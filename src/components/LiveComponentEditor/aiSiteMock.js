/**
 * 浏览器内 Mock 远程 AI 站点：拦截 fetch + EventSource，供示例 / 前端自测。
 * 不依赖真实后端；host 形如 https://mock-live-ai.local
 */

export const AI_MOCK_HOST = 'https://mock-live-ai.local';

const DEMO_FILE_ID = 'mock_ai_demo_file';

const DEMO_JSX = `<Antd.Card title="欢迎">
  <Antd.Space>
    <Antd.Button type="primary">开始</Antd.Button>
    <Antd.Button>取消</Antd.Button>
  </Antd.Space>
</Antd.Card>`;

const createDemoPayload = () =>
  JSON.stringify({
    content: DEMO_JSX,
    props: {},
    scope: {}
  });

const createId = () => `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const createToken = () => `tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const errorResponse = (message, status = 400) => jsonResponse({ message }, status);

const stripHost = url => {
  const raw = String(url || '');
  const base = AI_MOCK_HOST.replace(/\/$/, '');
  if (!raw.startsWith(base)) {
    return null;
  }
  const rest = raw.slice(base.length).replace(/^\//, '');
  const [pathname, search = ''] = rest.split('?');
  return { pathname, searchParams: new URLSearchParams(search) };
};

const buildRefineReply = (messages = []) => {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const confirmed = /选\s*[Aa]|方案\s*[Aa]|选 A|就 A|确认|可以生成|开始生成/.test(lastUser);
  if (confirmed) {
    return [
      '好的，已确认选用「方案 A」。',
      '',
      '### 需求小结',
      '- 目标：在欢迎卡片中增加提示文案，并强化主按钮',
      '- 布局：方案 A（标题 + 提示 + 操作区）',
      '- 组件：优先 Antd.Card / Space / Alert / Button',
      '',
      '请点击界面上的「开始生成」按钮写入代码。'
    ].join('\n');
  }

  if (messages.filter(m => m.role === 'user').length <= 1) {
    return [
      '收到。涉及界面结构，先给出两种布局供你选择：',
      '',
      '**方案 A：提示在上、按钮在下**',
      '',
      '```html',
      '<div class="ui-mock">',
      '  <div style="font-weight:600;margin-bottom:8px">欢迎</div>',
      '  <div style="padding:8px;background:#e6f4ff;border-radius:6px;margin-bottom:8px">提示文案 Alert</div>',
      '  <button style="margin-right:8px">开始</button><button>取消</button>',
      '</div>',
      '```',
      '',
      '**方案 B：提示左侧、按钮右侧**',
      '',
      '```html',
      '<div class="ui-mock" style="display:flex;gap:12px;align-items:center">',
      '  <div style="flex:1;padding:8px;background:#e6f4ff;border-radius:6px">提示文案</div>',
      '  <div><button style="margin-right:8px">开始</button><button>取消</button></div>',
      '</div>',
      '```',
      '',
      '请回复选 A / 选 B，或补充其它要求。'
    ].join('\n');
  }

  return [
    '已记下你的补充。仍建议先选定布局方案（回复「选 A」或「选 B」）。',
    '选定后我会给出需求小结，再请你点击「开始生成」。'
  ].join('\n');
};

const buildGenerateCode = ({ content, selection } = {}) => {
  if (selection?.code) {
    return {
      code: `<Antd.Button type="primary" size="large">已由 AI Mock 改写</Antd.Button>`,
      suggestedScope: null
    };
  }
  const base = String(content || '').trim();
  if (base.includes('Antd.Card')) {
    return {
      code: `<Antd.Card title="欢迎">
  <Antd.Alert type="info" showIcon message="这是 AI Mock 生成的提示" style={{ marginBottom: 12 }} />
  <Antd.Space>
    <Antd.Button type="primary">开始体验</Antd.Button>
    <Antd.Button>取消</Antd.Button>
  </Antd.Space>
</Antd.Card>`,
      suggestedScope: null
    };
  }
  return {
    code: `<FormInfo.Form data={{}}>
  <FormInfo
    title={props.title || '示例'}
    list={[
      <FormInfo.fields.Input name="name" label="姓名" rule="REQ" placeholder="请输入姓名" />,
      <FormInfo.fields.Select
        name="type"
        label="类型"
        rule="REQ"
        options={[
          { label: 'A', value: 'A' },
          { label: 'B', value: 'B' }
        ]}
      />
    ]}
  />
  <FormInfo.SubmitButton>提交</FormInfo.SubmitButton>
</FormInfo.Form>`,
    suggestedScope: { FormInfo: 'components-core:FormInfo' },
    suggestedProps: {
      title: { type: 'string', defaultValue: '示例' }
    }
  };
};

const chunkText = (text, size = 12) => {
  const chunks = [];
  const str = String(text || '');
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks.length ? chunks : [''];
};

let installed = null;

class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url) {
    this.url = url;
    this.readyState = MockEventSource.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this._timers = [];
    this._listeners = {};

    const parsed = stripHost(url);
    const token = parsed?.searchParams?.get('token');
    const job = token && installed?.jobs?.get(token);

    queueMicrotask(() => {
      if (this.readyState === MockEventSource.CLOSED) {
        return;
      }
      this.readyState = MockEventSource.OPEN;
      this.onopen?.({ type: 'open' });
      this._emit('open', { type: 'open' });

      if (!job) {
        this.onerror?.({ type: 'error', message: 'invalid token' });
        this.close();
        return;
      }

      const result =
        job.mode === 'generate' ? buildGenerateCode(job) : { code: buildRefineReply(job.messages), suggestedScope: null };
      const fullText = typeof result === 'string' ? result : result.code;
      const suggestedScope = typeof result === 'string' ? null : result.suggestedScope;
      const suggestedProps = typeof result === 'string' ? null : result.suggestedProps;
      const chunks = chunkText(fullText, 16);
      let delay = 0;
      chunks.forEach((text, index) => {
        delay += 35;
        const timer = setTimeout(() => {
          if (this.readyState === MockEventSource.CLOSED) {
            return;
          }
          this._dispatchMessage({ text, done: false });
          if (index === chunks.length - 1) {
            const donePayload = { done: true };
            if (suggestedScope && typeof suggestedScope === 'object' && Object.keys(suggestedScope).length) {
              donePayload.suggestedScope = suggestedScope;
            }
            if (suggestedProps && typeof suggestedProps === 'object' && Object.keys(suggestedProps).length) {
              donePayload.suggestedProps = suggestedProps;
            }
            this._dispatchMessage(donePayload);
            installed?.jobs?.delete(token);
            this.close();
          }
        }, delay);
        this._timers.push(timer);
      });
    });
  }

  _dispatchMessage(payload) {
    const event = { data: JSON.stringify(payload), type: 'message' };
    this.onmessage?.(event);
    this._emit('message', event);
  }

  _emit(type, event) {
    (this._listeners[type] || []).forEach(fn => fn(event));
  }

  addEventListener(type, handler) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(handler);
  }

  removeEventListener(type, handler) {
    this._listeners[type] = (this._listeners[type] || []).filter(fn => fn !== handler);
  }

  close() {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this.readyState = MockEventSource.CLOSED;
  }
}

const createStore = () => {
  const content = createDemoPayload();
  return {
    tree: [
      {
        id: DEMO_FILE_ID,
        name: 'AI Demo',
        type: 'file',
        permission: 'rw'
      }
    ],
    files: {
      [DEMO_FILE_ID]: content
    }
  };
};

const handleMockRequest = async (store, jobs, url, init = {}) => {
  const parsed = stripHost(url);
  if (!parsed) {
    return null;
  }
  const method = String(init.method || 'GET').toUpperCase();
  const path = parsed.pathname.replace(/\/$/, '');
  let body = null;
  if (init.body) {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = null;
    }
  }

  if (method === 'GET' && path === 'info') {
    return jsonResponse({
      name: 'AI Mock 站点',
      status: 'open',
      aiEnabled: true,
      defaultPermission: 'rw'
    });
  }

  if (method === 'GET' && path === 'getFolderTree') {
    return jsonResponse(store.tree);
  }

  if (method === 'GET' && path === 'get') {
    const id = parsed.searchParams.get('id');
    const node = store.tree.find(item => item.id === id);
    if (!node || node.type !== 'file') {
      return errorResponse('File not found', 404);
    }
    return jsonResponse({
      id: node.id,
      name: node.name,
      permission: node.permission || 'rw',
      content: store.files[id] ?? ''
    });
  }

  if (method === 'POST' && path === 'save') {
    const id = body?.id;
    const exists = store.tree.some(n => n.id === id);
    if (!id || !exists) {
      return errorResponse('File not found', 404);
    }
    store.files[id] = body.content ?? '';
    return jsonResponse({ id });
  }

  if (method === 'POST' && path === 'create') {
    const name = String(body?.name || '').trim() || 'untitled';
    const file = {
      id: createId(),
      name,
      type: 'file',
      permission: 'rw'
    };
    store.tree.push(file);
    store.files[file.id] = body?.content ?? '';
    return jsonResponse(file);
  }

  if (method === 'POST' && path === 'createFolder') {
    const folder = {
      id: createId(),
      name: String(body?.name || 'folder').trim(),
      type: 'directory',
      permission: 'rw',
      children: []
    };
    store.tree.push(folder);
    return jsonResponse(folder);
  }

  if (method === 'POST' && path === 'rename') {
    const node = store.tree.find(item => item.id === body?.id);
    if (!node) {
      return errorResponse('Node not found', 404);
    }
    node.name = String(body?.name || node.name).trim();
    return jsonResponse(node);
  }

  if (method === 'POST' && path === 'move') {
    const node = store.tree.find(item => item.id === body?.id);
    if (!node) {
      return errorResponse('Node not found', 404);
    }
    if (body?.parentId && body.parentId === body.id) {
      return errorResponse('INVALID_MOVE_TARGET', 400);
    }
    return jsonResponse({
      id: node.id,
      name: node.name,
      type: node.type,
      permission: node.permission,
      parentId: body?.parentId || null
    });
  }

  if (method === 'POST' && path === 'remove') {
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    store.tree = store.tree.filter(item => !ids.includes(item.id));
    ids.forEach(id => {
      delete store.files[id];
    });
    return jsonResponse({ ids });
  }

  if (method === 'POST' && path === 'ai/start') {
    const mode = body?.mode === 'generate' ? 'generate' : 'refine';
    const token = createToken();
    jobs.set(token, {
      mode,
      messages: Array.isArray(body?.messages) ? body.messages : [],
      content: body?.content || '',
      selection: body?.selection || null,
      scope: body?.scope || {}
    });
    return jsonResponse({ streamToken: token });
  }

  if (method === 'GET' && path === 'ai/stream') {
    return errorResponse('Use EventSource for SSE', 400);
  }

  // content-share stubs（避免面板误触报错）
  if (path.startsWith('content-share/')) {
    if (method === 'GET') {
      return jsonResponse([]);
    }
    return jsonResponse({});
  }

  return errorResponse(`Mock route not found: ${method} ${path}`, 404);
};

/**
 * 安装 AI Mock 站点拦截。可重复调用（先卸载再装）。
 * @returns {{ host: string, uninstall: () => void }}
 */
export const installAiSiteMock = () => {
  if (typeof window === 'undefined') {
    return { host: AI_MOCK_HOST, uninstall: () => {} };
  }
  uninstallAiSiteMock();

  const store = createStore();
  const jobs = new Map();
  const nativeFetch = window.fetch.bind(window);
  const NativeEventSource = window.EventSource;

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && String(url).startsWith(AI_MOCK_HOST)) {
      return handleMockRequest(store, jobs, url, init);
    }
    return nativeFetch(input, init);
  };

  function PatchedEventSource(url, eventSourceInitDict) {
    if (String(url).startsWith(AI_MOCK_HOST)) {
      return new MockEventSource(url);
    }
    return new NativeEventSource(url, eventSourceInitDict);
  }
  PatchedEventSource.CONNECTING = NativeEventSource?.CONNECTING ?? 0;
  PatchedEventSource.OPEN = NativeEventSource?.OPEN ?? 1;
  PatchedEventSource.CLOSED = NativeEventSource?.CLOSED ?? 2;
  PatchedEventSource.prototype = NativeEventSource?.prototype;
  window.EventSource = PatchedEventSource;

  installed = {
    store,
    jobs,
    nativeFetch,
    NativeEventSource
  };

  return {
    host: AI_MOCK_HOST,
    uninstall: uninstallAiSiteMock
  };
};

export const uninstallAiSiteMock = () => {
  if (!installed || typeof window === 'undefined') {
    installed = null;
    return;
  }
  window.fetch = installed.nativeFetch;
  if (installed.NativeEventSource) {
    window.EventSource = installed.NativeEventSource;
  }
  installed = null;
};

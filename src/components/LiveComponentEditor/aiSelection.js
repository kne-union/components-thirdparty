/** 从 content 中按 1-based line 抽取大致 JSX 片段 */
export const extractSelectionFromContent = (content, line, column) => {
  const text = String(content || '');
  if (!text.trim() || !line || line < 1) {
    return null;
  }
  const lines = text.split('\n');
  let startIdx = Math.min(Math.max(line - 1, 0), lines.length - 1);

  while (startIdx > 0 && !/<\s*[A-Za-z]/.test(lines[startIdx])) {
    startIdx -= 1;
  }

  const startLineText = lines[startIdx] || '';
  const openMatch = startLineText.match(/<\s*([A-Za-z][\w.]*)/);
  const tagName = openMatch?.[1];
  const label = tagName ? `${tagName} @ L${startIdx + 1}` : `L${startIdx + 1}`;

  let endIdx = startIdx;
  if (tagName && !/\/\s*>/.test(startLineText) && !new RegExp(`</\\s*${tagName.replace('.', '\\.')}\\s*>`).test(startLineText)) {
    let depth = 0;
    const openRe = new RegExp(`<\\s*${tagName.replace('.', '\\.')}(\\s|>|/)`, 'g');
    const closeRe = new RegExp(`</\\s*${tagName.replace('.', '\\.')}\\s*>`, 'g');
    for (let i = startIdx; i < lines.length; i += 1) {
      const row = lines[i];
      const opens = row.match(openRe) || [];
      const closes = row.match(closeRe) || [];
      const selfClosing = (row.match(new RegExp(`<\\s*${tagName.replace('.', '\\.')}[^>]*?/\\s*>`, 'g')) || []).length;
      depth += opens.length - selfClosing - closes.length;
      endIdx = i;
      if (i > startIdx && depth <= 0) {
        break;
      }
      if (i === startIdx && selfClosing && opens.length === selfClosing) {
        break;
      }
    }
  }

  const code = lines.slice(startIdx, endIdx + 1).join('\n');
  return {
    startLine: startIdx + 1,
    endLine: endIdx + 1,
    column: column || 1,
    code,
    label
  };
};

export const applySelectionToContent = (content, selection, nextCode) => {
  if (!selection?.startLine || !selection?.endLine) {
    return nextCode;
  }
  const lines = String(content || '').split('\n');
  const before = lines.slice(0, selection.startLine - 1);
  const after = lines.slice(selection.endLine);
  const mid = String(nextCode || '').replace(/\n$/, '').split('\n');
  return [...before, ...mid, ...after].join('\n');
};

export const stripCodeFence = text => {
  const raw = String(text || '').trim();
  if (!raw) {
    return '';
  }

  // 整段就是一个代码围栏
  const whole = raw.match(/^```(?:jsx|javascript|js|tsx|ts)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i);
  if (whole) {
    return whole[1].trim();
  }

  // 混有说明文字时，优先取 jsx/js 围栏
  const preferred = raw.match(/```(?:jsx|javascript|js|tsx|ts)\s*\r?\n?([\s\S]*?)\r?\n?```/i);
  if (preferred) {
    return preferred[1].trim();
  }

  // 任意围栏
  const generic = raw.match(/```[^\n]*\r?\n([\s\S]*?)\r?\n?```/);
  if (generic) {
    return generic[1].trim();
  }

  // 残缺围栏（只有开头）
  if (/^```/.test(raw)) {
    return raw.replace(/^```[^\n]*\r?\n?/, '').replace(/\r?\n?```\s*$/, '').trim();
  }

  // 无围栏但前面有说明：从第一个 JSX 根截取
  if (!/^[<!(]/.test(raw)) {
    const idx = raw.search(/<(?:[A-Za-z!/?]|>)/);
    if (idx >= 0) {
      return raw.slice(idx).trim();
    }
  }

  return raw;
};

const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const inferPropDef = (code, name) => {
  if (/^on[A-Z]/.test(name)) {
    return { type: 'function', defaultValue: '()=>null' };
  }
  const access = `props(?:\\?\\.)?\\.${escapeRegExp(name)}`;
  const orString = code.match(new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*['"\`]([^'"\`]*)['"\`]`));
  if (orString) {
    return { type: 'string', defaultValue: orString[1] };
  }
  const orNum = code.match(new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (orNum) {
    return { type: 'number', defaultValue: orNum[1] };
  }
  const orBool = code.match(new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*(true|false)\\b`));
  if (orBool) {
    return { type: 'boolean', defaultValue: orBool[1] };
  }
  if (new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*\\[`).test(code)) {
    return { type: 'array', defaultValue: '[]' };
  }
  if (new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*\\{`).test(code)) {
    return { type: 'object', defaultValue: '{}' };
  }
  return { type: 'string', defaultValue: '' };
};

/** 从 JSX/content 中收集 props.xxx 用法，生成可写入「组件参数」的声明 */
export const extractPropsFromCode = (code, existingProps = {}) => {
  const text = String(code || '');
  if (!text.trim()) {
    return {};
  }
  const names = new Set();
  const re = /props(?:\?\.)?\.([A-Za-z_$][\w$]*)|props\[\s*['"`]([^'"`]+)['"`]\s*\]/g;
  let match;
  while ((match = re.exec(text))) {
    const name = match[1] || match[2];
    if (name) {
      names.add(name);
    }
  }
  const result = {};
  names.forEach(name => {
    if (existingProps && existingProps[name]) {
      return;
    }
    result[name] = inferPropDef(text, name);
  });
  return result;
};

/** 合并 AI suggestProps 与代码扫描结果（工具声明优先） */
export const mergeSuggestedProps = (code, suggestedProps, existingProps = {}) => {
  const extracted = extractPropsFromCode(code, existingProps);
  return Object.assign({}, extracted, suggestedProps && typeof suggestedProps === 'object' ? suggestedProps : {});
};

/** 从 preset remotes 收集 AI 索引清单（跳过别名 / 非组件库） */
export const collectRemotesPayload = remotes => {
  if (!remotes || typeof remotes !== 'object') {
    return [];
  }
  const skip = new Set(['default', 'fastify-app']);
  const seen = new Set();
  return Object.entries(remotes)
    .filter(([name]) => name && !skip.has(name))
    .map(([name, cfg]) => ({
      name,
      version: cfg?.version || cfg?.defaultVersion || 'latest',
      packageName: cfg?.packageName
    }))
    .filter(item => {
      const key = `${item.name}@${item.version}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

# LiveComponentEditor

### 概述

### 组件概述

LiveComponentEditor 是一个实时的组件编辑器，允许用户在运行时动态编辑和预览 React 组件。该组件提供了代码编辑、参数配置、作用域管理等功能，并支持多种布局模式。

### 主要特性

- 实时代码编辑和预览
- 组件参数可视化配置
- 自定义作用域管理
- 三种布局模式：编辑器、混合、预览
- 支持 PlantUML 编码的数据存储
- 集成 FormInfo 进行参数管理
- 错误边界保护
- 支持 Antd 组件库集成
- 可扩展工具栏（toolbarExtra）
- 多站点文件管理（含 localStorage 适配、`siteActionsOpen` 本地自管站点）
- 混合模式源码双向定位（预览 ↔ 编辑器，`enableSourceLocate` 可关）
- 远程站点 AI 助手（当前选中远程站且 `info.aiEnabled` 时显示）


### 使用场景

适用于组件开发工具、在线代码编辑器、组件演示平台、教学工具等需要实时编辑和预览 React 组件的场景。

### 示例(全屏)

#### 示例代码

- 基础用法
- 实时编辑与预览，支持工具栏扩展与本地站点文件
- _LiveComponentEditor(@components/LiveComponentEditor),antd(antd)

```jsx
const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Alert, Input, Button } = antd;
const { useState, useRef } = React;
const BaseExample = () => {
  const ref = useRef(null);
  const [value, setValue] = useState(
    'xLLDQzj04FqhornoaHsdfo8iGngI4WY5DgMNRW-oF4xLh7U5j0eEGf0G2ad0E12tXb8ewGSr3Kro2A7uaZzZAVQ_AEiFHKgTXj9hT95sPjxRUSFJRW2Mu1Av11sAIyAjBVEgoAiFKZ6bQGH169OeByvpMSalCQoJ3NIbRPcCh9cE4SmzK6b224dGHDgIeH4uhd2y_70H4cPxqWXUZaepvVcgZQpYvPUvuql2pHeQ5DIB0c5c6Pb18Vf-61qqA13NPohzRF4fMLbyaYlavWe52hCbZVo5UHKPMWbr1HtJbJNaChN1OASpQ7So6r0Wmf6su5wcR_K4GvW-4-zlnHzF1pkT6Mt3P3xg598GXL2RZXgqjgBMIGQLX2Y4rw1NuHt25bwZjLuMzSUky1rIPi9QdwYqkKGNlRJ6wErv_-BBtR8eHDiV1jz-KaZwcmHkaKGXFczVVMwd49F0xOYzmtZlE6eSNxK-fN6PyByCupdMvRoBPdOE5VGirnuAJeqYRZRxbsVAE2D2HNx3nVaLsvDZArE8TjlzeqxyxYnkd52Oa2jJAzPxRzzx-t-z_OSHhq_SDxudxUgcGS529Pt2wEnzE3bwimDSzSirMpxofHIy53SFUjslnTdfsMdm1PDRoCO5KVDzVB6RWcUouqvdarRLJN5ZbRbJIg21Pma7GGzWaW4TB55p14SklPmbNDIJLAZ1y1fHzSD_KNrKi6hwJBvGOmKTUhz-zBhTtkLHl7qA6iXDHG-UT6s-1c4O_WO0'
  );
  return (
    <Flex vertical gap={12}>
      <Alert message={<Input.TextArea variant="borderless" autoSize value={value || ''} onChange={e => ref.current.setValue(e.target.value)} />} />
      <LiveComponentEditor
        defaultValue={value}
        onChange={setValue}
        ref={ref}
        toolbarExtra={<Button onClick={() => console.log(ref.current?.getValue())}>自定义按钮</Button>}
        sites={[{ host: 'localStorage:live-component-demo', name: '本地演示' }]}
      />
    </Flex>
  );
};

render(<BaseExample />);

```

- 多站点
- 多个 localStorage 站点与自定义工具栏按钮
- _LiveComponentEditor(@components/LiveComponentEditor),antd(antd)

```jsx
const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Button, message } = antd;
const { useState, useRef } = React;

const SitesExample = () => {
  const ref = useRef(null);
  const [value, setValue] = useState('');

  return (
    <Flex vertical gap={12}>
      <LiveComponentEditor
        defaultValue={value}
        onChange={setValue}
        ref={ref}
        height={480}
        toolbarExtra={
          <Button
            onClick={() => {
              const v = ref.current?.getValue();
              message.info(v ? &#96;长度 ${v.length}&#96; : '空');
            }}>
            查看编码长度
          </Button>
        }
        sites={[
          { host: 'localStorage:live-component-demo', name: '本地演示' },
          { host: 'localStorage:live-component-demo-2', name: '本地演示 2' }
        ]}
      />
    </Flex>
  );
};

render(<SitesExample />);

```

- AI 助手（Mock）
- 浏览器内 Mock 远程站点 AI：完善需求 → 开始生成 → 流式写入编辑器
- _LiveComponentEditor(@components/LiveComponentEditor),antd(antd)

```jsx
const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Alert } = antd;
const { useEffect, useState, useRef } = React;

const MOCK_HOST = LiveComponentEditor.AI_MOCK_HOST || 'https://mock-live-ai.local';

const AiExample = () => {
  const ref = useRef(null);
  const [value, setValue] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof LiveComponentEditor.installAiSiteMock === 'function') {
      LiveComponentEditor.installAiSiteMock();
    }
    setReady(true);
    return () => {
      LiveComponentEditor.uninstallAiSiteMock?.();
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <Flex vertical gap={12}>
      <Alert
        type="info"
        showIcon
        message="AI Mock 站点（无需后端）"
        description={
          <span>
            已拦截 <code>{MOCK_HOST}</code>。右侧 AI 面板应直接出现；可打开左侧「AI Demo」再试生成，或直接对编辑器内容完善需求后点「开始生成」。
          </span>
        }
      />
      <LiveComponentEditor
        defaultValue={value}
        onChange={setValue}
        ref={ref}
        height={520}
        siteActionsOpen={false}
        sites={[{ host: MOCK_HOST, name: 'AI Mock 站点' }]}
      />
    </Flex>
  );
};

render(<AiExample />);

```

### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| defaultValue | string | - | 默认组件配置（PlantUML 编码） |
| defaultMod | string | 'mix' | 默认显示模式 |
| height | number | 500 | 编辑器和预览区域高度 |
| width | number | 260 | 开启 `sites` 时左侧站点面板展开宽度（不可拖拽，可展开/收起） |
| libs | object | { lodash, dayjs } | 可用库集合 |
| onChange | function | - | 配置变化回调函数 |
| toolbarExtra | ReactNode | - | 扩展工具栏按钮（渲染在复制/导入之后） |
| sites | `{ host, name }[]` | - | 传入数组（可为 `[]`）时开启左侧多站点文件面板 |
| onSitesChange | function | - | 合并后站点列表变更回调（props + 本地添加） |
| siteActionsOpen | boolean | true | 开启后可添加站点；本地添加的站点可编辑/删除，`sites` 配置的不可改删 |
| userSitesStorageKey | string | `live-component-editor:user-sites` | 用户自行添加站点在 `localStorage` 中的存储 key |
| enableSourceLocate | boolean | true | 是否启用混合模式源码双向定位（预览↔编辑器） |

#### 显示模式 (mod)

| 模式值 | 说明 | 图标 |
|--------|------|------|
| editor | 仅显示编辑器 | MenuOutlined |
| mix | 编辑器和预览分屏显示 | SplitCellsOutlined |
| preview | 仅显示预览 | EyeOutlined |

#### 组件配置结构

```javascript
// 通过 PlantUML 编码的配置对象结构
{
  content: "React组件代码字符串",    // 组件内容
  props: {                         // 组件参数
    propName: {
      type: "string|number|boolean|array|object|function",
      defaultValue: "默认值"
    }
  },
  scope: {                         // 自定义作用域
    scopeName: "token"             // 组件名称
  }
}
```

#### 可用类型说明

| 类型 | 说明 | 默认值格式 |
|------|------|------------|
| string | 字符串类型 | 直接字符串值 |
| number | 数字类型 | 数字值 |
| boolean | 布尔类型 | true/false |
| array | 数组类型 | JSON 字符串 |
| object | 对象类型 | JSON 字符串 |
| function | 函数类型 | 固定为 " ()=>null " |

#### 工具栏操作

| 操作 | 说明 |
|------|------|
| 复制 | 将当前配置（PlantUML 编码字符串）写入系统剪贴板 |
| 从剪贴板导入 | 读取剪贴板并解析为组件配置（支持编码字符串或 JSON），覆盖当前编辑内容 |
| 保存 | 存在 `sites` 时可用；将当前配置保存到已打开且可写（`permission === 'rw'`）的文件 |
| 另存为 | 存在 `sites` 时可用；选择站点/父目录/文件名后创建新文件 |
| 复制内容地址 | 远程站点文件右键菜单 / 工具栏；弹窗创建带有效期的 `{prefix}/content/{shorten}`（不含站点 shorten）并管理已有链接 |
| toolbarExtra | 通过 prop 扩展自定义按钮 |

#### 多站点文件系统 (`sites`)

传入 `sites: [{ host, name }]`（可为 `[]`）后，左侧显示站点列表与文件树（基于 `@kne/file-system-view`）。

**站点来源与排序：**

- `sites` prop 配置的站点排在前面，不可编辑/删除
- `siteActionsOpen={true}`（默认）时，可通过面板自行添加站点；添加的站点保存在浏览器 `localStorage`（key 由 `userSitesStorageKey` 配置，默认 `live-component-editor:user-sites`），排在 prop 站点之后，可编辑/删除
- 同 host 以 prop 为准；`onSitesChange` 回调拿到的是合并后的完整列表

**站点类型图标：**

- 本地站点（`host` 以 `localStorage:` 开头）：Database 图标
- 远程站点（HTTP 基址）：CloudServer 图标
- 远程连通状态：请求 `getFolderTree` 成功且返回合法树数组显示绿色已连通；请求失败或格式非法显示红色未连通

**站点 API（`host` 为 HTTP 基址，与 localStorage 适配器方法一致）：**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `{host}/getFolderTree` | 获取文件树 |
| GET | `{host}/get?id=` | 按 id 读取文件内容 |
| GET | `{host}/info` | 站点信息（含 `aiEnabled`） |
| GET | `{prefix}/content/{contentShorten}` | 直出已保存 content（`text/plain`；不含站点 shorten） |
| POST | `{host}/content-share/create` | body: `{ id, expiresIn? }` |
| GET | `{host}/content-share/list?id=` | 列出未过期内容短链 |
| POST | `{host}/content-share/remove` | body: `{ shorten }` |
| POST | `{host}/createFolder` | body: `{ parentId, name }` |
| POST | `{host}/create` | body: `{ parentId, name, content? }` |
| POST | `{host}/save` | body: `{ id, content }` |
| POST | `{host}/rename` | body: `{ id, name }`；同目录重名校验 |
| POST | `{host}/remove` | body: `{ ids: string[] }`；非空目录不可删 |
| POST | `{host}/ai/start` | 创建 AI 流任务（需 `aiEnabled`） |
| GET | `{host}/ai/stream?token=` | AI SSE 流式输出 |

远程站点且当前选中站点的 `info.aiEnabled` 为 true 时，编辑器右侧显示 AI 助手；未选站点、localStorage 站点或不支持 AI 的站点不显示。多轮完善需求后点「开始生成」写入编辑器；可选「限定到选中组件」。

自测可用 `LiveComponentEditor.installAiSiteMock()`（见文档示例「AI 助手（Mock）」），拦截 `https://mock-live-ai.local`。

响应统一取 `res.data ?? res`。

树节点字段：`{ id, name, type: 'file'|'directory', permission: 'r'|'rw', children? }`。

仅读权限（`r`）时不允许保存到该文件、删除该节点。

**localStorage 站点：** `host` 可传 `localStorage:KEY_NAME`，在本地 `localStorage` 完成同等读写语义。

#### 混合模式源码双向定位

在 `mix` 且 `enableSourceLocate`（默认 `true`）时：

- **预览 → 编辑器**：双击预览区，解析最近带源码标记的节点（无标记时几何就近），左侧 Monaco 跳到对应行列；悬停时外部 overlay 虚线框提示目标。
- **编辑器 → 预览**：光标移动时，外部 overlay 实线框高亮预览中对应节点。
- **高亮**：只读测量目标 `getBoundingClientRect`，在预览内容外渲染 overlay，不修改预览 DOM 结构/样式。
- **关闭**：`enableSourceLocate={false}` 时关闭全部定位交互，且不注入 `data-live-*`。
- **降级**：预览未就绪或无法映射时轻提示；空白内容不提示。

#### 集成功能

- **CodeEditor**: 基于 Monaco Editor 的代码编辑器
- **LiveComponentView**: 实时组件渲染和预览
- **FormInfo**: 参数管理和表单配置
- **Antd**: UI 组件库支持
- **lodash**: 工具函数库
- **dayjs**: 日期处理库
- **@kne/file-system-view**: 站点文件树

#### 注意事项

- 预览区通过外层 `usePreset()` 注入完整 `preset`（含 `apis.file.getUrl`），需将编辑器置于 `Global` / `PureGlobal` 上下文中使用
- 函数类型参数仅支持占位符，无法编辑实际函数内容
- 组件代码会自动包装在 ErrorBoundary 中进行错误保护
- 支持使用 props.* 和 scope.* 中的变量和组件

# DiffEditor

### 概述

### 组件概述

DiffEditor 是基于 Monaco Editor 差异编辑器的内容对比组件，用于并排或内联展示两份文本 / JSON 的修改内容，与 CodeEditor 使用同一套 Monaco 加载配置。

### 主要特性

- 左右并排或内联（`renderSideBySide={false}`）两种对比视图
- 默认折叠未改动的区域，只展开修改附近的内容
- `original` / `modified` 传对象时自动按 JSON 格式化并以 json 语言高亮
- 默认只读，可通过 `readOnly={false}` 允许编辑修改后的一侧
- 支持 `window.MONACO_EDITOR_DIR` 配置 Monaco 资源路径

### 使用场景

适用于查看版本差异、人工编辑前后对比、配置变更审核等场景。


### 示例

#### 示例代码

- 基础用法
- 对比两段代码，默认左右并排、只读，并折叠未改动的区域
- _DiffEditor(@components/DiffEditor)

```jsx
const { default: DiffEditor } = _DiffEditor;

const original = &#96;const calcOrderAmount = order => {
  const { items = [], coupon } = order;
  const total = items.reduce((sum, { price, quantity }) => sum + price * quantity, 0);
  if (coupon && total >= coupon.threshold) {
    return total - coupon.discount;
  }
  return total;
};

export default calcOrderAmount;
&#96;;

const modified = &#96;const calcOrderAmount = (order, { freeShipping = false } = {}) => {
  const { items = [], coupon, shippingFee = 0 } = order;
  const total = items.reduce((sum, { price, quantity }) => sum + price * quantity, 0);
  const shipping = freeShipping ? 0 : shippingFee;
  if (coupon && total >= coupon.threshold) {
    return total - coupon.discount + shipping;
  }
  return total + shipping;
};

export default calcOrderAmount;
&#96;;

const BaseExample = () => {
  return <DiffEditor height={320} language="javascript" original={original} modified={modified} />;
};

render(<BaseExample />);

```

- 对比 JSON 与切换视图
- original / modified 直接传对象，自动按 JSON 格式化并高亮；通过 renderSideBySide 在并排与内联视图之间切换
- _DiffEditor(@components/DiffEditor),antd(antd)

```jsx
const { default: DiffEditor } = _DiffEditor;
const { Flex, Segmented } = antd;
const { useState } = React;

const original = {
  role: '前端工程师',
  tasks: [
    { task_id: 't1', task: '开发业务页面', level: 3 },
    { task_id: 't2', task: '维护组件库', level: 2 },
    { task_id: 't3', task: '代码评审', level: 2 }
  ],
  language: 'zh-CN'
};

const modified = {
  role: '前端工程师',
  tasks: [
    { task_id: 't1', task: '开发业务页面', level: 4 },
    { task_id: 't2', task: '维护组件库', level: 2 },
    { task_id: 't4', task: '性能优化', level: 3 }
  ],
  language: 'zh-CN'
};

const JsonExample = () => {
  const [view, setView] = useState('side');
  return (
    <Flex vertical gap={12}>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { label: '并排', value: 'side' },
          { label: '内联', value: 'inline' }
        ]}
      />
      <DiffEditor height={360} original={original} modified={modified} renderSideBySide={view === 'side'} />
    </Flex>
  );
};

render(<JsonExample />);

```

### API

### API 文档

#### 组件属性

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| original | 原始内容；传对象时按 `JSON.stringify(value, null, 2)` 格式化 | string \| object | - |
| modified | 修改后内容；传对象时按 JSON 格式化 | string \| object | - |
| language | 语言；未传且 `original` / `modified` 为对象时为 `json` | string | - |
| height | 编辑器高度，支持 `'100%'` 等字符串 | number \| string | 500 |
| renderSideBySide | 是否左右并排对比，false 为内联视图。为 true 时会把 Monaco 的 `renderSideBySideInlineBreakpoint` 设为 0，避免窄容器仍显示成内联 | boolean | true |
| hideUnchangedRegions | 是否折叠未改动的区域 | boolean | true |
| readOnly | 修改后一侧是否只读（原始一侧始终只读） | boolean | true |
| theme | 编辑器主题 | string | - |
| options | Monaco DiffEditor 配置，会覆盖上面几项生成的默认配置 | object | - |
| onMount | 挂载回调 | function({ editor, monaco }) | - |
| className | 外层容器类名 | string | - |

#### Ref 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getOriginalValue | - | string | 获取原始一侧内容 |
| getModifiedValue | - | string | 获取修改后一侧内容 |
| getEditor | - | IStandaloneDiffEditor | 获取 Monaco DiffEditor 实例 |
| getMonaco | - | Monaco | 获取 Monaco 命名空间 |

#### 全局配置

与 CodeEditor 相同，支持通过 `window.MONACO_EDITOR_DIR` 配置 Monaco Editor 的路径：

```javascript
window.MONACO_EDITOR_DIR = '/path/to/monaco-editor';
```

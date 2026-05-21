# MarkdownRender

### 概述

基于 `@kne/markdown-components-render` 的 Markdown 渲染封装，在标准 Markdown 上支持通过 YML 代码块与行内语法嵌入 React 组件，并可用 `variables` 注入事件与动态数据。

### 主要特性

- **Markdown-it 渲染**：标题、表格、链接、代码块等常见语法
- **块级自定义组件**：在 YML 围栏代码块中声明 md-components.type / props
- **行内组件**：通过 md-components 行内语法在段落中插入 Button 等组件
- **变量替换**：props 中以 $变量名 引用 variables 对象中的函数或值
- **可扩展**：options 配置 markdown-it 插件；htmlTransform / render 自定义渲染链路

### 使用场景

- 帮助中心、运营公告等需要「文档 + 可点击按钮/卡片」的页面
- CKEditor Markdown 模式的阅读态预览
- 从远程或静态 .md 文件加载内容并渲染（配合 @kne/react-fetch）

### 包与导入

本仓库以 `@components/MarkdownRender` 重新导出 **MarkdownComponentsRender** 并自动引入样式：

```javascript
import MarkdownComponentsRender from '@components/MarkdownRender';
```

### 组件语法速览

YML 块组件示例（围栏语言为 yml）：

```yml
md-components:
  type: Card
  props:
    title: 标题
    children: 正文
```

带变量的事件（onClick 等使用 $ 前缀）：

```yml
md-components:
  type: Button
  props:
    type: primary
    children: 提交
    onClick: $handleSubmit
```

行内组件写在段落反引号内，格式为 md-components:Type 加 JSON 属性。


### 示例

#### 示例代码

- 基础使用
- 加载 example.md，注册 Card/Button 与 variables
- _MarkdownRender(@components/MarkdownRender),antd(antd),_ReactFetch(@kne/react-fetch),md(./doc/example.md),(@kne/markdown-components-render/dist/index.css)

```jsx
const { default: MarkdownComponentsRender } = _MarkdownRender;
const { default: mdUrl } = md;
const { default: Fetch } = _ReactFetch;
const { Card, Button, App, Flex } = antd;

const BaseExample = () => {
  const { message } = App.useApp();

  return (
    <App>
      <Fetch
        url={mdUrl}
        ignoreSuccessState
        render={({ data }) => (
          <Flex vertical gap={12} style={{ width: '100%', maxWidth: 960 }}>
            <MarkdownComponentsRender
              components={{ Card, Button }}
              variables={{
                onOpenWorkbench: () => message.success('已打开工作台')
              }}>
              {data}
            </MarkdownComponentsRender>
          </Flex>
        )}
      />
    </App>
  );
};

render(<BaseExample />);

```

### API

### MarkdownComponentsRender

默认导出组件（`@components/MarkdownRender` 封装自 `@kne/markdown-components-render`）。将 `children` 作为 Markdown 字符串解析为 HTML，并把 `md-components` 标记替换为 `components` 中注册的 React 组件。

#### 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | Markdown 源码字符串 | string | `''` |
| components | 组件类型映射，键名对应 YML/行内语法中的 `type`（如 `Card`、`Button`） | object | `{}` |
| variables | 变量表；props 中 `$name` 会解析为 `variables[name]` | object | `{}` |
| options | markdown-it 配置容器 | object | - |
| options.config | 传入 `markdown-it` 构造函数的选项 | object | `{}` |
| options.plugins | 插件列表，项为 `plugin` 或 `[plugin, ...args]` | array | `[]` |
| htmlTransform | 在交给 React 解析前转换 HTML 字符串 | function | - |
| render | 自定义渲染包装 `(reactNode) => ReactNode`，用于包裹默认输出 | function | - |

#### components 与 variables

- `components` 需传入真实 React 组件（通常从 antd 解构），与文档中 `type` 字段一致
- 支持嵌套：YML 中 `children` 可为子组件数组（见 `Flex` + 多个 `Card` 示例）
- `variables` 常用于 `onClick: $handleSubmit` 等形式；未匹配到变量时保持原值

#### md-components 语法

| 形式 | 说明 |
| --- | --- |
| YML 围栏代码块 | 根键 md-components，含 type、props |
| 行内反引号 | md-components:Type 加 JSON 属性，写在段落反引号内 |

#### 附加导出

| 名称 | 说明 |
| --- | --- |
| preset | 全局默认参数，可与组件 props 合并 |
| markdownComponentsPlugin | markdown-it 插件，解析 md-components 标记 |
| MarkdownComponents | 将 HTML 转为 React 树的底层组件 |

#### 样式

使用 `@components/MarkdownRender` 时已包含 `@kne/markdown-components-render/dist/index.css`。若直接引用 npm 包，需自行导入该 CSS。

#### 与 CKEditor 配合

`CKEditor.Field` 设置 `isMarkdown` 后，`onChange` 得到 Markdown 字符串，可传给本组件：

```jsx
<MarkdownComponentsRender>{markdownFromEditor}</MarkdownComponentsRender>
```

富文本 HTML 请使用 `CKEditor.Content`，不要用本组件渲染。

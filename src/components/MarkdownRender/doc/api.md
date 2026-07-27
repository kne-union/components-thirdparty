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
| HtmlBlock | 将 `props.html` 渲染为真实 DOM（非代码块） |
| HtmlMarkdown | 自动把 \`\`\`html 围栏转为 HtmlBlock 再渲染 |
| prepareHtmlMarkdown | 将 Markdown 中的 HTML 围栏预处理为 md-components |

#### 样式

使用 `@components/MarkdownRender` 时已包含 `@kne/markdown-components-render/dist/index.css`。若直接引用 npm 包，需自行导入该 CSS。

#### 与 CKEditor 配合

`CKEditor.Field` 设置 `isMarkdown` 后，`onChange` 得到 Markdown 字符串，可传给本组件：

```jsx
<MarkdownComponentsRender>{markdownFromEditor}</MarkdownComponentsRender>
```

富文本 HTML 请使用 `CKEditor.Content`，不要用本组件渲染。

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

基于 CKEditor 5 的富文本编辑器封装，面向表单与内容生产场景，提供完整工具栏、图片/表格编辑、Markdown 输出，以及 3D 模型、视频、交互组件、FormCreator 表单、邮件模版变量与行内条件等富媒体能力。

### 主要特性

- **双模式**：富文本（HTML）与 Markdown（`isMarkdown`），Markdown 下自动剔除 3D、视频、交互组件、图表、表单相关工具与配置
- **富媒体插件**：GLB 3D 模型（`@google/model-viewer`）、HTML5 视频、LiveComponent（`LiveComponentEditor` 编辑 + `LiveComponentView` 渲染）、FormCreator（搭建器编辑 + `SchemaRenderer` 渲染）
- **邮件模版变量**：`TemplateVariablePlugin` 支持插入 lodash 插值/转义变量，编辑态显示 label 芯片，`getData` 输出可配置模版语法
- **邮件模版条件**：`TemplateConditionPlugin` 默认插入单条件壳（真值/假值/有值/空值/等于/不等于 + 可选否则）；「编辑条件」弹窗可添加扁平且/或多谓词；可选把 if / else 切成块级（`data-template-condition-layout`）
- **统一上传**：图片、3D、视频共用 `uploadAdapter` / `preset.apis.file`，未配置 `upload` 时回退 base64
- **预览增强**：`CKEditor.Content` 同步视频尺寸、挂载交互组件/表单/图表、3D 全屏预览（含移动端 overlay）
- **工具栏适配**：`CKEditor.Field` 按容器宽度设置 `--ck-toolbar-dropdown-max-width`，避免「显示更多」下拉过宽

### 使用场景

- 文章/公告/知识库等内容编辑与预览
- 需要嵌入 3D 产品模型或说明视频的营销/帮助文档
- 需要可配置、可复用的交互区块（LiveComponent）的运营页面
- 需要在富文本中嵌入可填写表单（FormCreator / SchemaRenderer）的场景
- 邮件/通知等 lodash 模版内容编写（变量与条件）
- 技术文档等需要 Markdown 源码编辑与输出的场景

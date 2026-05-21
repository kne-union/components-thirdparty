基于 CKEditor 5 的富文本编辑器封装，面向表单与内容生产场景，提供完整工具栏、图片/表格编辑、Markdown 输出，以及 3D 模型、视频、交互组件等富媒体能力。

### 主要特性

- **双模式**：富文本（HTML）与 Markdown（`isMarkdown`），Markdown 下自动剔除 3D、视频、交互组件相关工具与配置
- **富媒体插件**：GLB 3D 模型（`@google/model-viewer`）、HTML5 视频、LiveComponent（`LiveComponentEditor` 编辑 + `LiveComponentView` 渲染）
- **统一上传**：图片、3D、视频共用 `uploadAdapter` / `preset.apis.file`，未配置 `upload` 时回退 base64
- **预览增强**：`CKEditor.Content` 同步视频尺寸、挂载交互组件、3D 全屏预览（含移动端 overlay）
- **工具栏适配**：`CKEditor.Field` 按容器宽度设置 `--ck-toolbar-dropdown-max-width`，避免「显示更多」下拉过宽

### 使用场景

- 文章/公告/知识库等内容编辑与预览
- 需要嵌入 3D 产品模型或说明视频的营销/帮助文档
- 需要可配置、可复用的交互区块（LiveComponent）的运营页面
- 技术文档等需要 Markdown 源码编辑与输出的场景

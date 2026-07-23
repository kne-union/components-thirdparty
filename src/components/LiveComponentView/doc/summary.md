动态 React 组件渲染器：解析 `LiveComponentEditor` 导出的 `content` 配置，经 Babel 转译后在运行环境中执行 JSX，用于内容预览、文档演示及 CKEditor 交互组件阅读态。

### 主要特性

- **配置驱动**：`content` 为 PlantUML 编码的 JSON，含组件源码、`props` 默认值、`scope` 远程模块
- **远程拉取**：`LiveComponentView.Fetch` 通过内容 url（或 loader）拉取配置后渲染
- **全局 libs**：可通过 `preset({ libs })` 全局注入工具库（同 react-fetch）
- **运行时注入**：支持通过 `props` 覆盖配置内默认值；通过 `libs` 注入 lodash、dayjs 等库名与实例
- **远程组件**：`scope` 声明 `components-core:FormInfo` 等模块 token，加载完成后渲染
- **错误隔离**：编译/运行错误与 `ErrorBoundary` 统一展示可读堆栈，避免 `[object Error]`
- **与编辑器配套**：与 `LiveComponentEditor` 编辑、`CKEditor` `insertLiveComponent` 插入链路一致

### 使用场景

- 富文本中 `section.ck-live-component` 区块的阅读态渲染
- 组件文档站、运营后台预览可配置表单/卡片
- 在线搭建平台将用户保存的配置直接展示

# components-thirdparty

用于封装一些体积较大的需要使用时再加载的第三方库

[更多文档](https://www.kne-union.top/#/components)

开始：

```shell
npm run start
```

<!--START_SECTION:DOC_MD-->

| 组件 | 简介 |
|------|------|
| [Calendar](docs/Calendar.md) | ### 组件概述 Calendar 是一个基于 FullCalendar 的日历组件，提供了丰富的日历展示和交互功能。该组件支持多种视图模式（月视图、周视图、日视图、列表视图），并集成了拖拽、点击等交互操作。 ### 主要特性 -… |
| [CKEditor](docs/CKEditor.md) | 基于 CKEditor 5 的富文本编辑器封装，面向表单与内容生产场景，提供完整工具栏、图片/表格编辑、Markdown 输出，以及 3D 模型、视频、交互组件等富媒体能力。 ### 主要特性 - **双模式**：富文本（HTML）与… |
| [CodeEditor](docs/CodeEditor.md) | ### 组件概述 CodeEditor 是基于 Monaco Editor 的代码编辑器组件，提供了强大的代码编辑功能。Monaco Editor 是 VS Code 的编辑器核心，支持语法高亮、代码补全、错误检测等特性。 ###… |
| [Echart](docs/Echart.md) | ### 组件概述 Echart 是基于 Apache ECharts 的图表组件，提供了丰富的数据可视化功能。该组件封装了 ECharts 的初始化、配置更新和响应式调整等核心功能，简化了图表的使用流程。 ### 主要特性 - 支持所有… |
| [FormCreator](docs/FormCreator.md) | 配置式表单搭建组件：通过字段列表 UI 产出 Schema，并用 `@kne/form-info` 实时预览与运行时渲染。 |
| [JSONEditor](docs/JSONEditor.md) | JSON数据编辑器，支持代码编辑与预览切换，可作为表单字段使用。 |
| [JSONSchemaForm](docs/JSONSchemaForm.md) | 将 JSON Schema 转换为 `@kne/form-creator` Schema，并用 `SchemaRenderer` 渲染可提交表单。 |
| [LiveComponentEditor](docs/LiveComponentEditor.md) | ### 组件概述 LiveComponentEditor 是一个实时的组件编辑器，允许用户在运行时动态编辑和预览 React 组件。该组件提供了代码编辑、参数配置、作用域管理等功能，并支持多种布局模式。 ### 主要特性 -… |
| [LiveComponentsAdmin](docs/LiveComponentsAdmin.md) | # LiveComponentsAdmin 管理 Live 组件远程站点及其文件内容。 - 列表：`components-admin:BizUnit` 对接站点 CRUD / 开闭 - 详情：`LiveComponentEditor`… |
| [LiveComponentView](docs/LiveComponentView.md) | 动态 React 组件渲染器：解析 `LiveComponentEditor` 导出的 `content` 配置，经 Babel 转译后在运行环境中执行 JSX，用于内容预览、文档演示及 CKEditor 交互组件阅读态。 ###… |
| [LottiePlayer](docs/LottiePlayer.md) | ### 组件概述 LottiePlayer 是基于 Lottie Web 的动画播放器组件，用于播放 Adobe After Effects 导出的动画文件。该组件支持 JSON 格式的动画数据，提供了流畅的动画播放体验。 ###… |
| [MarkdownRender](docs/MarkdownRender.md) | 基于 `@kne/markdown-components-render` 的 Markdown 渲染封装，在标准 Markdown 上支持通过 YML 代码块与行内语法嵌入 React 组件，并可用 `variables`… |
| [ModelView](docs/ModelView.md) | 使用 @google/model-viewer 展示 3D 模型的组件，仅支持 GLB 格式，可配置自动旋转、相机控制、阴影效果等。 |

<!--END_SECTION:DOC_MD-->

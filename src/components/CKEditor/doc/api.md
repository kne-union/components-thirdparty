### CKEditor

经 `createWithRemoteLoader` 包装，用于 `components-core:FormInfo` 表单场景。作为表单项使用时属性与 `CKEditor.Field` 一致（如 `name`、`label`、`value`、`onChange`、`isMarkdown`、`config` 等），由 `useDecorator` 注入受控逻辑。

### CKEditor.Field

富文本 / Markdown 编辑器本体。

#### 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| className | 外层容器类名 | string | - |
| style | 外层容器样式；内部会合并 `--ck-toolbar-dropdown-max-width` | object | - |
| isMarkdown | 是否 Markdown 模式。为 `true` 时不加载 3D、视频、交互组件、图表插件，并从工具栏移除 `model3dUpload`、`videoUpload`、`insertLiveComponent`、`insertEchart` | boolean | false |
| config | CKEditor 5 配置，与内置 `defaultConfig` 深合并 | object | 见下方 config |
| plugins | 追加的 CKEditor 插件类 | array | [] |
| locale | 界面语言，`zh-CN` 或 `en` 等；未传时使用 `@kne/global-context` 的 `locale` | string | 上下文 locale |
| uploadAdapter | 图片上传与粘贴转存；富文本下亦作为 `modelUpload` / `videoUpload` 的默认合并源 | object | `preset.apis.file` 的 `upload`、`uploadUrl` |
| liveComponent | 交互组件预览/编辑扩展参数，与 `config.liveComponent` 合并，见下表 | object | `{}` |
| model3d | 3D 模型预览扩展参数，与 `config.model3d` 合并，见下表 | object | 见 `defaultConfig.model3d` |
| value | 编辑器 HTML / Markdown 内容 | string | - |
| onChange | 内容变化回调 `(html: string) => void` | function | - |

#### 工具栏宽度

容器通过 `useToolbarDropdownMaxWidth` 监听宽度，将 CSS 变量 `--ck-toolbar-dropdown-max-width` 写入外层 `style`，限制主工具栏「显示更多」下拉的最大宽度。也可在业务侧使用包内导出的 `useToolbarDropdownMaxWidth`、`getToolbarDropdownMaxWidthStyle`、`formatToolbarDropdownMaxWidth` 自定义包裹层。

### CKEditor.Content

只读内容预览，接收与编辑器一致的 HTML 字符串。

#### 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| className | 预览根节点类名（叠加 `ck ck-content`） | string | - |
| children | HTML 字符串，经 `dangerouslySetInnerHTML` 渲染 | string | - |
| liveComponent | 传给 `LiveComponentView` 的扩展参数，需与编辑区 `Field` 侧配置一致 | object | - |
| model3d | 传给预览区 `model-viewer` 的属性与全屏等行为配置 | object | - |

#### 预览行为

- **视频**：对 `figure.ck-video` 同步内联宽高到内部 `video`
- **3D 模型**：加载 `model-viewer` 后同步布局；支持全屏预览（桌面全屏 API，移动端固定层 overlay）
- **交互组件**：对 `section.ck-live-component[data-live-component]` 挂载 `LiveComponentView`；卸载时清理
- **图表**：对 `figure.ck-echart[data-echart-option]` 挂载 `@components/Echart` 渲染

### config 配置说明

与 CKEditor 5 一致项以外，本组件扩展如下（`merge` 进编辑器 `config`）：

| 配置项 | 说明 |
| --- | --- |
| toolbar | 主工具栏。传入 `toolbar.items` 时会**整体替换**默认项（非按索引合并）。富文本默认含 `imageUpload`、`model3dUpload`、`videoUpload`、`insertLiveComponent`、`insertEchart` 等 |
| image | 图片浮动工具栏 |
| table | 表格内容工具栏 |
| htmlSupport | GeneralHtmlSupport 白名单；已允许 `model-viewer`、`figure.ck-video`、`figure.ck-echart`、`section.ck-live-component` 等 |
| uploadAdapter | 图片上传：`upload(file)` 返回 URL 或 `{ code, data, msg }`；`uploadUrl` 粘贴外链转存；`base64MaxWidth` / `base64MaxHeight` 控制无 `upload` 时的 base64 缩放 |
| modelUpload | **仅富文本**。3D 上传，默认合并 `uploadAdapter`；仅 `.glb`；无 `upload` 时 base64 嵌入 |
| videoUpload | **仅富文本**。视频上传，默认合并 `uploadAdapter`；支持 mp4、webm、ogg、mov 等；无 `upload` 时 base64 嵌入 |
| model3d.toolbar | **仅富文本**。3D 浮动工具栏，默认 `model3dStyle:*`、`resizeModel3d:*`、`resizeModel3dHeight:*`，可拖拽缩放 |
| mediaVideo.toolbar | **仅富文本**。视频浮动工具栏，默认 `mediaVideoStyle:*`、`resizeMediaVideo:*`、`resizeMediaVideoHeight:*` |
| liveComponent | **仅富文本**。交互组件渲染/编辑参数，见下表 |
| echart.toolbar | **仅富文本**。图表浮动工具栏，默认 `echartStyle:*`、`resizeEchart:*`、`resizeEchartHeight:*`，可拖拽缩放 |
| model3d | **仅富文本**。3D 模型 `model-viewer` 参数，见下表 |

上传函数约定与图片相同：返回字符串 URL，或 `{ code: 0, data: 'url', msg }`（`code !== 0` 时展示失败占位图/提示）。

### 富文本扩展与存储结构

#### 3D 模型（Model3dPlugin）

- 工具栏：`model3dUpload`
- 存储：`figure` + `model-viewer`，类名 `ck-model3d`，支持对齐与拖拽缩放

#### 视频（VideoPlugin）

- 工具栏：`videoUpload`
- 存储：`figure.ck-video` 包裹 `video`，支持对齐与拖拽缩放

#### 交互组件（LiveComponentPlugin）

- 工具栏：`insertLiveComponent`，弹窗内嵌 `LiveComponentEditor`
- 存储：`<section class="component-box ck-live-component" data-live-component="PlantUML编码配置">`
- 编辑区与 `CKEditor.Content` 均通过 `LiveComponentView` 渲染；双击已插入块可再次打开编辑

#### ECharts 图表（EchartPlugin）

- 工具栏：`insertEchart`，弹窗内嵌 `JSONEditor` 编辑 ECharts `option` JSON
- 存储：`<figure class="ck-echart"><div class="ck-echart-inner" data-echart-option="..."></div></figure>`
- 编辑区与 `CKEditor.Content` 均通过 `@components/Echart` 渲染；选中后可拖拽调整宽高，双击可再次编辑配置

#### liveComponent 参数（Field / Content / config.liveComponent）

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| height | 编辑区/预览区挂载容器最小高度 | number \| string |
| libs | 传给 `LiveComponentView` 的运行库（如 `{ lodash, dayjs }`） | object |
| props | 传给 `LiveComponentView` 的属性覆盖 | object |
| editor.height | `LiveComponentEditor` 弹窗高度 | number |
| editor.libs | 传给 `LiveComponentEditor` 的 `libs` | object |

`CKEditor.Field` 与 `CKEditor.Content` 应传入**相同**的 `liveComponent`，保证编辑预览与阅读预览一致。

#### model3d 参数（Field / Content / config.model3d）

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| height | 预览默认高度（内容未内联高度时） | string |
| viewer | `model-viewer` 属性，与 `ModelView` 对齐：`autoRotate`、`cameraControls`、`poster`、`loading`、`exposure` 等 | object |
| preview.enableFullscreen | `Content` 预览是否显示全屏按钮 | boolean | `true` |
| toolbar | 编辑器内浮动工具栏项（已有） | array |

### Markdown 模式说明

`isMarkdown={true}` 时：

- 追加 CKEditor `Markdown` 插件，输出 Markdown 源码
- 不注册 `Model3dPlugin`、`VideoPlugin`、`LiveComponentPlugin`
- 从 `config` 中剥离 `model3d`、`modelUpload`、`videoUpload`、`mediaVideo`
- 自定义 `plugins` 传入上述插件时会被过滤

预览 Markdown 请配合 `@kne/markdown-components-render`（见 `doc/markdown.js`）。

### 包导出工具函数

| 名称 | 说明 |
| --- | --- |
| formatToolbarDropdownMaxWidth | 将数字或字符串格式化为 CSS 宽度值 |
| getToolbarDropdownMaxWidthStyle | 生成含 `--ck-toolbar-dropdown-max-width` 的 style 对象 |
| useToolbarDropdownMaxWidth | 对容器 ref 做 ResizeObserver，返回当前可用最大宽度 |

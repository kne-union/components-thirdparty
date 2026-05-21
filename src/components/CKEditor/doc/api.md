|属性名|说明|类型|默认值|
|  ---  | --- | --- | --- |
|className|自定义类名|string|-
|isMarkdown|是否启用 Markdown 模式（不含 3D 模型上传与 `Model3dPlugin`）|boolean|false
|config|编辑器配置对象，可自定义工具栏和插件配置|object|详见下方配置
|plugins|自定义插件数组|array|[]
|value|编辑器内容|string|-
|onChange|内容变化回调函数|function|-
|style|外层容器样式|object|-

`CKEditor.Field` 会根据外层容器宽度自动设置 CSS 变量 `--ck-toolbar-dropdown-max-width`，用于限制工具栏「显示更多」下拉的最大宽度。

### config 配置说明
- `toolbar`: 工具栏配置，包含各种编辑功能按钮
- `image`: 图片编辑工具栏配置
- `table`: 表格编辑工具栏配置
- `htmlSupport`: HTML支持配置，允许的标签和属性
- `uploadAdapter`: 图片上传配置，`upload` 上传文件，`uploadUrl` 粘贴图片转存
- `modelUpload`: 3D 模型上传配置（仅支持 `.glb`，**仅富文本模式**），默认合并 `uploadAdapter`；`upload` 与图片相同，返回 `{ code, data, msg }`，`data` 为模型 URL。未配置 `upload` 时模型文件转为 base64 嵌入
- `model3d.toolbar`: 选中 3D 模型时显示的工具栏（**仅富文本模式**），支持 `model3dStyle:*` 对齐/环绕样式与 `resizeModel3d:*` 尺寸（25%/50%/75%/原始），可拖拽边角调整宽度

|属性名|说明|类型|默认值|
|  ---  | --- | --- | --- |
|className|自定义类名|string|-
|isMarkdown|是否启用 Markdown 模式（不含 3D 模型、视频上传及相关插件）|boolean|false
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
- `videoUpload`: 视频上传配置（**仅富文本模式**），默认合并 `uploadAdapter`；`upload` 与图片相同。支持 mp4、webm、ogg、mov 等常见格式。未配置 `upload` 时视频转为 base64 嵌入
- `model3d.toolbar`: 3D 模型浮动工具栏（**仅富文本模式**），默认含 `model3dStyle:*`、`resizeModel3d:*`、`resizeModel3dHeight:*`，可拖拽边角自由缩放
- `mediaVideo.toolbar`: 视频浮动工具栏（**仅富文本模式**），默认含 `mediaVideoStyle:*`、`resizeMediaVideo:*`、`resizeMediaVideoHeight:*`，行为与 3D 模型一致

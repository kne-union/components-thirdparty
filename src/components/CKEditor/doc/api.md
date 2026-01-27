|属性名|说明|类型|默认值|
|  ---  | --- | --- | --- |
|className|自定义类名|string|-
|isMarkdown|是否启用Markdown模式|boolean|false
|config|编辑器配置对象，可自定义工具栏和插件配置|object|详见下方配置
|plugins|自定义插件数组|array|[]
|value|编辑器内容|string|-
|onChange|内容变化回调函数|function|-

### config 配置说明
- `toolbar`: 工具栏配置，包含各种编辑功能按钮
- `image`: 图片编辑工具栏配置
- `table`: 表格编辑工具栏配置
- `htmlSupport`: HTML支持配置，允许的标签和属性

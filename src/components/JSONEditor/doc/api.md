|属性名|说明|类型|默认值|
|  ---  | --- | --- | --- |
|value|编辑器的JSON字符串值|string|-
|onChange|内容变化回调函数|function(value: string)|-

### JSONEditor.Field

直接使用的不带表单装饰器的纯UI组件，需手动传入 `value` 和 `onChange`。

### JSONEditor（默认导出）

通过 `createWithRemoteLoader` 包装的表单字段组件，在 FormInfo 表单中使用时自动通过 `useDecorator` 绑定表单上下文，支持 `name`、`label`、`rule` 等表单字段属性。

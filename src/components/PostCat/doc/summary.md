OpenAPI 文档管理与展示组件，参考 [components-postcat](https://github.com/kne-union/components-postcat) 用最新组件重新实现，采用与 LiveComponentEditor 相同的站点模式组织数据。

- 站点：左侧复用 LiveComponentEditor 的站点文件面板，`localStorage:KEY` 为浏览器本地站点，`http(s)` 地址为远程站点（协议与 LiveComponentEditor 一致）；用户可添加 / 编辑自定义站点
- 文件：每个文件存一份 OpenAPI JSON；空文件可导入 JSON 或一键导入示例，可写文件支持重新导入覆盖，任意文件可导出
- 文档：按 tag 分组的接口树，每个接口分「文档」「请求」两个页签；参数、请求体、响应的 schema 树表与示例，内置在线调试（选择环境、文档 servers 或自定义地址发送请求）
- 接口用例：参考 Apifox，在「请求」页签可把当前参数「保存为用例」，用例列在该接口「请求」页签左侧，点击即还原参数直接重新调用；用例存在文档文件的 `x-postcat-cases` 字段，随站点保存
- 调用记录：参考 Apifox，左侧「历史」页签按日期列出发送过的请求，点击还原请求参数与响应，支持搜索、删除、清空；按站点 + 文件存在浏览器本地
- 环境：传入 `envs` 时开启环境管理，`envs` 为只读预置环境，用户可按站点在本地追加环境；不传 `envs` 则不显示环境管理
- 支持 OpenAPI 3.x 与 Swagger 2.0，递归展开 `$ref`（循环引用会标记）、合并 `allOf`

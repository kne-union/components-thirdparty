### PostCat

站点模式工作台：左侧站点文件树，右侧 OpenAPI 文档。

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| sites | 预置站点 `[{ host, name }]`，`host` 为 `localStorage:KEY` 或远程站点 base URL | array | `[]` |
| onSitesChange | 用户站点列表变化回调 | function | - |
| siteActionsOpen | 是否允许用户添加 / 编辑自定义站点 | boolean | true |
| userSitesStorageKey | 用户站点与选中状态的 localStorage key | string | `postcat:user-sites` |
| envs | 预置调试环境 `[{ id, name, baseUrl, headers }]`，只读；不传则不开启环境管理 | array | - |
| envActionsOpen | 是否允许用户按站点添加 / 编辑 / 删除本地环境 | boolean | true |
| userEnvsStorageKey | 用户环境的 localStorage key，结构 `{ [siteHost]: env[] }` | string | `postcat:user-envs` |
| tryIt | 是否显示在线调试 | boolean | true |
| historyStorageKey | 调用记录的 localStorage key，结构 `{ [siteHost:fileId]: record[] }` | string | `postcat:history` |
| maxHistory | 每个文件最多保留的调用记录条数 | number | 100 |
| width | 站点面板宽度 | number | 260 |
| height | 组件高度 | number \| string | 640 |
| bordered | 是否显示外边框 | boolean | true |
| className | 根节点 className | string | - |
| style | 根节点样式 | object | - |

#### 接口用例

每个接口分「文档」「请求」两个页签。参考 Apifox「保存为用例」：在「请求」页签填好参数后点「保存为用例」并命名；接口有用例时，「请求」页签改为左右布局：左侧是「临时请求 + 各用例」列表（悬停可重命名、删除），右侧是请求区；接口区域宽度小于 640px 时，左侧列表改为请求区上方的 SuperSelect 下拉选择，重命名、删除按钮跟在下拉旁。点击用例即还原其环境、参数与请求体，可直接重新发送。打开用例后可「保存」覆盖或「另存为」新用例。左侧接口树只在有用例的接口后显示用例数量。请求体的 Content-Type 为 JSON 且 schema 是 `object` 时，可在「表单」（jsonschema-form 按 schema 生成）和「JSON」编辑器之间切换，两边数据互通；JSON 不合法时不能切回表单。

用例保存在文档文件顶层的 `x-postcat-cases` 字段（OpenAPI 扩展字段），随站点文件一起存储（本地或服务端）并随「导出 API」导出；只读文件可查看和运行用例，但不能新增、修改或删除。

#### 编辑接口

可写的 `*.json` 文件可以维护接口：左侧搜索框旁「+」新增接口，接口标题右侧「编辑」「删除」（删除需二次确认）。编辑弹窗顶部可在「表单」和「JSON」之间切换，两边数据互通：「表单」用 FormInfo 填写方法、路径、名称、分组、说明、是否废弃，以及请求参数列表、请求体、响应列表（Swagger 2.0 文档不显示请求体）。Schema 用树形编辑器维护：每行填字段名、类型、必填、说明，`object` 可添加子字段，`array` 展开 `items` 设置元素类型，类型下拉中也可直接选择文档里的模型生成 `$ref`；「JSON」直接编辑整个接口定义（`method`、`path` 加 OpenAPI operation 字段），表单里没有的字段（如 `operationId`、`security`）在两种模式下都会原样保留。同一方法 + 路径不能重复；修改方法或路径时，该接口的用例会跟着迁移，删除接口时用例一起删除。空文件可点「新建空白文档」从零开始添加接口。订阅和只读文件不显示这些入口。

#### 文档文件与订阅

站点里的文件按扩展名分两种：

- `*.json`：静态文档，文件内容就是 OpenAPI JSON，可导入覆盖、维护用例。
- `*.url`：订阅，文件内容为 `{ "url": "https://..." }`，打开时从该地址请求 OpenAPI 文档。订阅内容只读（不能导入、不能增改用例），工具栏可「刷新」重新拉取，或「另存为文件」保存成 `*.json` 后再编辑。订阅地址需允许跨域访问。

「新建文件」弹窗先选「文件」或「订阅」，名称只填主体部分，后缀（`.json` / `.url`）自动补上；选「订阅」时还需填写订阅地址。

#### 站点协议

与 LiveComponentEditor 站点协议一致（`getFolderTree`、`get`、`create`、`createFolder`、`save`、`rename`、`remove` 等），文件内容为 OpenAPI JSON 字符串；`permission` 为 `r` 的文件只读，不能导入覆盖。

### OpenApiView

单独展示一份 OpenAPI 文档。

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| data | OpenAPI 3.x / Swagger 2.0 文档对象 | object | - |
| envs | 调试可选环境 `[{ id, name, baseUrl, headers }]`，`headers` 为 JSON 字符串或对象 | array | `[]` |
| tryIt | 是否显示在线调试（关闭后同时隐藏调用记录） | boolean | true |
| history | 调用记录（受控） | array | - |
| defaultHistory | 调用记录初始值（非受控，仅存内存） | array | `[]` |
| onHistoryChange | 调用记录变化回调 | function(list) | - |
| maxHistory | 最多保留的调用记录条数 | number | 100 |
| cases | 接口用例（受控） | array | - |
| defaultCases | 接口用例初始值（非受控） | array | `[]` |
| onCasesChange | 接口用例变化回调 | function(list) | - |
| caseActionsOpen | 是否允许新增 / 修改 / 删除用例 | boolean | true |
| apiActionsOpen | 是否允许新增 / 编辑 / 删除接口（需同时传 `onDataChange`） | boolean | true |
| onDataChange | 接口增删改后的文档回调，`(doc, { fromKey, toKey })`：`fromKey` 为原接口 key（新增为 null），`toKey` 为新 key（删除为 null） | function | - |
| className | 根节点 className | string | - |

#### 接口用例结构

```js
{ id, name, operationKey, request: { target, baseUrl, customBaseUrl, path, query, header, body }, createdAt, updatedAt }
```

`operationKey` 为 `${method}:${path}`。

#### 调用记录

每次在「请求」页签发送请求后新增一条记录，最新的在前：

```js
{
  id, time, operationKey, method, path, summary, url,
  request: { target, baseUrl, customBaseUrl, path, query, header, body },
  response: { status, statusText, duration, headers, data } // 请求失败时为 { error, duration }
}
```

左侧「历史」页签按日期分组展示，可搜索、单条删除、清空；点击记录会切到对应接口并还原请求参数与响应结果。接口已不在文档中的记录置灰不可点。响应体超过 100KB 时截断后保存。

### EnvPanel

环境列表：`presetEnvs` 只读展示，`userEnvs` 在 `envActionsOpen` 时可增删改，变更通过 `onUserEnvsChange(list)` 回调。

### 其他导出

| 导出 | 说明 |
|------|------|
| parseOpenApiData | 把 OpenAPI 文档解析为 `{ info, servers, tags, operations }` |
| isOpenApiDoc | 判断对象是否为 OpenAPI / Swagger 文档 |
| loadSampleDoc | 异步加载内置 Petstore 示例文档 |
| downloadJSON | `downloadJSON(data, filename)` 下载 JSON 文件 |
| ImportButton | 选择本地 JSON 文件的按钮，`onImport(data)` / `onError(error)` |
| createSiteApi | 同 LiveComponentEditor，按 host 生成站点读写接口 |
| isLocalStorageHost | 判断 host 是否为本地站点 |

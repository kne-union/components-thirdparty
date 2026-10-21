# PostCat

### 概述

OpenAPI 文档管理与展示组件，参考 [components-postcat](https://github.com/kne-union/components-postcat) 用最新组件重新实现，采用与 LiveComponentEditor 相同的站点模式组织数据。

- 站点：左侧复用 LiveComponentEditor 的站点文件面板，`localStorage:KEY` 为浏览器本地站点，`http(s)` 地址为远程站点（协议与 LiveComponentEditor 一致）；用户可添加 / 编辑自定义站点
- 文件：每个文件存一份 OpenAPI JSON；空文件可导入 JSON 或一键导入示例，可写文件支持重新导入覆盖，任意文件可导出
- 文档：按 tag 分组的接口树，每个接口分「文档」「请求」两个页签；参数、请求体、响应的 schema 树表与示例，内置在线调试（选择环境、文档 servers 或自定义地址发送请求）
- 接口用例：参考 Apifox，在「请求」页签可把当前参数「保存为用例」，用例列在该接口「请求」页签左侧，点击即还原参数直接重新调用；用例存在文档文件的 `x-postcat-cases` 字段，随站点保存
- 调用记录：参考 Apifox，左侧「历史」页签按日期列出发送过的请求，点击还原请求参数与响应，支持搜索、删除、清空；按站点 + 文件存在浏览器本地
- 环境：传入 `envs` 时开启环境管理，`envs` 为只读预置环境，用户可按站点在本地追加环境；不传 `envs` 则不显示环境管理
- 支持 OpenAPI 3.x 与 Swagger 2.0，递归展开 `$ref`（循环引用会标记）、合并 `allOf`


### 示例(全屏)

#### 示例代码

- 站点模式
- 与 LiveComponentEditor 相同的站点管理：左侧站点文件树（localStorage:KEY 为本地站点，http 地址为远程站点，可添加自定义站点），每个文件是一份 OpenAPI JSON；右侧展示文档、在线调试，支持导入 / 导出与环境管理。演示首次进入会在本地站点写入 Petstore 示例
- _PostCat(@components/PostCat),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: PostCat, createSiteApi, loadSampleDoc } = _PostCat;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useEffect, useState } = React;

const DEMO_HOST = 'localStorage:postcat-demo';

const seedDemoSite = async () => {
  const api = createSiteApi(DEMO_HOST);
  const tree = await api.getFolderTree();
  if (tree.length === 0) {
    const doc = await loadSampleDoc();
    await api.create({ name: 'petstore.json', content: JSON.stringify(doc, null, 2) });
    await api.create({
      name: 'petstore-online.url',
      content: JSON.stringify({ url: 'https://petstore3.swagger.io/api/v3/openapi.json' }, null, 2)
    });
  }
};

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDemoSite().finally(() => setReady(true));
  }, []);

  return (
    <PureGlobal preset={mockPreset}>
      {ready && (
        <PostCat
          height={720}
          sites={[{ host: DEMO_HOST, name: '本地文档' }]}
          envs={[{ id: 'petstore', name: 'Petstore', baseUrl: 'https://petstore3.swagger.io/api/v3' }]}
        />
      )}
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 文档展示
- 单独使用 OpenApiView 展示一份 OpenAPI 文档：按 tag 分组的接口菜单、参数与 schema 树表、响应、示例和在线调试
- _PostCat(@components/PostCat),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { OpenApiView, loadSampleDoc } = _PostCat;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Spin } = antd;
const { useEffect, useState } = React;

const ViewExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    loadSampleDoc().then(setDoc);
  }, []);

  return (
    <PureGlobal preset={mockPreset}>
      {doc ? (
        <OpenApiView
          data={doc}
          envs={[{ id: 'mock', name: 'Petstore', baseUrl: 'https://petstore3.swagger.io/api/v3', headers: '{"Accept": "application/json"}' }]}
        />
      ) : (
        <Spin />
      )}
    </PureGlobal>
  );
});

render(<ViewExample />);

```

### API

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
| maxHistory | 最多保留的调用记录条数（服务端分页时传 `Infinity`，避免截断已加载记录） | number | 100 |
| historyTotal | 调用记录总条数（服务端分页时显示），不传为已加载条数 | number | - |
| historyHasMore | 是否还有更多调用记录；为 true 且传 `onHistoryLoadMore` 时开启下拉加载 | boolean | false |
| onHistoryLoadMore | 加载下一页调用记录，返回 Promise；结果需由调用方追加到 `history` | function | - |
| onHistorySearch | 传入后调用记录搜索交给调用方（如服务端），参数为关键字（输入停顿 300ms 后触发），不再本地过滤；结果需由调用方替换 `history` | function(keyword) | - |
| onHistoryClear | 点「清空」时回调（在 `onHistoryChange([])` 之前），服务端分页时用来清空未加载的记录 | function | - |
| caseCounts | 各接口的用例总数 `{ [operationKey]: count }`（服务端分页时传），接口树数量与「请求」页签是否显示用例列表以此为准 | object | - |
| onCasesLoadMore | 加载某接口下一页用例，参数 `operationKey`，返回 Promise；打开接口且未加载用例时自动加载第一页，结果需由调用方追加到 `cases` | function(operationKey) | - |
| cases | 接口用例（受控） | array | - |
| defaultCases | 接口用例初始值（非受控） | array | `[]` |
| onCasesChange | 接口用例变化回调 | function(list) | - |
| caseActionsOpen | 是否允许新增 / 修改 / 删除用例 | boolean | true |
| apiActionsOpen | 是否允许新增 / 编辑 / 删除接口（需同时传 `onDataChange`） | boolean | true |
| onDataChange | 接口增删改后的文档回调，`(doc, { fromKey, toKey })`：`fromKey` 为原接口 key（新增为 null），`toKey` 为新 key（删除为 null） | function | - |
| stickyTop | 左侧接口 / 调用记录列表吸顶时距视口顶部的距离（页面有固定 header 时传 header 高度），数字按 px | number \| string | 0 |
| className | 根节点 className | string | - |

分页与搜索相关属性（`historyTotal`、`historyHasMore`、`onHistoryLoadMore`、`onHistorySearch`、`onHistoryClear`、`caseCounts`、`onCasesLoadMore`）均为可选：不传时调用记录与用例按全量本地数据处理，PostCat 站点模式（本地站点 / 服务器站点）即为此方式。

调试参数按 schema 填写：类型只作为输入框 placeholder，初值只取 schema 声明的 `example` / `default`；`object` 类型的 query / header 参数用 jsonschema-form 按属性填写，query 中按 `name[key]=value` 展开（参数声明 `style: form` 且 explode 时按属性平铺）；数组参数重复参数名（`name=a&name=b`，输入框可填 JSON 数组或逗号分隔），对象内的数组用 `name[key][]=value`。

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

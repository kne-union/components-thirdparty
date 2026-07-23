### LiveComponentView

根据编码配置动态编译并渲染 React 组件，默认导出组件已外包一层 `ErrorBoundary`。

#### 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 组件配置字符串，经 `plantuml-encoder` 解码后为 JSON（必填） | string | - |
| props | 运行时属性，与配置内 `props` 解析后的默认值合并，同名以本属性为准 | object | - |
| libs | 注入运行环境的库；与 `preset({ libs })` 合并，同名以本属性为准 | object | - |
| enableSourceLocate | 是否注入 `data-live-line` / `data-live-column`（供编辑器预览定位源码） | boolean | false |

#### preset

用法同 `@kne/react-fetch` 的 `preset`，用于全局注入 `libs`（入口调用一次即可）：

```js
import { preset } from '@components/LiveComponentView';
// 或 LiveComponentView.preset({ libs: { lodash, dayjs } })
preset({ libs: { lodash, dayjs, _: lodash } });
```

之后组件可不传 `libs`，仍可在动态 JSX 中使用对应标识符；组件级 `libs` 会覆盖全局同名键。

#### content 解码结构

解码后对象字段：

| 字段 | 说明 |
| --- | --- |
| content | 组件 JSX 源码字符串，内部以 `render(...)` 包裹后由 Babel（es2015 + react）编译 |
| props | 参数定义：`{ name: { type, defaultValue } }`，`type` 支持 string、number、boolean、array、object、function |
| scope | 远程模块映射：`{ 变量名: 'moduleToken' }`，如 `{ FormInfo: 'components-core:FormInfo' }` |

`content` 为空或解码失败时展示错误文案；`scope` 模块未加载完成前显示 `Spin`。

使用 `components-core:FormInfo` 时，JSX 须写在 `<FormInfo.Form data={{...}}>` 内（或 `scope` 含 `FormInfo` 且内容出现 `<FormInfo` 时，组件会自动外包一层 `FormInfo.Form`，避免缺少 Form 上下文导致 `useCacheRemove` 报错）。

#### 运行环境内置标识

| 标识 | 说明 |
| --- | --- |
| React | React 核心 |
| Antd | antd 全量导出 |
| props | 合并后的组件属性 |
| scope 中的变量名 | 远程加载的模块（另含 `PureGlobal`） |

`libs` 中声明的键（如 `lodash`、`dayjs`）会作为额外参数传入编译后的函数，须在 JSX 中按同名使用。

#### props.type 与 defaultValue

| type | defaultValue 处理 |
| --- | --- |
| string | 原样字符串 |
| number / boolean / array / object | `JSON.parse(defaultValue)` |
| function | 固定为 `() => null` |

#### 错误处理

编译错误、运行时异常、`JSON.parse(decode(...))` 失败均通过 `ErrorComponent` 展示；`Error` 对象会格式化为 `message` 或 `stack` 文本。

#### 典型用法

- 只读展示：`<LiveComponentView content={encoded} libs={{ lodash, dayjs }} />`
- 覆盖标题：`<LiveComponentView content={encoded} props={{ title: '自定义标题' }} />`
- 配置来源：与 `LiveComponentEditor` 输出、`CKEditor` `data-live-component` 属性相同

### LiveComponentView.Fetch

基于 `@kne/react-fetch`：请求内容 url（如 live-components-site 的 `{prefix}/content/{contentShorten}`，`text/plain` 直出配置字符串）后交给 `LiveComponentView` 渲染。

#### 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | 内容地址（与 react-fetch 一致） | string | - |
| loader | 自定义加载；存在时优先生效，返回值即为 content 字符串 | function | - |
| libs | 同 LiveComponentView | object | - |
| enableSourceLocate | 同 LiveComponentView | boolean | false |
| 其他业务字段 | 直接作为运行时 props 传入（如 `headline="自定义"`），覆盖配置内同名默认值 | any | - |
| 其他 | 透传给 react-fetch（method、cache、loading、error 等） | - | GET |

内容接口非 `{code,data}` JSON，组件内已用专用 `transformResponse` 将响应体映射为 fetch 的 `results`。

#### 典型用法

```jsx
<LiveComponentView.Fetch url={contentUrl} libs={{ lodash, dayjs }} />
<LiveComponentView.Fetch url={contentUrl} libs={{ lodash, dayjs }} headline="自定义" />
```

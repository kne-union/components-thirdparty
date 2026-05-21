### LiveComponentView

根据编码配置动态编译并渲染 React 组件，默认导出组件已外包一层 `ErrorBoundary`。

#### 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 组件配置字符串，经 `plantuml-encoder` 解码后为 JSON（必填） | string | - |
| props | 运行时属性，与配置内 `props` 解析后的默认值合并，同名以本属性为准 | object | - |
| libs | 注入运行环境的库，键名为 JSX 中使用的标识符，值为模块实例 | object | - |

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

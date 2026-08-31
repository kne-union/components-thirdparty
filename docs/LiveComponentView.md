# LiveComponentView

### 概述

动态 React 组件渲染器：解析 `LiveComponentEditor` 导出的 `content` 配置，经 Babel 转译后在运行环境中执行 JSX，用于内容预览、文档演示及 CKEditor 交互组件阅读态。

### 主要特性

- **配置驱动**：`content` 为 PlantUML 编码的 JSON，含组件源码、`props` 默认值、`scope` 远程模块
- **远程拉取**：`LiveComponentView.Fetch` 通过内容 url（或 loader）拉取配置后渲染
- **全局 libs**：可通过 `preset({ libs })` 全局注入工具库（同 react-fetch）
- **运行时注入**：支持通过 `props` 覆盖配置内默认值；通过 `libs` 注入 lodash、dayjs 等库名与实例
- **远程组件**：`scope` 声明 `components-core:FormInfo` 等模块 token，加载完成后渲染
- **错误隔离**：编译/运行错误与 `ErrorBoundary` 统一展示可读堆栈，避免 `[object Error]`
- **与编辑器配套**：与 `LiveComponentEditor` 编辑、`CKEditor` `insertLiveComponent` 插入链路一致

### 使用场景

- 富文本中 `section.ck-live-component` 区块的阅读态渲染
- 组件文档站、运营后台预览可配置表单/卡片
- 在线搭建平台将用户保存的配置直接展示


### 示例

#### 示例代码

- 信息采集表单
- 渲染 LiveComponentEditor 默认 Demo：FormInfo 表单 + 列表，scope 加载 components-core:FormInfo
- _LiveComponentView(@components/LiveComponentView),antd(antd),lodash(lodash),dayjs(dayjs)

```jsx
const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography, Alert } = antd;
const { Title, Paragraph, Text } = Typography;

// LiveComponentEditor 默认 Demo：员工信息采集（FormInfo + 可编辑列表）
const FORM_CONTENT =
  'xLLDQzj04FqhornoaHsdfo8iGngI4WY5DgMNRW-oF4xLh7U5j0eEGf0G2ad0E12tXb8ewGSr3Kro2A7uaZzZAVQ_AEiFHKgTXj9hT95sPjxRUSFJRW2Mu1Av11sAIyAjBVEgoAiFKZ6bQGH169OeByvpMSalCQoJ3NIbRPcCh9cE4SmzK6b224dGHDgIeH4uhd2y_70H4cPxqWXUZaepvVcgZQpYvPUvuql2pHeQ5DIB0c5c6Pb18Vf-61qqA13NPohzRF4fMLbyaYlavWe52hCbZVo5UHKPMWbr1HtJbJNaChN1OASpQ7So6r0Wmf6su5wcR_K4GvW-4-zlnHzF1pkT6Mt3P3xg598GXL2RZXgqjgBMIGQLX2Y4rw1NuHt25bwZjLuMzSUky1rIPi9QdwYqkKGNlRJ6wErv_-BBtR8eHDiV1jz-KaZwcmHkaKGXFczVVMwd49F0xOYzmtZlE6eSNxK-fN6PyByCupdMvRoBPdOE5VGirnuAJeqYRZRxbsVAE2D2HNx3nVaLsvDZArE8TjlzeqxyxYnkd52Oa2jJAzPxRzzx-t-z_OSHhq_SDxudxUgcGS529Pt2wEnzE3bwimDSzSirMpxofHIy53SFUjslnTdfsMdm1PDRoCO5KVDzVB6RWcUouqvdarRLJN5ZbRbJIg21Pma7GGzWaW4TB55p14SklPmbNDIJLAZ1y1fHzSD_KNrKi6hwJBvGOmKTUhz-zBhTtkLHl7qA6iXDHG-UT6s-1c4O_WO0';

const BaseExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 720 }}>
      <Card>
        <Title level={4}>信息采集表单</Title>
        <Paragraph type="secondary">
          下方区块由 <Text code>content</Text> 动态渲染，配置内含 <Text code>scope.FormInfo</Text> 远程模块。可在
          LiveComponentEditor 中编辑后复制新的编码替换本示例常量。
        </Paragraph>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="配置说明"
          description="解码后包含姓名、部门、兴趣等字段及可增删的列表行，默认标题为「个人信息」。"
        />
        <LiveComponentView content={FORM_CONTENT} libs={{ lodash, dayjs }} />
      </Card>
    </Space>
  );
};

render(<BaseExample />);

```

- 活动结果页
- 仅依赖 Antd 的轻量 JSX，展示 content 内 props 默认值（标题、副标题、按钮文案）
- _LiveComponentView(@components/LiveComponentView),antd(antd)

```jsx
const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography } = antd;
const { Title, Paragraph } = Typography;

const RESULT_CONTENT =
  'ZKzDIm9H5FqhmrsBqbOSeTQj8bhDvZc-Qc1wCyox3v9X88SIaG85gIWfN1X314bVXXR-cEOzTTLVYAS9BjtTUpxkEJS4ssD86K8U2fiCozaToeMB5ZCCZWG5DotWmhOfvnPe51rqgHdwWUVpx24bPTTXD9hhHMbtbLpkSv8UOq3CS96n9H0zPc35fwO5Vk0SaQ1YGV7VI6nqFBPDIjID2haLHp6oMAu86PZh81_2ie2UzJd80yV0OGUGWJBT9yB5FU8AZQktaMmagj6JpGjLRyh6FKGPM9PSvq2zbOwUvE15jJzalQ_YP79pcewxglhy-tKk1xtqkvCEXx9rBVirsKcC3IFzV5pWwgedQsVJQdloEb9nydCIw_2LHzV8duxRylPkzd0vwxv3fBlRdZQ4KVG7';

const SimpleExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 560 }}>
      <Card>
        <Title level={4}>活动结果页</Title>
        <Paragraph type="secondary">
          仅使用 Antd 组件，不声明 scope。标题、副标题、按钮文案来自 content 内 props 默认值。
        </Paragraph>
        <LiveComponentView content={RESULT_CONTENT} />
      </Card>
    </Space>
  );
};

render(<SimpleExample />);

```

- 覆盖组件参数
- 通过 LiveComponentView 的 props 覆盖配置中的 headline、subTitle 等字段
- _LiveComponentView(@components/LiveComponentView),antd(antd)

```jsx
const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography, Input, Form } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const RESULT_CONTENT =
  'ZKzDIm9H5FqhmrsBqbOSeTQj8bhDvZc-Qc1wCyox3v9X88SIaG85gIWfN1X314bVXXR-cEOzTTLVYAS9BjtTUpxkEJS4ssD86K8U2fiCozaToeMB5ZCCZWG5DotWmhOfvnPe51rqgHdwWUVpx24bPTTXD9hhHMbtbLpkSv8UOq3CS96n9H0zPc35fwO5Vk0SaQ1YGV7VI6nqFBPDIjID2haLHp6oMAu86PZh81_2ie2UzJd80yV0OGUGWJBT9yB5FU8AZQktaMmagj6JpGjLRyh6FKGPM9PSvq2zbOwUvE15jJzalQ_YP79pcewxglhy-tKk1xtqkvCEXx9rBVirsKcC3IFzV5pWwgedQsVJQdloEb9nydCIw_2LHzV8duxRylPkzd0vwxv3fBlRdZQ4KVG7';

const PropsExample = () => {
  const [headline, setHeadline] = useState('春季校招 · 简历已提交');
  const [subTitle, setSubTitle] = useState('HR 将在 3 个工作日内通过邮件通知面试安排。');
  const [actionLabel, setActionLabel] = useState('查看投递记录');

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 560 }}>
      <Card title="覆盖组件参数">
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          <Text code>LiveComponentView</Text> 的 <Text code>props</Text> 会覆盖 content 配置里的同名默认值，便于同一套模板在不同业务下复用。
        </Paragraph>
        <Form layout="vertical" style={{ marginBottom: 24 }}>
          <Form.Item label="主标题 headline">
            <Input value={headline} onChange={e => setHeadline(e.target.value)} />
          </Form.Item>
          <Form.Item label="副标题 subTitle">
            <Input value={subTitle} onChange={e => setSubTitle(e.target.value)} />
          </Form.Item>
          <Form.Item label="按钮文案 actionLabel">
            <Input value={actionLabel} onChange={e => setActionLabel(e.target.value)} />
          </Form.Item>
        </Form>
        <LiveComponentView
          content={RESULT_CONTENT}
          props={{
            headline,
            subTitle,
            actionLabel
          }}
        />
      </Card>
    </Space>
  );
};

render(<PropsExample />);

```

- 注入工具库
- 通过 libs 传入 dayjs、lodash，在动态 JSX 中格式化时间与汇总数值
- _LiveComponentView(@components/LiveComponentView),antd(antd),lodash(lodash),dayjs(dayjs)

```jsx
const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography } = antd;
const { Title, Paragraph, Text } = Typography;

const STATS_CONTENT =
  'RP7DIiD054PVvJ8RMuYf5j5Qse3emarN2bACo90Psv5a9cIcfJ44n8tLZGf2G1IfuCz22eAwQS6NiMcpwYj8L2f2T_SkphaVtmsG9RYYNA4YAgrmHVHLx15GJDcqRABFtcaStSSFHwF7jeb0Aj-cvI001xUs657r8Ypavo0C3PC3_F0RBhOe4EPHIp71ooPgKayn2zkfW1saMeSHObCJVMCJK675f6BMvFgmTplgTkBeFObUJGHDR3TeEI3OtvUPhBudF0Uhp4orMgtELYgpQskmlbvqd9bi2Bb_vatV5JKFktLVtwGj1SftKxsabk04U_ua241y_JouU4ewRydDtQZxaKJTvFXiSDuUTJlZ_jLqdLIUu3KZsDLbmybip-SB6YmlQf2VdzEWiBIJ3KkvQQ01yNDdt6yFBr_05WJBEiGln_5XRzm_-Oq_dVikE_VNjc7otpLzde4qv7h2bQWOX1gIbd1fEePV';

const LibsExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 480 }}>
      <Card>
        <Title level={4}>注入工具库</Title>
        <Paragraph type="secondary">
          通过 <Text code>libs=&#123;&#123; lodash, dayjs &#125;&#125;</Text> 将库注入运行环境，动态 JSX 中可直接使用
          <Text code>dayjs()</Text>、<Text code>_.sum()</Text> 等。
        </Paragraph>
        <LiveComponentView content={STATS_CONTENT} libs={{ lodash, dayjs }} />
      </Card>
    </Space>
  );
};

render(<LibsExample />);

```

- 远程内容拉取
- LiveComponentView.Fetch 通过内容 url / loader 拉取配置后渲染，业务 props（如 headline）直接写在组件上
- _LiveComponentView(@components/LiveComponentView),antd(antd)

```jsx
const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography } = antd;
const { Title, Paragraph, Text } = Typography;

const RESULT_CONTENT =
  'ZKzDIm9H5FqhmrsBqbOSeTQj8bhDvZc-Qc1wCyox3v9X88SIaG85gIWfN1X314bVXXR-cEOzTTLVYAS9BjtTUpxkEJS4ssD86K8U2fiCozaToeMB5ZCCZWG5DotWmhOfvnPe51rqgHdwWUVpx24bPTTXD9hhHMbtbLpkSv8UOq3CS96n9H0zPc35fwO5Vk0SaQ1YGV7VI6nqFBPDIjID2haLHp6oMAu86PZh81_2ie2UzJd80yV0OGUGWJBT9yB5FU8AZQktaMmagj6JpGjLRyh6FKGPM9PSvq2zbOwUvE15jJzalQ_YP79pcewxglhy-tKk1xtqkvCEXx9rBVirsKcC3IFzV5pWwgedQsVJQdloEb9nydCIw_2LHzV8duxRylPkzd0vwxv3fBlRdZQ4KVG7';

const FetchExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 560 }}>
      <Card>
        <Title level={4}>远程内容拉取</Title>
        <Paragraph type="secondary">
          <Text code>LiveComponentView.Fetch</Text> 基于 <Text code>@kne/react-fetch</Text>，传入内容短链{' '}
          <Text code>url</Text>（如 <Text code>{'{prefix}/content/{code}'}</Text>
          ）拉取配置后渲染；也可传 <Text code>loader</Text> 自行返回配置字符串。业务参数直接写在组件上（如{' '}
          <Text code>headline</Text>），与 <Text code>libs</Text> 等并列。
        </Paragraph>
        <LiveComponentView.Fetch
          loader={() => Promise.resolve(RESULT_CONTENT)}
          headline="通过 Fetch 渲染"
          subTitle="本示例用 loader 模拟内容短链返回的 text/plain 配置。"
        />
      </Card>
    </Space>
  );
};

render(<FetchExample />);

```

### API

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

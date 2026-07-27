# LiveComponentsAdmin

### 概述

# LiveComponentsAdmin

管理 Live 组件远程站点及其文件内容。

- 列表：`components-admin:BizUnit` 对接站点 CRUD / 开闭
- 详情：`LiveComponentEditor` 绑定站点 `host`，管理文件树与组件配置


### 示例(全屏)

#### 示例代码

- 站点列表
- BizUnit 管理 Live 组件站点：关键字搜索、状态筛选、创建、编辑、开启/关闭、删除；行操作可进入内容管理
- _LiveComponentsAdmin(@components/LiveComponentsAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { List } = _LiveComponentsAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const ListExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <List />
      </Layout>
    </PureGlobal>
  );
});

render(<ListExample />);

```

- 表单字段
- 站点创建/编辑表单：站点名称、默认权限（可读写 / 只读）
- _LiveComponentsAdmin(@components/LiveComponentsAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { FormInner } = _LiveComponentsAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const FormInnerExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo@Form', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [Form, PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Card title="站点表单字段">
        <Form
          data={{ defaultPermission: 'rw' }}
          onSubmit={data => {
            console.log(data);
          }}>
          <FormInner />
        </Form>
      </Card>
    </PureGlobal>
  );
});

render(<FormInnerExample />);

```

- 站点内容
- 详情页展示站点信息，并用 LiveComponentEditor 管理该站点下的文件与组件配置（localStorage 演示）
- _LiveComponentsAdmin(@components/LiveComponentsAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { Detail } = _LiveComponentsAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Routes, Route, Navigate } = reactRouterDom;

const DetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="/detail" element={<Detail />} />
          <Route path="*" element={<Navigate to="/detail?id=site-001" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<DetailExample />);

```

### API

### LiveComponentsAdmin

管理端模块：站点列表（BizUnit）+ 站点内容（LiveComponentEditor）。

#### 属性（根组件）

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| baseUrl | string | `''` | ChildrenRouter 基路径 |
| menu | ReactNode | - | 传给列表页 `page.menu` |
| pageProps | object | `{}` | 传给列表/详情页布局 |

#### 子模块

| 导出 | 说明 |
|------|------|
| List | 站点 BizUnit 列表 |
| FormInner | 创建/编辑表单 |
| Detail | 站点详情与内容编辑 |
| getApis | 生成 `preset.apis.liveComponentsSite` |

#### getApis

```js
import { getApis } from 'components-thirdparty:LiveComponentsAdmin';

Object.assign(preset.apis, {
  liveComponentsSite: getApis({ prefix: '/api/v1/live-components-site' })
});
```

| 接口 | 方法 | 路径 |
|------|------|------|
| list | GET | `{prefix}/site/list` |
| detail | GET | `{prefix}/site/detail` |
| create | POST | `{prefix}/site/create` |
| save | POST | `{prefix}/site/save` |
| remove | POST | `{prefix}/site/remove` |

`status`：`open` 开启，`closed` 关闭。

#### 路由

- `/`：站点列表
- `/detail?id=`：内容管理（单站点 LiveComponentEditor，`siteActionsOpen={false}`）

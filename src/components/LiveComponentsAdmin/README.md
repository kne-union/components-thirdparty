# LiveComponentsAdmin

### 概述

# LiveComponentsAdmin

管理 Live 组件远程站点及其文件内容。

- 列表：`components-admin:BizUnit` 对接站点 CRUD / 开闭
- 详情：`LiveComponentEditor` 绑定站点 `host`，管理文件树与组件配置


### 示例(全屏)

#### 示例代码

- 站点列表
- BizUnit 管理 Live 组件站点：创建、编辑、开启/关闭、删除；行操作可进入内容管理
- _LiveComponentsAdminList(@components/LiveComponentsAdmin/List),remoteLoader(@kne/remote-loader)

```jsx
const { default: List } = _LiveComponentsAdminList;
const { createWithRemoteLoader } = remoteLoader;

const mockSites = [
  {
    id: '1',
    name: '演示站点',
    shorten: 'ABC123',
    host: '/api/v1/live-components-site/ABC123',
    status: 'open',
    defaultPermission: 'rw',
    createdAt: '2026-07-01T10:00:00.000Z'
  },
  {
    id: '2',
    name: '已关闭站点',
    shorten: 'XYZ789',
    host: '/api/v1/live-components-site/XYZ789',
    status: 'closed',
    defaultPermission: 'r',
    createdAt: '2026-07-10T08:30:00.000Z'
  }
];

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  const liveComponentsSite = {
    list: {
      loader: () => Promise.resolve({ pageData: mockSites, totalCount: mockSites.length })
    },
    create: {
      loader: ({ data }) =>
        Promise.resolve({
          id: String(Date.now()),
          shorten: 'NEW001',
          host: '/api/v1/live-components-site/NEW001',
          status: 'open',
          defaultPermission: 'rw',
          createdAt: new Date().toISOString(),
          ...data
        })
    },
    save: {
      loader: () => Promise.resolve({})
    },
    remove: {
      loader: () => Promise.resolve({})
    },
    detail: {
      loader: ({ params }) => Promise.resolve(mockSites.find(item => item.id === String(params?.id)) || mockSites[0])
    }
  };

  return (
    <PureGlobal
      preset={{
        apis: { liveComponentsSite }
      }}>
      <Layout navigation={{ isFixed: false }}>
        <List />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 站点内容
- 详情页展示站点信息，并用 LiveComponentEditor 管理该站点下的文件与组件配置（localStorage 演示）
- _LiveComponentsAdminDetail(@components/LiveComponentsAdmin/Detail),remoteLoader(@kne/remote-loader)

```jsx
const { default: Detail } = _LiveComponentsAdminDetail;
const { createWithRemoteLoader } = remoteLoader;

const mockSite = {
  id: 'demo',
  name: '本地演示站点',
  shorten: 'LOCAL',
  host: 'localStorage:live-components-admin-demo',
  status: 'open',
  defaultPermission: 'rw',
  createdAt: '2026-07-01T10:00:00.000Z'
};

const DetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  const liveComponentsSite = {
    detail: {
      loader: () => Promise.resolve(mockSite)
    }
  };

  // 文档环境用 query 注入 id
  if (typeof window !== 'undefined' && !new URLSearchParams(window.location.search).get('id')) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', mockSite.id);
    window.history.replaceState({}, '', url);
  }

  return (
    <PureGlobal
      preset={{
        apis: { liveComponentsSite },
        ajax: params => {
          if (params?.loader) {
            return Promise.resolve(params.loader(params)).then(data => ({
              data: { code: 0, data }
            }));
          }
          return Promise.resolve({ data: { code: 0, data: null } });
        }
      }}>
      <Layout navigation={{ isFixed: false }}>
        <Detail />
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

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

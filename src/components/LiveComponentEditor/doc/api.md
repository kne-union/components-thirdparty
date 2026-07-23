### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| defaultValue | string | - | 默认组件配置（PlantUML 编码） |
| defaultMod | string | 'mix' | 默认显示模式 |
| height | number | 500 | 编辑器和预览区域高度 |
| width | number | 260 | 开启 `sites` 时左侧站点面板展开宽度（不可拖拽，可展开/收起） |
| libs | object | { lodash, dayjs } | 可用库集合 |
| onChange | function | - | 配置变化回调函数 |
| toolbarExtra | ReactNode | - | 扩展工具栏按钮（渲染在复制/导入之后） |
| sites | `{ host, name }[]` | - | 传入数组（可为 `[]`）时开启左侧多站点文件面板 |
| onSitesChange | function | - | 站点列表变更回调（添加/编辑/删除站点后触发） |
| siteActions | boolean | true | 是否显示站点操作（添加/编辑/删除站点） |

#### 显示模式 (mod)

| 模式值 | 说明 | 图标 |
|--------|------|------|
| editor | 仅显示编辑器 | MenuOutlined |
| mix | 编辑器和预览分屏显示 | SplitCellsOutlined |
| preview | 仅显示预览 | EyeOutlined |

#### 组件配置结构

```javascript
// 通过 PlantUML 编码的配置对象结构
{
  content: "React组件代码字符串",    // 组件内容
  props: {                         // 组件参数
    propName: {
      type: "string|number|boolean|array|object|function",
      defaultValue: "默认值"
    }
  },
  scope: {                         // 自定义作用域
    scopeName: "token"             // 组件名称
  }
}
```

#### 可用类型说明

| 类型 | 说明 | 默认值格式 |
|------|------|------------|
| string | 字符串类型 | 直接字符串值 |
| number | 数字类型 | 数字值 |
| boolean | 布尔类型 | true/false |
| array | 数组类型 | JSON 字符串 |
| object | 对象类型 | JSON 字符串 |
| function | 函数类型 | 固定为 " ()=>null " |

#### 工具栏操作

| 操作 | 说明 |
|------|------|
| 复制 | 将当前配置（PlantUML 编码字符串）写入系统剪贴板 |
| 从剪贴板导入 | 读取剪贴板并解析为组件配置（支持编码字符串或 JSON），覆盖当前编辑内容 |
| 保存 | 存在 `sites` 时可用；将当前配置保存到已打开且可写（`permission === 'rw'`）的文件 |
| 另存为 | 存在 `sites` 时可用；选择站点/父目录/文件名后创建新文件 |
| toolbarExtra | 通过 prop 扩展自定义按钮 |

#### 多站点文件系统 (`sites`)

传入非空 `sites: [{ host, name }]` 后，左侧显示站点列表与文件树（基于 `@kne/file-system-view`）。

**站点 API（`host` 为 HTTP 基址）：**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `{host}/getFolderTree` | 获取文件树 |
| GET | `{host}/get?id=` | 按 id 读取文件内容 |
| POST | `{host}/createFolder` | body: `{ parentId, name }` |
| POST | `{host}/create` | body: `{ parentId, name, content? }` |
| POST | `{host}/save` | body: `{ id, content }` |
| POST | `{host}/rename` | body: `{ id, name }`；同目录重名校验 |
| POST | `{host}/remove` | body: `{ ids: string[] }`；非空目录不可删 |

响应统一取 `res.data ?? res`。

树节点字段：`{ id, name, type: 'file'|'directory', permission: 'r'|'rw', children? }`。

仅读权限（`r`）时不允许保存到该文件、删除该节点。

**localStorage 站点：** `host` 可传 `localStorage:KEY_NAME`，在本地 `localStorage` 完成同等读写语义。

#### 混合模式双击定位

在 `mix` 模式下双击预览区：定位最近带源码标记的 DOM 元素，高亮约 1 秒，并在左侧 Monaco 跳转到对应行列。

#### 集成功能

- **CodeEditor**: 基于 Monaco Editor 的代码编辑器
- **LiveComponentView**: 实时组件渲染和预览
- **FormInfo**: 参数管理和表单配置
- **Antd**: UI 组件库支持
- **lodash**: 工具函数库
- **dayjs**: 日期处理库
- **@kne/file-system-view**: 站点文件树

#### 注意事项

- 预览区通过外层 `usePreset()` 注入完整 `preset`（含 `apis.file.getUrl`），需将编辑器置于 `Global` / `PureGlobal` 上下文中使用
- 函数类型参数仅支持占位符，无法编辑实际函数内容
- 组件代码会自动包装在 ErrorBoundary 中进行错误保护
- 支持使用 props.* 和 scope.* 中的变量和组件

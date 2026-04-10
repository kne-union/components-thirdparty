# BizUnit 使用指南

## 模块概述

请根据以下规范生成一个完整的前端业务模块，该模块基于BizUnit架构模式，包含完整的CRUD功能、国际化支持、文档示例和可复用的组件结构。

## 目录结构

```
src/components/[ModuleName]/
├── index.js                          # 主入口文件，导出所有组件
├── [ModuleName].js                   # 根组件，路由配置
├── withLocale.js                     # 国际化HOC封装
├── style.module.scss                 # 全局样式文件
├── Actions/                          # 操作按钮组件目录
│   ├── index.js                      # Actions主组件
│   ├── Create.js                     # 新建按钮
│   ├── Save.js                       # 编辑/保存按钮
│   ├── Remove.js                     # 删除按钮
│   └── SetStatus.js                  # 设置状态按钮
├── Detail/                           # 详情页目录
│   ├── index.js                      # 详情页主组件
│   └── RightOptions.js               # 右侧操作按钮
├── FormInner/                        # 表单内部组件目录
│   └── index.js                      # 表单字段定义
├── List/                             # 列表页目录
│   ├── index.js                      # 列表页主组件
│   └── getColumns.js                 # 列配置
├── TabDetail/                        # Tab详情页目录
│   ├── index.js                      # Tab详情页主组件
│   └── [TabName]/                     # 各个Tab内容
├── locale/                           # 国际化文件目录
│   ├── zh-CN.js                      # 中文语言包
│   └── en-US.js                      # 英文语言包
├── doc/                              # 文档和示例目录
│   ├── api.md                        # API文档
│   ├── list.js                       # 列表示例
│   ├── detail.js                     # 详情示例
│   ├── form-inner.js                 # 表单示例
│   ├── tab-detail.js                 # Tab详情示例
│   ├── example.json                  # 示例数据
│   ├── summary.md                    # 摘要说明
│   └── style.scss                    # 文档样式
└── README.md                         # 模块说明文档
```

## 核心组件实现规范

### 1. 主入口文件 (index.js)

导出所有子组件，包括：

- 默认导出：根组件
- 命名导出：List, FormInner, Detail, TabDetail, Actions等

### 2. 根组件 ([ModuleName].js)

- 使用 `createWithRemoteLoader` 进行远程模块加载
- 使用 `ChildrenRouter` 或 `AppChildrenRouter` 进行路由配置
- 配置路由路径和懒加载
- 支持自定义 navigation 和 list 配置

示例结构：

```javascript
import ChildrenRouter from '@kne/app-children-router';
import withLocale from './withLocale';

const ModuleNameInner = ({baseUrl, ...props}) => {
    return (
        <ChildrenRouter
            {...props}
            baseUrl={`${baseUrl}/route-path`}
            list={[
                {index: true, loader: () => import('./List')},
                {path: 'detail', loader: () => import('./Detail')},
                {path: 'tab-detail', loader: () => import('./TabDetail')}
            ]}
        />
    );
};

export default withLocale(ModuleNameInner);
```

### 3. 国际化封装 (withLocale.js)

使用 `createWithIntlProvider` 创建国际化HOC：

```javascript
import {createWithIntlProvider} from '@kne/react-intl';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const withLocale = createWithIntlProvider({
    defaultLocale: 'zh-CN',
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS
    },
    namespace: 'components-admin:ModuleName'
});

export default withLocale;
```

### 4. 列表页 (List/index.js)

- 使用 `TablePage` 或 `Table` 组件
- 集成 `Filter` 进行筛选
- 使用 `StateBar` 进行状态切换
- 定义 `getColumns` 配置表格列
- 支持 `SearchInput` 关键字搜索
- 支持分页、排序

核心要素：

- `usePreset()` 获取apis配置
- `useIntl()` 获取formatMessage
- `useRef()` 管理表格reload
- `useState()` 管理筛选状态
- `useNavigate()` 路由跳转

### 5. 列配置 (List/getColumns.js)

导出 `getColumns` 函数，接收 `{ navigate, formatMessage }` 参数
列类型包括：

- `serialNumber`: 序号
- `mainInfo`: 主信息（可点击）
- `tag`: 标签
- `description`: 描述
- `datetime`: 日期时间
- `options`: 操作列

### 6. 表单组件 (FormInner/index.js)

- 使用 `FormInfo` 组件
- **详细使用方法请参阅 [FormInfo使用指南.md](./FormInfo使用指南.md)**
- 该指南包含：
    - 完整的字段类型说明（基础输入、选择器、日期时间、业务专用、上传类等）
    - 校验规则配置
    - 列表组件使用
    - 弹窗与抽屉表单
    - 分步表单
    - 表单上下文与API
    - 多语言支持
    - 最佳实践与完整示例

### 7. 详情页 (Detail/index.js)

- 使用 `Fetch` 组件获取详情数据
- 使用 `Page` 和 `InfoPage` 组件
- 使用 `Descriptions` 展示详情信息
- 支持 `RightOptions` 操作按钮

### 8. Tab详情页 (TabDetail/index.js)

- 使用 `StateBarPage` 组件
- 支持多个Tab切换
- 使用 `PageHeader` 显示标题和标签
- 使用 `StateTag` 显示状态标签
- 根据 `searchParams.get('tab')` 切换内容

### 9. Actions组件 (Actions/index.js)

- 使用 `ButtonGroup` 组件
- 定义操作列表：
    - 编辑
    - 设置状态
    - 删除
- 支持条件显示（hidden属性）
- 支持确认弹窗（confirm属性）

### 10. 各个Action按钮

- **Create.js**: 新建按钮，使用 `useFormModal`
- **Save.js**: 编辑按钮，使用 `useFormModal`，预填充数据
- **Remove.js**: 删除按钮，需要confirm确认
- **SetStatus.js**: 设置状态按钮

## 国际化文件规范

### zh-CN.js 和 en-US.js

包含以下类型键值：

- 列表列标题：ID, Name, Status, Description, CreatedAt等
- 操作按钮：Add, Edit, Delete, Save等
- 成功提示：AddSuccess, SaveSuccess, DeleteSuccess等
- 确认提示：DeleteConfirm等
- 表单标签：字段名称
- 详情页标题

## API集成规范

通过 `usePreset()` 获取 `apis` 对象，包含：

- `list`: 列表接口
- `detail`: 详情接口
- `create`: 新建接口
- `save`: 编辑接口
- `remove`: 删除接口
- 其他业务接口

## 文档示例规范

### doc/list.js

使用 `PureGlobal` 提供mock数据：

```javascript
const {default: List} = _ModuleName;
const {createWithRemoteLoader} = remoteLoader;
const BaseExample = createWithRemoteLoader({
    modules: ['components-core:Global@PureGlobal', 'components-core:Global@usePreset', 'components-core:Layout']
})(({remoteModules}) => {
    const [PureGlobal, usePreset, Layout] = remoteModules;
    const {ajax} = usePreset();
    return (
        <PureGlobal preset={{ajax, apis: {testApi: {getList, add, save, remove}}}}>
            <Layout navigation={{isFixed: false}}>
                <List/>
            </Layout>
        </PureGlobal>
    );
});
render(<BaseExample/>);
```

### README.md

包含：

- 概述（模块功能说明）
- 示例代码（列表、表单、详情、Tab详情）
- API文档（属性说明表格）

## 样式规范

- 使用 CSS Modules（`*.module.scss`）
- 遵循 BEM 命名规范
- 响应式设计支持

## 技术栈

- React 18+
- React Router v6
- Ant Design 5.x
- @kne/remote-loader（远程模块加载）
- @kne/react-intl（国际化）
- @kne/react-fetch（数据请求）
- @kne/app-children-router（路由组件）

## 生成要求

1. 完整实现上述目录结构
2. 所有组件使用 `createWithRemoteLoader` 加载依赖
3. 所有组件使用 `withLocale` HOC进行国际化封装
4. 实现完整的CRUD功能
5. 提供完整的国际化文件（中英文）
6. 提供完整的文档示例
7. 代码风格统一，使用ESLint
8. 注释清晰，易于维护
9. 支持响应式设计
10. 提供类型定义（TypeScript项目）

## 上下文信息

生成模块时需要提供：

- 模块名称（ModuleName）
- 业务字段定义
- API接口路径
- 特殊业务逻辑说明
- 列表列配置要求
- 表单字段配置要求
- 详情页展示要求
- Tab页配置要求（如需要）

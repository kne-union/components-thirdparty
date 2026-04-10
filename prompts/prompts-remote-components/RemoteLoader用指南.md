# remote-loader 使用指南

## 简介

remote-loader 是一个基于 Webpack 5 Module Federation 的 React 远程模块加载库，特别适合构建微前端架构。它允许不同团队独立开发和部署各自的模块，然后在运行时动态集成。

## 安装

```shell
npm i --save @kne/remote-loader
```

## 核心概念

### 模块标记格式

remote-loader 使用模块标记来指定要加载的远程模块，支持多种格式：

- **简单格式**: `module-name` - 使用默认配置加载模块
- **带远程**: `remoteName:module-name` - 指定远程容器名称
- **带版本**: `remoteName:module-name@version` - 指定版本号
- **带子模块**: `remoteName:module-name@sub-module` - 加载子模块
- **带属性访问**: `remoteName:module-name.property` - 访问模块的特定属性
- **完整格式**: `http://example.com/remoteName/version:module-name@sub-module.property` - 指定完整的远程地址

格式规则：`[模块地址/remote/version:]模块名[@子模块][.模块属性]`

## 快速开始

### 1. 全局配置

在使用前，需要通过 `preset` 函数配置远程容器信息：

```javascript
import {preset} from '@kne/remote-loader';

preset({
    remotes: {
        default: {
            url: 'http://example.com',        // 远程容器基础 URL
            remote: 'ui_components',           // 远程容器名称
            defaultVersion: '1.0.0',          // 默认版本（可选）
            tpl: '{{url}}/{{remote}}/{{version}}' // 路径模板（可选）
        },
        'components-core': {
            url: 'http://cdn.example.com',
            remote: 'components_core',
            defaultVersion: 'latest'
        }
    },
    remoteEntryFileName: 'remoteEntry.js',     // 远程入口文件名（默认）
    fallback: <div>Loading...</div>,           // 全局加载中显示内容
    error: <div>加载失败</div>                 // 全局错误显示内容
});
```

## 三种使用方式

### 方式一：RemoteLoader 组件（推荐）

最简单的声明式组件方式，适合大多数场景：

```jsx
import RemoteLoader from '@kne/remote-loader';

// 基础用法
<RemoteLoader module="Button" onClick={() => console.log('clicked')}>
  点击我
</RemoteLoader>

// 指定远程容器
<RemoteLoader module="components-core:Table" dataSource={data} columns={columns} />

// 指定版本
<RemoteLoader module="components-core:Modal@1.2.0" visible={true} />

// 加载子模块
<RemoteLoader module="InfoPage">
  <RemoteLoader module="InfoPage.Part" title="基本信息">
    内容
  </RemoteLoader>
</RemoteLoader>

// 访问模块属性
<RemoteLoader module="utils.format.date" timestamp={Date.now()} />

// 完整路径
<RemoteLoader module="http://cdn.example.com/remote/1.0.0:Button@antd.Button" />
```

### 方式二：withRemoteLoader 高阶组件

适合需要批量加载多个模块的场景：

```jsx
import {withRemoteLoader} from '@kne/remote-loader';

const MyComponent = withRemoteLoader(({remoteModules, ...props}) => {
    const [Button, Modal, Table] = remoteModules;
    
    return (
        <div>
            <Button>按钮</Button>
            <Modal visible={true}>模态框</Modal>
            <Table data={props.data} />
        </div>
    );
});

// 使用
<MyComponent 
    modules={['Button', 'Modal', 'Table']}
    fallback={<div>加载中...</div>}
    remoteError={<div>加载失败</div>}
    onLoadComplete={(modules) => console.log('加载完成', modules)}
    data={tableData}
/>
```

**属性说明**：
- `modules`: 要加载的模块标记数组（必需）
- `fallback`: 加载中显示的内容（可选）
- `remoteError`: 加载失败时显示的内容（可选）
- `onLoadComplete`: 模块加载完成的回调（可选）
- 其他属性会传递给被包装的组件

### 方式三：useLoader Hook

适合在函数组件中进行细粒度控制：

```jsx
import {useLoader} from '@kne/remote-loader';

function MyComponent() {
    const {loading, error, remoteModules} = useLoader({
        modules: ['Button', 'Modal', 'Table'],
        onLoadComplete: (modules) => {
            console.log('所有模块加载完成', modules);
        }
    });
    
    if (loading) return <div>加载中...</div>;
    if (error) return <div>加载失败: {error.message}</div>;
    
    const [Button, Modal, Table] = remoteModules;
    
    return (
        <div>
            <Button>按钮</Button>
            <Table data={data} />
        </div>
    );
}
```

**返回值**：
- `loading`: 布尔值，表示是否正在加载
- `error`: 错误对象，加载失败时包含错误信息
- `remoteModules`: 加载成功的模块数组

### 方式四：createWithRemoteLoader（预配置）

创建带预设配置的高阶组件：

```jsx
import {createWithRemoteLoader} from '@kne/remote-loader';

// 创建预配置的组件
const AccountComponent = createWithRemoteLoader({
    modules: ['Account@OuterContainer', 'Account@Login']
})(({remoteModules, userId}) => {
    const [OuterContainer, Login] = remoteModules;
    
    return (
        <OuterContainer>
            <Login userId={userId} />
        </OuterContainer>
    );
});

// 使用时可以覆盖预设
<AccountComponent 
    modules={['Account@OuterContainer', 'Account@Register']}  // 覆盖预设
    userId="123"
/>
```

## API 参考

### preset(options)

设置全局配置。

**参数**：
```javascript
{
    remotes: {
        [name]: {
            url: string,              // 远程容器基础 URL
            remote: string,           // 远程容器名称
            defaultVersion: string,   // 默认版本（可选）
            tpl: string               // 路径模板（可选）
        }
    },
    remoteEntryFileName: string,      // 默认 'remoteEntry.js'
    fallback: ReactNode,              // 全局加载中组件
    error: ReactNode | Function       // 全局错误组件
}
```

### loadModule(token)

加载单个远程模块（核心函数）。

```javascript
import {loadModule} from '@kne/remote-loader';

const {default: Button} = await loadModule('components-core:Button@1.0.0');
```

### safeLoadModule(token)

安全加载模块，失败时返回空组件而不是抛出错误。

```javascript
import {safeLoadModule} from '@kne/remote-loader';

const Button = await safeLoadModule('Button');
// 即使加载失败，Button 也是一个可渲染的空组件
```

### parseToken(token)

解析模块标记，返回模块信息对象。

```javascript
import {parseToken} from '@kne/remote-loader';

const info = parseToken('http://example.com/remote/1.0.0:Module@SubModule.prop');
// 返回：
// {
//   url: 'http://example.com',
//   remote: 'remote',
//   version: '1.0.0',
//   module: {
//     moduleName: 'Module',
//     subModuleName: 'SubModule',
//     modulePropName: 'prop'
//   }
// }
```

### getPublicPath(name, options)

根据配置生成公共路径。

```javascript
import {getPublicPath} from '@kne/remote-loader';

const path = getPublicPath('components-core', {
    version: '1.0.0'
});
// 返回类似: 'http://example.com/components_core/1.0.0/'
```

### getStaticPath(config)

根据参数生成静态路径。

```javascript
import {getStaticPath} from '@kne/remote-loader';

const path = getStaticPath({
    url: 'http://example.com',
    remote: 'components',
    version: '1.0.0',
    tpl: '{{url}}/{{remote}}/{{version}}'
});
// 返回: 'http://example.com/components/1.0.0/'
```

### getOrLoadRemote(remote, shareScope, remoteFallbackUrl)

获取或加载远程容器（底层 API）。

```javascript
import {getOrLoadRemote} from '@kne/remote-loader';

await getOrLoadRemote('components-core', 'default', 'http://example.com/remoteEntry.js');
```

### loadComponent(remote, shareScope, module, url)

加载远程组件（底层 API）。

```javascript
import {loadComponent} from '@kne/remote-loader';

const loadBtn = loadComponent('components-core', 'default', './Button', 'http://example.com/remoteEntry.js');
const {default: Button} = await loadBtn();
```

## 缓存机制

remote-loader 内置 LRU 缓存机制，最大缓存 500 条记录。同一模块只会被加载一次，提升性能。

```javascript
import {cache} from '@kne/remote-loader';

// 检查缓存
cache.has('Button');  // true/false

// 获取缓存
cache.get('Button');  // 返回模块或 undefined

// 清空缓存
cache.clear();

// 获取缓存大小
cache.size();  // 返回缓存条目数量
```

## 高级用法

### 模块生命周期钩子

模块可以定义 `moduleMounted` 函数，在模块加载完成时执行：

```javascript
// 远程模块
export default function MyComponent(props) {
    return <div>组件</div>;
}

// 模块加载完成后执行
MyComponent.moduleMounted = async ({token, module}) => {
    console.log('模块已加载:', token);
    // 可以在这里进行初始化操作
    await module.initialize();
};
```

### 错误处理

提供多层错误处理机制：

```javascript
// 1. 全局错误处理
preset({
    error: <ErrorFallback />
});

// 2. 组件级错误处理
<RemoteLoader 
    module="Button"
    fallback={<div>加载中</div>}
    remoteError={<div>加载失败</div>}
/>

// 3. Hook 错误处理
const {error, remoteModules} = useLoader({modules: ['Button']});
if (error) {
    return <ErrorComponent error={error} />;
}

// 4. 安全加载（不抛出错误）
const Button = await safeLoadModule('Button');
```

### 动态切换模块版本

```jsx
function VersionedComponent({version}) {
    return (
        <RemoteLoader 
            module={`components-core:Button@${version}`}
            text="按钮"
        />
    );
}

// 切换版本会重新加载模块
<VersionedComponent version="1.0.0" />
<VersionedComponent version="2.0.0" />
```

### 批量加载与依赖管理

```jsx
const App = withRemoteLoader(({remoteModules}) => {
    const [Layout, Header, Content, Footer] = remoteModules;
    
    return (
        <Layout>
            <Header title="应用" />
            <Content>内容</Content>
            <Footer />
        </Layout>
    );
});

<App modules={['Layout', 'Layout.Header', 'Layout.Content', 'Layout.Footer']} />
```

## 最佳实践

### 1. 使用 preset 集中管理配置

```javascript
// config/remote-loader.js
import {preset} from '@kne/remote-loader';

preset({
    remotes: {
        default: {
            url: process.env.REMOTE_URL,
            remote: 'ui_components',
            defaultVersion: process.env.REMOTE_VERSION
        }
    },
    fallback: <LoadingSpinner />,
    error: <ErrorBoundary />
});
```

### 2. 组件封装

```javascript
// components/RemoteButton.jsx
import RemoteLoader from '@kne/remote-loader';

export default function RemoteButton(props) {
    return <RemoteLoader module="components-core:Button" {...props} />;
}
```

### 3. 类型安全（TypeScript）

```typescript
import {useLoader} from '@kne/remote-loader';

interface ButtonProps {
    text: string;
    onClick: () => void;
}

function MyComponent() {
    const {loading, remoteModules} = useLoader({
        modules: ['Button', 'Modal']
    });
    
    const [Button, Modal] = remoteModules as [
        React.FC<ButtonProps>,
        React.FC<{visible: boolean}>
    ];
    
    // ...
}
```

### 4. 性能优化

```javascript
// 使用 useMemo 缓存 modules 数组
const modules = useMemo(() => ['Button', 'Modal'], []);

const {remoteModules} = useLoader({modules});

// 清理不需要的缓存
useEffect(() => {
    return () => {
        cache.clear();
    };
}, []);
```

## 常见问题

### Q: 模块加载失败怎么办？
A: 检查以下几点：
1. 确认远程容器的 URL 可访问
2. 检查 `remoteEntry.js` 文件是否存在
3. 确认模块名称是否正确
4. 查看浏览器控制台的网络请求和错误信息

### Q: 如何调试模块加载？
A: 使用 `onLoadComplete` 回调：
```javascript
<RemoteLoader 
    module="Button"
    onLoadComplete={(module) => console.log('加载的模块:', module)}
/>
```

### Q: 如何实现模块热更新？
A: 清空缓存后重新加载：
```javascript
import {cache} from '@kne/remote-loader';

cache.clear();  // 清空缓存
window.location.reload();  // 重新加载页面
```

### Q: 多个远程容器如何配置？
A: 在 preset 中配置多个：
```javascript
preset({
    remotes: {
        'components-core': {url: 'http://cdn1.com', remote: 'components'},
        'business-modules': {url: 'http://cdn2.com', remote: 'business'},
        default: {url: 'http://cdn1.com', remote: 'components'}
    }
});
```

## 示例项目

完整示例请参考项目的 `doc` 目录中的示例代码：
- `doc/base.js`: 基础用法示例
- `doc/module.js`: 子模块加载示例
- `doc/sub-module.js`: 属性模块示例
- `doc/hoc.js`: 高阶组件用法示例

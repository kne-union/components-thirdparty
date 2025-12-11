### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| content | string | - | 组件配置（PlantUML 编码，必需） |
| themeColor | object | - | 自定义主题配置 |
| locale | string | - | 语言环境设置 |
| container | ReactComponent | - | 自定义容器组件 |
| props | object | - | 注入到组件的属性 |

#### 输入格式 (content)

content 需要通过 PlantUML 编码，解码后的对象结构：

```javascript
{
  content: "React组件代码",     // 要渲染的 JSX 代码
  props: {                     // 组件默认属性
    propName: {
      type: "string|number|boolean|array|object|function",
      defaultValue: "默认值"
    }
  },
  scope: {                     // 可用组件模块
    componentName: "moduleToken"
  }
}
```

#### 内置可用库

组件运行环境中内置了以下库：

| 库名称 | 用途 | 导入方式 |
|--------|------|----------|
| React | React 核心 | 内置可用 |
| Antd | UI 组件库 | 全局可用 |
| lodash | 工具函数 | 全局可用 |
| dayjs | 日期处理 | 全局可用 |

#### 错误处理

当组件执行出错时，会显示错误信息：

```javascript
const ErrorComponent = ({ error }) => {
  return (
    <div className="error-message">
      <pre>{error}</pre>
    </div>
  );
};
```

#### 默认容器组件

如果不提供 container 属性，使用默认容器：

```javascript
const DefaultContainer = ({ children }) => children;
```

#### 远程模块加载

支持通过 scope 配置加载远程模块，模块会在组件执行前动态加载并注入到运行环境中。

#### 安全特性

- 代码在 ErrorBoundary 保护下执行
- 支持主题和上下文隔离
- 渲染结束后自动清理 DOM
- 支持组件卸载时的资源清理
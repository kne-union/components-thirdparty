
# LiveComponentView


### 概述

### 组件概述

LiveComponentView 是一个动态组件渲染器，能够实时渲染和执行用户提供的 React 组件代码。该组件通过 Babel 转译器将代码转换为可执行的 JavaScript，并在沙箱环境中安全运行。

### 主要特性

- 实时渲染 React 组件代码
- 支持 ES6+ 语法转译
- 错误边界保护和错误显示
- 支持自定义组件容器
- 集成主题和国际化
- 支持组件参数注入
- 沙箱环境安全执行
- 支持多个远程模块加载

### 使用场景

适用于代码演示平台、在线编程环境、组件文档展示、教学系统等需要动态执行和渲染 React 代码的场景。

### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _LiveComponentView(@components/LiveComponentView)

```jsx
const {default:LiveComponentView} = _LiveComponentView;
const BaseExample = ()=>{
    return <LiveComponentView content="bPHTQnD158R_oZ8ttKAQn3k9JQ3MLYfIFz8xrul9vYIEtPrPTcRRb6MXHGGhb1GQ38WWVc6nQBqeHNBJFvFTDl_2cIJx1Md5kSdiUyvpSjwp9_6HoQW0Ab05BQuorrwZBLPK5utHkjUmYQZwcEzGKzDRKhs71Pwlrdo3QlBWRKo4Hc5RU-moct3GTHSuixOWpL67WzWWDZ1Fw7e-eiuKqUVlf7fGk5KkbsCbY2zBL3IBDd2Esr0aibNzGVtHUf4Bbz0sQUsaFIeY26eJB76c2I8ig1fe-EV7S30ONdoAzauDf5c4Iv_FqkzFPz4YO3LvSOqwdhIARKMh3qNX1bZoCVn-51uUIC7rniMVhZpH7gwiBvGNf0a3bMg56mhNmG8pgTm41xl2bYyaKt_qwdZKFyxLbm_C4OHHdcjR7N-CLUQYjxlHXrF9pXMsiEL1nK29PA2WC9iQzNR3tgySbKYIIg7dmSs-bb-0kTbWdVikynojOJ5pCpP9vCR9bvwr6Bu-kph_yczNCdFl_UZRJmCbxSN2DOwawxF-vUT-XeY5wudzesZ_93mukUnzp78v-JzciG4TiUG2pe-X2TnqoTXlPX9HjtjryLjjpQIWgZtTul7shrhGqLvwNCXrb-acg65AlesTgdyxtlXy6vCVybrF24PhKVTmEFYwM9eTdOKlOsg2DKq8k--YypSPF1UTTbfAMfLA9bTTQgY0kCaSG1KVnH7vzsCocpkCIZyB9dEXaeI2u2y0"/>;
};

render(<BaseExample />);

```


### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| content | string | - | 组件配置（PlantUML 编码，必需） |
| props | object | - | 注入到组件的属性 |
| libs | object | - | 可用库集合，在组件运行环境中使用 |

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

#### 远程模块加载

支持通过 scope 配置加载远程模块，模块会在组件执行前动态加载并注入到运行环境中。

#### 安全特性

- 代码在 ErrorBoundary 保护下执行
- 支持主题和上下文隔离
- 渲染结束后自动清理 DOM
- 支持组件卸载时的资源清理

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
    return <LiveComponentView content="xLLTIzn05FqhOLvysI_xLCBkWXKjWXHQIr-QFcHdxzhKsPamcSXA22YbeCAoWjikY53i1rqgLHz4ohxuPpPnzrzq9cvYqgwMqbVd9RbtxZdSStCouo7Cg00ga8xASrJK2ui4MjewS65XasYhfbtnPX_uLODgSfKN6MykqGRJX2K8L3oRCzifH86l4SiH5U_bTMcclD2mWDITmXArNQ5HimaL0wc7WJHYre38CFYs7-orPOAxH6q_MtYgBIyyoPVoiwMIWOhLt1t4Aq009ynri4qkcb9MYd_yjZ_kzJFyCc2si1XrCcshvKKmVIRStGmFJoLs9hTk4XTq0oKf0_cvwQXnTpFedcHGIKgYRa2l_BjrpRy6l5PZhSUSkRPM8molnI8j-TquE6c9mRlpqSNdlwkIbLi7uwy_39Iq5oTkKIHLd_UkFlLIY3XnEs9dFzmv3jh7LzsFQLmc_G-pU0ujCSV1p8wX3WxcLgGtDOcmqnbTdYdNN1CgxjyiN5YMTftuMEhVxesE-k7xix1z8dacvChHYlNUsFV6_ZzZ_s73cyFsZUi8gx4XPM9GqgNCwDXz69-wsG6kkBMc9HwvGZ1Q3Jjxmy6NSd7wxZJul4ana4b1qFaGNcodu9dTIQV5f5MPIKSeXnpCR42wXs86UOzWrhGPbLASF6OSz6JBpw7elb3rqN-dNkhGC5qYNgWXIl3mv_VXO32yF0gtJYM_s53qo17Segl8z_rV"/>;
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
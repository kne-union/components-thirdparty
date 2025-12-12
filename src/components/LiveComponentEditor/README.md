
# LiveComponentEditor


### 概述

### 组件概述

LiveComponentEditor 是一个实时的组件编辑器，允许用户在运行时动态编辑和预览 React 组件。该组件提供了代码编辑、参数配置、作用域管理等功能，并支持多种布局模式。

### 主要特性

- 实时代码编辑和预览
- 组件参数可视化配置
- 自定义作用域管理
- 三种布局模式：编辑器、混合、预览
- 支持 PlantUML 编码的数据存储
- 集成 FormInfo 进行参数管理
- 错误边界保护
- 支持 Antd 组件库集成

### 使用场景

适用于组件开发工具、在线代码编辑器、组件演示平台、教学工具等需要实时编辑和预览 React 组件的场景。

### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _LiveComponentEditor(@components/LiveComponentEditor),antd(antd)

```jsx
const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Alert } = antd;
const { useState } = React;
const BaseExample = () => {
  const [value, setValue] = useState(
    'bPDTIzn058R_IfWRRx8VtfMm6x2YHIY5rjARfXVPoLbDdSo4cKbP2G6b56f1Ld3fGYcKVg4ehRqGANlZdzb4zrzq9kwc2QoMpaqovvpdvRndPcA46PL09R9GotQeeLPhbV5WZNQP8Nr9e1s7d8MYdcyIW_X2jkFdDwMLydhN1-A9-XeD8sbGDu2sW_J7GGPnEq3KDZqwJ0_sLO17HAUVh3ms7guygZLhYyscWngsUOVmEX30XR87eSjbe7elwKzU7q-6nnLzjM6Xz1aLbRRrYdFCMiZUxMGVpnIxOBvoIGIMWugGWn9pFZKPxAI3dnMg22dgB_GYkTlNyYRWhGxhFU0i2eqEONXhPj9NXyD1b2scRywlBxx-svMgtFqm-Vx3GKLxiy0jZfJhy-7Lbs69c0Lk9_OEixtJTF_qQl2fp5N2_p6Bfz2JInpSwXWy49ZxkT_I9B9-__hobxurDu9QUtg5bwZqwgi4UiRBI4Y_kwtACUXXAdx33TlnlSIUryPwr0byUJ-Iab4xwn-CHzzQZVdPUVYoIp6GQK7QVvzTl2tXbUoqqqRHgegq6ZOoaS0i16J5Q0QgnubP8496bOKQPXoi8fMOA7-VkZv_elh7WwuR4VbCduQ2nxzFngFH-F9pjdkczEMsbaT2Sfzke2H9_W00'
  );
  return (
    <Flex vertical gap={12}>
      <Alert message={value || '暂无内容'} />
      <LiveComponentEditor defaultValue={value} onChange={setValue} />
    </Flex>
  );
};

render(<BaseExample />);

```


### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| defaultValue | string | - | 默认组件配置（PlantUML 编码） |
| defaultMod | string | 'mix' | 默认显示模式 |
| onChange | function | - | 配置变化回调函数 |

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

#### 集成功能

- **CodeEditor**: 基于 Monaco Editor 的代码编辑器
- **LiveComponentView**: 实时组件渲染和预览
- **FormInfo**: 参数管理和表单配置
- **Antd**: UI 组件库支持
- **lodash**: 工具函数库
- **dayjs**: 日期处理库

#### 注意事项

- 函数类型参数仅支持占位符，无法编辑实际函数内容
- 组件代码会自动包装在 ErrorBoundary 中进行错误保护
- 支持使用 props.* 和 scope.* 中的变量和组件

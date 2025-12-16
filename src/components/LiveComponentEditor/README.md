
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
const { Flex, Alert, Input } = antd;
const { useState, useRef } = React;
const BaseExample = () => {
  const ref = useRef(null);
  const [value, setValue] = useState(
    'xLLTIzn05FqhOLvysI_xLCBkWXKjWXHQIr-QFcHdxzhKsPamcSXA22YbeCAoWjikY53i1rqgLHz4ohxuPpPnzrzq9cvYqgwMqbVd9RbtxZdSStCouo7Cg00ga8xASrJK2ui4MjewS65XasYhfbtnPX_uLODgSfKN6MykqGRJX2K8L3oRCzifH86l4SiH5U_bTMcclD2mWDITmXArNQ5HimaL0wc7WJHYre38CFYs7-orPOAxH6q_MtYgBIyyoPVoiwMIWOhLt1t4Aq009ynri4qkcb9MYd_yjZ_kzJFyCc2si1XrCcshvKKmVIRStGmFJoLs9hTk4XTq0oKf0_cvwQXnTpFedcHGIKgYRa2l_BjrpRy6l5PZhSUSkRPM8molnI8j-TquE6c9mRlpqSNdlwkIbLi7uwy_39Iq5oTkKIHLd_UkFlLIY3XnEs9dFzmv3jh7LzsFQLmc_G-pU0ujCSV1p8wX3WxcLgGtDOcmqnbTdYdNN1CgxjyiN5YMTftuMEhVxesE-k7xix1z8dacvChHYlNUsFV6_ZzZ_s73cyFsZUi8gx4XPM9GqgNCwDXz69-wsG6kkBMc9HwvGZ1Q3Jjxmy6NSd7wxZJul4ana4b1qFaGNcodu9dTIQV5f5MPIKSeXnpCR42wXs86UOzWrdHiHgMMF6OSz6JBpw7elb3rqN-dNkhGC5qYNgWXIl3mv_VXO32yF0gtJYM_s53qo17Segl8z_rV'
  );
  return (
    <Flex vertical gap={12}>
      <Alert message={<Input.TextArea variant="borderless" autoSize value={value || ''} onChange={e => ref.current.setValue(e.target.value)} />} />
      <LiveComponentEditor defaultValue={value} onChange={setValue} ref={ref} />
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
| height | number | 500 | 编辑器和预览区域高度 |
| libs | object | { lodash, dayjs } | 可用库集合 |
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

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
    'xLLDQzj04FqhornoaHsdfo8iGngI4WY5DgMNRW-oF4xLh7U5j0eEGf0G2ad0E12tXb8ewGSr3Kro2A7uaZzZAVQ_AEiFHKgTXj9hT95sPjxRUSFJRW2Mu1Av11sAIyAjBVEgoAiFKZ6bQGH169OeByvpMSalCQoJ3NIbRPcCh9cE4SmzK6b224dGHDgIeH4uhd2y_70H4cPxqWXUZaepvVcgZQpYvPUvuql2pHeQ5DIB0c5c6Pb18Vf-61qqA13NPohzRF4fMLbyaYlavWe52hCbZVo5UHKPMWbr1HtJbJNaChN1OASpQ7So6r0Wmf6su5wcR_K4GvW-4-zlnHzF1pkT6Mt3P3xg598GXL2RZXgqjgBMIGQLX2Y4rw1NuHt25bwZjLuMzSUky1rIPi9QdwYqkKGNlRJ6wErv_-BBtR8eHDiV1jz-KaZwcmHkaKGXFczVVMwd49F0xOYzmtZlE6eSNxK-fN6PyByCupdMvRoBPdOE5VGirnuAJeqYRZRxbsVAE2D2HNx3nVaLsvDZArE8TjlzeqxyxYnkd52Oa2jJAzPxRzzx-t-z_OSHhq_SDxudxUgcGS529Pt2wEnzE3bwimDSzSirMpxofHIy53SFUjslnTdfsMdm1PDRoCO5KVDzVB6RWcUouqvdarRLJN5ZbRbJIg21Pma7GGzWaW4TB55p14SklPmbNDIJLAZ1y1fHzSD_KNrKi6hwJBvGOmKTUhz-zBhTtkLHl7qA6iXDHG-UT6s-1c4O_WO0'
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

#### 工具栏操作

| 操作 | 说明 |
|------|------|
| 复制 | 将当前配置（PlantUML 编码字符串）写入系统剪贴板 |
| 从剪贴板导入 | 读取剪贴板并解析为组件配置（支持编码字符串或 JSON），覆盖当前编辑内容 |

#### 集成功能

- **CodeEditor**: 基于 Monaco Editor 的代码编辑器
- **LiveComponentView**: 实时组件渲染和预览
- **FormInfo**: 参数管理和表单配置
- **Antd**: UI 组件库支持
- **lodash**: 工具函数库
- **dayjs**: 日期处理库

#### 注意事项

- 预览区通过外层 `usePreset()` 注入完整 `preset`（含 `apis.file.getUrl`），需将编辑器置于 `Global` / `PureGlobal` 上下文中使用
- 函数类型参数仅支持占位符，无法编辑实际函数内容
- 组件代码会自动包装在 ErrorBoundary 中进行错误保护
- 支持使用 props.* 和 scope.* 中的变量和组件
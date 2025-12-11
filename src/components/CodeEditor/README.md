
# CodeEditor


### 概述

### 组件概述

CodeEditor 是基于 Monaco Editor 的代码编辑器组件，提供了强大的代码编辑功能。Monaco Editor 是 VS Code 的编辑器核心，支持语法高亮、代码补全、错误检测等特性。

### 主要特性

- 支持多种编程语言的语法高亮
- 智能代码补全
- 错误检测和提示
- 可自定义编辑器主题
- 支持代码格式化
- 可配置的编辑器高度
- 支持外部 Monaco Editor 路径配置

### 使用场景

适用于需要代码编辑功能的应用，如在线编程平台、配置编辑器、代码示例展示、开发工具等场景。

### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _CodeEditor(@components/CodeEditor)

```jsx
const {default:CodeEditor} = _CodeEditor;
const BaseExample = ()=>{
    return <CodeEditor />;
};

render(<BaseExample />);

```


### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| height | string | '500px' | 编辑器高度 |
| defaultLanguage | string | - | 默认编程语言 |
| defaultValue | string | - | 默认代码内容 |
| value | string | - | 受控的代码内容 |
| onChange | function | - | 内容变化回调函数 |
| theme | string | - | 编辑器主题 |
| options | object | - | Monaco Editor 配置选项 |
| loading | ReactNode | - | 自定义加载组件 |
| path | string | - | 文件路径，用于语言检测 |

#### 全局配置

组件支持通过 `window.MONACO_EDITOR_DIR` 全局变量配置 Monaco Editor 的路径：

```javascript
window.MONACO_EDITOR_DIR = '/path/to/monaco-editor';
```

#### Monaco Editor 常用配置选项

```javascript
const options = {
  fontSize: 14,           // 字体大小
  wordWrap: 'on',         // 自动换行
  minimap: { enabled: false }, // 禁用小地图
  scrollBeyondLastLine: false, // 禁止滚动到最后一行之后
  automaticLayout: true   // 自动布局
};
```

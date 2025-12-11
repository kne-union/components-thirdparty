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
### API 文档

#### 组件属性

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| original | 原始内容；传对象时按 `JSON.stringify(value, null, 2)` 格式化 | string \| object | - |
| modified | 修改后内容；传对象时按 JSON 格式化 | string \| object | - |
| language | 语言；未传且 `original` / `modified` 为对象时为 `json` | string | - |
| height | 编辑器高度，支持 `'100%'` 等字符串 | number \| string | 500 |
| renderSideBySide | 是否左右并排对比，false 为内联视图。为 true 时会把 Monaco 的 `renderSideBySideInlineBreakpoint` 设为 0，避免窄容器仍显示成内联 | boolean | true |
| hideUnchangedRegions | 是否折叠未改动的区域 | boolean | true |
| readOnly | 修改后一侧是否只读（原始一侧始终只读） | boolean | true |
| theme | 编辑器主题 | string | - |
| options | Monaco DiffEditor 配置，会覆盖上面几项生成的默认配置 | object | - |
| onMount | 挂载回调 | function({ editor, monaco }) | - |
| className | 外层容器类名 | string | - |

#### Ref 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getOriginalValue | - | string | 获取原始一侧内容 |
| getModifiedValue | - | string | 获取修改后一侧内容 |
| getEditor | - | IStandaloneDiffEditor | 获取 Monaco DiffEditor 实例 |
| getMonaco | - | Monaco | 获取 Monaco 命名空间 |

#### 全局配置

与 CodeEditor 相同，支持通过 `window.MONACO_EDITOR_DIR` 配置 Monaco Editor 的路径：

```javascript
window.MONACO_EDITOR_DIR = '/path/to/monaco-editor';
```

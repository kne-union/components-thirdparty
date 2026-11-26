### 组件概述

DiffEditor 是基于 Monaco Editor 差异编辑器的内容对比组件，用于并排或内联展示两份文本 / JSON 的修改内容，与 CodeEditor 使用同一套 Monaco 加载配置。

### 主要特性

- 左右并排或内联（`renderSideBySide={false}`）两种对比视图
- 默认折叠未改动的区域，只展开修改附近的内容
- `original` / `modified` 传对象时自动按 JSON 格式化并以 json 语言高亮
- 默认只读，可通过 `readOnly={false}` 允许编辑修改后的一侧
- 支持 `window.MONACO_EDITOR_DIR` 配置 Monaco 资源路径

### 使用场景

适用于查看版本差异、人工编辑前后对比、配置变更审核等场景。

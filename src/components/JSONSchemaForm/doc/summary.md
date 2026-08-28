### 项目概述

`@kne/jsonschema-form` 将 **JSON Schema** 转换为 `@kne/form-creator` Schema，并用 `SchemaRenderer` 渲染可提交表单。v1 以 form-creator 为唯一渲染层，不再在本包内手写字段与 GroupList。

### 主要特性

- **结构映射**：嵌套 `object` → `object` 模块；对象数组 → `list` + `itemBlocks`；标量数组 → `multiField`
- **分支能力**：`oneOf` → `choice`（单选），`anyOf` → `choice`（多选）
- **组合与引用**：`allOf` 合并属性；同文档 `$ref`（`#/$defs`、`#/definitions`）内联
- **字段增强**：`format` 自动映射类型/规则；`x-widget` / `ui:widget` 自定义组件；`x-props` 透传 props
- **双入口**：组件 `JSONSchemaForm` 直接渲染，或 `jsonSchemaToFormCreatorSchema` 只做转换

### 使用场景

- 后端下发 JSON Schema，前端需要快速生成 Ant Design 表单
- 已有 form-creator 生态，希望用标准 JSON Schema 驱动同一套渲染
- 调试 / 中间层需要查看「JSON Schema → form-creator Schema」转换结果

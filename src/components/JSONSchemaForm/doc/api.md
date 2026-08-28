### JSONSchemaForm

将 JSON Schema 转为 form-creator Schema，并委托 `SchemaRenderer` 渲染。

#### 属性

| 属性名 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| schema | `object` | - | JSON Schema 根对象 |
| column | `number` | `2` | 转换时写入各模块的默认列数 |
| gap | `number` | `24` | 字段间距 |
| onSubmit | `(data, ...args) => any` | - | 提交回调（写入 `formProps.onSubmit`） |
| formProps | `object` | - | 透传给 SchemaRenderer / 底层 Form |
| rules | `object` | - | 额外校验规则，合并进 `formProps.rules` |
| footer | `ReactNode \| false` | - | `false` 隐藏操作区；传入节点时作为自定义 actions |
| actions | `ReactNode \| object \| false` | - | 同 form-creator `SchemaRenderer` 的 actions；`false` 隐藏操作区 |
| ...rest | `object` | - | 其余属性合并进 `formProps` |

### jsonSchemaToFormCreatorSchema

纯函数：JSON Schema → `@kne/form-creator` Schema（含 `blocks`）。

#### 参数

| 参数名 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| jsonSchema | `object` | - | JSON Schema |
| options.column | `number` | `2` | 默认列数 |
| options.gap | `number` | `24` | 默认间距 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `object` | form-creator Schema：`{ title, subtitle, column, gap, blocks, actions? }` |

### 转换对照

| JSON Schema | form-creator |
|-------------|--------------|
| object 标量字段 | `formInfo` / `object` 的 `list` |
| 嵌套 object | `object`（可再挂 `blocks`） |
| array of object | `list` + `itemBlocks` |
| array of 标量 | `multiField` |
| oneOf | `choice`（`mode: 'single'`） |
| anyOf | `choice`（`mode: 'multiple'`） |
| allOf | 合并 `properties` / `required` 后再转 |
| 同文档 `$ref` | 内联展开 |
| format / x-widget / ui:widget | 字段类型与规则 |

### resolveRef / mergeAllOf / fieldFromSchema

底层转换工具，一般无需直接使用；需要定制转换流水线时可单独导入。

| 导出 | 描述 |
|------|------|
| `resolveRef(schema, root)` | 解析同文档 `$ref` |
| `mergeAllOf(schema, root)` | 合并 `allOf` |
| `fieldFromSchema(name, schema, options?)` | 单个属性 → form-creator field |
| `FORMAT_FIELD_MAP` | format → 字段类型/规则映射表 |

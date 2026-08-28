| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| value | object | - | 受控 Schema |
| defaultValue | object | - | 非受控初始 Schema |
| onChange | function(schema) | - | Schema 变更回调 |
| showPreview | boolean | true | 是否显示右侧预览 |
| className | string | - | 根节点类名 |
| formProps | object | {} | 透传给预览区 Form / FormSteps 的属性 |
| renderModal | function(props) | - | 自定义编辑弹窗渲染，透传给内部 FormModal（同 super-select / form-info） |

### SchemaRenderer

传入 Schema 直接渲染可填写表单（运行时，不经过编辑器）。示例见「Schema 直接渲染表单」。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 表单 Schema |
| formProps | object | {} | 透传给内部 `Form`（如 `onSubmit`、`data`） |
| preview | boolean | false | 预览态（字段预览行为） |
| className | string | - | 根 Form 类名 |
| children | ReactNode | - | 追加到表单内容与操作区之间 |
| showActions | boolean | true | 是否展示提交/重置操作区（默认开启，可不传） |
| actions | ReactNode \| false | - | 自定义操作区；不传则按 Schema `actions` / 默认居中「提交/重置」；`false` 隐藏 |
| showSubmit | boolean | - | 覆盖 Schema；不传则读 `schema.actions.showSubmit`（默认 true） |
| showReset | boolean | - | 覆盖 Schema；不传则读 `schema.actions.showReset`（默认 true） |
| submitText | string | - | 覆盖 Schema；不传则读 `schema.actions.submitText` 或「提交」 |
| resetText | string | - | 覆盖 Schema；不传则读 `schema.actions.resetText` 或「重置」 |
| submitButtonProps | object | - | 与 Schema 合并后透传给 `SubmitButton` |
| resetButtonProps | object | - | 与 Schema 合并后透传给 `ResetButton` |

```js
import { SchemaRenderer } from '@kne/form-creator';

// 默认居中提交 / 重置
<SchemaRenderer schema={schema} formProps={{ onSubmit: console.log }} />

// 定制文案与按钮属性
<SchemaRenderer
  schema={schema}
  submitText="保存"
  resetText="清空"
  submitButtonProps={{ size: 'large' }}
  formProps={{ onSubmit: console.log }}
/>

// 完全自定义操作区
<SchemaRenderer schema={schema} actions={<MyButtons />} />

// 不显示操作按钮
<SchemaRenderer schema={schema} showActions={false} />
// 或
<SchemaRenderer schema={schema} actions={false} />
```

### SchemaRendererInner

只渲染 Schema 区块内容，**不包外层 Form**，便于放入业务已有 `Form` 内。操作区相关 props 与 `SchemaRenderer` 相同。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 表单 Schema |
| preview | boolean | false | 预览态 |
| className | string | - | 包在表单区块外层的 className（可选） |
| children | ReactNode | - | 追加内容 |
| showActions | boolean | true | 是否展示提交/重置操作区（默认开启，可不传） |
| actions / showSubmit / showReset / submitText / resetText / \*ButtonProps | - | - | 同 SchemaRenderer |

```js
import { SchemaRendererInner } from '@kne/form-creator';
import { Form, SubmitButton } from '@kne/form-info';

<Form onSubmit={console.log}>
  <SchemaRendererInner schema={schema} />
</Form>

// 不展示按钮区，自行放按钮
<Form onSubmit={console.log}>
  <SchemaRendererInner schema={schema} showActions={false} />
  <SubmitButton>提交</SubmitButton>
</Form>
```

### Schema 结构

```js
{
  actions?: {
    showSubmit?: boolean,   // 默认 true
    showReset?: boolean,    // 默认 true
    showCancel?: boolean,   // 默认 false（可选取消按钮）
    submitText?: string,    // 空则用「提交」
    resetText?: string,     // 空则用「重置」
    cancelText?: string,    // 空则用「取消」
    align?: 'center' | 'start' | 'end', // 默认 center
    gap?: number,           // 按钮间距，默认 16
    submitButtonProps?: object,
    resetButtonProps?: object,
    cancelButtonProps?: object
  },
  blocks: [{
    id: string,
    kind: 'formInfo' | 'list' | 'tableList' | 'multiField' | 'object' | 'choice' | 'steps',
    title?, subtitle?, column?, gap?, bordered?, important?,
    name?, label?, addText?, maxLength?, minLength?, fieldType?, autoStep?,
    mode?, selectorName?, selectorInData?, discriminator?,
    list?: [{ id, type, name, label, tips?, description?, rule?, block?, hidden?, props? }],
    itemBlocks?: Block[], // list：列表项内子模块
    blocks?: Block[], // formInfo / object：子模块
    options?: [{ id, title, list?, blocks?: Block[] }], // choice
    items?: [{ id, title, column, list: [...], blocks?: Block[] }] // steps 专用
  }]
}
```

`actions` 由 FormCreator 顶部「添加模块」旁的设置按钮弹窗配置，写入 Schema；`SchemaRenderer` 会读取并渲染居中操作按钮（组件 props 可覆盖 Schema）。
### 区块类型

| kind | 说明 | 主要参数 |
|------|------|----------|
| formInfo | 表单信息区块 | title, subtitle, column, gap, bordered, list, **blocks** |
| list | 动态列表 | name, title, important, bordered, maxLength, list, **itemBlocks** |
| tableList | 表格列表 | name, title, bordered, maxLength, list（不支持子模块） |
| object | 对象分组 | name, title, column, gap, list（字段名渲染为 `name.field`）, **blocks** |
| choice | 选项分支 | title, **mode**(`single`\|`multiple`), **minLength** / **maxLength**（仅多选：最少/最多选几项）, selectorName, selectorInData, options[{ title, list, **blocks** }] |
| multiField | 同类型多值 | name, label, fieldType, addText（不支持子模块） |
| steps | 步骤表单 | title, subtitle, bordered, autoStep, items[{ title, column, list, **blocks** }] |

`choice`：顶部同一条选项 UI；`single` 只挂载当前选项内容，`multiple` 平铺所有选中项。多选时可配置 `minLength` / `maxLength` 限制最少、最多选择几个（提交时校验；达到上限后未选项禁用）。JSON Schema 的 oneOf/anyOf 可分别映射为 `mode: 'single'/'multiple'`。`allOf` 无需独立 kind，展开为多个 sibling blocks 即可。

兼容旧版：若仅有顶层 `list` 且无 `blocks`，会自动迁移为一个 `formInfo` 区块。

### 字段类型

基础：Input、TextArea、InputNumber、Switch、Checkbox、DatePicker  
选择：Select、RadioGroup、CheckboxGroup、SuperSelect、SuperSelectPlus

### 工具方法

- `createBlock(kind)` / `createStep()` / `createChoiceOption()` / `normalizeSchema(schema)`
- `schemaToDataSchema(schema)` 根据搭建 Schema 生成**提交数据**的 JSON Schema（见下节）
- `preset({ rules, fields })` 一次注册扩展规则与填写项（推荐）
- `parseRuleString(rule)` / `buildRuleString(config)` 校验规则字符串解析/组装

### schemaToDataSchema

将搭建 Schema 转为描述表单提交数据形状的 JSON Schema（`type: 'object'`）。

```js
import { schemaToDataSchema } from '@kne/form-creator';

const dataSchema = schemaToDataSchema(schema);
// dataSchema.properties / required / oneOf|anyOf（choice）
```

| 搭建块 | 提交数据形状 |
|--------|----------------|
| formInfo | 字段摊平进当前 object |
| object | `properties[name]` = nested object（字段名为相对 name） |
| list / tableList | `properties[name]` = array of object |
| multiField | `properties[name]` = array，元素为 `fieldType` 的 valueSchema |
| steps | 各 step 字段/子块并入当前层 |
| choice（single） | `oneOf`：每支含 selector `const` + 该 option 字段 |
| choice（multiple） | 当前层 selector 为数组 + `anyOf` 各 option 字段支 |

说明：

- **hidden 字段仍进入** data schema（可提交）
- 字段值类型来自 registry 的 `valueSchema`；`rule` 含 `REQ` 时写入父 object 的 `required`（choice 支内同样生效）
- 扩展字段在 `preset` / `registerField` 中声明 `valueSchema`（对象或 `(field) => schema`）；未声明则回退 `{ type: 'string' }`

### preset（推荐）

应用入口调用一次，同时完成：

1. **运行时校验**：合并进 `@kne/react-form-antd` 的 `RULES`
2. **编辑器规则面板**：写入「填写规则」勾选列表
3. **扩展填写项**：注册到字段类型 registry

内置规则 `REQ` / `TEL` / `EMAIL` 已内置，无需重复配置；传入同名 key 可覆盖运行时规则并更新编辑器 label。

```js
import { preset } from '@kne/form-creator';
import { Rate, Slider } from '@kne/react-form-antd';

preset({
  rules: {
    ID_CARD: {
      label: '身份证格式',
      reg: /^\d{17}[\dXx]$/,
      message: '%s格式不正确'
    },
    RATE_MIN: {
      label: '评分至少3星',
      validator: value => ({
        result: Number(value) >= 3,
        errMsg: Number(value) >= 3 ? '' : '评分至少 3 星'
      })
    }
  },
  fields: {
    Rate: {
      label: '评分',
      groupName: '评价组件',
      component: Rate,
      defaultProps: { count: 5 },
      propsSchema: [
        { name: 'count', label: '星星总数', type: 'number', min: 1, max: 10, defaultValue: 5 }
      ]
    }
  }
});
```

| 配置 | 类型 | 说明 |
|------|------|------|
| `rules` | `Record<string, RuleDef>` | key 为规则 token；`RuleDef` 含 `label` + `reg/message` 或 `validator` |
| `fields` | `Record<string, FieldDef>` | key 为字段 type；见下方 FieldDef |

**FieldDef** 常用字段：`label`、`component`、`groupName`、`defaultProps`、`propsSchema`、`valueSchema`、`hasOptions`、`hasFieldProps` 等。

- `valueSchema`：该类型**提交值**的 JSON Schema 片段；可为对象，或 `(field) => schema`（可按 props 细化）。供 `schemaToDataSchema` 使用；缺省回退 `{ type: 'string' }`。

扩展填写项时，用 `fields` 内的 `propsSchema` 声明可编辑的额外参数（写入字段 `props`），编辑器会按声明自动生成「填写项设置」表单：

```js
fields: {
  Rate: {
    label: '评分',
    component: Rate,
    valueSchema: { type: 'number' },
    propsSchema: [
      { name: 'count', label: '星星总数', type: 'number', min: 1, max: 10, defaultValue: 5 }
    ]
  },
  Slider: {
    label: '滑块',
    component: Slider,
    valueSchema: { type: 'number' },
    defaultProps: { min: 0, max: 100, step: 1 },
    propsSchema: [
      { name: 'min', label: '最小值', type: 'number', defaultValue: 0 },
      { name: 'max', label: '最大值', type: 'number', defaultValue: 100 },
      { name: 'step', label: '步长', type: 'number', min: 0, defaultValue: 1 },
      {
        name: 'tooltipPlacement',
        label: '提示位置',
        type: 'select',
        defaultValue: 'top',
        options: [
          { label: '上', value: 'top' },
          { label: '下', value: 'bottom' }
        ]
      },
      { name: 'dots', label: '显示刻度点', type: 'boolean' }
    ]
  }
}
```

### 扩展组件与校验（示例见「扩展组件与校验规则」）

使用 `preset({ rules, fields })` 即可，无需再单独调用 react-form-antd 的 `preset`。

`propsSchema` 项约定：

| 字段 | 说明 |
|------|------|
| name | 写入 `field.props` 的键名 |
| label | 编辑器展示名 |
| type | `string` \| `number` \| `boolean` \| `select` |
| placeholder | 输入提示（string/number/select） |
| defaultValue | 缺省值 |
| min / max | `type=number` 时的范围 |
| options | `type=select` 的选项 `{ label, value }[]` |

有 `propsSchema` 时会自动开启 `hasFieldProps`，无需再手写开关。

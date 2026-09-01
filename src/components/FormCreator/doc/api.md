默认导出为 FormInfo 表单字段（`useDecorator`），可直接放进 `FormInfo.list`。脱离表单时用 `FormCreator.Field`。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| name | string | - | 表单字段名（默认导出） |
| label | string | - | 表单项标签（默认导出） |
| value | object | - | 受控 Schema |
| defaultValue | object | - | 非受控初始 Schema |
| onChange | function(schema) | - | Schema 变更回调 |
| showPreview | boolean | true | 是否显示右侧预览 |
| className | string | - | 根节点类名 |
| formProps | object | {} | 透传给预览区 Form / FormSteps 的属性 |
| locale | string | 跟随全局 | `zh-CN` / `en-US`；扩展字段展示名与 `@kne/form-creator` UI 文案 |
| extraToolbar | ButtonGroupItem[] \| function({ schema }) | - | 扩展操作列表（或返回列表的函数），并入圆形「更多」下拉 |
| schemaImportExport | boolean \| object | true | 启用导入导出（复制 / 导出 / 导入）；传 `false` 关闭；与 extraToolbar 数组、保存模版同属「更多」下拉 |
| apis | object | - | 模版与文件夹接口；有 `groupList` 时显示左侧 FileSystemView；有 `saveTemplate` 时显示「保存为模版」 |
| groupType | string | form-creator-template | 传给 Group 文件夹 API 的 `type` |
| valueKey / labelKey | string | code / name | 与 GroupFolder 一致 |

### apis

文件夹部分与 `components-admin:GroupFolder` / `GroupFolderField` **完全一致**：

| 字段 | 类型 | 说明 |
|----|----|-----|
| groupList | function \| { loader } \| ajaxConfig | 分组树（`output: 'tree'`） |
| create | function \| ajaxConfig | 新建文件夹 |
| save | function \| ajaxConfig | 更新文件夹 |
| remove | function \| ajaxConfig | 删除文件夹 |

模版部分：

| 字段 | 类型 | 说明 |
|----|----|-----|
| list | function \| ajaxConfig | 模版列表（挂到对应 `parentId` 目录下显示为文件） |
| get | function \| ajaxConfig | 可选；列表项无 schema 时按 id 拉取 |
| saveTemplate | function \| ajaxConfig | 保存当前 Schema 为模版；`{ name, parentId, schema }`，`parentId` 为 null 表示根 |

分组节点字段：`id` / `code` / `name` / `children`（同 Group）。保存弹窗「保存到文件夹」使用 `GroupFolderField`（`isPopup` 单选下拉），并可在有 `create`/`save` 时新建文件夹。

```js
<FormCreator.Field
  value={schema}
  onChange={setSchema}
  groupType="questionnaire"
  apis={{
    groupList: { loader: async () => mockGroups },
    create: { url: '/api/group', method: 'POST' },
    save: { url: '/api/group', method: 'POST' },
    remove: { url: '/api/group/remove', method: 'POST' },
    list: async () => mockTemplates,
    saveTemplate: async ({ name, parentId, schema }) => {
      await createTemplate({ name, parentId, schema });
    }
  }}
/>
```


```js
<FormInfo
  list={[
    <FormCreator name="schema" label="问卷内容" />
  ]}
/>

<FormCreator.Field value={schema} onChange={setSchema} />

{/* 自定义操作并入「更多」下拉（推荐） */}
<FormCreator.Field
  extraToolbar={[
    { key: 'custom', children: '自定义操作', onClick: () => {} }
  ]}
/>

{/* 问卷场景默认开启导入导出；不需要时可关闭 */}
<FormCreator.Field schemaImportExport={false} />

{/* 仅保留复制与导出 */}
<FormCreator.Field schemaImportExport={{ showImport: false, showUpload: false }} />
```

### Schema 导入导出（本包装层）

导入导出由本包装层实现（`SchemaToolbarActions` + `schemaIO`），不依赖 `@kne/form-creator` 内置功能。`@kne/form-creator` 只提供 `extraToolbar` 扩展点。

通过 `schemaImportExport` 配置开关；扩展操作（导入导出、保存为模版）用 `ButtonGroup` 收进下拉：`showLength={0}`，触发器为圆形 Icon 按钮。

工具方法（本包导出）：`serializeSchema`、`parseSchemaJson`、`downloadSchemaFile`、`copySchemaToClipboard`。

### SchemaRenderer

传入 Schema 直接渲染可填写表单（运行时，不经过编辑器）。示例见「Schema 直接渲染表单」。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 表单 Schema |
| formProps | object | {} | 透传给内部 `Form`（如 `onSubmit`、`data`） |
| preview | boolean | false | 预览态（字段预览行为） |
| className | string | - | 根 Form 类名 |
| bodyClassName | string | - | 字段区域（`.schema-body`）额外 className，便于外部改样式 |
| footerClassName | string | - | Footer 操作区（`.schema-actions`）额外 className |
| buttonFooter | boolean | false | 为 true 时用 `@kne/button-group` 的 `ButtonFooter` 包裹 Footer（移动端贴底）；默认关闭 |
| buttonFooterProps | object | - | 透传给 `ButtonFooter`（如 `placement`、`target`、`className`） |
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

// 字段区 / Footer 自定义 className；移动端 Footer 贴底（默认关闭）
<SchemaRenderer
  schema={schema}
  bodyClassName="my-form-fields"
  footerClassName="my-form-footer"
  buttonFooter
  buttonFooterProps={{ placement: 'bottom' }}
  formProps={{ onSubmit: console.log }}
/>
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
| bodyClassName / footerClassName / buttonFooter / buttonFooterProps | - | - | 同 SchemaRenderer |

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

### SchemaContent

按搭建 Schema 的分组结构展示**已提交数据**（只读）。字段展示形态由各填写项的 `valueSchema` 决定（boolean → 是/否，enum → 选项文案，日期按 `format`）。布局与 FormInfo 相同，使用 `@kne/info-page` 的 Part + Content。示例见「按 Schema 展示提交数据」。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 搭建 Schema |
| data | object | - | 提交数据；为 `null` / `undefined` 时展示空状态 |
| className | string | - | 根节点类名 |
| empty | ReactNode | - | 自定义空状态；不传则用默认 Empty |

`SchemaContentInner` 只渲染分组内容，**不包**外层 `InfoPage`，便于放入业务已有详情页。

```js
import { SchemaContent, SchemaContentInner } from '@kne/form-creator';

<SchemaContent schema={schema} data={submitData} />

<InfoPage>
  <SchemaContentInner schema={schema} data={submitData} />
</InfoPage>
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

`actions` 由 FormCreator 顶部「添加模块」旁的设置按钮弹窗配置，写入 Schema；`SchemaRenderer` 会读取并渲染居中操作按钮（组件 props 可覆盖 Schema）。扩展操作（导入导出、保存模版、`extraToolbar` 数组）统一收进圆形「更多」下拉。
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
- `SchemaContent` / `SchemaContentInner` 按 Schema + 字段 `valueSchema` 只读展示提交数据
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
| `locale` | string | 可选，默认 `zh-CN`；同步注册扩展字段的中英文展示名 |

本包装层会为 Password、JSONEditor、CKEditor 等扩展字段按当前 `locale` 注册 `label` / `groupName`（文案见 `locale/zh-CN.js`、`locale/en-US.js`）。切换语言时 FormCreator 会重新 register。编辑器壳层文案由 `@kne/form-creator` 自身的 `form-creator` namespace 负责。

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

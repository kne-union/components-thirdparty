### TemplateEditor.Field

不带表单装饰器的模板编辑器，需手动传入 `value` 和 `onChange`。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 模板类型：`html` 富文本邮件；`text` 纯文本（短信等），编辑器内仍可插入变量与行内条件，但 `value` / `onChange` 为纯文本 | `'html'` \| `'text'` | `'html'` |
| value | 模板内容（Liquid 语法）；`type="html"` 为 HTML，`type="text"` 为纯文本 | string | - |
| onChange | 内容变化回调 | function(value: string) | - |
| variables | 可插入的模板变量，`name` 支持 `a.b` 路径 | `{ name: string, label?: string }[]` | `[]` |
| previewData | 预览用的示例数据，按变量 `name` 取值（支持嵌套对象）；缺失的变量显示为 `[label]` | object | - |
| subject | 邮件主题模板；传入后预览顶部展示渲染后的主题（信封头），仅 `type="html"` 生效 | string | - |
| condition | 是否启用条件块；传对象时作为 CKEditor `templateCondition` 配置（如 `operators`、`allowElse`、`allowNesting`） | boolean \| object | `true` |
| config | 透传给 CKEditor 的额外配置，会覆盖同名默认项 | object | - |
| readOnly | 只读模式：CKEditor 进入只读并隐藏工具栏，保留「内容 / 预览」切换，适合详情页展示模板 | boolean | false |
| copyable | 在「内容 / 预览」切换栏右侧显示「复制」按钮，复制模板源码（`value`） | boolean | false |
| uploadAdapter | 透传给 CKEditor 的图片上传适配，同 `CKEditor.Field` 的 `uploadAdapter` | object | - |
| height | 编辑区最小高度与预览区高度（px） | number | `html` 为 480，`text` 为 160 |
| className | 外层容器类名 | string | - |

说明：

- 没有 `variables` 时工具栏不显示「插入变量」；`condition={false}` 时不显示「条件」
- 预览流程：`validateTemplateHtml` 校验 → `toEmailHtml` inline 邮件样式 → liquidjs 渲染（`outputEscape: 'escape'`，`{{ name | raw }}` 原样输出）→ 链接统一加 `target="_blank" rel="noopener noreferrer"` → 沙箱 iframe（不允许脚本，允许弹出新标签页）
- 文本模式：工具栏只保留撤销、重做、插入变量、条件；条件只能是行内（块级会跨段落，转成文本后无法识别回条件块）；每个段落输出为一行，`<br>` 输出为换行，粗体等格式不进入输出；预览不做 HTML 转义，以短信气泡展示并统计字数
- `variables` / `condition` / `config` 建议在组件外定义或 `useMemo`，避免每次渲染生成新对象

### TemplateEditor（默认导出）

通过 `createWithRemoteLoader` 包装的表单字段组件，在 FormInfo 表单中使用时通过 `useDecorator` 自动绑定表单上下文，支持 `name`、`label`、`rule` 等表单字段属性，其余属性同 `TemplateEditor.Field`。

### renderTemplate

以下工具函数由 [@kne/message-template](https://github.com/kne-union/message-template) 提供并在此转出，前端与 Node 端（如服务端发送）可直接依赖该包使用同一套渲染与校验规则。

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| template | Liquid 模板字符串 | string |
| data | 渲染数据 | object |
| options.type | `html`（默认）转义 HTML；`text` 不转义，用于短信等纯文本 | `'html'` \| `'text'` |

返回渲染后的字符串（同步）。`html` 下 `{{ name }}` 转义 HTML，`{{ name | raw }}` 原样输出。语法错误时抛出异常。

### htmlToText / textToHtml

文本模式使用的转换函数：`htmlToText(html)` 将编辑器 HTML 转为纯文本（每段一行）；`textToHtml(text)` 将纯文本按行转为段落 HTML。

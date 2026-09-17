### CKEditor

经 `createWithRemoteLoader` 包装，用于 `components-core:FormInfo` 表单场景。作为表单项使用时属性与 `CKEditor.Field` 一致（如 `name`、`label`、`value`、`onChange`、`isMarkdown`、`config` 等），由 `useDecorator` 注入受控逻辑。

### CKEditor.Field

富文本 / Markdown 编辑器本体。

#### 属性说明

| 属性名        | 说明                                                                                                                                                      | 类型     | 默认值                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| className     | 外层容器类名                                                                                                                                              | string   | -                                           |
| style         | 外层容器样式；内部会合并 `--ck-toolbar-dropdown-max-width`                                                                                                | object   | -                                           |
| isMarkdown    | 是否 Markdown 模式。为 `true` 时不加载 3D、视频、交互组件、图表、表单插件，并从工具栏移除 `model3dUpload`、`videoUpload`、`insertLiveComponent`、`insertEchart`、`insertFormCreator` | boolean  | false                                       |
| config        | CKEditor 5 配置，与内置 `defaultConfig` 深合并                                                                                                            | object   | 见下方 config                               |
| plugins       | 追加的 CKEditor 插件类                                                                                                                                    | array    | []                                          |
| locale        | 界面语言，`zh-CN` 或 `en` 等；未传时使用 `@kne/global-context` 的 `locale`                                                                                | string   | 上下文 locale                               |
| uploadAdapter | 图片上传与粘贴转存；富文本下亦作为 `modelUpload` / `videoUpload` 的默认合并源                                                                             | object   | `preset.apis.file` 的 `upload`、`uploadUrl` |
| liveComponent | **兼容简写**。与 `config.liveComponent` 合并；推荐直接写在 `config.liveComponent`（见下表）                                                              | object   | `{}`                                        |
| formCreator   | **兼容简写**。与 `config.formCreator` 合并；推荐直接写在 `config.formCreator`（见下表）                                                                  | object   | `{}`                                        |
| model3d       | 3D 模型预览扩展参数，与 `config.model3d` 合并，见下表                                                                                                     | object   | 见 `defaultConfig.model3d`                  |
| value         | 编辑器 HTML / Markdown 内容                                                                                                                               | string   | -                                           |
| onChange      | 内容变化回调 `(html: string) => void`                                                                                                                     | function | -                                           |

#### 工具栏宽度

容器通过 `useToolbarDropdownMaxWidth` 监听宽度，将 CSS 变量 `--ck-toolbar-dropdown-max-width` 写入外层 `style`，限制主工具栏「显示更多」下拉的最大宽度。也可在业务侧使用包内导出的 `useToolbarDropdownMaxWidth`、`getToolbarDropdownMaxWidthStyle`、`formatToolbarDropdownMaxWidth` 自定义包裹层。

### CKEditor.Content

只读内容预览，接收与编辑器一致的 HTML 字符串。

#### 属性说明

| 属性名        | 说明                                                               | 类型   | 默认值 |
| ------------- | ------------------------------------------------------------------ | ------ | ------ |
| className     | 预览根节点类名（叠加 `ck ck-content`）                             | string | -      |
| children      | HTML 字符串，经 `dangerouslySetInnerHTML` 渲染                     | string | -      |
| liveComponent | 传给 `LiveComponentView` 的扩展参数，需与编辑区 `Field` 侧配置一致 | object | -      |
| formCreator   | 传给 `SchemaRenderer` 的扩展参数，需与编辑区 `Field` 侧配置一致    | object | -      |
| model3d       | 传给预览区 `model-viewer` 的属性与全屏等行为配置                   | object | -      |

#### 预览行为

- **视频**：对 `figure.ck-video` 同步内联宽高到内部 `video`
- **3D 模型**：加载 `model-viewer` 后同步布局；支持全屏预览（桌面全屏 API，移动端固定层 overlay）
- **交互组件**：对 `section.ck-live-component[data-live-component]` 挂载 `LiveComponentView`；卸载时清理
- **图表**：对 `figure.ck-echart[data-echart-option]` 挂载 `@components/Echart` 渲染
- **表单**：对 `section.ck-form-creator[data-form-creator-schema]` 挂载 `@components/FormCreator` 的 `SchemaRenderer`；卸载时清理

### config 配置说明

与 CKEditor 5 一致项以外，本组件扩展如下（`merge` 进编辑器 `config`）：

| 配置项             | 说明                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| style              | Style 插件配置。传入 `style.definitions` 时会**整体替换**默认样式列表（非按索引合并）                                                                 | object   | 见 `defaultConfig.style`                    |
| table              | 表格内容工具栏                                                                                                                                                              |
| htmlSupport        | GeneralHtmlSupport 白名单；已允许 `model-viewer`、`figure.ck-video`、`figure.ck-echart`、`section.ck-live-component`、`section.ck-form-creator` 等                                                     |
| uploadAdapter      | 图片上传：`upload(file)` 返回 URL 或 `{ code, data, msg }`；`uploadUrl` 粘贴外链转存；`base64MaxWidth` / `base64MaxHeight` 控制无 `upload` 时的 base64 缩放                 |
| modelUpload        | **仅富文本**。3D 上传，默认合并 `uploadAdapter`；仅 `.glb`；无 `upload` 时 base64 嵌入                                                                                      |
| videoUpload        | **仅富文本**。视频上传，默认合并 `uploadAdapter`；支持 mp4、webm、ogg、mov 等；无 `upload` 时 base64 嵌入                                                                   |
| model3d.toolbar    | **仅富文本**。3D 浮动工具栏，默认 `model3dStyle:*`、`resizeModel3d:*`、`resizeModel3dHeight:*`，可拖拽缩放                                                                  |
| mediaVideo.toolbar | **仅富文本**。视频浮动工具栏，默认 `mediaVideoStyle:*`、`resizeMediaVideo:*`、`resizeMediaVideoHeight:*`                                                                    |
| liveComponent      | **仅富文本**。交互组件渲染/编辑参数，见下表                                                                                                                                 |
| formCreator        | **仅富文本**。FormCreator 表单渲染/编辑参数，见下表                                                                                                                         |
| echart.toolbar     | **仅富文本**。图表浮动工具栏，默认 `echartStyle:*`、`resizeEchart:*`、`resizeEchartHeight:*`，可拖拽缩放                                                                    |
| model3d            | **仅富文本**。3D 模型 `model-viewer` 参数，见下表                                                                                                                           |
| templateVariable   | **仅富文本**。邮件模版变量：变量列表与 lodash `templateSettings` 同名字段（`interpolate` / `escape`），见下表                                                               |

上传函数约定与图片相同：返回字符串 URL，或 `{ code: 0, data: 'url', msg }`（`code !== 0` 时展示失败占位图/提示）。

### 富文本扩展与存储结构

#### 3D 模型（Model3dPlugin）

- 工具栏：`model3dUpload`
- 存储：`figure` + `model-viewer`，类名 `ck-model3d`，支持对齐与拖拽缩放

#### 视频（VideoPlugin）

- 工具栏：`videoUpload`
- 存储：`figure.ck-video` 包裹 `video`，支持对齐与拖拽缩放

#### 交互组件（LiveComponentPlugin）

- 工具栏：`insertLiveComponent`，弹窗内嵌 `LiveComponentEditor`
- **Field 侧请在 `config.liveComponent` 中完成配置**（高度、libs、弹窗 `editor.*` 等）；可通过 `config.liveComponent.editor.sites`（或同对象顶层 `sites`）开启多站点文件面板
- 存储：`<section class="component-box ck-live-component" data-live-component="PlantUML编码配置">`
- 编辑区与 `CKEditor.Content` 均通过 `LiveComponentView` 渲染；选中后右上角提供「编辑」按钮，双击亦可再次打开编辑

#### ECharts 图表（EchartPlugin）

- 工具栏：`insertEchart`，弹窗内嵌 `JSONEditor` 编辑 ECharts `option` JSON
- 存储：`<figure class="ck-echart"><div class="ck-echart-inner" data-echart-option="..."></div></figure>`
- 编辑区与 `CKEditor.Content` 均通过 `@components/Echart` 渲染；选中后可拖拽调整宽高，双击可再次编辑配置

#### FormCreator 表单（FormCreatorPlugin）

- 工具栏：`insertFormCreator`，弹窗内嵌 `@components/FormCreator` 的 `FormCreatorField` 搭建表单
- **Field 侧请在 `config.formCreator` 中配置**；**Content 侧用 `formCreator.formProps`（对象）给文档内所有表单的 `Form` 统一传参**（如 `onSubmit`、`data`）
- 存储：`<section class="component-box ck-form-creator" data-form-creator-schema="encodeURIComponent(JSON)">`
- 编辑区与 `CKEditor.Content` 均通过 `SchemaRenderer` 渲染；选中后右上角提供「编辑」按钮，双击亦可再次打开编辑

#### 邮件模版变量（TemplateVariablePlugin）

- 工具栏：`insertTemplateVariable`（需自行加入 `config.toolbar.items`；未配置 `variables` 时按钮禁用）
- 编辑态：内联 chip，显示 `label`，样式区分插值 / 转义
- `getData` / `onChange`：输出纯文本模版标签，默认 `<%= name %>` / `<%- name %>`；可用 `interpolate` / `escape` RegExp 自定义（与 `_.templateSettings` 一致）
- 回填：HTML 中的模版标签会按正则解析为芯片；`label` 优先从 `variables` 查找

#### templateVariable 参数（config.templateVariable）

| 字段        | 说明                                                                                               | 类型   | 默认值               |
| ----------- | -------------------------------------------------------------------------------------------------- | ------ | -------------------- |
| variables   | 可插入变量列表；项含 `name`、`label`、可选 `kind`（`interpolate` \| `escape`，默认 `interpolate`） | array  | `[]`                 |
| interpolate | 插值语法 RegExp（需含捕获组），同 lodash `templateSettings.interpolate`                            | RegExp | `/<%=([\s\S]+?)%>/g` |
| escape      | 转义语法 RegExp（需含捕获组），同 lodash `templateSettings.escape`                                 | RegExp | `/<%-([\s\S]+?)%>/g` |
| evaluate    | 可传入以兼容完整 `templateSettings`；不参与变量 widget 化                                          | RegExp | -                    |

#### liveComponent 参数（`config.liveComponent` / Content.liveComponent）

| 字段                       | 说明                                                                                                  | 类型             |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| height                     | 编辑区/预览区挂载容器最小高度                                                                         | number \| string |
| libs                       | 传给 `LiveComponentView` 的运行库（如 `{ lodash, dayjs }`）                                           | object           |
| props                      | 传给 `LiveComponentView` 的属性覆盖                                                                   | object           |
| editor.height              | `LiveComponentEditor` 弹窗高度                                                                        | number           |
| editor.libs                | 传给 `LiveComponentEditor` 的 `libs`                                                                  | object           |
| editor.sites               | 传给 `LiveComponentEditor` 的多站点列表 `{ host, name }[]`；传入数组（含 `[]`）时弹窗开启左侧站点面板 | array            |
| editor.siteActionsOpen     | 是否允许在弹窗内添加/管理本地站点，默认 `true`                                                        | boolean          |
| editor.userSitesStorageKey | 用户自管站点在 `localStorage` 的存储 key                                                              | string           |
| editor.width               | 站点面板展开宽度                                                                                      | number           |
| editor.onSitesChange       | 合并后站点列表变更回调                                                                                | function         |
| editor.transformContentUrl | 复制内容地址时的 URL 转换                                                                             | function         |
| editor.enableSourceLocate  | 混合模式源码双向定位，默认跟随 Editor                                                                 | boolean          |
| sites                      | 简写，等价于 `editor.sites`                                                                           | array            |
| siteActionsOpen            | 简写，等价于 `editor.siteActionsOpen`                                                                 | boolean          |

- **Field**：在 `config.liveComponent` 中配置（插件从 `editor.config.get('liveComponent')` 读取）；顶层 `liveComponent` prop 仅作兼容合并
- **Content**：无编辑器 `config`，仍用 `liveComponent` prop 传预览侧参数（通常与 Field 的 `config.liveComponent` 共用同一对象，预览侧只用到 height/libs/props）
- 插入/编辑弹窗内的站点能力仅 Field 侧 `editor.*` / 顶层简写生效

#### formCreator 参数（`config.formCreator` / Content.formCreator）

| 字段         | 说明                                                                 | 类型             | 默认值  |
| ------------ | -------------------------------------------------------------------- | ---------------- | ------- |
| height       | 编辑区/预览区挂载容器最小高度                                        | number \| string | `240`   |
| preview      | 传给 `SchemaRenderer` 的预览模式                                     | boolean          | `true`  |
| showActions  | 是否显示 Schema 底部操作按钮                                         | boolean          | `false` |
| formProps    | **对象**。透传给文档内**每一个** FormCreator `SchemaRenderer` 内部 `Form`（如 `onSubmit`、`data`）；Content 侧常用 | object           | `{}`    |
| emptyText    | Schema 无可渲染内容时的占位文案                                      | string           | 见 i18n |
| editor       | 透传给弹窗内 `FormCreatorField` 的属性（如 `apis`、`extraToolbar` 等） | object           | `{}`    |

- **Field**：推荐写在 `config.formCreator`（顶层 `formCreator` prop 仅兼容合并）；编辑区挂载同样会带上 `formProps`
- **Content**：用 `formCreator` prop；其中 `formProps` 会对页面上所有 `section.ck-form-creator` 渲染出的表单生效
- 若 Content 需要可提交，通常设 `preview: false`、`showActions: true`，并在 `formProps.onSubmit` 处理提交

#### model3d 参数（Field / Content / config.model3d）

| 字段                     | 说明                                                                                                         | 类型    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------- |
| height                   | 预览默认高度（内容未内联高度时）                                                                             | string  |
| viewer                   | `model-viewer` 属性，与 `ModelView` 对齐：`autoRotate`、`cameraControls`、`poster`、`loading`、`exposure` 等 | object  |
| preview.enableFullscreen | `Content` 预览是否显示全屏按钮                                                                               | boolean | `true` |
| toolbar                  | 编辑器内浮动工具栏项（已有）                                                                                 | array   |

### Markdown 模式说明

`isMarkdown={true}` 时：

- 追加 CKEditor `Markdown` 插件，输出 Markdown 源码
- 不注册 `Model3dPlugin`、`VideoPlugin`、`LiveComponentPlugin`、`EchartPlugin`、`FormCreatorPlugin`
- 从 `config` 中剥离 `model3d`、`modelUpload`、`videoUpload`、`mediaVideo`、`liveComponent`、`formCreator`
- 自定义 `plugins` 传入上述插件时会被过滤

预览 Markdown 请配合 `@kne/markdown-components-render`（见 `doc/markdown.js`）。

### 包导出工具函数

| 名称                            | 说明                                                   |
| ------------------------------- | ------------------------------------------------------ |
| formatToolbarDropdownMaxWidth   | 将数字或字符串格式化为 CSS 宽度值                      |
| getToolbarDropdownMaxWidthStyle | 生成含 `--ck-toolbar-dropdown-max-width` 的 style 对象 |
| useToolbarDropdownMaxWidth      | 对容器 ref 做 ResizeObserver，返回当前可用最大宽度     |
| EMAIL_STYLE_PRESETS             | 邮件样式的**唯一声明来源**，下面几项均由它派生           |
| EMAIL_STYLE_DEFINITIONS         | 邮件模版 Style 预设，可直接赋给 `config.style.definitions` |
| EMAIL_TOOLBAR_ITEMS             | 邮件模版推荐工具栏（含模版变量与 `style`）             |
| EMAIL_STYLE_CSS                 | 无前缀邮件样式 CSS，可注入邮件模版外壳                  |
| toEmailHtml                     | 兜底工具：给 class 版 HTML 补 inline style（正常流程无需调用） |

#### 邮件模版样式（config.style + EMAIL_STYLE_DEFINITIONS）

```js
import CKEditor, { EMAIL_STYLE_DEFINITIONS, EMAIL_TOOLBAR_ITEMS } from '@kne-components/components-thirdparty/CKEditor';

<CKEditor.Field
  config={{
    toolbar: { items: EMAIL_TOOLBAR_ITEMS },
    style: { definitions: EMAIL_STYLE_DEFINITIONS },
    templateVariable: { variables: [...] }
  }}
/>
```

样式按「段落」下拉里可选的块元素分组。默认 heading 配置为 `paragraph→p`、`heading1→h2`、`heading2→h3`、`heading3→h4`（**没有 h1**），Style 插件只列出与当前块元素匹配的项，因此定义在 `h1` 上的样式永远选不到。

| 元素 | 段落下拉 | 可选样式 |
| ---- | -------- | -------- |
| `p` | 正文 | 正文、导语、补充说明、引用段、提示条、警示条、成功条、主按钮、次按钮、页脚 |
| `h2` | 标题 1 | 邮件主标题、章节标题（色条）、横幅标题（深底） |
| `h3` | 标题 2 | 小节标题、小节标题（底线）、小节标题（品牌色） |
| `h4` | 标题 3 | 小标题、标签标题 |
| `blockquote` | 引用按钮 | 邮件引用块 |
| `ul` / `ol` | 列表按钮 | 紧凑列表、宽松列表 |
| `hr` | 分割线按钮 | 细分割线、粗分割线、虚线分割线、空白间距 |
| `figure` | 表格按钮 | 邮件表格 |

对齐、字号、颜色、加粗交给工具栏，样式项不重复这些能力。按钮样式作用在段落上，内部链接会渲染成按钮块：写一行文字 → 加链接 → 套「主按钮」。

#### 邮件客户端兼容

预设只用 Outlook（Word 引擎）与 Gmail 都支持的属性：实体色、`px` 字号行高、`margin` / `padding` / `border` / `background-color`。**不使用**伪元素、`nth-child`、`border-radius`、`box-shadow`、渐变、`flex` / `grid` —— 这些在 inline 化后会丢失或被 Outlook 忽略。

分割线不靠 `border` 画：`<hr>` 在 Outlook 下容易渲染成双线或被忽略，因此统一用 `height` + `background-color`，并额外写 `color`（Word 引擎按 `color` 绘制 `hr`），同时 `border: 0` 清掉默认样式。

#### 编辑 / 保存 / 发信一致性

多数邮件客户端会剥离或忽略 `<style>`，只认元素上的 `style="..."`，因此发信内容必须带 inline style。这一步已由 `EmailStylePlugin`（富文本模式默认启用）接在编辑器出口上，**业务侧不需要任何额外调用**：

```js
// onChange 拿到的内容已带 inline style，可直接存库、直接投递
<CKEditor.Field value={content} onChange={setContent} config={{ style: { definitions: EMAIL_STYLE_DEFINITIONS } }} />
```

运作方式：

| 环节 | 内容形态 | 说明 |
| ---- | -------- | ---- |
| 编辑器 model | 只有 class | 保持干净，「样式」下拉可随时切换 |
| 编辑态显示 | class + 注入的 scoped CSS | CSS 由 `EMAIL_STYLE_PRESETS` 派生后运行时注入 |
| `onChange` / `getData()` | class + inline style | `editor.data.get()` 出口按同一份声明派生 `style` |
| `CKEditor.Content` 预览 | 同上 | 内容自带 inline style，无需额外样式表 |
| 发信 | 同上 | 直接投递，无转换步骤 |

回填是幂等的：`htmlSupport` 未放开 `p`/`h2` 等的 `style`，内容回到编辑器时 inline style 被丢弃、class 保留，显示仍由 scoped CSS 负责，下次输出再重新派生。因此同一份内容反复编辑保存不会叠加或漂移。

样式声明只存在于 `emailStyles.js` 的 `EMAIL_STYLE_PRESETS`，下拉选项、编辑态 CSS、发信 inline style 全部由它派生，`ckeditor.scss` 里不再有邮件样式，不存在需要人工同步的副本。改样式只改一处。

#### toEmailHtml(html, options)

正常流程用不到——只在手上是 class 版 HTML（例如从别处导入的内容）时用它补样式。

| 参数            | 说明                                                         | 类型     | 默认值            |
| --------------- | ------------------------------------------------------------ | -------- | ----------------- |
| html            | 富文本内容                                                   | string   | -                 |
| options.css     | 要 inline 的 CSS                                             | string   | `EMAIL_STYLE_CSS` |
| options.inliner | 自定义 inline 实现 `(html, css) => string`，替换内置逻辑     | function | -                 |

行为说明：

- 内容不含 `email-` 时直接返回，不做解析（出口被高频调用，非邮件场景零开销）
- 用浏览器 CSSOM 解析 `css` 后写入元素 `style`；`class` 保留便于排查
- **工具栏产生的 inline style（颜色、字号、对齐）优先级最高**，不会被样式类覆盖
- `@media` 等无法 inline 的规则原样保留在输出前部的 `<style>` 中
- 无 DOM 环境（SSR）退化为 `<style>` + 原内容

如果已有基于 [juice](https://www.npmjs.com/package/juice) 的发信链路，可通过 `inliner` 接入（juice 需自行安装，非本包依赖）：

```js
import juice from 'juice/client';

toEmailHtml(content, { inliner: (html, css) => juice(`<style>${css}</style>${html}`) });
```

已知退化（可接受）：Outlook 桌面忽略 `inline-block` 的 `padding`，按钮偏窄只保留底色；`dashed` 边框可能渲染为实线。

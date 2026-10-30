# TemplateEditor

### 概述

### 组件概述

TemplateEditor 是邮件 / 通知模板编辑器，基于 CKEditor 的邮件工具栏与 Liquid 模板变量、条件插件，提供「编辑 / 预览」两种模式：编辑时可插入变量与条件块，预览时用示例数据渲染出真实邮件效果，并可切换电脑、手机宽度。

### 主要特性

- 邮件专用工具栏与样式预设（标题、按钮、提示条、页脚等），预览时自动 inline 样式，贴近邮件客户端效果
- 插入模板变量（`{{ name }}`）与条件块（`{% if %}`），输出标准 Liquid 语法
- 预览使用 liquidjs 渲染示例数据，未提供示例值的变量显示为 `[变量名]`；语法错误时给出提示
- 可选的邮件主题预览（信封头），主题同样支持变量
- 预览在沙箱 iframe 中渲染，样式与页面隔离、模版脚本不执行；链接一律在新标签页打开（页内锚点除外）；支持电脑 / 手机宽度切换
- 与 JSONEditor 用法一致：默认导出可直接作为 FormInfo 表单字段，`TemplateEditor.Field` 可独立使用
- 导出 `renderTemplate`，业务侧可用同一套规则渲染模板

### 使用场景

适用于营销邮件、面试邀约、录用通知、系统通知等需要「可视化编辑 + 变量替换 + 效果预览」的模板管理场景。


### 示例

#### 示例代码

- 基础用法
- 使用 TemplateEditor.Field 编辑 AI 面试邀请邮件：工具栏可插入变量，切换到预览后用 previewData 渲染正文与 subject 主题，并可切换电脑 / 手机宽度
- _TemplateEditor(@components/TemplateEditor)

```jsx
const { default: TemplateEditor } = _TemplateEditor;
const { useState } = React;

const variables = [
  { name: 'candidateName', label: '候选人姓名' },
  { name: 'jobTitle', label: '应聘岗位' },
  { name: 'interviewTime', label: '面试时间' },
  { name: 'interviewLink', label: '面试链接' }
];

const previewData = {
  candidateName: '王芳',
  jobTitle: '高级前端工程师',
  interviewTime: '2026-11-05 14:00',
  interviewLink: 'https://interview.example.com/room/8F3K2'
};

const initContent = &#96;<h2 class="email-title">AI 面试邀请</h2>
<p class="email-lead">{{ candidateName }}，您好！</p>
<p class="email-text">感谢您投递 <strong>{{ jobTitle }}</strong> 岗位，诚邀您参加 AI 视频面试。</p>
<p class="email-tip">面试时间：{{ interviewTime }}，请提前 10 分钟进入面试间并检查摄像头与麦克风。</p>
<p class="email-text"><a href="{{ interviewLink }}"><span class="email-btn">进入面试间</span></a></p>
<p class="email-footer">此邮件由系统自动发送，请勿直接回复。</p>&#96;;

const BaseExample = () => {
  const [content, setContent] = useState(initContent);
  return (
    <TemplateEditor.Field
      value={content}
      onChange={setContent}
      variables={variables}
      previewData={previewData}
      subject="【面试邀请】{{ candidateName }}，邀请您参加{{ jobTitle }}岗位 AI 面试"
    />
  );
};

render(<BaseExample />);

```

- 在Form中使用
- 作为 FormInfo 表单字段编辑入职通知模板，支持 name、label、rule 校验；condition={false} 关闭条件块，height 控制编辑区高度
- _TemplateEditor(@components/TemplateEditor),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const { default: TemplateEditor } = _TemplateEditor;
const { createWithRemoteLoader } = remoteLoader;
const { Typography } = antd;

const variables = [
  { name: 'employeeName', label: '员工姓名' },
  { name: 'department', label: '部门' },
  { name: 'entryDate', label: '入职日期' }
];

const initData = {
  name: '入职欢迎通知',
  content: &#96;<p class="email-lead">{{ employeeName }}，欢迎加入{{ department }}！</p>
<p class="email-text">您的入职日期为 {{ entryDate }}，请携带身份证、学历证书原件到前台办理入职手续。</p>
<p class="email-footer">人力资源部</p>&#96;
};

const FormExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Input } = FormInfo.fields;
  return (
    <Form
      data={initData}
      onSubmit={data => {
        console.log(data);
      }}>
      <FormInfo
        column={1}
        list={[
          <Input name="name" label="模板名称" rule="REQ" />,
          <TemplateEditor
            name="content"
            label="模板内容"
            rule="REQ"
            variables={variables}
            condition={false}
            height={280}
            previewData={{ employeeName: '张伟', department: '技术部', entryDate: '2026-11-16' }}
          />
        ]}
      />
      <Typography.Paragraph type="secondary">本示例关闭了条件块（condition=false），提交后在控制台查看表单数据。</Typography.Paragraph>
      <SubmitButton>保存模板</SubmitButton>
    </Form>
  );
});

render(<FormExample />);

```

- 文本模式（短信）
- type="text" 时仍用 CKEditor 插入变量与行内条件，但 value / onChange 是纯文本（每行一段、丢弃格式），预览以短信气泡展示渲染结果与字数；contactPhone 未提供示例值，预览中以 [联系电话] 占位
- _TemplateEditor(@components/TemplateEditor),antd(antd)

```jsx
const { default: TemplateEditor } = _TemplateEditor;
const { Flex, Typography } = antd;
const { useState } = React;

const variables = [
  { name: 'candidateName', label: '候选人姓名' },
  { name: 'interviewTime', label: '面试时间' },
  { name: 'shortLink', label: '短链接' },
  { name: 'contactPhone', label: '联系电话' }
];

const previewData = {
  candidateName: '王芳',
  interviewTime: '11月5日 14:00',
  shortLink: 'https://s.example.com/8F3K2'
};

const initContent = &#96;【AI面试】{{ candidateName }}您好，您的AI视频面试安排在{{ interviewTime }}，请点击 {{ shortLink }} 进入。
{% if contactPhone != blank %}如有疑问请致电{{ contactPhone }}。{% else %}如有疑问请回复本短信。{% endif %}&#96;;

const SmsExample = () => {
  const [content, setContent] = useState(initContent);
  return (
    <Flex vertical gap={12}>
      <TemplateEditor.Field type="text" value={content} onChange={setContent} variables={variables} previewData={previewData} />
      <Typography.Text type="secondary">onChange 输出的纯文本：</Typography.Text>
      <Typography.Paragraph code style={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography.Paragraph>
    </Flex>
  );
};

render(<SmsExample />);

```

- 条件块与示例数据切换
- 通过 condition 配置条件算子，正文按会员等级、优惠码是否为空输出不同内容；切换示例数据可在预览中对比效果，并演示 renderTemplate 渲染主题
- _TemplateEditor(@components/TemplateEditor),antd(antd)

```jsx
const { default: TemplateEditor, renderTemplate } = _TemplateEditor;
const { Flex, Segmented, Typography } = antd;
const { useState } = React;

const variables = [
  { name: 'user.name', label: '用户姓名' },
  { name: 'user.level', label: '会员等级' },
  { name: 'couponCode', label: '优惠码' }
];

const condition = {
  operators: ['truthy', 'falsy', 'filled', 'empty', 'eq', 'neq'],
  allowElse: true,
  allowNesting: true
};

const samples = {
  vip: { label: 'VIP 会员', data: { user: { name: '李娜', level: 'VIP' }, couponCode: 'VIP2026' } },
  normal: { label: '普通会员', data: { user: { name: '陈强', level: '普通' }, couponCode: '' } }
};

const initContent = &#96;<h2 class="email-title">双十一会员专享</h2>
<p class="email-lead">{% if user.level == 'VIP' %}尊敬的 VIP 会员 {{ user.name }}{% else %}亲爱的 {{ user.name }}{% endif %}，您好！</p>
<p class="email-text">{% if couponCode != blank %}您的专属优惠码 {{ couponCode }} 已到账，下单立减 200 元。{% else %}升级 VIP 即可领取专属优惠码。{% endif %}</p>
<p class="email-footer">活动时间：2026-11-01 至 2026-11-11</p>&#96;;

const subject = '{{ user.name }}，您的双十一专属福利已送达';

const ConditionExample = () => {
  const [content, setContent] = useState(initContent);
  const [sample, setSample] = useState('vip');
  const { data } = samples[sample];
  return (
    <Flex vertical gap={12}>
      <Flex gap={8} align="center" wrap>
        <Typography.Text>预览示例数据：</Typography.Text>
        <Segmented value={sample} onChange={setSample} options={Object.entries(samples).map(([value, { label }]) => ({ value, label }))} />
      </Flex>
      <TemplateEditor.Field value={content} onChange={setContent} variables={variables} condition={condition} previewData={data} subject={subject} height={320} />
      <Typography.Text type="secondary">renderTemplate 渲染主题：{renderTemplate(subject, data)}</Typography.Text>
    </Flex>
  );
};

render(<ConditionExample />);

```

### API

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

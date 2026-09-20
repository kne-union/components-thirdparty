# CKEditor

### 概述

基于 CKEditor 5 的富文本编辑器封装，面向表单与内容生产场景，提供完整工具栏、图片/表格编辑、Markdown 输出，以及 3D 模型、视频、交互组件、FormCreator 表单、邮件模版变量与行内条件等富媒体能力。

### 主要特性

- **双模式**：富文本（HTML）与 Markdown（`isMarkdown`），Markdown 下自动剔除 3D、视频、交互组件、图表、表单相关工具与配置
- **富媒体插件**：GLB 3D 模型（`@google/model-viewer`）、HTML5 视频、LiveComponent（`LiveComponentEditor` 编辑 + `LiveComponentView` 渲染）、FormCreator（搭建器编辑 + `SchemaRenderer` 渲染）
- **邮件模版变量**：`TemplateVariablePlugin` 支持插入 lodash 插值/转义变量，编辑态显示 label 芯片，`getData` 输出可配置模版语法
- **邮件模版条件**：`TemplateConditionPlugin` 默认插入单条件壳（真值/假值/有值/空值/等于/不等于 + 可选否则）；「编辑条件」弹窗可添加扁平且/或多谓词；可选把 if / else 切成块级（`data-template-condition-layout`）
- **统一上传**：图片、3D、视频共用 `uploadAdapter` / `preset.apis.file`，未配置 `upload` 时回退 base64
- **预览增强**：`CKEditor.Content` 同步视频尺寸、挂载交互组件/表单/图表、3D 全屏预览（含移动端 overlay）
- **工具栏适配**：`CKEditor.Field` 按容器宽度设置 `--ck-toolbar-dropdown-max-width`，避免「显示更多」下拉过宽

### 使用场景

- 文章/公告/知识库等内容编辑与预览
- 需要嵌入 3D 产品模型或说明视频的营销/帮助文档
- 需要可配置、可复用的交互区块（LiveComponent）的运营页面
- 需要在富文本中嵌入可填写表单（FormCreator / SchemaRenderer）的场景
- 邮件/通知等 lodash 模版内容编写（变量与条件）
- 技术文档等需要 Markdown 源码编辑与输出的场景


### 示例

#### 示例代码

- 基础示例
- 展示富文本编辑器的基本功能，包含完整的工具栏和内容编辑功能
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title } = Typography;

const initData = &#96;<h2>欢迎使用 CKEditor 5</h2><p>这是一个功能强大的富文本编辑器，支持：</p><ul>  <li><strong>文本格式</strong>：加粗、斜体、下划线、删除线等</li>  <li><strong>段落</strong>：标题、引用、代码块等</li>  <li><strong>列表</strong>：有序列表、无序列表、待办事项</li>  <li><strong>图片</strong>：上传、调整大小、设置样式</li>  <li><strong>表格</strong>：插入和编辑表格</li>  <li><strong>链接</strong>：插入和管理链接</li>  <li><strong>更多</strong>：水平线、分页符、特殊字符等</li></ul><p>尝试编辑上面的内容，体验各种编辑功能！</p>&#96;;

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>基础富文本编辑器</Title>
          <CKEditor.Field value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- Markdown 模式
- 展示 Markdown 模式下的编辑器，支持 Markdown 语法输入和编辑
- _CKEditor(@components/CKEditor),antd(antd),_MarkdownRender(@kne/markdown-components-render)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Switch, Divider } = antd;
const { useState } = React;
const { Title } = Typography;
const { default: MarkdownRender } = _MarkdownRender;

const initData = &#96;
## Markdown output 🛫

[CKEditor 5](https://ckeditor.com/) can be configured to output Markdown instead of HTML. Markdown is a lightweight markup language that you can use to add formatting to plain text documents. Use the **Source** button to check and edit the Markdown source code of this content.

The editor-produced Markdown output supports most essential features, like [links](https://ckeditor.com/), **different** kinds of _emphasis_, inline code formatting, or code blocks:

css
p {
    text-align: center;
    color: red;
}


## Markdown input 🛬

Thanks to the [autoformatting feature](https://ckeditor.com/docs/ckeditor5/latest/features/autoformat.html), you can use Markdown syntax when writing. Try it out - use these (or any other) Markdown shortcuts in the editor to format the content on the fly 🚀!

| Inline formatting | Shortcut                            |
| ----------------- | ----------------------------------- |
| **Bold**          | Type ** or __ around your text. |
| _Italic_          | Type * or _ around your text.   |
| Code            | Type  around your text.          |
| ~~Strikethrough~~ | Type ~~ around your text.         |

Shh! 🤫 Markdown has very basic support for tables. Some advanced table-related features like table or cell styling were disabled in this demo.

## Block formatting

You can also use Markdown to create various text blocks, such as:

* Block quotes - Start a line with ﹥ followed by a space.

* Headings:

    1. Heading 1 - Start a line with # followed by a space.
    2. Heading 2 - Start a line with ## followed by a space.
    3. Heading 3 - Start a line with ### followed by a space.

* Lists, including nested ones:

    * Numbered lists - Start a line with 1. or 1) followed by a space.
    * Bulleted lists - Start a line with * or - followed by a space.
    * To-do lists - Start a line with [ ] or [x] followed by a space to insert an unchecked or checked list item.

* Code blocks - Start a line with .

* Horizontal lines - Start a line with ---
&#96;;

const MarkdownExample = () => {
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [content, setContent] = useState(initData);
  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Flex justify="space-between" align="center">
            <Title level={4} style={{ margin: 0 }}>
              Markdown 模式
            </Title>
            <Switch checked={isMarkdown} onChange={setIsMarkdown} checkedChildren="Markdown" unCheckedChildren="富文本" />
          </Flex>
          <CKEditor.Field key={&#96;editor-${isMarkdown}&#96;} isMarkdown={isMarkdown} value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          {isMarkdown ? <MarkdownRender>{content}</MarkdownRender> : <CKEditor.Content>{content}</CKEditor.Content>}
        </Space>
      </Card>
    </Flex>
  );
};

render(<MarkdownExample />);

```

- 自定义配置
- 工具栏分层：简单、标准、富媒体模版、邮件模版（含样式与邮件兼容预设）、全部
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor, EMAIL_STYLE_DEFINITIONS, EMAIL_TOOLBAR_ITEMS } = _CKEditor;
const { Flex, Card, Space, Typography, Radio, Divider, Alert } = antd;
const { useState } = React;
const { Title } = Typography;

/** 与 CKEditor.Field 默认 config.toolbar.items 一致，代表「全部」档位 */
const FULL_TOOLBAR_ITEMS = [
  'undo',
  'redo',
  '|',
  'heading',
  'style',
  '|',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'link',
  'bulletedList',
  'numberedList',
  'todoList',
  'fontBackgroundColor',
  'fontColor',
  'fontSize',
  '|',
  'alignment',
  'pageBreak',
  'outdent',
  'indent',
  '|',
  'specialCharacters',
  'subscript',
  'superscript',
  '|',
  'imageUpload',
  'model3dUpload',
  'videoUpload',
  'insertLiveComponent',
  'insertEchart',
  'insertFormCreator',
  'blockQuote',
  'insertTable',
  'codeBlock',
  'htmlEmbed',
  'highlight',
  'horizontalLine',
  '|',
  'selectAll',
  'removeFormat',
  'sourceEditing'
];

/**
 * 简单：文字样式 + 基础排版（列表 / 对齐 / 缩进）
 * 标准：日常最常用（结构、列表、链接、对齐、图片、表格、代码块等）
 * 富媒体模版：撤销/重做置顶，其后图片 / 视频 / 3D / 图表 / 交互组件 / 表单，其余与标准类似
 * 邮件模版：模版变量优先，含样式（邮件兼容常用样式），配合邮件常用排版与表格
 * 全部：组件默认工具栏全量能力
 */
const TOOLBAR_PRESETS = {
  simple: {
    label: '简单',
    hint: '文字样式与基础排版：加粗/斜体/下划线、列表、对齐、缩进',
    config: {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'alignment',
          'outdent',
          'indent',
          '|',
          'removeFormat'
        ]
      }
    }
  },
  standard: {
    label: '标准',
    hint: '最常用：标题、文字样式与链接、列表、对齐、图片、引用、表格、代码块',
    config: {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'link',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'alignment',
          'outdent',
          'indent',
          '|',
          'imageUpload',
          'blockQuote',
          'insertTable',
          'codeBlock',
          '|',
          'removeFormat'
        ]
      }
    }
  },
  richMedia: {
    label: '富媒体模版',
    hint: '撤销/重做置顶；其后为图片、视频、3D、图表、交互组件、表单；其余与标准档类似',
    config: {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'imageUpload',
          'videoUpload',
          'model3dUpload',
          'insertEchart',
          'insertLiveComponent',
          'insertFormCreator',
          '|',
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'link',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'alignment',
          'outdent',
          'indent',
          '|',
          'blockQuote',
          'insertTable',
          'codeBlock',
          '|',
          'removeFormat'
        ]
      }
    }
  },
  emailTemplate: {
    label: '邮件模版',
    hint: '撤销置顶；模版变量 + 模版条件 + 样式（按段落可选元素分组：正文/标题1-3/引用/列表/分割线/表格，均为邮件客户端兼容写法）',
    config: {
      toolbar: {
        items: EMAIL_TOOLBAR_ITEMS
      },
      style: {
        definitions: EMAIL_STYLE_DEFINITIONS
      },
      templateVariable: {
        variables: [
          { name: 'userName', label: '用户名' },
          { name: 'companyName', label: '公司名' },
          { name: 'rawHtml', label: '原始HTML', kind: 'escape' }
        ]
      },
      templateCondition: {
        operators: ['truthy', 'falsy', 'filled', 'empty', 'eq', 'neq'],
        allowElse: true
      }
    }
  },
  full: {
    label: '全部',
    hint: '开放默认工具栏全部功能（含预设样式、富媒体、源码编辑等）',
    config: {
      toolbar: {
        items: FULL_TOOLBAR_ITEMS
      }
    }
  }
};

const CustomConfigExample = () => {
  const [toolbarType, setToolbarType] = useState('simple');
  const [content, setContent] = useState(&#96;<h2>自定义配置示例</h2>\n<p>切换下方档位，工具栏按钮数量会明显变化。</p>&#96;);

  const preset = TOOLBAR_PRESETS[toolbarType];
  const toolbarItemCount = preset.config.toolbar.items.filter(item => item !== '|').length;

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>自定义工具栏配置</Title>
          <Radio.Group value={toolbarType} onChange={e => setToolbarType(e.target.value)} buttonStyle="solid">
            {Object.entries(TOOLBAR_PRESETS).map(([key, { label }]) => (
              <Radio.Button key={key} value={key}>
                {label}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Alert type="info" showIcon message={&#96;当前：${preset.label}（${toolbarItemCount} 个工具按钮）&#96;} description={preset.hint} />
          <CKEditor.Field key={toolbarType} config={preset.config} value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content key={&#96;preview-${toolbarType}&#96;}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<CustomConfigExample />);

```

- 国际化支持
- 展示如何配置编辑器的语言，支持多种国际化选项
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Select, Divider } = antd;
const { useState } = React;
const { Title, Text } = Typography;

const I18nExample = () => {
  const [language, setLanguage] = useState('zh-CN');
  const [content, setContent] = useState(
    &#96;<h2>国际化示例</h2>\n<p>CKEditor 5 支持多种语言，可以通过配置 language 属性来切换界面语言。</p>\n<p>尝试切换下面的语言选择器，观察编辑器界面语言的变化。</p>\n<ul>\n  <li>简体中文 (zh-CN)</li>\n  <li>英语 (en-US)</li>\n</ul>&#96;
  );

  const languageOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' }
  ];

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Flex justify="space-between" align="center">
            <Title level={4} style={{ margin: 0 }}>
              国际化支持
            </Title>
            <Space>
              <Text>选择语言：</Text>
              <Select value={language} onChange={setLanguage} options={languageOptions} style={{ width: 200 }} />
            </Space>
          </Flex>
          <CKEditor.Field key={language} locale={language} value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content key={&#96;preview-${language}&#96;}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<I18nExample />);

```

- 3D模型上传
- 使用 model-viewer 上传并展示 GLB 3D 模型，未配置上传 API 时自动使用 base64
- _CKEditor(@components/CKEditor),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;
const { getPublicPath } = remoteLoader;

const initData = &#96;<h2>3D模型上传示例</h2><p>点击工具栏中的<span style="color: #1677ff;">3D模型按钮</span>，选择 <strong>.glb</strong> 文件即可插入编辑器。</p><p>未配置上传接口时，模型会以 base64 嵌入内容；配置 <code>modelUpload.upload</code> 或 <code>uploadAdapter.upload</code> 后走服务端上传。
<figure class="ck-model3d" style="height:626px;">
    <div class="ck-model3d" style="height:626px;">
        <model-viewer style="height:626px;width:100%;" src="${getPublicPath('components-thirdparty')}/3d/NeilArmstrong.glb" alt="NeilArmstrong.glb" camera-controls="" auto-rotate="" loading="lazy"></model-viewer>
    </div>
</figure>
</p>&#96;;

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>3D模型上传</Title>
            <Paragraph type="secondary">点击工具栏中的 3D模型 按钮上传模型文件，编辑器与预览均使用 @google/model-viewer 渲染</Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{ message: messageApi }}
            model3d={{
              viewer: {
                autoRotate: true,
                cameraControls: true,
                loading: 'lazy'
              }
            }}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content
            model3d={{
              viewer: {
                autoRotate: true,
                cameraControls: true,
                loading: 'lazy'
              },
              preview: { enableFullscreen: true }
            }}>
            {content}
          </CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- 交互组件
- 弹窗内嵌支持多站点的 LiveComponentEditor；以 section 特殊标签插入，LiveComponentView 渲染
- _CKEditor(@components/CKEditor),antd(antd),lodash(lodash),dayjs(dayjs)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const initData = &#96;<h2>
    交互组件示例
</h2>
<section class="component-box ck-live-component" data-live-component="xLLDIzn06FuhOIvUijcrfn9s5rIq259eBRqqFMGdipPrCXCc4ra90QKKjB2iuBOBKYZsWowLgWUHiXV_p2Rk_elEn4rCx6eflJgNvFru7kPvysGc090IZWW7EgWkKUOiaoRLv4lT8DKvmYrj2QEMie4Ojw69bJNJhGMp3q9HLiJAC0gtEKQrm6NKzRGa21LiUxmMlBXgBRHhJHjXozEMYUjpXPWEgXb0FWoWOBE1i0YZx_lHNbiac8zb-UdY4sLbyN6fKfgjL0nGhgjt4AyYZ636R27NPDmHEdFyupVzSQzVu1S1TRbDYLVOjbn10jDdudTRySSJWPrHDqpi8zq0MSe0eJeTDUvkHTtZ0YfB2TGrw6Lujww5LmYkDsZh4QE-gpGmXUkfI5jyI8QylCJexTde_ClVLOdExOFnjvy6oBQN9cvH95IVzIu_ztA8D74xOdS_tZsAsaUNtKzvN27z3xDuXbfyZY6pE0OBUP3PYTxS9E9EPtHnAbrpHIYvRrXOMn5sdVXOwD_fZGxxyVlJk7qiU2Raqj6IzTxOzyR-FsF_OSFhm_Qrxt6xkIbaGYIb2vd9iVimFNMB0rpr6uxDvttEAQd7dRtXu6krFBqw3RvW4eZmf27gV8ZFTtBmGdMoqtAsLNb9t8YAbmXGGN8Z03q0oPybNopKD7tCdyinYNjd-El7S30ONXp6soUYds-wCkjnPfCr48Ogy21r4s3ABSgGEYubOZnU2LA6zAmKXhy1">
    &nbsp;
</section>
<p>
    点击工具栏「交互组件」按钮，在弹窗中使用 LiveComponentEditor 编写组件，确认后以特殊标签插入文档。
</p>&#96;;

const liveComponentConfig = {
  height: 400,
  libs: { lodash, dayjs },
  editor: {
    height: 560,
    libs: { lodash, dayjs },
    sites: [
      { host: 'localStorage:live-component-demo', name: '本地演示' },
      { host: 'localStorage:live-component-demo-2', name: '本地演示 2' }
    ],
    siteActionsOpen: true
  }
};

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>交互组件</Title>
            <Paragraph type="secondary">
              通过 <Text code>config.liveComponent</Text> 配置预览与插入弹窗（含多站点文件面板）；编辑区与
              CKEditor.Content 预览均通过 LiveComponentView 渲染。双击已插入组件可再次编辑。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              message: messageApi,
              liveComponent: liveComponentConfig
            }}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content liveComponent={liveComponentConfig}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- ECharts 图表
- 弹窗使用 JSONEditor 配置 ECharts option，插入后可拖拽调整大小，预览与编辑均使用 @components/Echart 渲染
- _CKEditor(@components/CKEditor),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;

const sampleOption = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
};

const encodedOption = encodeURIComponent(JSON.stringify(sampleOption));

const initData = &#96;<h2>ECharts 图表示例</h2>
<p>点击工具栏 <strong>图表</strong> 按钮，在弹窗中用 JSONEditor 编辑 ECharts <code>option</code> 后插入。选中图表可拖拽调整大小，双击可再次编辑配置。</p>
<figure class="ck-echart" style="height:400px;">
  <div class="ck-echart-inner" data-echart-option="${encodedOption}" style="height:400px;"></div>
</figure>&#96;;

const EchartExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>插入 ECharts 图表</Title>
            <Paragraph type="secondary">
              编辑区与预览区均通过 @components/Echart 渲染；配置以 JSON 存入 <code>data-echart-option</code>
            </Paragraph>
          </div>
          <CKEditor.Field value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<EchartExample />);

```

- 视频上传
- 上传 mp4、webm、mov 等视频并在编辑器中插入 HTML5 video，未配置上传 API 时自动使用 base64
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;

const initData = &#96;<h2>视频上传示例</h2><p>点击工具栏中的<span style="color: #1677ff;">视频按钮</span>，选择 <strong>mp4 / webm / mov</strong> 等文件即可插入编辑器。</p><p>未配置上传接口时，视频会以 base64 嵌入内容；配置 <code>videoUpload.upload</code> 或 <code>uploadAdapter.upload</code> 后走服务端上传。</p>&#96;;

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>视频上传</Title>
            <Paragraph type="secondary">点击工具栏中的视频按钮上传视频文件，编辑器与预览均使用 HTML5 video 播放</Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              message: messageApi
            }}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- 邮件模版变量
- 插入 lodash 模版变量：编辑态显示 label 芯片，getData 输出可配置的插值/转义语法
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const EMAIL_TOOLBAR_ITEMS = [
  'undo',
  'redo',
  '|',
  'heading',
  '|',
  'bold',
  'italic',
  'underline',
  'fontColor',
  'fontSize',
  '|',
  'bulletedList',
  'numberedList',
  'alignment',
  '|',
  'link',
  'insertTable',
  'insertTemplateVariable',
  '|',
  'removeFormat',
  'sourceEditing'
];

const templateVariableConfig = {
  variables: [
    { name: 'userName', label: '用户名' },
    { name: 'companyName', label: '公司名' },
    { name: 'rawHtml', label: '原始HTML', kind: 'escape' }
  ],
  // 与 lodash.templateSettings 同名字段；示例使用自定义 {{ }} / {{- }}
  interpolate: /\{\{([\s\S]+?)\}\}/g,
  escape: /\{\{-([\s\S]+?)\}\}/g
};

const initData = &#96;<p>你好 {{userName}}，欢迎加入 {{companyName}}。</p><p>以下为原始 HTML：{{-rawHtml}}</p>&#96;;

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>邮件模版变量</Title>
            <Paragraph type="secondary">
              工具栏「模版变量」从配置列表插入；编辑态显示 label 芯片，获取内容为 lodash 模版标签（本示例为自定义
              <Text code>{'{{name}}'}</Text> / <Text code>{'{{-name}}'}</Text>）。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              toolbar: { items: EMAIL_TOOLBAR_ITEMS },
              templateVariable: templateVariableConfig
            }}
          />
          <Divider orientation="left">getData / onChange 原始内容</Divider>
          <Text code style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
            {content}
          </Text>
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- 邮件模版条件
- 行内条件（真值/假值/有值/空值/等于/不等于 + 可选否则）。块级写在条件最外层 span 的 data-template-condition-layout 上，内部仍是 lodash if/else
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor, EMAIL_STYLE_DEFINITIONS, EMAIL_TOOLBAR_ITEMS } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const templateVariableConfig = {
  variables: [
    { name: 'userName', label: '用户名' },
    { name: 'couponCode', label: '优惠码' },
    { name: 'companyName', label: '公司名' }
  ]
};

const templateConditionConfig = {
  operators: ['truthy', 'falsy', 'filled', 'empty', 'eq', 'neq'],
  allowElse: true,
  allowNesting: true
};

const initData = &#96;<p>亲爱的<% if (userName == 'VIP') { %>尊贵的<%= userName %><% } else { %>朋友<% } %>，您好！</p><p>使用优惠码<% if (couponCode != null && couponCode !== '') { %><%= couponCode %>可享折扣<% } %>。</p>&#96;;

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>邮件模版条件</Title>
            <Paragraph type="secondary">
              工具栏「条件」插入行内**单条件**壳；选中后浮动条可编辑条件（弹窗内可「添加条件」做扁平且/或）、切换否则，或切成块级。块级里可以选标题和样式，也可以再套一层条件；切回行内时会去掉块级标签和回车换行，只保留文字、变量和仍为行内的嵌套条件。
              <Text code>getData</Text> 在条件最外层保留属性（含 <Text code>data-template-condition-clauses</Text> / <Text code>joiner</Text>），内部仍是 lodash <Text code>{'<% if %>'}</Text>。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              toolbar: { items: EMAIL_TOOLBAR_ITEMS },
              style: { definitions: EMAIL_STYLE_DEFINITIONS },
              templateVariable: templateVariableConfig,
              templateCondition: templateConditionConfig
            }}
          />
          <Divider orientation="left">getData / onChange 原始内容</Divider>
          <Text code style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
            {content}
          </Text>
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- FormCreator 表单
- config.formCreator 配置编辑区；Content 用 formCreator.formProps 给所有表单 Form 传参
- _CKEditor(@components/CKEditor),_FormCreator(@components/FormCreator),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
const { defaultSchema, createBlock, createField } = _FormCreator;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useMemo, useState } = React;
const { Title, Paragraph, Text } = Typography;

const sampleSchema = {
  ...defaultSchema(),
  title: '活动报名',
  blocks: [
    createBlock('formInfo', {
      title: '基本信息',
      column: 2,
      list: [
        createField({ type: 'Input', name: 'name', label: '姓名', rule: 'REQ', props: { placeholder: '请输入姓名' } }),
        createField({ type: 'Input', name: 'email', label: '邮箱', rule: 'REQ EMAIL', props: { placeholder: '请输入邮箱' } })
      ]
    })
  ]
};

const initData = &#96;<h2>
    表单搭建示例
</h2>
<section class="component-box ck-form-creator" data-form-creator-schema="${encodeURIComponent(JSON.stringify(sampleSchema))}">
    &nbsp;
</section>
<p>
    点击工具栏「表单」按钮，在弹窗中使用 FormCreator 搭建表单，确认后以特殊标签插入文档；编辑区与 CKEditor.Content 均通过 SchemaRenderer 渲染。双击已插入块可再次编辑。
</p>&#96;;

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  // Field：编辑区预览（只读示意）
  const fieldFormCreator = useMemo(
    () => ({
      height: 280,
      preview: true,
      showActions: false
    }),
    []
  );

  // Content：可交互；formProps 会传给文档内每一个 FormCreator 表单的 Form
  const contentFormCreator = useMemo(
    () => ({
      height: 280,
      preview: false,
      showActions: true,
      formProps: {
        onSubmit: values => {
          messageApi.success(&#96;提交成功：${JSON.stringify(values)}&#96;);
          return true;
        }
      }
    }),
    [messageApi]
  );

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>FormCreator 表单</Title>
            <Paragraph type="secondary">
              Field 用 <Text code>config.formCreator</Text> 配置编辑区预览；Content 用{' '}
              <Text code>formCreator.formProps</Text> 给文档内所有 FormCreator 表单的 <Text code>Form</Text> 统一传参（如{' '}
              <Text code>onSubmit</Text>、<Text code>data</Text>）。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              message: messageApi,
              formCreator: fieldFormCreator
            }}
          />
          <Divider orientation="left">内容预览（可提交）</Divider>
          <CKEditor.Content formCreator={contentFormCreator}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- 在Form中使用
- 展示如何在Form中使用编辑器
- _CKEditor(@components/CKEditor),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const { createWithRemoteLoader } = remoteLoader;
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography } = antd;
const { useState } = React;
const { Title } = Typography;

const initData = &#96;<h2>欢迎使用 CKEditor 5</h2><p>这是一个功能强大的富文本编辑器，支持：</p><ul>  <li><strong>文本格式</strong>：加粗、斜体、下划线、删除线等</li>  <li><strong>段落</strong>：标题、引用、代码块等</li>  <li><strong>列表</strong>：有序列表、无序列表、待办事项</li>  <li><strong>图片</strong>：上传、调整大小、设置样式</li>  <li><strong>表格</strong>：插入和编辑表格</li>  <li><strong>链接</strong>：插入和管理链接</li>  <li><strong>更多</strong>：水平线、分页符、特殊字符等</li></ul><p>尝试编辑上面的内容，体验各种编辑功能！</p>&#96;;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <Flex vertical gap={16}>
      <Form data={{ title: '文章标题', content: initData }}>
        <FormInfo column={1} list={[<Input name="title" label="标题" rule="REQ" />, <CKEditor name="content" label="内容" />]} />
      </Form>
    </Flex>
  );
});

render(<BaseExample />);

```

### API

### CKEditor

经 `createWithRemoteLoader` 包装，用于 `components-core:FormInfo` 表单场景。作为表单项使用时属性与 `CKEditor.Field` 一致（如 `name`、`label`、`value`、`onChange`、`isMarkdown`、`config` 等），由 `useDecorator` 注入受控逻辑。

### CKEditor.Field

富文本 / Markdown 编辑器本体。

#### 属性说明

| 属性名        | 说明                                                                                                                                                                                 | 类型     | 默认值                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------- |
| className     | 外层容器类名                                                                                                                                                                         | string   | -                                           |
| style         | 外层容器样式；内部会合并 `--ck-toolbar-dropdown-max-width`                                                                                                                           | object   | -                                           |
| isMarkdown    | 是否 Markdown 模式。为 `true` 时不加载 3D、视频、交互组件、图表、表单插件，并从工具栏移除 `model3dUpload`、`videoUpload`、`insertLiveComponent`、`insertEchart`、`insertFormCreator` | boolean  | false                                       |
| config        | CKEditor 5 配置，与内置 `defaultConfig` 深合并                                                                                                                                       | object   | 见下方 config                               |
| plugins       | 追加的 CKEditor 插件类                                                                                                                                                               | array    | []                                          |
| locale        | 界面语言，`zh-CN` 或 `en` 等；未传时使用 `@kne/global-context` 的 `locale`                                                                                                           | string   | 上下文 locale                               |
| uploadAdapter | 图片上传与粘贴转存；富文本下亦作为 `modelUpload` / `videoUpload` 的默认合并源                                                                                                        | object   | `preset.apis.file` 的 `upload`、`uploadUrl` |
| liveComponent | **兼容简写**。与 `config.liveComponent` 合并；推荐直接写在 `config.liveComponent`（见下表）                                                                                          | object   | `{}`                                        |
| formCreator   | **兼容简写**。与 `config.formCreator` 合并；推荐直接写在 `config.formCreator`（见下表）                                                                                              | object   | `{}`                                        |
| model3d       | 3D 模型预览扩展参数，与 `config.model3d` 合并，见下表                                                                                                                                | object   | 见 `defaultConfig.model3d`                  |
| value         | 编辑器 HTML / Markdown 内容                                                                                                                                                          | string   | -                                           |
| onChange      | 内容变化回调 `(html: string) => void`                                                                                                                                                | function | -                                           |

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

| 配置项             | 说明                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| style              | Style 插件配置。传入 `style.definitions` 时会**整体替换**默认样式列表（非按索引合并）                                                                       | object | 见 `defaultConfig.style` |
| table              | 表格内容工具栏                                                                                                                                              |
| htmlSupport        | GeneralHtmlSupport 白名单；已允许 `model-viewer`、`figure.ck-video`、`figure.ck-echart`、`section.ck-live-component`、`section.ck-form-creator` 等          |
| uploadAdapter      | 图片上传：`upload(file)` 返回 URL 或 `{ code, data, msg }`；`uploadUrl` 粘贴外链转存；`base64MaxWidth` / `base64MaxHeight` 控制无 `upload` 时的 base64 缩放 |
| modelUpload        | **仅富文本**。3D 上传，默认合并 `uploadAdapter`；仅 `.glb`；无 `upload` 时 base64 嵌入                                                                      |
| videoUpload        | **仅富文本**。视频上传，默认合并 `uploadAdapter`；支持 mp4、webm、ogg、mov 等；无 `upload` 时 base64 嵌入                                                   |
| model3d.toolbar    | **仅富文本**。3D 浮动工具栏，默认 `model3dStyle:*`、`resizeModel3d:*`、`resizeModel3dHeight:*`，可拖拽缩放                                                  |
| mediaVideo.toolbar | **仅富文本**。视频浮动工具栏，默认 `mediaVideoStyle:*`、`resizeMediaVideo:*`、`resizeMediaVideoHeight:*`                                                    |
| liveComponent      | **仅富文本**。交互组件渲染/编辑参数，见下表                                                                                                                 |
| formCreator        | **仅富文本**。FormCreator 表单渲染/编辑参数，见下表                                                                                                         |
| echart.toolbar     | **仅富文本**。图表浮动工具栏，默认 `echartStyle:*`、`resizeEchart:*`、`resizeEchartHeight:*`，可拖拽缩放                                                    |
| model3d            | **仅富文本**。3D 模型 `model-viewer` 参数，见下表                                                                                                           |
| templateVariable   | **仅富文本**。邮件模版变量：变量列表与 lodash `templateSettings` 同名字段（`interpolate` / `escape`），见下表                                               |
| templateCondition  | **仅富文本**。邮件模版行内条件：算子白名单与可选 else，见下表                                                                                               |

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

#### 邮件模版条件（TemplateConditionPlugin）

- 工具栏：`insertTemplateCondition`（需自行加入 `config.toolbar.items`；变量列表来自 `templateVariable.variables` 或 `templateCondition.variables`）
- 编辑态：默认行内**单条件**壳；选中后浮动条可「编辑条件」（弹窗内可添加多条扁平且/或谓词）、「否则」、以及「块级」
- `getData` / `onChange`：条件最外层保留 `data-template-condition-*`（含 `clauses` JSON 与 `joiner`；块级为 `data-template-condition-layout="block"`），内部是 lodash evaluate，多条件如 `<% if ((userName == 'VIP') && (couponCode != null && couponCode !== '')) { %>…<% } %>`
- 算子白名单：`truthy` / `falsy` / `filled` / `empty` / `eq` / `neq`；扁平多条件仅支持全 `&&` 或全 `||`（无括号分组、无 else-if）；块级 then/else 可再套条件 widget（`allowNesting`）；行内不可嵌套 widget
- 回填：仅识别本插件规范形态的 `<% if %>`；手写混合 `&&`/`||` 或不规范表达式不 widget 化

#### templateCondition 参数（config.templateCondition）

| 字段         | 说明                                                            | 类型    | 默认值                           |
| ------------ | --------------------------------------------------------------- | ------- | -------------------------------- |
| variables    | 可选；不传则复用 `templateVariable.variables` 作 subject 白名单 | array   | 同 templateVariable              |
| operators    | 允许的算子列表                                                  | array   | `['truthy','falsy','filled','empty','eq','neq']` |
| allowElse    | 是否允许否则分支                                                | boolean | `true`                           |
| allowNesting | 块级条件 then/else 内是否允许再套条件；行内条件始终不可嵌套 | boolean | `true`                           |
| maxClauses   | 「编辑条件」弹窗最多可添加的谓词条数                            | number  | `5`                              |
| display      | 新建条件的默认展示；实例可用浮动条在行内 / 块级间切换 | string  | `'inline'`                       |

#### 模版校验工具（包导出）

| 名称                         | 说明                                                     |
| ---------------------------- | -------------------------------------------------------- |
| findUnbalancedTemplateTags   | 扫描 `<%` / `%>` 是否配对，返回错误或 null               |
| validateTemplateHtml         | 配对校验；可传入 `template`（如 `_.template`）做 dry-run |
| unwrapTemplateConditionSpans | 将编辑器中间态 condition span 转为 lodash evaluate       |
| buildConditionExpression     | 由 subject/operator/value 生成条件表达式                 |
| findConditionMatches         | 在文本中找出规范形态的 if/else 匹配                      |

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

| 字段        | 说明                                                                                                               | 类型             | 默认值  |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------------- | ------- |
| height      | 编辑区/预览区挂载容器最小高度                                                                                      | number \| string | `240`   |
| preview     | 传给 `SchemaRenderer` 的预览模式                                                                                   | boolean          | `true`  |
| showActions | 是否显示 Schema 底部操作按钮                                                                                       | boolean          | `false` |
| formProps   | **对象**。透传给文档内**每一个** FormCreator `SchemaRenderer` 内部 `Form`（如 `onSubmit`、`data`）；Content 侧常用 | object           | `{}`    |
| emptyText   | Schema 无可渲染内容时的占位文案                                                                                    | string           | 见 i18n |
| editor      | 透传给弹窗内 `FormCreatorField` 的属性（如 `apis`、`extraToolbar` 等）                                             | object           | `{}`    |

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

| 名称                            | 说明                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| formatToolbarDropdownMaxWidth   | 将数字或字符串格式化为 CSS 宽度值                              |
| getToolbarDropdownMaxWidthStyle | 生成含 `--ck-toolbar-dropdown-max-width` 的 style 对象         |
| useToolbarDropdownMaxWidth      | 对容器 ref 做 ResizeObserver，返回当前可用最大宽度             |
| EMAIL_STYLE_PRESETS             | 邮件样式的**唯一声明来源**，下面几项均由它派生                 |
| EMAIL_STYLE_DEFINITIONS         | 邮件模版 Style 预设，可直接赋给 `config.style.definitions`     |
| EMAIL_TOOLBAR_ITEMS             | 邮件模版推荐工具栏（含模版变量、模版条件与 `style`）           |
| EMAIL_STYLE_CSS                 | 无前缀邮件样式 CSS，可注入邮件模版外壳                         |
| toEmailHtml                     | 兜底工具：给 class 版 HTML 补 inline style（正常流程无需调用） |
| findUnbalancedTemplateTags      | 模版 `<%`/`%>` 配对检查                                        |
| validateTemplateHtml            | 模版 HTML 校验（配对 + 可选 lodash.template dry-run）          |

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

| 元素         | 段落下拉   | 可选样式                                                                   |
| ------------ | ---------- | -------------------------------------------------------------------------- |
| `p`          | 正文       | 正文、导语、补充说明、引用段、提示条、警示条、成功条、主按钮、次按钮、页脚 |
| `h2`         | 标题 1     | 邮件主标题、章节标题（色条）、横幅标题（深底）                             |
| `h3`         | 标题 2     | 小节标题、小节标题（底线）、小节标题（品牌色）                             |
| `h4`         | 标题 3     | 小标题、标签标题                                                           |
| `blockquote` | 引用按钮   | 邮件引用块                                                                 |
| `ul` / `ol`  | 列表按钮   | 紧凑列表、宽松列表                                                         |
| `hr`         | 分割线按钮 | 细分割线、粗分割线、虚线分割线、空白间距                                   |
| `figure`     | 表格按钮   | 邮件表格                                                                   |

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

| 环节                     | 内容形态                  | 说明                                             |
| ------------------------ | ------------------------- | ------------------------------------------------ |
| 编辑器 model             | 只有 class                | 保持干净，「样式」下拉可随时切换                 |
| 编辑态显示               | class + 注入的 scoped CSS | CSS 由 `EMAIL_STYLE_PRESETS` 派生后运行时注入    |
| `onChange` / `getData()` | class + inline style      | `editor.data.get()` 出口按同一份声明派生 `style` |
| `CKEditor.Content` 预览  | 同上                      | 内容自带 inline style，无需额外样式表            |
| 发信                     | 同上                      | 直接投递，无转换步骤                             |

回填是幂等的：`htmlSupport` 未放开 `p`/`h2` 等的 `style`，内容回到编辑器时 inline style 被丢弃、class 保留，显示仍由 scoped CSS 负责，下次输出再重新派生。因此同一份内容反复编辑保存不会叠加或漂移。

样式声明只存在于 `emailStyles.js` 的 `EMAIL_STYLE_PRESETS`，下拉选项、编辑态 CSS、发信 inline style 全部由它派生，`ckeditor.scss` 里不再有邮件样式，不存在需要人工同步的副本。改样式只改一处。

#### toEmailHtml(html, options)

正常流程用不到——只在手上是 class 版 HTML（例如从别处导入的内容）时用它补样式。

| 参数            | 说明                                                     | 类型     | 默认值            |
| --------------- | -------------------------------------------------------- | -------- | ----------------- |
| html            | 富文本内容                                               | string   | -                 |
| options.css     | 要 inline 的 CSS                                         | string   | `EMAIL_STYLE_CSS` |
| options.inliner | 自定义 inline 实现 `(html, css) => string`，替换内置逻辑 | function | -                 |

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

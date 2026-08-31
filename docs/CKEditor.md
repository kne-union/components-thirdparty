# CKEditor

### 概述

基于 CKEditor 5 的富文本编辑器封装，面向表单与内容生产场景，提供完整工具栏、图片/表格编辑、Markdown 输出，以及 3D 模型、视频、交互组件等富媒体能力。

### 主要特性

- **双模式**：富文本（HTML）与 Markdown（`isMarkdown`），Markdown 下自动剔除 3D、视频、交互组件相关工具与配置
- **富媒体插件**：GLB 3D 模型（`@google/model-viewer`）、HTML5 视频、LiveComponent（`LiveComponentEditor` 编辑 + `LiveComponentView` 渲染）
- **统一上传**：图片、3D、视频共用 `uploadAdapter` / `preset.apis.file`，未配置 `upload` 时回退 base64
- **预览增强**：`CKEditor.Content` 同步视频尺寸、挂载交互组件、3D 全屏预览（含移动端 overlay）
- **工具栏适配**：`CKEditor.Field` 按容器宽度设置 `--ck-toolbar-dropdown-max-width`，避免「显示更多」下拉过宽

### 使用场景

- 文章/公告/知识库等内容编辑与预览
- 需要嵌入 3D 产品模型或说明视频的营销/帮助文档
- 需要可配置、可复用的交互区块（LiveComponent）的运营页面
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
- 通过 config.toolbar 分层：简单（文字样式与基础排版）、标准（日常最常用）、全部（与默认工具栏一致）
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
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
  const [content, setContent] = useState(
    &#96;<h2>自定义配置示例</h2>\n<p>切换下方档位，工具栏按钮数量会明显变化。</p>&#96;
  );

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
          <Alert
            type="info"
            showIcon
            message={&#96;当前：${preset.label}（${toolbarItemCount} 个工具按钮）&#96;}
            description={preset.hint}
          />
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
- 弹窗使用 LiveComponentEditor 编辑，以 section 特殊标签插入，LiveComponentView 渲染
- _CKEditor(@components/CKEditor),antd(antd),lodash(lodash),dayjs(dayjs)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;

const initData = &#96;<h2>
    交互组件示例
</h2>
<section class="component-box ck-live-component" data-live-component="xLLDIzn06FuhOIvUijcrfn9s5rIq259eBRqqFMGdipPrCXCc4ra90QKKjB2iuBOBKYZsWowLgWUHiXV_p2Rk_elEn4rCx6eflJgNvFru7kPvysGc090IZWW7EgWkKUOiaoRLv4lT8DKvmYrj2QEMie4Ojw69bJNJhGMp3q9HLiJAC0gtEKQrm6NKzRGa21LiUxmMlBXgBRHhJHjXozEMYUjpXPWEgXb0FWoWOBE1i0YZx_lHNbiac8zb-UdY4sLbyN6fKfgjL0nGhgjt4AyYZ636R27NPDmHEdFyupVzSQzVu1S1TRbDYLVOjbn10jDdudTRySSJWPrHDqpi8zq0MSe0eJeTDUvkHTtZ0YfB2TGrw6Lujww5LmYkDsZh4QE-gpGmXUkfI5jyI8QylCJexTde_ClVLOdExOFnjvy6oBQN9cvH95IVzIu_ztA8D74xOdS_tZsAsaUNtKzvN27z3xDuXbfyZY6pE0OBUP3PYTxS9E9EPtHnAbrpHIYvRrXOMn5sdVXOwD_fZGxxyVlJk7qiU2Raqj6IzTxOzyR-FsF_OSFhm_Qrxt6xkIbaGYIb2vd9iVimFNMB0rpr6uxDvttEAQd7dRtXu6krFBqw3RvW4eZmf27gV8ZFTtBmGdMoqtAsLNb9t8YAbmXGGN8Z03q0oPybNopKD7tCdyinYNjd-El7S30ONXp6soUYds-wCkjnPfCr48Ogy21r4s3ABSgGEYubOZnU2LA6zAmKXhy1">
    &nbsp;
</section>
<p>
    点击工具栏「交互组件」按钮，在弹窗中使用 LiveComponentEditor 编写组件，确认后以特殊标签插入文档。
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
            <Title level={4}>交互组件</Title>
            <Paragraph type="secondary">
              插入后保存为 section 标签；编辑区与 CKEditor.Content 预览均通过 LiveComponentView 渲染。双击已插入组件可再次编辑。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{ message: messageApi }}
            liveComponent={{
              height: 400,
              libs: { lodash, dayjs },
              editor: { height: 520, libs: { lodash, dayjs } }
            }}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content
            liveComponent={{
              height: 400,
              libs: { lodash, dayjs }
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

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| className | 外层容器类名 | string | - |
| style | 外层容器样式；内部会合并 `--ck-toolbar-dropdown-max-width` | object | - |
| isMarkdown | 是否 Markdown 模式。为 `true` 时不加载 3D、视频、交互组件、图表插件，并从工具栏移除 `model3dUpload`、`videoUpload`、`insertLiveComponent`、`insertEchart` | boolean | false |
| config | CKEditor 5 配置，与内置 `defaultConfig` 深合并 | object | 见下方 config |
| plugins | 追加的 CKEditor 插件类 | array | [] |
| locale | 界面语言，`zh-CN` 或 `en` 等；未传时使用 `@kne/global-context` 的 `locale` | string | 上下文 locale |
| uploadAdapter | 图片上传与粘贴转存；富文本下亦作为 `modelUpload` / `videoUpload` 的默认合并源 | object | `preset.apis.file` 的 `upload`、`uploadUrl` |
| liveComponent | 交互组件预览/编辑扩展参数，与 `config.liveComponent` 合并，见下表 | object | `{}` |
| model3d | 3D 模型预览扩展参数，与 `config.model3d` 合并，见下表 | object | 见 `defaultConfig.model3d` |
| value | 编辑器 HTML / Markdown 内容 | string | - |
| onChange | 内容变化回调 `(html: string) => void` | function | - |

#### 工具栏宽度

容器通过 `useToolbarDropdownMaxWidth` 监听宽度，将 CSS 变量 `--ck-toolbar-dropdown-max-width` 写入外层 `style`，限制主工具栏「显示更多」下拉的最大宽度。也可在业务侧使用包内导出的 `useToolbarDropdownMaxWidth`、`getToolbarDropdownMaxWidthStyle`、`formatToolbarDropdownMaxWidth` 自定义包裹层。

### CKEditor.Content

只读内容预览，接收与编辑器一致的 HTML 字符串。

#### 属性说明

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| className | 预览根节点类名（叠加 `ck ck-content`） | string | - |
| children | HTML 字符串，经 `dangerouslySetInnerHTML` 渲染 | string | - |
| liveComponent | 传给 `LiveComponentView` 的扩展参数，需与编辑区 `Field` 侧配置一致 | object | - |
| model3d | 传给预览区 `model-viewer` 的属性与全屏等行为配置 | object | - |

#### 预览行为

- **视频**：对 `figure.ck-video` 同步内联宽高到内部 `video`
- **3D 模型**：加载 `model-viewer` 后同步布局；支持全屏预览（桌面全屏 API，移动端固定层 overlay）
- **交互组件**：对 `section.ck-live-component[data-live-component]` 挂载 `LiveComponentView`；卸载时清理
- **图表**：对 `figure.ck-echart[data-echart-option]` 挂载 `@components/Echart` 渲染

### config 配置说明

与 CKEditor 5 一致项以外，本组件扩展如下（`merge` 进编辑器 `config`）：

| 配置项 | 说明 |
| --- | --- |
| toolbar | 主工具栏。传入 `toolbar.items` 时会**整体替换**默认项（非按索引合并）。富文本默认含 `imageUpload`、`model3dUpload`、`videoUpload`、`insertLiveComponent`、`insertEchart` 等 |
| image | 图片浮动工具栏 |
| table | 表格内容工具栏 |
| htmlSupport | GeneralHtmlSupport 白名单；已允许 `model-viewer`、`figure.ck-video`、`figure.ck-echart`、`section.ck-live-component` 等 |
| uploadAdapter | 图片上传：`upload(file)` 返回 URL 或 `{ code, data, msg }`；`uploadUrl` 粘贴外链转存；`base64MaxWidth` / `base64MaxHeight` 控制无 `upload` 时的 base64 缩放 |
| modelUpload | **仅富文本**。3D 上传，默认合并 `uploadAdapter`；仅 `.glb`；无 `upload` 时 base64 嵌入 |
| videoUpload | **仅富文本**。视频上传，默认合并 `uploadAdapter`；支持 mp4、webm、ogg、mov 等；无 `upload` 时 base64 嵌入 |
| model3d.toolbar | **仅富文本**。3D 浮动工具栏，默认 `model3dStyle:*`、`resizeModel3d:*`、`resizeModel3dHeight:*`，可拖拽缩放 |
| mediaVideo.toolbar | **仅富文本**。视频浮动工具栏，默认 `mediaVideoStyle:*`、`resizeMediaVideo:*`、`resizeMediaVideoHeight:*` |
| liveComponent | **仅富文本**。交互组件渲染/编辑参数，见下表 |
| echart.toolbar | **仅富文本**。图表浮动工具栏，默认 `echartStyle:*`、`resizeEchart:*`、`resizeEchartHeight:*`，可拖拽缩放 |
| model3d | **仅富文本**。3D 模型 `model-viewer` 参数，见下表 |

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
- 存储：`<section class="component-box ck-live-component" data-live-component="PlantUML编码配置">`
- 编辑区与 `CKEditor.Content` 均通过 `LiveComponentView` 渲染；双击已插入块可再次打开编辑

#### ECharts 图表（EchartPlugin）

- 工具栏：`insertEchart`，弹窗内嵌 `JSONEditor` 编辑 ECharts `option` JSON
- 存储：`<figure class="ck-echart"><div class="ck-echart-inner" data-echart-option="..."></div></figure>`
- 编辑区与 `CKEditor.Content` 均通过 `@components/Echart` 渲染；选中后可拖拽调整宽高，双击可再次编辑配置

#### liveComponent 参数（Field / Content / config.liveComponent）

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| height | 编辑区/预览区挂载容器最小高度 | number \| string |
| libs | 传给 `LiveComponentView` 的运行库（如 `{ lodash, dayjs }`） | object |
| props | 传给 `LiveComponentView` 的属性覆盖 | object |
| editor.height | `LiveComponentEditor` 弹窗高度 | number |
| editor.libs | 传给 `LiveComponentEditor` 的 `libs` | object |

`CKEditor.Field` 与 `CKEditor.Content` 应传入**相同**的 `liveComponent`，保证编辑预览与阅读预览一致。

#### model3d 参数（Field / Content / config.model3d）

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| height | 预览默认高度（内容未内联高度时） | string |
| viewer | `model-viewer` 属性，与 `ModelView` 对齐：`autoRotate`、`cameraControls`、`poster`、`loading`、`exposure` 等 | object |
| preview.enableFullscreen | `Content` 预览是否显示全屏按钮 | boolean | `true` |
| toolbar | 编辑器内浮动工具栏项（已有） | array |

### Markdown 模式说明

`isMarkdown={true}` 时：

- 追加 CKEditor `Markdown` 插件，输出 Markdown 源码
- 不注册 `Model3dPlugin`、`VideoPlugin`、`LiveComponentPlugin`
- 从 `config` 中剥离 `model3d`、`modelUpload`、`videoUpload`、`mediaVideo`
- 自定义 `plugins` 传入上述插件时会被过滤

预览 Markdown 请配合 `@kne/markdown-components-render`（见 `doc/markdown.js`）。

### 包导出工具函数

| 名称 | 说明 |
| --- | --- |
| formatToolbarDropdownMaxWidth | 将数字或字符串格式化为 CSS 宽度值 |
| getToolbarDropdownMaxWidthStyle | 生成含 `--ck-toolbar-dropdown-max-width` 的 style 对象 |
| useToolbarDropdownMaxWidth | 对容器 ref 做 ResizeObserver，返回当前可用最大宽度 |

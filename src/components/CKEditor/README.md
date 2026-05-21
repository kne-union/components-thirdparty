# CKEditor

### 概述

基于 CKEditor 5 的功能强大的富文本编辑器组件，支持丰富的文本编辑功能、图片上传、表格编辑、Markdown 模式等。


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
- 展示如何通过 config 属性自定义编辑器的工具栏和功能配置
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Radio, Divider } = antd;
const { useState } = React;
const { Title } = Typography;

const CustomConfigExample = () => {
  const [toolbarType, setToolbarType] = useState('full');
  const [content, setContent] = useState(&#96;<h2>自定义配置示例</h2>\n<p>根据选择的工具栏类型，显示不同的编辑功能。</p>&#96;);

  const toolbarConfigs = {
    simple: {
      toolbar: {
        items: ['bold', 'italic', 'underline', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
      }
    },
    standard: {
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
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'link',
          'blockQuote',
          'codeBlock'
        ]
      }
    },
    full: {
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
        ]
      }
    }
  };

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>自定义工具栏配置</Title>
          <Radio.Group value={toolbarType} onChange={(e) => setToolbarType(e.target.value)} buttonStyle="solid">
            <Radio.Button value="simple">简单</Radio.Button>
            <Radio.Button value="standard">标准</Radio.Button>
            <Radio.Button value="full">完整</Radio.Button>
          </Radio.Group>
          <CKEditor.Field key={toolbarType} config={toolbarConfigs[toolbarType]} value={content} onChange={setContent} />
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
- _CKEditor(@components/CKEditor),antd(antd)

```jsx
const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;

const initData = &#96;<h2>3D模型上传示例</h2><p>点击工具栏中的<span style="color: #1677ff;">3D模型按钮</span>，选择 <strong>.glb</strong> 文件即可插入编辑器。</p><p>未配置上传接口时，模型会以 base64 嵌入内容；配置 <code>modelUpload.upload</code> 或 <code>uploadAdapter.upload</code> 后走服务端上传。</p>&#96;;

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
            <Paragraph type="secondary">
              点击工具栏中的 3D模型 按钮上传模型文件，编辑器与预览均使用 @google/model-viewer 渲染
            </Paragraph>
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

|属性名|说明|类型|默认值|
|  ---  | --- | --- | --- |
|className|自定义类名|string|-
|isMarkdown|是否启用 Markdown 模式（不含 3D 模型上传与 `Model3dPlugin`）|boolean|false
|config|编辑器配置对象，可自定义工具栏和插件配置|object|详见下方配置
|plugins|自定义插件数组|array|[]
|value|编辑器内容|string|-
|onChange|内容变化回调函数|function|-
|style|外层容器样式|object|-

`CKEditor.Field` 会根据外层容器宽度自动设置 CSS 变量 `--ck-toolbar-dropdown-max-width`，用于限制工具栏「显示更多」下拉的最大宽度。

### config 配置说明
- `toolbar`: 工具栏配置，包含各种编辑功能按钮
- `image`: 图片编辑工具栏配置
- `table`: 表格编辑工具栏配置
- `htmlSupport`: HTML支持配置，允许的标签和属性
- `uploadAdapter`: 图片上传配置，`upload` 上传文件，`uploadUrl` 粘贴图片转存
- `modelUpload`: 3D 模型上传配置（仅支持 `.glb`，**仅富文本模式**），默认合并 `uploadAdapter`；`upload` 与图片相同，返回 `{ code, data, msg }`，`data` 为模型 URL。未配置 `upload` 时模型文件转为 base64 嵌入
- `model3d.toolbar`: 选中 3D 模型时显示的工具栏（**仅富文本模式**），支持 `model3dStyle:*` 对齐/环绕样式与 `resizeModel3d:*` 尺寸（25%/50%/75%/原始），可拖拽边角调整宽度

const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Switch, Divider, Tag, message } = antd;
const { useState } = React;
const { Title } = Typography;

// 扩展组件：type 与 components 的键名对应
const UserCard = ({ name, title, onClick }) => (
  <Card size="small" title={name} extra={<a onClick={onClick}>联系</a>} style={{ width: 280 }}>
    <Tag color="blue">{title}</Tag>
  </Card>
);

const componentsData = `
## 组件渲染 🧩

Markdown 模式下 \`\`\`yml 围栏里的 md-components 会在编辑器内实时渲染，块级点右上角按钮、行内点组件后的编辑图标即可编辑；工具栏「组件」可插入。

\`\`\`yml
md-components:
  type: Alert
  props:
    type: success
    showIcon: true
    message: 默认支持 antd 基础组件
\`\`\`

\`\`\`yml
md-components:
  type: RemoteLoader
  props:
    module: components-core:Content
    list:
      - label: 姓名
        content: 张三
      - label: 职位
        content: 前端工程师
\`\`\`

\`\`\`yml
md-components:
  type: UserCard
  props:
    name: 李四
    title: 产品经理
    onClick: $handleContact
\`\`\`

行内组件：\`md-components:Button{"type":"link","children":"行内按钮","onClick":"$handleContact"}\`
`;

const initData =
  componentsData +
  `
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
`;

const MarkdownExample = () => {
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [content, setContent] = useState(initData);
  // 编辑器与预览共用：与默认组件合并，同名覆盖
  const markdownOptions = {
    components: { UserCard },
    variables: { handleContact: () => message.info('联系一下') }
  };
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
          <CKEditor.Field
            key={`editor-${isMarkdown}`}
            isMarkdown={isMarkdown}
            markdownOptions={markdownOptions}
            value={content}
            onChange={setContent}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content isMarkdown={isMarkdown} markdownOptions={markdownOptions}>
            {content}
          </CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<MarkdownExample />);

const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Switch, Divider } = antd;
const { useState } = React;
const { Title } = Typography;
const { default: MarkdownRender } = _MarkdownRender;

const initData = `
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
          <CKEditor.Field key={`editor-${isMarkdown}`} isMarkdown={isMarkdown} value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          {isMarkdown ? <MarkdownRender>{content}</MarkdownRender> : <CKEditor.Content>{content}</CKEditor.Content>}
        </Space>
      </Card>
    </Flex>
  );
};

render(<MarkdownExample />);

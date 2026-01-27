const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title } = Typography;

const initData = `<h2>欢迎使用 CKEditor 5</h2><p>这是一个功能强大的富文本编辑器，支持：</p><ul>  <li><strong>文本格式</strong>：加粗、斜体、下划线、删除线等</li>  <li><strong>段落</strong>：标题、引用、代码块等</li>  <li><strong>列表</strong>：有序列表、无序列表、待办事项</li>  <li><strong>图片</strong>：上传、调整大小、设置样式</li>  <li><strong>表格</strong>：插入和编辑表格</li>  <li><strong>链接</strong>：插入和管理链接</li>  <li><strong>更多</strong>：水平线、分页符、特殊字符等</li></ul><p>尝试编辑上面的内容，体验各种编辑功能！</p>`;

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

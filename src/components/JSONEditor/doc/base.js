const { default: JSONEditor } = _JSONEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title } = Typography;

const initData = JSON.stringify(
  {
    name: '张三',
    department: '技术部',
    position: '高级前端工程师',
    skills: ['React', 'TypeScript', 'Node.js'],
    contact: {
      email: 'zhangsan@example.com',
      phone: '138-0000-0001'
    }
  },
  null,
  2
);

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>基础JSON编辑器</Title>
          <JSONEditor.Field value={content} onChange={setContent} />
          <Divider orientation="left">数据预览</Divider>
          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <pre style={{ margin: 0 }}>{content}</pre>
          </div>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

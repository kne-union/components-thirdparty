const { createWithRemoteLoader } = remoteLoader;
const { default: JSONEditor } = _JSONEditor;
const { Flex, Card, Space, Typography } = antd;
const { Title } = Typography;

const initContent = JSON.stringify(
  {
    projectName: '智能办公平台',
    version: '2.1.0',
    features: ['权限管理', '数据看板', '消息通知'],
    config: {
      theme: 'dark',
      language: 'zh-CN',
      pageSize: 20
    }
  },
  null,
  2
);

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>在Form中使用JSONEditor</Title>
          <Form data={{ name: '项目配置', content: initContent }}>
            <FormInfo
              column={1}
              list={[
                <Input name="name" label="配置名称" rule="REQ" />,
                <JSONEditor name="content" label="配置内容" />
              ]}
            />
          </Form>
        </Space>
      </Card>
    </Flex>
  );
});

render(<BaseExample />);

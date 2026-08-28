const { jsonSchemaToFormCreatorSchema } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { Flex, Typography, Button, message } = antd;
const { useMemo, useState } = React;

const sourceSchema = {
  title: '演示转换',
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', title: '姓名' },
    tags: { type: 'array', title: '标签', items: { type: 'string' } },
    profile: {
      type: 'object',
      title: '档案',
      properties: {
        city: { type: 'string', title: '城市' }
      }
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  const creatorSchema = useMemo(() => jsonSchemaToFormCreatorSchema(sourceSchema, { column: 2, gap: 24 }), []);
  const [copied, setCopied] = useState(false);

  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        仅调用 <Typography.Text code>jsonSchemaToFormCreatorSchema</Typography.Text>
        ，得到可交给 form-creator <Typography.Text code>SchemaRenderer</Typography.Text> 的 Schema。
      </Typography.Paragraph>
      <Flex gap={8}>
        <Button
          type="primary"
          onClick={async () => {
            const text = JSON.stringify(creatorSchema, null, 2);
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              message.success('已复制转换结果');
            } catch (e) {
              console.log(text);
              message.info('已输出到控制台');
            }
          }}
        >
          复制转换结果
        </Button>
        {copied ? <Typography.Text type="success">已复制</Typography.Text> : null}
      </Flex>
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema（输入）</Typography.Text>
          <JsonView data={sourceSchema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>form-creator Schema（输出）</Typography.Text>
          <JsonView data={creatorSchema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

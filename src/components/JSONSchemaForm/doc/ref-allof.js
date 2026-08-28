const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const schema = {
  title: '收货信息',
  type: 'object',
  required: ['receiver'],
  properties: {
    receiver: { $ref: '#/$defs/personName' },
    phone: { $ref: '#/$defs/mobile' },
    region: { $ref: '#/definitions/region' }
  },
  allOf: [
    {
      properties: {
        city: { type: 'string', title: '城市' }
      },
      required: ['city']
    },
    {
      properties: {
        detail: { type: 'string', title: '详细地址', maxLength: 120 }
      }
    }
  ],
  $defs: {
    personName: { type: 'string', title: '收货人' },
    mobile: { type: 'string', title: '联系电话', format: 'tel' }
  },
  definitions: {
    region: {
      type: 'string',
      title: '所在地区',
      enum: ['华东', '华北', '华南', '西南']
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        同文档 <Typography.Text code>$ref</Typography.Text>（$defs / definitions）会内联展开；
        <Typography.Text code>allOf</Typography.Text> 会合并属性与必填后再生成表单。
      </Typography.Paragraph>
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema</Typography.Text>
          <JsonView data={schema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>表单预览</Typography.Text>
          <JSONSchemaForm
            schema={schema}
            onSubmit={data => {
              console.log('ref/allOf submit', data);
              message.success('提交成功');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

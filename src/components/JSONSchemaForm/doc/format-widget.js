const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const schema = {
  title: '联系与日程',
  type: 'object',
  required: ['email', 'mobile'],
  properties: {
    email: { type: 'string', title: '工作邮箱', format: 'email' },
    mobile: { type: 'string', title: '手机号', format: 'tel' },
    birthday: { type: 'string', title: '出生日期', format: 'date' },
    interviewAt: {
      type: 'string',
      title: '面试时间',
      format: 'date-time'
    },
    website: { type: 'string', title: '个人主页', format: 'uri' },
    score: {
      type: 'integer',
      title: '自评分数',
      minimum: 1,
      maximum: 10,
      'ui:widget': 'InputNumber'
    },
    remark: {
      type: 'string',
      title: '备注',
      maxLength: 200,
      'x-widget': 'TextArea',
      'x-props': { placeholder: '补充说明（x-widget=TextArea）' }
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        format 映射规则/组件；可用 <Typography.Text code>x-widget</Typography.Text> /{' '}
        <Typography.Text code>ui:widget</Typography.Text> 覆盖字段类型，
        <Typography.Text code>x-props</Typography.Text> 透传组件 props。
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
            column={2}
            onSubmit={data => {
              console.log('format submit', data);
              message.success('校验通过并已提交');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

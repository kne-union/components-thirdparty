const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const schema = {
  title: '客户开户',
  type: 'object',
  required: ['customerType'],
  properties: {
    customerType: {
      title: '客户类型',
      description: 'oneOf：只能选择一种客户类型',
      oneOf: [
        {
          title: '企业客户',
          type: 'object',
          required: ['companyName'],
          properties: {
            companyName: { type: 'string', title: '公司名称' },
            creditCode: { type: 'string', title: '统一社会信用代码' },
            contact: { type: 'string', title: '联系人', format: 'tel' }
          }
        },
        {
          title: '个人客户',
          type: 'object',
          required: ['idName'],
          properties: {
            idName: { type: 'string', title: '姓名' },
            idNo: { type: 'string', title: '证件号' }
          }
        }
      ]
    },
    tags: {
      title: '附加服务',
      description: 'anyOf：可同时选择多项服务包',
      anyOf: [
        {
          title: '发票服务',
          type: 'object',
          properties: {
            invoiceTitle: { type: 'string', title: '发票抬头' }
          }
        },
        {
          title: '邮寄服务',
          type: 'object',
          properties: {
            address: { type: 'string', title: '邮寄地址' }
          }
        }
      ]
    }
  },
  allOf: [
    {
      properties: {
        agreement: {
          type: 'boolean',
          title: '同意开户协议',
          default: false
        }
      },
      required: ['agreement']
    },
    {
      properties: {
        openDate: { type: 'string', title: '期望开户日期', format: 'date' },
        accountManager: { type: 'string', title: '客户经理工号' },
        remark: {
          type: 'string',
          title: '备注',
          maxLength: 200,
          'x-textarea': true
        }
      }
    }
  ]
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        <Typography.Text code>oneOf</Typography.Text> → choice 单选；{' '}
        <Typography.Text code>anyOf</Typography.Text> → choice 多选；{' '}
        <Typography.Text code>allOf</Typography.Text> 合并公共字段（协议、开户日期、备注等）到同一表单。
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
              console.log('choice submit', data);
              message.success('提交成功');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

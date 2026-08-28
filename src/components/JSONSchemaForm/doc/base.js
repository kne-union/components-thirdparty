const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const resumeSchema = {
  title: '个人简历',
  description: '请填写完整的求职简历信息',
  type: 'object',
  required: ['name', 'gender', 'phone'],
  properties: {
    name: { type: 'string', title: '姓名', default: '张三' },
    gender: { type: 'string', title: '性别', enum: ['男', '女'], default: '男' },
    phone: { type: 'string', title: '手机号', format: 'tel' },
    email: { type: 'string', title: '邮箱', format: 'email' },
    age: { type: 'integer', title: '年龄', minimum: 16, maximum: 65 },
    isPLA: { type: 'boolean', title: '是否党员', default: false },
    desc: {
      type: 'string',
      title: '个人简介',
      minLength: 0,
      maxLength: 500,
      'x-textarea': true
    },
    education: {
      type: 'array',
      title: '教育经历',
      minItems: 1,
      'x-addText': '添加教育经历',
      items: {
        type: 'object',
        required: ['schoolName'],
        properties: {
          schoolName: { type: 'string', title: '学校名称' },
          type: { type: 'string', title: '招生类型', enum: ['统招', '非统招'] },
          major: { type: 'string', title: '专业' },
          time: {
            type: 'object',
            title: '就读时间',
            properties: {
              startTime: { type: 'string', title: '开始时间', format: 'date' },
              endTime: { type: 'string', title: '结束时间', format: 'date' }
            }
          },
          description: { type: 'string', title: '在校表现', maxLength: 500 }
        }
      }
    },
    language: {
      type: 'array',
      title: '语言能力',
      items: { type: 'string' },
      'x-addText': '添加语言'
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex gap={16} align="flex-start" wrap="wrap">
      <Flex vertical gap={8} style={panelStyle}>
        <Typography.Text strong>JSON Schema</Typography.Text>
        <JsonView data={resumeSchema} theme="light" collapsedFrom={2} searchable={false} />
      </Flex>
      <Flex vertical gap={8} style={panelStyle}>
        <Typography.Text strong>表单预览</Typography.Text>
        <JSONSchemaForm
          schema={resumeSchema}
          column={2}
          gap={24}
          onSubmit={async data => {
            console.log('resume submit', data);
            message.success('简历已提交（详见控制台）');
          }}
        />
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

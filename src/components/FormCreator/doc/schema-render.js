const { SchemaRenderer, createBlock, createField } = _FormCreator;
const { default: JsonView } = _JsonView;
const { useState } = React;
const { Alert, Space, Typography } = antd;
const { Text } = Typography;

const demoSchema = {
  actions: {
    showSubmit: true,
    showReset: true,
    submitText: '提交报名',
    resetText: '清空'
  },
  blocks: [
    createBlock('formInfo', {
      title: '员工信息',
      subtitle: '传入 Schema，用 SchemaRenderer 直接渲染表单',
      column: 2,
      list: [
        createField({
          type: 'Input',
          name: 'name',
          label: '姓名',
          rule: 'REQ',
          props: { placeholder: '请输入姓名' }
        }),
        createField({
          type: 'Input',
          name: 'mobile',
          label: '手机号',
          rule: 'REQ TEL',
          props: { placeholder: '请输入手机号' }
        }),
        createField({
          type: 'Select',
          name: 'gender',
          label: '性别',
          rule: 'REQ',
          props: {
            placeholder: '请选择',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ]
          }
        }),
        createField({
          type: 'DatePicker',
          name: 'joinDate',
          label: '入职日期',
          props: { placeholder: '请选择日期' }
        }),
        createField({
          type: 'TextArea',
          name: 'remark',
          label: '备注',
          block: true,
          description: '选填',
          props: { rows: 3, placeholder: '补充说明' }
        })
      ]
    })
  ]
};

const SchemaRenderExample = () => {
  const [result, setResult] = useState(null);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="运行时渲染"
        description={
          <span>
            业务侧 Schema 可带 <Text code>actions</Text>（FormCreator 左侧可配）。SchemaRenderer 会识别并居中渲染提交
            / 重置；也可用组件 props 覆盖。
          </span>
        }
      />
      <JsonView data={demoSchema} theme="light" collapsedFrom={2} searchable={false} />
      <SchemaRenderer
        schema={demoSchema}
        formProps={{
          onSubmit: data => setResult(data)
        }}
      />
      {result ? <JsonView data={result} theme="light" collapsedFrom={2} searchable={false} /> : null}
    </Space>
  );
};

render(<SchemaRenderExample />);

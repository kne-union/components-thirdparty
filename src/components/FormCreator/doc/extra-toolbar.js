const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { useState } = React;
const { Alert, Space, Typography, message } = antd;
const { Text } = Typography;

const ExtraToolbarExample = () => {
  const [schema, setSchema] = useState(() => ({
    ...defaultSchema(),
    blocks: [
      createBlock('formInfo', {
        title: '基本信息',
        column: 2,
        list: [
          createField({ type: 'Input', name: 'name', label: '姓名', rule: 'REQ', props: { placeholder: '请输入姓名' } }),
          createField({ type: 'Input', name: 'mobile', label: '手机号', rule: 'REQ TEL', props: { placeholder: '请输入手机号' } })
        ]
      })
    ]
  }));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="扩展工具栏按钮"
        description={
          <span>
            「添加模块」旁通过圆形「更多」下拉收纳扩展操作。传入 <Text code>extraToolbar</Text> 操作列表（或
            <Text code>{'({ schema }) => list'}</Text>
            ）会与导入导出、保存等一并进入下拉，与当前工具栏交互一致。
          </span>
        }
      />
      <FormCreator.Field
        value={schema}
        onChange={setSchema}
        extraToolbar={[
          {
            key: 'custom-action',
            children: '自定义操作',
            onClick: () => message.info('自定义业务按钮')
          }
        ]}
      />
    </Space>
  );
};

render(<ExtraToolbarExample />);

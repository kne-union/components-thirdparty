const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { useState } = React;
const { Alert, Space, Typography } = antd;
const { Text } = Typography;

const SchemaImportExportExample = () => {
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
        message="Schema 导入导出"
        description={
          <span>
            默认开启导入导出：复制、导出、导入（粘贴 / 剪贴板 / 文件）收进「添加模块」旁圆形「更多」下拉，样式与扩展操作一致。传{' '}
            <Text code>schemaImportExport={'{false}'}</Text> 可关闭。
          </span>
        }
      />
      <FormCreator.Field
        value={schema}
        onChange={setSchema}
        schemaImportExport={{ downloadFileName: 'questionnaire-schema.json' }}
      />
    </Space>
  );
};

render(<SchemaImportExportExample />);

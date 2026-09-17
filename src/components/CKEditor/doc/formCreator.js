const { default: CKEditor } = _CKEditor;
const { defaultSchema, createBlock, createField } = _FormCreator;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useMemo, useState } = React;
const { Title, Paragraph, Text } = Typography;

const sampleSchema = {
  ...defaultSchema(),
  title: '活动报名',
  blocks: [
    createBlock('formInfo', {
      title: '基本信息',
      column: 2,
      list: [
        createField({ type: 'Input', name: 'name', label: '姓名', rule: 'REQ', props: { placeholder: '请输入姓名' } }),
        createField({ type: 'Input', name: 'email', label: '邮箱', rule: 'REQ EMAIL', props: { placeholder: '请输入邮箱' } })
      ]
    })
  ]
};

const initData = `<h2>
    表单搭建示例
</h2>
<section class="component-box ck-form-creator" data-form-creator-schema="${encodeURIComponent(JSON.stringify(sampleSchema))}">
    &nbsp;
</section>
<p>
    点击工具栏「表单」按钮，在弹窗中使用 FormCreator 搭建表单，确认后以特殊标签插入文档；编辑区与 CKEditor.Content 均通过 SchemaRenderer 渲染。双击已插入块可再次编辑。
</p>`;

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  // Field：编辑区预览（只读示意）
  const fieldFormCreator = useMemo(
    () => ({
      height: 280,
      preview: true,
      showActions: false
    }),
    []
  );

  // Content：可交互；formProps 会传给文档内每一个 FormCreator 表单的 Form
  const contentFormCreator = useMemo(
    () => ({
      height: 280,
      preview: false,
      showActions: true,
      formProps: {
        onSubmit: values => {
          messageApi.success(`提交成功：${JSON.stringify(values)}`);
          return true;
        }
      }
    }),
    [messageApi]
  );

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>FormCreator 表单</Title>
            <Paragraph type="secondary">
              Field 用 <Text code>config.formCreator</Text> 配置编辑区预览；Content 用{' '}
              <Text code>formCreator.formProps</Text> 给文档内所有 FormCreator 表单的 <Text code>Form</Text> 统一传参（如{' '}
              <Text code>onSubmit</Text>、<Text code>data</Text>）。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              message: messageApi,
              formCreator: fieldFormCreator
            }}
          />
          <Divider orientation="left">内容预览（可提交）</Divider>
          <CKEditor.Content formCreator={contentFormCreator}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

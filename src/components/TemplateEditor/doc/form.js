const { default: TemplateEditor } = _TemplateEditor;
const { createWithRemoteLoader } = remoteLoader;
const { Typography } = antd;

const variables = [
  { name: 'employeeName', label: '员工姓名' },
  { name: 'department', label: '部门' },
  { name: 'entryDate', label: '入职日期' }
];

const initData = {
  name: '入职欢迎通知',
  content: `<p class="email-lead">{{ employeeName }}，欢迎加入{{ department }}！</p>
<p class="email-text">您的入职日期为 {{ entryDate }}，请携带身份证、学历证书原件到前台办理入职手续。</p>
<p class="email-footer">人力资源部</p>`
};

const FormExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Input } = FormInfo.fields;
  return (
    <Form
      data={initData}
      onSubmit={data => {
        console.log(data);
      }}>
      <FormInfo
        column={1}
        list={[
          <Input name="name" label="模板名称" rule="REQ" />,
          <TemplateEditor
            name="content"
            label="模板内容"
            rule="REQ"
            variables={variables}
            condition={false}
            height={280}
            previewData={{ employeeName: '张伟', department: '技术部', entryDate: '2026-11-16' }}
          />
        ]}
      />
      <Typography.Paragraph type="secondary">本示例关闭了条件块（condition=false），提交后在控制台查看表单数据。</Typography.Paragraph>
      <SubmitButton>保存模板</SubmitButton>
    </Form>
  );
});

render(<FormExample />);

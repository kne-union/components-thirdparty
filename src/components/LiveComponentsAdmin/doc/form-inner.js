const { FormInner } = _LiveComponentsAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const FormInnerExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo@Form', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [Form, PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Card title="站点表单字段">
        <Form
          data={{ defaultPermission: 'rw' }}
          onSubmit={data => {
            console.log(data);
          }}>
          <FormInner />
        </Form>
      </Card>
    </PureGlobal>
  );
});

render(<FormInnerExample />);

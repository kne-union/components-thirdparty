const { default: FormCreator, defaultSchema, createBlock, createField, createChoiceOption } = _FormCreator;
const { createWithRemoteLoader } = remoteLoader;
const { useMemo, useState } = React;
const { Alert, Flex, Segmented, Typography } = antd;
const { Text } = Typography;

const createInterviewSchema = () => ({
  ...defaultSchema(),
  blocks: [
    createBlock('formInfo', {
      title: '候选人信息',
      subtitle: '面试官填写前请核对候选人基本资料',
      column: 2,
      list: [
        createField({ type: 'Input', name: 'candidateName', label: '候选人姓名', rule: 'REQ', props: { placeholder: '如：李雨桐' } }),
        createField({ type: 'Input', name: 'position', label: '应聘岗位', rule: 'REQ', props: { placeholder: '如：高级前端工程师' } }),
        createField({ type: 'DatePicker', name: 'interviewDate', label: '面试日期', rule: 'REQ' }),
        createField({
          type: 'Select',
          name: 'round',
          label: '面试轮次',
          rule: 'REQ',
          props: {
            options: [
              { label: '一面（技术）', value: 'tech' },
              { label: '二面（业务）', value: 'business' },
              { label: 'HR 面', value: 'hr' }
            ]
          }
        })
      ]
    }),
    createBlock('choice', {
      title: '面试结论',
      selectorName: 'conclusion',
      options: [
        createChoiceOption({
          title: '通过',
          list: [createField({ type: 'TextArea', name: 'highlight', label: '主要亮点', block: true, rule: 'REQ' })]
        }),
        createChoiceOption({
          title: '不通过',
          list: [createField({ type: 'TextArea', name: 'reason', label: '不通过原因', block: true, rule: 'REQ' })]
        })
      ]
    })
  ]
});

const ModalAdapterExample = createWithRemoteLoader({
  modules: ['components-core:Drawer@createDrawerRender']
})(({ remoteModules }) => {
  const [createDrawerRender] = remoteModules;
  const [schema, setSchema] = useState(createInterviewSchema);
  const [mode, setMode] = useState('modal');

  const renderDrawer = useMemo(() => {
    const renderDrawerBase = createDrawerRender({ placement: 'right', footerButtons: [], bodyScroll: true });
    // 宿主协议：onCancel → onClose，footer 函数需先执行；width 由 Drawer 自身决定（移动端全宽）
    return ({ formProps, saveText, autoClose, cancelText, onCancel, footer, width, ...props }) =>
      renderDrawerBase({
        ...props,
        onClose: onCancel,
        footer: typeof footer === 'function' ? footer() : footer
      });
  }, [createDrawerRender]);

  return (
    <Flex vertical gap={16}>
      <Alert
        type="info"
        showIcon
        message="弹窗适配 components-core"
        description={
          <span>
            本包装层默认把「编辑模块」「编辑填写项」「表单按钮」等内部弹窗统一渲染为 components-core 的 Modal：标题与底部按钮固定、内容区滚动，切到「手机」预览时全屏展示。
            需要换成侧滑抽屉等其它弹层时，传入 <Text code>renderModal</Text> 即可，例如配合 <Text code>components-core:Drawer@createDrawerRender</Text>。
          </span>
        }
      />
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { label: '默认（components-core Modal）', value: 'modal' },
          { label: '自定义 renderModal（Drawer）', value: 'drawer' }
        ]}
      />
      <FormCreator.Field
        key={mode}
        value={schema}
        onChange={setSchema}
        renderModal={mode === 'drawer' ? renderDrawer : undefined}
      />
    </Flex>
  );
});

render(<ModalAdapterExample />);

const { createWithRemoteLoader } = remoteLoader;
const { default: CKEditor } = _CKEditor;
const { Button, Space, Typography } = antd;
const { useState } = React;
const { Paragraph, Text } = Typography;

// 内容刻意加长，弹窗内滚动时验收工具栏吸顶位置
const longContent = Array.from({ length: 30 }, (_, index) => `<p>第 ${index + 1} 段：滚动弹窗，工具栏应贴在弹窗可视区域顶部，不留空隙。</p>`).join(
  ''
);

const ModalExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:FormInfo@useFormModal']
})(({ remoteModules }) => {
  const [FormInfo, useFormModal] = remoteModules;
  const { Input } = FormInfo.fields;
  const formModal = useFormModal();
  const [result, setResult] = useState('');

  const openModal = () => {
    const modalApi = formModal({
      title: '弹窗中编辑（默认工具栏）',
      size: 'large',
      formProps: {
        data: { title: '弹窗标题', content: `<h2>弹窗内的编辑器</h2>${longContent}` },
        onSubmit: data => {
          setResult(data?.content || '');
          modalApi.close();
        }
      },
      children: <FormInfo column={1} list={[<Input name="title" label="标题" rule="REQ" />, <CKEditor name="content" label="内容" rule="REQ" />]} />
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Paragraph type="secondary">
        验收点：打开弹窗后工具栏按钮按宽度正常展示，不会全部收进「⋮」；弹窗内滚动时工具栏吸附在可视区域顶部，不额外下移。
      </Paragraph>
      <Button type="primary" onClick={openModal}>
        打开 useFormModal
      </Button>
      {result ? (
        <Paragraph>
          <Text type="secondary">提交内容长度：</Text>
          <Text>{result.length}</Text>
        </Paragraph>
      ) : null}
    </Space>
  );
});

render(<ModalExample />);

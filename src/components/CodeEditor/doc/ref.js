const { default: CodeEditor } = _CodeEditor;
const { Flex, Button, Space, Typography, message } = antd;
const { useRef, useState } = React;

const templates = {
  interview: '{"title":"面试邀约","receiver":"王芳","time":"2026-11-05 14:00","location":"上海市徐汇区漕河泾开发区 A 座 8 楼","interviewer":["赵磊","陈静"]}',
  offer: '{"title":"录用通知","receiver":"张伟","position":"Java 开发工程师","entryDate":"2026-11-16","probationMonths":3}'
};

const RefExample = () => {
  const editorRef = useRef(null);
  const [output, setOutput] = useState('');
  return (
    <Flex vertical gap={12}>
      <Space wrap>
        <Button onClick={() => editorRef.current.setValue(templates.interview)}>载入面试邀约</Button>
        <Button onClick={() => editorRef.current.setValue(templates.offer)}>载入录用通知</Button>
        <Button
          onClick={async () => {
            const formatted = await editorRef.current.format();
            formatted || message.info('当前语言暂不支持格式化');
          }}>
          调用 format()
        </Button>
        <Button
          type="primary"
          onClick={() => {
            try {
              setOutput(JSON.stringify(JSON.parse(editorRef.current.getValue())));
            } catch (e) {
              message.error('内容不是合法的 JSON');
            }
          }}>
          读取并压缩 getValue()
        </Button>
        <Button
          onClick={() => {
            const editor = editorRef.current.getEditor();
            editor.setSelection(editor.getModel().getFullModelRange());
            editor.focus();
          }}>
          getEditor() 全选
        </Button>
      </Space>
      <CodeEditor ref={editorRef} height={240} defaultLanguage="json" defaultValue={templates.interview} formatActionOpen={false} />
      {output && <Typography.Paragraph copyable code>{output}</Typography.Paragraph>}
    </Flex>
  );
};

render(<RefExample />);

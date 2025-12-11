const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Alert } = antd;
const { useState } = React;
const BaseExample = () => {
  const [value, setValue] = useState('');
  return (
    <Flex vertical gap={12}>
      <Alert message={value || '暂无内容'} />
      <LiveComponentEditor defaultValue={value} onChange={setValue} />
    </Flex>
  );
};

render(<BaseExample />);

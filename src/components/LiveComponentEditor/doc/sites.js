const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Button, message } = antd;
const { useState, useRef } = React;

const SitesExample = () => {
  const ref = useRef(null);
  const [value, setValue] = useState('');

  return (
    <Flex vertical gap={12}>
      <LiveComponentEditor
        defaultValue={value}
        onChange={setValue}
        ref={ref}
        height={480}
        toolbarExtra={
          <Button
            onClick={() => {
              const v = ref.current?.getValue();
              message.info(v ? `长度 ${v.length}` : '空');
            }}>
            查看编码长度
          </Button>
        }
        sites={[
          { host: 'localStorage:live-component-demo', name: '本地演示' },
          { host: 'localStorage:live-component-demo-2', name: '本地演示 2' }
        ]}
      />
    </Flex>
  );
};

render(<SitesExample />);

const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Alert } = antd;
const { useEffect, useState, useRef } = React;

const MOCK_HOST = LiveComponentEditor.AI_MOCK_HOST || 'https://mock-live-ai.local';

const AiExample = () => {
  const ref = useRef(null);
  const [value, setValue] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof LiveComponentEditor.installAiSiteMock === 'function') {
      LiveComponentEditor.installAiSiteMock();
    }
    setReady(true);
    return () => {
      LiveComponentEditor.uninstallAiSiteMock?.();
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <Flex vertical gap={12}>
      <Alert
        type="info"
        showIcon
        message="AI Mock 站点（无需后端）"
        description={
          <span>
            已拦截 <code>{MOCK_HOST}</code>。右侧 AI 面板应直接出现；可打开左侧「AI Demo」再试生成，或直接对编辑器内容完善需求后点「开始生成」。
          </span>
        }
      />
      <LiveComponentEditor
        defaultValue={value}
        onChange={setValue}
        ref={ref}
        height={520}
        siteActionsOpen={false}
        sites={[{ host: MOCK_HOST, name: 'AI Mock 站点' }]}
      />
    </Flex>
  );
};

render(<AiExample />);

const { default: MarkdownComponentsRender } = _MarkdownRender;
const { default: mdUrl } = md;
const { default: Fetch } = _ReactFetch;
const { Card, Button, App, Flex } = antd;

const BaseExample = () => {
  const { message } = App.useApp();

  return (
    <App>
      <Fetch
        url={mdUrl}
        ignoreSuccessState
        render={({ data }) => (
          <Flex vertical gap={12} style={{ width: '100%', maxWidth: 960 }}>
            <MarkdownComponentsRender
              components={{ Card, Button }}
              variables={{
                onOpenWorkbench: () => message.success('已打开工作台')
              }}>
              {data}
            </MarkdownComponentsRender>
          </Flex>
        )}
      />
    </App>
  );
};

render(<BaseExample />);

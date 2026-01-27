const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Select, Divider } = antd;
const { useState } = React;
const { Title, Text } = Typography;

const I18nExample = () => {
  const [language, setLanguage] = useState('zh-CN');
  const [content, setContent] = useState(
    `<h2>国际化示例</h2>\n<p>CKEditor 5 支持多种语言，可以通过配置 language 属性来切换界面语言。</p>\n<p>尝试切换下面的语言选择器，观察编辑器界面语言的变化。</p>\n<ul>\n  <li>简体中文 (zh-CN)</li>\n  <li>英语 (en-US)</li>\n</ul>`
  );

  const languageOptions = [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' }
  ];

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Flex justify="space-between" align="center">
            <Title level={4} style={{ margin: 0 }}>
              国际化支持
            </Title>
            <Space>
              <Text>选择语言：</Text>
              <Select value={language} onChange={setLanguage} options={languageOptions} style={{ width: 200 }} />
            </Space>
          </Flex>
          <CKEditor.Field key={language} locale={language} value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content key={`preview-${language}`}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<I18nExample />);

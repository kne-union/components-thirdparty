const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const EMAIL_TOOLBAR_ITEMS = [
  'undo',
  'redo',
  '|',
  'heading',
  '|',
  'bold',
  'italic',
  'underline',
  'fontColor',
  'fontSize',
  '|',
  'bulletedList',
  'numberedList',
  'alignment',
  '|',
  'link',
  'insertTable',
  'insertTemplateVariable',
  '|',
  'removeFormat',
  'sourceEditing'
];

const templateVariableConfig = {
  variables: [
    { name: 'userName', label: '用户名' },
    { name: 'companyName', label: '公司名' },
    { name: 'rawHtml', label: '原始HTML', kind: 'raw' }
  ]
};

const initData = `<p>你好 {{ userName }}，欢迎加入 {{ companyName }}。</p><p>以下为原始 HTML：{{ rawHtml | raw }}</p>`;

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>邮件模版变量</Title>
            <Paragraph type="secondary">
              工具栏「模版变量」从配置列表插入；编辑态显示 label 芯片，获取内容为 Liquid 变量标签
              <Text code>{'{{ name }}'}</Text> / <Text code>{'{{ name | raw }}'}</Text>。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              toolbar: { items: EMAIL_TOOLBAR_ITEMS },
              templateVariable: templateVariableConfig
            }}
          />
          <Divider orientation="left">getData / onChange 原始内容</Divider>
          <Text code style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
            {content}
          </Text>
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

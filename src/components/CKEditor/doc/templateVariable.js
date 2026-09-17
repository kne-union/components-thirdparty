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
    { name: 'rawHtml', label: '原始HTML', kind: 'escape' }
  ],
  // 与 lodash.templateSettings 同名字段；示例使用自定义 {{ }} / {{- }}
  interpolate: /\{\{([\s\S]+?)\}\}/g,
  escape: /\{\{-([\s\S]+?)\}\}/g
};

const initData = `<p>你好 {{userName}}，欢迎加入 {{companyName}}。</p><p>以下为原始 HTML：{{-rawHtml}}</p>`;

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>邮件模版变量</Title>
            <Paragraph type="secondary">
              工具栏「模版变量」从配置列表插入；编辑态显示 label 芯片，获取内容为 lodash 模版标签（本示例为自定义
              <Text code>{'{{name}}'}</Text> / <Text code>{'{{-name}}'}</Text>）。
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

const { default: TemplateEditor } = _TemplateEditor;
const { Flex, Typography } = antd;
const { useState } = React;

const variables = [
  { name: 'candidateName', label: '候选人姓名' },
  { name: 'interviewTime', label: '面试时间' },
  { name: 'shortLink', label: '短链接' },
  { name: 'contactPhone', label: '联系电话' }
];

const previewData = {
  candidateName: '王芳',
  interviewTime: '11月5日 14:00',
  shortLink: 'https://s.example.com/8F3K2'
};

const initContent = `【AI面试】{{ candidateName }}您好，您的AI视频面试安排在{{ interviewTime }}，请点击 {{ shortLink }} 进入。
{% if contactPhone != blank %}如有疑问请致电{{ contactPhone }}。{% else %}如有疑问请回复本短信。{% endif %}`;

const SmsExample = () => {
  const [content, setContent] = useState(initContent);
  return (
    <Flex vertical gap={12}>
      <TemplateEditor.Field type="text" value={content} onChange={setContent} variables={variables} previewData={previewData} />
      <Typography.Text type="secondary">onChange 输出的纯文本：</Typography.Text>
      <Typography.Paragraph code style={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography.Paragraph>
    </Flex>
  );
};

render(<SmsExample />);

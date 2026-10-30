const { default: TemplateEditor } = _TemplateEditor;
const { useState } = React;

const variables = [
  { name: 'candidateName', label: '候选人姓名' },
  { name: 'jobTitle', label: '应聘岗位' },
  { name: 'interviewTime', label: '面试时间' },
  { name: 'interviewLink', label: '面试链接' }
];

const previewData = {
  candidateName: '王芳',
  jobTitle: '高级前端工程师',
  interviewTime: '2026-11-05 14:00',
  interviewLink: 'https://interview.example.com/room/8F3K2'
};

const initContent = `<h2 class="email-title">AI 面试邀请</h2>
<p class="email-lead">{{ candidateName }}，您好！</p>
<p class="email-text">感谢您投递 <strong>{{ jobTitle }}</strong> 岗位，诚邀您参加 AI 视频面试。</p>
<p class="email-tip">面试时间：{{ interviewTime }}，请提前 10 分钟进入面试间并检查摄像头与麦克风。</p>
<p class="email-text"><a href="{{ interviewLink }}"><span class="email-btn">进入面试间</span></a></p>
<p class="email-footer">此邮件由系统自动发送，请勿直接回复。</p>`;

const BaseExample = () => {
  const [content, setContent] = useState(initContent);
  return (
    <TemplateEditor.Field
      value={content}
      onChange={setContent}
      variables={variables}
      previewData={previewData}
      subject="【面试邀请】{{ candidateName }}，邀请您参加{{ jobTitle }}岗位 AI 面试"
    />
  );
};

render(<BaseExample />);

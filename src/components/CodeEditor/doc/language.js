const { default: CodeEditor } = _CodeEditor;
const { Flex, Segmented, Typography } = antd;
const { useState } = React;

const files = {
  json: {
    label: 'JSON',
    code: '{"jobTitle":"高级前端工程师","department":"技术部","city":"上海","salary":{"min":25000,"max":40000},"skills":["React","TypeScript","Webpack"]}'
  },
  css: {
    label: 'CSS',
    code: '.candidate-card{display:flex;gap:12px;padding:16px;border-radius:8px}.candidate-card .name{font-weight:600;color:#262626}'
  },
  html: {
    label: 'HTML',
    code: '<div class="offer"><h2>录用通知</h2><p>张三，您好：</p><p>恭喜您通过技术部的面试，入职日期为 2026-11-16。</p></div>'
  },
  markdown: {
    label: 'Markdown',
    code: '# 面试反馈\n\n- 候选人：李四\n- 岗位：产品经理\n- 结论：**建议进入终面**\n'
  }
};

const LanguageExample = () => {
  const [language, setLanguage] = useState('json');
  const [values, setValues] = useState(() => Object.fromEntries(Object.entries(files).map(([key, { code }]) => [key, code])));
  return (
    <Flex vertical gap={12}>
      <Segmented value={language} onChange={setLanguage} options={Object.entries(files).map(([value, { label }]) => ({ label, value }))} />
      <CodeEditor
        height={240}
        path={`demo.${language}`}
        language={language}
        value={values[language]}
        onChange={value => setValues(current => Object.assign({}, current, { [language]: value }))}
      />
      <Typography.Text type="secondary">
        当前 {files[language].label} 内容共 {(values[language] || '').length} 个字符；Markdown 没有内置格式化器，切换过去后格式化按钮自动隐藏。
      </Typography.Text>
    </Flex>
  );
};

render(<LanguageExample />);

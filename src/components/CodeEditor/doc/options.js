const { default: CodeEditor } = _CodeEditor;
const { Flex, Switch, Space, Typography } = antd;
const { useState } = React;

const tsCode = `// 统计各部门本月入职人数
interface Employee { name: string; department: string; entryDate: string }

export const countHiredByDepartment=(list:Employee[],month:string)=>list
.filter(({entryDate})=>entryDate.startsWith(month))
.reduce<Record<string,number>>((result,{department})=>({...result,[department]:(result[department]||0)+1}),{});
`;

const OptionsExample = () => {
  const [dark, setDark] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [formatActionOpen, setFormatActionOpen] = useState(true);
  return (
    <Flex vertical gap={12}>
      <Space size={24} wrap>
        <Space>
          <Switch checked={dark} onChange={setDark} />
          <Typography.Text>暗色主题</Typography.Text>
        </Space>
        <Space>
          <Switch checked={readOnly} onChange={setReadOnly} />
          <Typography.Text>只读（自动隐藏格式化浮层）</Typography.Text>
        </Space>
        <Space>
          <Switch checked={formatActionOpen} onChange={setFormatActionOpen} />
          <Typography.Text>显示格式化浮层</Typography.Text>
        </Space>
      </Space>
      <CodeEditor
        height={220}
        defaultLanguage="typescript"
        defaultValue={tsCode}
        theme={dark ? 'vs-dark' : 'light'}
        formatActionOpen={formatActionOpen}
        loading={<Typography.Text type="secondary">编辑器加载中...</Typography.Text>}
        options={{
          readOnly,
          fontSize: 14,
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false
        }}
      />
    </Flex>
  );
};

render(<OptionsExample />);

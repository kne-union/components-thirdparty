const { default: DiffEditor } = _DiffEditor;
const { Flex, Segmented } = antd;
const { useState } = React;

const original = {
  role: '前端工程师',
  tasks: [
    { task_id: 't1', task: '开发业务页面', level: 3 },
    { task_id: 't2', task: '维护组件库', level: 2 },
    { task_id: 't3', task: '代码评审', level: 2 }
  ],
  language: 'zh-CN'
};

const modified = {
  role: '前端工程师',
  tasks: [
    { task_id: 't1', task: '开发业务页面', level: 4 },
    { task_id: 't2', task: '维护组件库', level: 2 },
    { task_id: 't4', task: '性能优化', level: 3 }
  ],
  language: 'zh-CN'
};

const JsonExample = () => {
  const [view, setView] = useState('side');
  return (
    <Flex vertical gap={12}>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { label: '并排', value: 'side' },
          { label: '内联', value: 'inline' }
        ]}
      />
      <DiffEditor height={360} original={original} modified={modified} renderSideBySide={view === 'side'} />
    </Flex>
  );
};

render(<JsonExample />);

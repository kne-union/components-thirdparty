const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { useMemo, useRef, useState } = React;
const { Alert, Space, Typography } = antd;
const { Text, Paragraph } = Typography;

const buildDemoSchema = title => ({
  ...defaultSchema(),
  blocks: [
    createBlock('formInfo', {
      title,
      column: 2,
      list: [
        createField({ type: 'Input', name: 'name', label: '姓名', rule: 'REQ', props: { placeholder: '请输入姓名' } }),
        createField({ type: 'Input', name: 'mobile', label: '手机号', rule: 'REQ TEL', props: { placeholder: '请输入手机号' } })
      ]
    })
  ]
});

const TemplateApisExample = () => {
  const [schema, setSchema] = useState(() => buildDemoSchema('当前问卷'));
  const [folders, setFolders] = useState(() => [
    { id: 1, code: 'onboard', name: '入职模版', children: [] },
    { id: 2, code: 'survey', name: '调研', children: [] }
  ]);
  const [templates, setTemplates] = useState(() => [
    { id: 'tpl-basic', name: '基础信息', parentId: 1, schema: buildDemoSchema('基础信息模版') },
    {
      id: 'tpl-feedback',
      name: '满意度',
      parentId: 2,
      schema: {
        ...defaultSchema(),
        blocks: [
          createBlock('formInfo', {
            title: '满意度',
            list: [createField({ type: 'TextArea', name: 'feedback', label: '意见', props: { rows: 3 } })]
          })
        ]
      }
    }
  ]);
  const foldersRef = useRef(folders);
  const templatesRef = useRef(templates);
  foldersRef.current = folders;
  templatesRef.current = templates;

  const apis = useMemo(
    () => ({
      groupList: {
        loader: async () => foldersRef.current
      },
      create: async ({ data }) => {
        const item = {
          id: Date.now(),
          code: `folder_${Date.now()}`,
          name: data.name,
          parentId: data.parentId ?? null,
          children: []
        };
        const append = (nodes, parentId) => {
          if (parentId == null) {
            return [...nodes, item];
          }
          return (nodes || []).map(node => {
            if (node.id === parentId || node.code === parentId) {
              return { ...node, children: [...(node.children || []), item] };
            }
            if (node.children?.length) {
              return { ...node, children: append(node.children, parentId) };
            }
            return node;
          });
        };
        const next = append(foldersRef.current, data.parentId);
        foldersRef.current = next;
        setFolders(next);
        return item;
      },
      save: async ({ data }) => {
        const walk = nodes =>
          (nodes || []).map(node => {
            if (node.id === data.id || node.code === data.code) {
              return { ...node, name: data.name };
            }
            if (node.children?.length) {
              return { ...node, children: walk(node.children) };
            }
            return node;
          });
        const next = walk(foldersRef.current);
        foldersRef.current = next;
        setFolders(next);
        return data;
      },
      remove: async ({ data }) => {
        const walk = nodes =>
          (nodes || [])
            .filter(node => node.id !== data.id && node.code !== data.code)
            .map(node => ({ ...node, children: walk(node.children || []) }));
        const next = walk(foldersRef.current);
        foldersRef.current = next;
        setFolders(next);
      },
      list: async () => templatesRef.current,
      saveTemplate: async ({ data }) => {
        const item = {
          id: `tpl-${Date.now()}`,
          name: data.name,
          parentId: data.parentId,
          schema: data.schema
        };
        const next = [...templatesRef.current, item];
        templatesRef.current = next;
        setTemplates(next);
        return item;
      }
    }),
    []
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="模版列表与保存"
        description={
          <div>
            <Paragraph style={{ marginBottom: 4 }}>
              左侧为 <Text code>FileSystemView</Text>；文件夹走 GroupFolder API（
              <Text code>groupList / create / save / remove</Text>
              ），模版走 <Text code>list / saveTemplate</Text>。
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>本示例为内存 mock，可换成真实 ajax 配置。</Paragraph>
          </div>
        }
      />
      <FormCreator.Field value={schema} onChange={setSchema} groupType="demo" apis={apis} />
    </Space>
  );
};

render(<TemplateApisExample />);

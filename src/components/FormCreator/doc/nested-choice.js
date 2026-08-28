const { SchemaRenderer, createBlock, createField, createChoiceOption } = _FormCreator;
const { default: JsonView } = _JsonView;
const { useState } = React;
const { Alert, Space, Switch } = antd;

const NestedChoiceExample = () => {
  const [multiple, setMultiple] = useState(false);
  const [result, setResult] = useState(null);

  const schema = {
    actions: {
      showSubmit: true,
      showReset: true,
      submitText: '提交',
      resetText: '重置'
    },
    blocks: [
      createBlock('list', {
        title: '教育经历',
        name: 'education',
        addText: '添加教育经历',
        minLength: 1,
        list: [
          createField({ type: 'Input', name: 'schoolName', label: '学校', rule: 'REQ', props: { placeholder: '学校名称' } }),
          createField({ type: 'Input', name: 'major', label: '专业', props: { placeholder: '专业' } })
        ],
        itemBlocks: [
          createBlock('object', {
            name: 'time',
            title: '在校时间',
            column: 2,
            list: [
              createField({ type: 'Input', name: 'startTime', label: '开始', props: { placeholder: '开始时间' } }),
              createField({ type: 'Input', name: 'endTime', label: '结束', props: { placeholder: '结束时间' } })
            ]
          }),
          createBlock('list', {
            title: '课程',
            name: 'courses',
            addText: '添加课程',
            list: [createField({ type: 'Input', name: 'courseName', label: '课程名', props: { placeholder: '课程名' } })]
          })
        ]
      }),
      createBlock('choice', {
        title: '客户类型',
        mode: multiple ? 'multiple' : 'single',
        minLength: multiple ? 1 : undefined,
        maxLength: multiple ? 2 : undefined,
        selectorName: 'customerType',
        selectorInData: true,
        options: [
          createChoiceOption({
            id: 'enterprise',
            title: '企业',
            blocks: [
              createBlock('formInfo', {
                title: '企业信息',
                column: 2,
                list: [
                  createField({ type: 'Input', name: 'companyName', label: '公司名', rule: 'REQ', props: { placeholder: '公司名称' } }),
                  createField({ type: 'Input', name: 'creditCode', label: '信用代码', props: { placeholder: '统一社会信用代码' } })
                ]
              })
            ]
          }),
          createChoiceOption({
            id: 'person',
            title: '个人',
            blocks: [
              createBlock('formInfo', {
                title: '个人信息',
                column: 2,
                list: [
                  createField({ type: 'Input', name: 'idName', label: '姓名', rule: 'REQ', props: { placeholder: '姓名' } }),
                  createField({ type: 'Input', name: 'idNo', label: '证件号', props: { placeholder: '证件号码' } })
                ]
              })
            ]
          }),
          createChoiceOption({
            id: 'other',
            title: '其他',
            blocks: [
              createBlock('formInfo', {
                column: 1,
                list: [createField({ type: 'TextArea', name: 'otherNote', label: '说明', block: true, props: { rows: 3, placeholder: '补充说明' } })]
              })
            ]
          })
        ]
      })
    ]
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="列表嵌套与选项切换"
        description={<span>列表每一条里可以再放分组信息或子列表；选项切换可设为「只能选一个」或「可以选多个」（多选可限制最少/最多几项），下方会显示对应填写内容。</span>}
      />
      <Space>
        <span>允许多选</span>
        <Switch checked={multiple} onChange={setMultiple} />
      </Space>
      <SchemaRenderer
        key={multiple ? 'multiple' : 'single'}
        schema={schema}
        formProps={{
          onSubmit: data => setResult(data)
        }}
      />
      {result ? <JsonView data={result} theme="light" collapsedFrom={2} searchable={false} /> : null}
    </Space>
  );
};

render(<NestedChoiceExample />);

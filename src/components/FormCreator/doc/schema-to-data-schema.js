const {
  SchemaRenderer,
  schemaToDataSchema,
  createBlock,
  createField,
  createChoiceOption,
  createStep,
  defaultSchema
} = _FormCreator;
const { default: JsonView } = _JsonView;
const { useMemo, useState } = React;
const { Alert, Card, Col, Row, Space, Switch, Typography } = antd;
const { Text, Title } = Typography;

const buildDemoSchema = multipleChoice => ({
  ...defaultSchema(),
  title: '提交数据 Schema 演示',
  actions: {
    showSubmit: true,
    showReset: true,
    submitText: '提交并对照',
    resetText: '重置'
  },
  blocks: [
    createBlock('formInfo', {
      title: '基本信息',
      subtitle: '含 hidden 字段（界面不展示，但应出现在 data schema）',
      column: 2,
      list: [
        createField({
          type: 'Input',
          name: 'name',
          label: '姓名',
          rule: 'REQ',
          props: { placeholder: '请输入姓名' }
        }),
        createField({
          type: 'Input',
          name: 'mobile',
          label: '手机号',
          rule: 'REQ TEL',
          props: { placeholder: '请输入手机号' }
        }),
        createField({
          type: 'Select',
          name: 'city',
          label: '城市',
          props: {
            allowClear: true,
            options: [
              { label: '上海', value: 'sh' },
              { label: '北京', value: 'bj' }
            ]
          }
        }),
        createField({
          type: 'Input',
          name: 'internalCode',
          label: '内部编码',
          hidden: true,
          rule: 'REQ',
          tips: 'hidden: true，预览不可见，data schema 应包含'
        }),
        createField({
          type: 'Switch',
          name: 'agree',
          label: '同意协议'
        })
      ]
    }),
    createBlock('object', {
      name: 'profile',
      title: '档案对象',
      column: 2,
      list: [
        createField({ type: 'InputNumber', name: 'age', label: '年龄' }),
        createField({
          type: 'DatePicker',
          name: 'birthday',
          label: '生日',
          props: { format: 'YYYY-MM-DD' }
        })
      ]
    }),
    createBlock('list', {
      name: 'projects',
      title: '项目经历',
      addText: '添加项目',
      minLength: 0,
      maxLength: 5,
      list: [
        createField({ type: 'Input', name: 'projectName', label: '项目名', rule: 'REQ' }),
        createField({ type: 'TextArea', name: 'desc', label: '描述', props: { rows: 2 } })
      ],
      itemBlocks: [
        createBlock('object', {
          name: 'period',
          title: '周期',
          column: 2,
          list: [
            createField({ type: 'Input', name: 'start', label: '开始' }),
            createField({ type: 'Input', name: 'end', label: '结束' })
          ]
        })
      ]
    }),
    createBlock('multiField', {
      name: 'tags',
      label: '标签',
      fieldType: 'Input',
      addText: '添加标签'
    }),
    createBlock('choice', {
      title: '客户类型',
      mode: multipleChoice ? 'multiple' : 'single',
      minLength: multipleChoice ? 1 : undefined,
      maxLength: multipleChoice ? 2 : undefined,
      selectorName: 'customerType',
      selectorInData: true,
      options: [
        createChoiceOption({
          id: 'personal',
          title: '个人',
          list: [
            createField({ type: 'Input', name: 'idCard', label: '身份证号', rule: 'REQ' }),
            createField({ type: 'Input', name: 'personalRemark', label: '备注' })
          ]
        }),
        createChoiceOption({
          id: 'company',
          title: '企业',
          list: [
            createField({ type: 'Input', name: 'companyName', label: '公司名', rule: 'REQ' }),
            createField({ type: 'Input', name: 'creditCode', label: '统一社会信用代码' })
          ],
          blocks: [
            createBlock('object', {
              name: 'billing',
              title: '开票信息',
              list: [createField({ type: 'Input', name: 'taxTitle', label: '抬头' })]
            })
          ]
        })
      ]
    }),
    createBlock('steps', {
      title: '补充步骤',
      items: [
        createStep({
          title: '确认',
          list: [createField({ type: 'Checkbox', name: 'confirmed', label: '已核对信息' })]
        })
      ]
    })
  ]
});

const SchemaToDataSchemaExample = () => {
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [submitData, setSubmitData] = useState(null);

  const schema = useMemo(() => buildDemoSchema(multipleChoice), [multipleChoice]);
  const dataSchema = useMemo(() => schemaToDataSchema(schema), [schema]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="schemaToDataSchema"
        description={
          <span>
            左侧可填写并提交，右侧为根据搭建 Schema 生成的<strong>提交数据 JSON Schema</strong>。请对照：hidden 字段
            <Text code>internalCode</Text>、object / list / multiField、choice 的 <Text code>oneOf</Text>/
            <Text code>anyOf</Text> 是否符合预期。
          </span>
        }
      />

      <Space align="center">
        <Text>客户类型多选</Text>
        <Switch checked={multipleChoice} onChange={setMultipleChoice} checkedChildren="anyOf" unCheckedChildren="oneOf" />
        <Text type="secondary">{multipleChoice ? 'choice → anyOf + selector 数组' : 'choice → oneOf + selector const'}</Text>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card size="small" title="表单预览（提交数据）" bordered>
            <SchemaRenderer
              key={multipleChoice ? 'multi' : 'single'}
              schema={schema}
              formProps={{
                onSubmit: data => setSubmitData(data)
              }}
            />
            {submitData ? (
              <div style={{ marginTop: 12 }}>
                <Title level={5}>最近一次提交</Title>
                <JsonView data={submitData} theme="light" collapsedFrom={2} searchable={false} />
              </div>
            ) : null}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="生成的 data schema" bordered>
            <JsonView data={dataSchema} theme="light" collapsedFrom={3} searchable={false} />
          </Card>
        </Col>
      </Row>

      <Card size="small" title="搭建 Schema（源）" bordered>
        <JsonView data={schema} theme="light" collapsedFrom={2} searchable={false} />
      </Card>
    </Space>
  );
};

render(<SchemaToDataSchemaExample />);

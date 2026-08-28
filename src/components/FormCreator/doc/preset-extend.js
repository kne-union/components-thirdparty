const { default: FormCreator, preset, defaultSchema, createBlock, createField } = _FormCreator;
const { Rate, Slider } = _ReactFormAntd;
const { default: JsonView } = _JsonView;
const { useState } = React;
const { Alert, Typography, Space } = antd;
const { Text, Paragraph } = Typography;

// 一次 preset：运行时校验 + 编辑器规则面板 + 扩展填写项
preset({
  rules: {
    ID_CARD: {
      label: '身份证格式',
      reg: /^\d{17}[\dXx]$/,
      message: '%s格式不正确'
    },
    RATE_MIN: {
      label: '评分至少3星',
      validator: value => {
        const score = Number(value) || 0;
        return {
          result: score >= 3,
          errMsg: score >= 3 ? '' : '评分至少 3 星'
        };
      }
    }
  },
  fields: {
    Rate: {
      label: '评分',
      groupName: '评价组件',
      component: Rate,
      defaultProps: { count: 5, allowHalf: false, allowClear: true },
      valueSchema: { type: 'number' },
      propsSchema: [
        {
          name: 'count',
          label: '星星总数',
          type: 'number',
          min: 1,
          max: 10,
          defaultValue: 5
        },
        {
          name: 'allowHalf',
          label: '允许半星',
          type: 'boolean',
          defaultValue: false
        },
        {
          name: 'allowClear',
          label: '允许清除',
          type: 'boolean',
          defaultValue: true
        }
      ]
    },
    Slider: {
      label: '滑块',
      component: Slider,
      defaultProps: { min: 0, max: 100, step: 1 },
      valueSchema: { type: 'number' },
      propsSchema: [
        { name: 'min', label: '最小值', type: 'number', defaultValue: 0 },
        { name: 'max', label: '最大值', type: 'number', defaultValue: 100 },
        { name: 'step', label: '步长', type: 'number', min: 0, defaultValue: 1 },
        {
          name: 'tooltipPlacement',
          label: '提示位置',
          type: 'select',
          defaultValue: 'top',
          options: [
            { label: '上', value: 'top' },
            { label: '下', value: 'bottom' },
            { label: '左', value: 'left' },
            { label: '右', value: 'right' }
          ]
        },
        { name: 'dots', label: '显示刻度点', type: 'boolean', defaultValue: false }
      ]
    }
  }
});

const PresetExtendExample = () => {
  const [schema, setSchema] = useState(() => ({
    ...defaultSchema(),
    blocks: [
      createBlock('formInfo', {
        title: '扩展字段与校验',
        subtitle: '演示 preset({ rules, fields }) 一次注册',
        column: 2,
        list: [
          createField({
            type: 'Input',
            name: 'idCard',
            label: '身份证号',
            rule: 'REQ ID_CARD',
            tips: '已通过 preset 注册 ID_CARD 规则',
            props: { placeholder: '请输入18位身份证号' }
          }),
          createField({
            type: 'Rate',
            name: 'score',
            label: '满意度',
            rule: 'REQ RATE_MIN',
            description: '自定义 Rate 字段，规则要求至少 3 星',
            props: { count: 5, allowHalf: false, allowClear: true }
          }),
          createField({
            type: 'Slider',
            name: 'progress',
            label: '完成度',
            block: true,
            props: { min: 0, max: 100, step: 5, dots: true }
          })
        ]
      })
    ]
  }));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="扩展方式"
        description={
          <div>
            <Paragraph style={{ marginBottom: 4 }}>
              调用 <Text code>{'preset({ rules, fields })'}</Text> 即可同时注册：运行时校验（@kne/react-form-antd）、编辑器「填写规则」勾选面板、扩展填写项类型。
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              规则项在 <Text code>rules</Text> 中写 <Text code>label</Text> + 校验定义（<Text code>reg/message</Text> 或 <Text code>validator</Text>）；字段在 <Text code>fields</Text> 中按 type 配置，支持 <Text code>groupName</Text> 与 <Text code>propsSchema</Text>。
            </Paragraph>
          </div>
        }
      />
      <FormCreator value={schema} onChange={setSchema} />
      <JsonView data={schema} theme="light" collapsedFrom={2} searchable={false} />
    </Space>
  );
};

render(<PresetExtendExample />);

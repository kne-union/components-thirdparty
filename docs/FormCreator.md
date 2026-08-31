# form-creator

### 描述

配置式表单搭建组件，产出 Schema 并用 @kne/form-info 渲染

### 安装

```shell
npm i --save @kne/form-creator
```

### 概述

配置式表单搭建组件：通过字段列表 UI 产出 Schema，并用 `@kne/form-info` 实时预览与运行时渲染。


### 示例

#### 示例样式

```scss
@use '~@kne/responsive-utils/scss' as resp;

@include resp.mobile-container {
  .example-driver-runner {
    padding: 12px 16px 24px;
    box-sizing: border-box;
  }
}
```

#### 示例代码

- 配置式表单搭建(全屏)
- 通过模块列表添加/编辑/排序，右侧实时预览；默认示例含列表嵌套与选项切换
- _FormCreator(@kne/current-lib_form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/current-lib_form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"],_FormInfo(@kne/form-info)[import * as _FormInfo from "@kne/form-info"]

```jsx
const {default: FormCreator, defaultSchema, createBlock, createField, createStep, createChoiceOption} = _FormCreator;
const {default: JsonView} = _JsonView;
const {useState} = React;
const {Typography} = antd;

const {Text} = Typography;

const BaseExample = () => {
    const [schema, setSchema] = useState(() => ({
        ...defaultSchema(),
        actions: {
            showSubmit: true,
            showReset: true,
            showCancel: false,
            submitText: '',
            resetText: '',
            cancelText: '',
            align: 'center',
            gap: 16
        },
        blocks: [
            createBlock('formInfo', {
                title: '基本信息',
                subtitle: '请先填写基础资料',
                column: 2,
                list: [
                    createField({
                        type: 'Input',
                        name: 'name',
                        label: '姓名',
                        rule: 'REQ',
                        tips: '与证件姓名一致',
                        props: {placeholder: '请输入姓名'}
                    }),
                    createField({
                        type: 'Input',
                        name: 'mobile',
                        label: '手机号',
                        rule: 'REQ TEL',
                        props: {placeholder: '请输入手机号'}
                    }),
                    createField({
                        type: 'Select',
                        name: 'gender',
                        label: '性别',
                        rule: 'REQ',
                        props: {
                            placeholder: '请选择',
                            options: [
                                {label: '男', value: 'male'},
                                {label: '女', value: 'female'}
                            ]
                        }
                    }),
                    createField({
                        type: 'DatePicker',
                        name: 'birthday',
                        label: '出生日期',
                        props: {placeholder: '请选择日期'}
                    }),
                    createField({
                        type: 'TextArea',
                        name: 'remark',
                        label: '备注',
                        block: true,
                        description: '选填',
                        props: {rows: 3, placeholder: '补充说明'}
                    })
                ]
            }),
            createBlock('list', {
                title: '工作经历',
                name: 'workExperiences',
                addText: '添加工作经历',
                minLength: 1,
                list: [
                    createField({
                        type: 'Input',
                        name: 'company',
                        label: '公司',
                        rule: 'REQ',
                        props: {placeholder: '请输入公司名称'}
                    }),
                    createField({
                        type: 'Input',
                        name: 'title',
                        label: '职位',
                        rule: 'REQ',
                        props: {placeholder: '请输入职位'}
                    }),
                    createField({
                        type: 'DatePicker',
                        name: 'startDate',
                        label: '入职时间',
                        props: {placeholder: '请选择日期'}
                    })
                ]
            }),
            createBlock('tableList', {
                title: '教育经历',
                name: 'educations',
                addText: '添加教育经历',
                list: [
                    createField({
                        type: 'Input',
                        name: 'school',
                        label: '学校',
                        rule: 'REQ',
                        props: {placeholder: '请输入学校'}
                    }),
                    createField({
                        type: 'Input',
                        name: 'major',
                        label: '专业',
                        props: {placeholder: '请输入专业'}
                    }),
                    createField({
                        type: 'Select',
                        name: 'degree',
                        label: '学历',
                        props: {
                            placeholder: '请选择',
                            options: [
                                {label: '本科', value: 'bachelor'},
                                {label: '硕士', value: 'master'},
                                {label: '博士', value: 'doctor'}
                            ]
                        }
                    })
                ]
            }),
            createBlock('list', {
                title: '项目经历（含嵌套）',
                name: 'projects',
                addText: '添加项目',
                minLength: 0,
                list: [
                    createField({
                        type: 'Input',
                        name: 'projectName',
                        label: '项目名称',
                        rule: 'REQ',
                        props: {placeholder: '请输入项目名称'}
                    }),
                    createField({
                        type: 'Input',
                        name: 'role',
                        label: '担任角色',
                        props: {placeholder: '如：前端开发'}
                    })
                ],
                itemBlocks: [
                    createBlock('object', {
                        name: 'period',
                        title: '项目周期',
                        column: 2,
                        list: [
                            createField({
                                type: 'DatePicker',
                                name: 'start',
                                label: '开始时间',
                                props: {placeholder: '请选择'}
                            }),
                            createField({
                                type: 'DatePicker',
                                name: 'end',
                                label: '结束时间',
                                props: {placeholder: '请选择'}
                            })
                        ]
                    }),
                    createBlock('list', {
                        title: '项目成果',
                        name: 'achievements',
                        addText: '添加成果',
                        list: [
                            createField({
                                type: 'Input',
                                name: 'content',
                                label: '成果说明',
                                props: {placeholder: '请输入成果'}
                            })
                        ]
                    })
                ]
            }),
            createBlock('choice', {
                title: '客户类型',
                mode: 'single',
                selectorName: 'customerType',
                selectorInData: true,
                options: [
                    createChoiceOption({
                        id: 'enterprise',
                        title: '企业',
                        list: [
                            createField({
                                type: 'Input',
                                name: 'companyName',
                                label: '公司名',
                                rule: 'REQ',
                                props: {placeholder: '公司名称'}
                            }),
                            createField({
                                type: 'Input',
                                name: 'creditCode',
                                label: '信用代码',
                                props: {placeholder: '统一社会信用代码'}
                            })
                        ]
                    }),
                    createChoiceOption({
                        id: 'person',
                        title: '个人',
                        list: [
                            createField({
                                type: 'Input',
                                name: 'idName',
                                label: '姓名',
                                rule: 'REQ',
                                props: {placeholder: '姓名'}
                            }),
                            createField({
                                type: 'Input',
                                name: 'idNo',
                                label: '证件号',
                                props: {placeholder: '证件号码'}
                            })
                        ]
                    }),
                    createChoiceOption({
                        id: 'other',
                        title: '其他',
                        list: [
                            createField({
                                type: 'TextArea',
                                name: 'otherNote',
                                label: '说明',
                                block: true,
                                props: {rows: 3, placeholder: '补充说明'}
                            })
                        ]
                    })
                ]
            }),
            createBlock('choice', {
                title: '兴趣标签',
                mode: 'multiple',
                minLength: 1,
                maxLength: 2,
                selectorName: 'interests',
                selectorInData: true,
                options: [
                    createChoiceOption({
                        id: 'sports',
                        title: '运动',
                        list: [
                            createField({
                                type: 'Input',
                                name: 'sportsNote',
                                label: '擅长项目',
                                props: {placeholder: '如：篮球'}
                            })
                        ]
                    }),
                    createChoiceOption({
                        id: 'music',
                        title: '音乐',
                        list: [
                            createField({
                                type: 'Input',
                                name: 'musicNote',
                                label: '偏好风格',
                                props: {placeholder: '如：古典'}
                            })
                        ]
                    }),
                    createChoiceOption({
                        id: 'reading',
                        title: '阅读',
                        list: [
                            createField({
                                type: 'TextArea',
                                name: 'readingNote',
                                label: '近期书单',
                                block: true,
                                props: {rows: 2, placeholder: '选填'}
                            })
                        ]
                    })
                ]
            }),
            createBlock('multiField', {
                title: '备用联系方式',
                name: 'backupContacts',
                label: '联系方式',
                fieldType: 'Input',
                maxLength: 3,
                minLength: 1
            }),
            createBlock('steps', {
                title: '入职补充信息',
                autoStep: true,
                items: [
                    createStep({
                        title: '账号信息',
                        column: 2,
                        list: [
                            createField({
                                type: 'Input',
                                name: 'email',
                                label: '邮箱',
                                rule: 'REQ EMAIL',
                                props: {placeholder: '请输入邮箱'}
                            }),
                            createField({
                                type: 'Input',
                                name: 'employeeNo',
                                label: '工号',
                                props: {placeholder: '选填'}
                            })
                        ]
                    }),
                    createStep({
                        title: '紧急联系人',
                        column: 2,
                        list: [
                            createField({
                                type: 'Input',
                                name: 'emergencyName',
                                label: '联系人',
                                rule: 'REQ',
                                props: {placeholder: '请输入姓名'}
                            }),
                            createField({
                                type: 'Input',
                                name: 'emergencyMobile',
                                label: '联系电话',
                                rule: 'REQ TEL',
                                props: {placeholder: '请输入手机号'}
                            }),
                            createField({
                                type: 'Select',
                                name: 'emergencyRelation',
                                label: '关系',
                                props: {
                                    placeholder: '请选择',
                                    options: [
                                        {label: '父母', value: 'parent'},
                                        {label: '配偶', value: 'spouse'},
                                        {label: '子女', value: 'child'},
                                        {label: '其他', value: 'other'}
                                    ]
                                }
                            })
                        ]
                    }),
                    createStep({
                        title: '其他说明',
                        column: 1,
                        list: [
                            createField({
                                type: 'TextArea',
                                name: 'onboardNote',
                                label: '补充说明',
                                props: {rows: 3, placeholder: '如有特殊需求请填写'}
                            })
                        ]
                    })
                ]
            })
        ]
    }));

    return <div>
        <FormCreator value={schema} onChange={setSchema} />
        <div style={{marginTop: 16}}>
            <JsonView data={schema} theme="light" collapsedFrom={2} searchable={false} />
            <Text type="secondary">初始示例已包含表单分组、列表、表格列表、列表嵌套、选项切换、多字段、分步等模块。</Text>
        </div>
    </div>;
};

render(<BaseExample />);

```

- Schema 直接渲染表单
- 传入已有 Schema，用 SchemaRenderer 直接展示可提交表单（运行时，不经过编辑器）
- _FormCreator(@kne/current-lib_form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/current-lib_form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { SchemaRenderer, createBlock, createField } = _FormCreator;
const { default: JsonView } = _JsonView;
const { useState } = React;
const { Alert, Space, Typography } = antd;
const { Text } = Typography;

const demoSchema = {
  actions: {
    showSubmit: true,
    showReset: true,
    submitText: '提交报名',
    resetText: '清空'
  },
  blocks: [
    createBlock('formInfo', {
      title: '员工信息',
      subtitle: '传入 Schema，用 SchemaRenderer 直接渲染表单',
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
          name: 'gender',
          label: '性别',
          rule: 'REQ',
          props: {
            placeholder: '请选择',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ]
          }
        }),
        createField({
          type: 'DatePicker',
          name: 'joinDate',
          label: '入职日期',
          props: { placeholder: '请选择日期' }
        }),
        createField({
          type: 'TextArea',
          name: 'remark',
          label: '备注',
          block: true,
          description: '选填',
          props: { rows: 3, placeholder: '补充说明' }
        })
      ]
    })
  ]
};

const SchemaRenderExample = () => {
  const [result, setResult] = useState(null);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="运行时渲染"
        description={
          <span>
            业务侧 Schema 可带 <Text code>actions</Text>（FormCreator 左侧可配）。SchemaRenderer 会识别并居中渲染提交
            / 重置；也可用组件 props 覆盖。
          </span>
        }
      />
      <JsonView data={demoSchema} theme="light" collapsedFrom={2} searchable={false} />
      <SchemaRenderer
        schema={demoSchema}
        formProps={{
          onSubmit: data => setResult(data)
        }}
      />
      {result ? <JsonView data={result} theme="light" collapsedFrom={2} searchable={false} /> : null}
    </Space>
  );
};

render(<SchemaRenderExample />);

```

- 列表嵌套与选项切换
- 列表每一条里可再放分组或子列表；选项切换支持单选/多选，每个选项可添加填写项
- _FormCreator(@kne/current-lib_form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/current-lib_form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
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

```

- 扩展组件与校验规则
- 通过 preset({ rules, fields }) 一次扩展运行时校验、规则勾选面板与自定义填写项
- _FormCreator(@kne/current-lib_form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/current-lib_form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_ReactFormAntd(@kne/react-form-antd)[import * as _ReactFormAntd from "@kne/react-form-antd"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
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

```

- 生成提交数据 JSON Schema
- schemaToDataSchema：对照表单提交结果与生成的 data schema（含 hidden、object/list、choice oneOf/anyOf）
- _FormCreator(@kne/current-lib_form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/current-lib_form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
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

```

- 扩展添加模块旁的按钮
- extraToolbar：在「添加模块」和设置按钮后面追加自定义操作
- _FormCreator(@kne/current-lib_form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/current-lib_form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { useState } = React;
const { Alert, Button, Space, Typography, message } = antd;
const { Text } = Typography;

const ExtraToolbarExample = () => {
  const [schema, setSchema] = useState(() => ({
    ...defaultSchema(),
    blocks: [
      createBlock('formInfo', {
        title: '基本信息',
        column: 2,
        list: [
          createField({ type: 'Input', name: 'name', label: '姓名', rule: 'REQ', props: { placeholder: '请输入姓名' } }),
          createField({ type: 'Input', name: 'mobile', label: '手机号', rule: 'REQ TEL', props: { placeholder: '请输入手机号' } })
        ]
      })
    ]
  }));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="扩展工具栏按钮"
        description={
          <span>
            「添加模块」旁的设置按钮后面可通过 <Text code>extraToolbar</Text> 追加自定义按钮（ReactNode，或
            <Text code>{'({ schema }) => ReactNode'}</Text>）。
          </span>
        }
      />
      <FormCreator
        value={schema}
        onChange={setSchema}
        extraToolbar={
          <Space size={8}>
            <Button
              size="small"
              onClick={() => {
                const text = JSON.stringify(schema, null, 2);
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(text).then(() => message.success('已复制 Schema JSON'));
                } else {
                  message.info(text);
                }
              }}
            >
              复制 Schema
            </Button>
            <Button size="small" onClick={() => message.info('这里可以接导入 / 预览等业务逻辑')}>
              导入
            </Button>
          </Space>
        }
      />
    </Space>
  );
};

render(<ExtraToolbarExample />);

```

- 按 Schema 展示提交数据
- SchemaContent：根据搭建 Schema 与字段 valueSchema，用 InfoPage（同 FormInfo 布局）展示提交结果
- _FormCreator(@kne/current-lib_form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/current-lib_form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { SchemaRenderer, SchemaContent, createBlock, createField, createChoiceOption } = _FormCreator;
const { useState } = React;
const { Alert, Card, Col, Row, Space, Typography } = antd;
const { Text } = Typography;

const demoSchema = {
  actions: {
    showSubmit: true,
    showReset: true,
    submitText: '提交并展示',
    resetText: '重置'
  },
  blocks: [
    createBlock('formInfo', {
      title: '员工信息',
      subtitle: '提交后按各字段 valueSchema 展示',
      column: 2,
      list: [
        createField({ type: 'Input', name: 'name', label: '姓名', rule: 'REQ', props: { placeholder: '请输入姓名' } }),
        createField({ type: 'Input', name: 'mobile', label: '手机号', rule: 'REQ TEL', props: { placeholder: '请输入手机号' } }),
        createField({
          type: 'Select',
          name: 'gender',
          label: '性别',
          rule: 'REQ',
          props: {
            placeholder: '请选择',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ]
          }
        }),
        createField({ type: 'Switch', name: 'agree', label: '同意协议' }),
        createField({ type: 'DatePicker', name: 'joinDate', label: '入职日期', props: { placeholder: '请选择日期' } }),
        createField({ type: 'TextArea', name: 'remark', label: '备注', block: true, props: { rows: 2, placeholder: '选填' } })
      ]
    }),
    createBlock('list', {
      title: '项目经历',
      name: 'projects',
      addText: '添加项目',
      list: [
        createField({ type: 'Input', name: 'projectName', label: '项目名', rule: 'REQ' }),
        createField({ type: 'Input', name: 'role', label: '角色' })
      ]
    }),
    createBlock('choice', {
      title: '客户类型',
      mode: 'single',
      selectorName: 'customerType',
      selectorInData: true,
      options: [
        createChoiceOption({
          id: 'enterprise',
          title: '企业',
          list: [createField({ type: 'Input', name: 'companyName', label: '公司名', rule: 'REQ' })]
        }),
        createChoiceOption({
          id: 'person',
          title: '个人',
          list: [createField({ type: 'Input', name: 'idName', label: '姓名', rule: 'REQ' })]
        })
      ]
    })
  ]
};

const demoData = {
  name: '张三',
  mobile: '13800138000',
  gender: 'male',
  agree: true,
  joinDate: '2024-03-01',
  remark: '可远程办公',
  projects: [
    { projectName: '招聘门户改版', role: '前端' },
    { projectName: '表单搭建器', role: '全栈' }
  ],
  customerType: 'enterprise',
  companyName: '示例科技有限公司'
};

const SchemaContentExample = () => {
  const [data, setData] = useState(demoData);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="SchemaContent"
        description={
          <span>
            按搭建 Schema 的分组结构展示提交数据；字段展示形态由各填写项的 <Text code>valueSchema</Text>
            （如 string / number / boolean / enum）决定。布局与 FormInfo 相同，使用 InfoPage.Part + Content。
          </span>
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card size="small" title="填写并提交" bordered>
            <SchemaRenderer
              schema={demoSchema}
              formProps={{
                data: demoData,
                onSubmit: values => setData(values)
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="数据展示（SchemaContent）" bordered>
            <SchemaContent schema={demoSchema} data={data} />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

render(<SchemaContentExample />);

```

### API

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| value | object | - | 受控 Schema |
| defaultValue | object | - | 非受控初始 Schema |
| onChange | function(schema) | - | Schema 变更回调 |
| showPreview | boolean | true | 是否显示右侧预览 |
| className | string | - | 根节点类名 |
| formProps | object | {} | 透传给预览区 Form / FormSteps 的属性 |
| renderModal | function(props) | - | 自定义编辑弹窗渲染，透传给内部 FormModal（同 super-select / form-info） |
| extraToolbar | ReactNode \| function({ schema }) | - | 追加在「添加模块」与设置按钮后面的自定义按钮区 |

```js
<FormCreator
  value={schema}
  onChange={setSchema}
  extraToolbar={
    <Button size="small" onClick={() => {}}>复制 Schema</Button>
  }
/>

// 需要读当前 Schema 时用函数
<FormCreator extraToolbar={({ schema }) => <Button size="small">导出</Button>} />
```

#### SchemaRenderer

传入 Schema 直接渲染可填写表单（运行时，不经过编辑器）。示例见「Schema 直接渲染表单」。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 表单 Schema |
| formProps | object | {} | 透传给内部 `Form`（如 `onSubmit`、`data`） |
| preview | boolean | false | 预览态（字段预览行为） |
| className | string | - | 根 Form 类名 |
| bodyClassName | string | - | 字段区域（`.schema-body`）额外 className，便于外部改样式 |
| footerClassName | string | - | Footer 操作区（`.schema-actions`）额外 className |
| buttonFooter | boolean | false | 为 true 时用 `@kne/button-group` 的 `ButtonFooter` 包裹 Footer（移动端贴底）；默认关闭 |
| buttonFooterProps | object | - | 透传给 `ButtonFooter`（如 `placement`、`target`、`className`） |
| children | ReactNode | - | 追加到表单内容与操作区之间 |
| showActions | boolean | true | 是否展示提交/重置操作区（默认开启，可不传） |
| actions | ReactNode \| false | - | 自定义操作区；不传则按 Schema `actions` / 默认居中「提交/重置」；`false` 隐藏 |
| showSubmit | boolean | - | 覆盖 Schema；不传则读 `schema.actions.showSubmit`（默认 true） |
| showReset | boolean | - | 覆盖 Schema；不传则读 `schema.actions.showReset`（默认 true） |
| submitText | string | - | 覆盖 Schema；不传则读 `schema.actions.submitText` 或「提交」 |
| resetText | string | - | 覆盖 Schema；不传则读 `schema.actions.resetText` 或「重置」 |
| submitButtonProps | object | - | 与 Schema 合并后透传给 `SubmitButton` |
| resetButtonProps | object | - | 与 Schema 合并后透传给 `ResetButton` |

```js
import { SchemaRenderer } from '@kne/form-creator';

// 默认居中提交 / 重置
<SchemaRenderer schema={schema} formProps={{ onSubmit: console.log }} />

// 定制文案与按钮属性
<SchemaRenderer
  schema={schema}
  submitText="保存"
  resetText="清空"
  submitButtonProps={{ size: 'large' }}
  formProps={{ onSubmit: console.log }}
/>

// 完全自定义操作区
<SchemaRenderer schema={schema} actions={<MyButtons />} />

// 不显示操作按钮
<SchemaRenderer schema={schema} showActions={false} />
// 或
<SchemaRenderer schema={schema} actions={false} />

// 字段区 / Footer 自定义 className；移动端 Footer 贴底（默认关闭）
<SchemaRenderer
  schema={schema}
  bodyClassName="my-form-fields"
  footerClassName="my-form-footer"
  buttonFooter
  buttonFooterProps={{ placement: 'bottom' }}
  formProps={{ onSubmit: console.log }}
/>
```

#### SchemaRendererInner

只渲染 Schema 区块内容，**不包外层 Form**，便于放入业务已有 `Form` 内。操作区相关 props 与 `SchemaRenderer` 相同。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 表单 Schema |
| preview | boolean | false | 预览态 |
| className | string | - | 包在表单区块外层的 className（可选） |
| children | ReactNode | - | 追加内容 |
| showActions | boolean | true | 是否展示提交/重置操作区（默认开启，可不传） |
| actions / showSubmit / showReset / submitText / resetText / \*ButtonProps | - | - | 同 SchemaRenderer |
| bodyClassName / footerClassName / buttonFooter / buttonFooterProps | - | - | 同 SchemaRenderer |

```js
import { SchemaRendererInner } from '@kne/form-creator';
import { Form, SubmitButton } from '@kne/form-info';

<Form onSubmit={console.log}>
  <SchemaRendererInner schema={schema} />
</Form>

// 不展示按钮区，自行放按钮
<Form onSubmit={console.log}>
  <SchemaRendererInner schema={schema} showActions={false} />
  <SubmitButton>提交</SubmitButton>
</Form>
```

#### SchemaContent

按搭建 Schema 的分组结构展示**已提交数据**（只读）。字段展示形态由各填写项的 `valueSchema` 决定（boolean → 是/否，enum → 选项文案，日期按 `format`）。布局与 FormInfo 相同，使用 `@kne/info-page` 的 Part + Content。示例见「按 Schema 展示提交数据」。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 搭建 Schema |
| data | object | - | 提交数据；为 `null` / `undefined` 时展示空状态 |
| className | string | - | 根节点类名 |
| empty | ReactNode | - | 自定义空状态；不传则用默认 Empty |

`SchemaContentInner` 只渲染分组内容，**不包**外层 `InfoPage`，便于放入业务已有详情页。

```js
import { SchemaContent, SchemaContentInner } from '@kne/form-creator';

<SchemaContent schema={schema} data={submitData} />

<InfoPage>
  <SchemaContentInner schema={schema} data={submitData} />
</InfoPage>
```

#### Schema 结构

```js
{
  actions?: {
    showSubmit?: boolean,   // 默认 true
    showReset?: boolean,    // 默认 true
    showCancel?: boolean,   // 默认 false（可选取消按钮）
    submitText?: string,    // 空则用「提交」
    resetText?: string,     // 空则用「重置」
    cancelText?: string,    // 空则用「取消」
    align?: 'center' | 'start' | 'end', // 默认 center
    gap?: number,           // 按钮间距，默认 16
    submitButtonProps?: object,
    resetButtonProps?: object,
    cancelButtonProps?: object
  },
  blocks: [{
    id: string,
    kind: 'formInfo' | 'list' | 'tableList' | 'multiField' | 'object' | 'choice' | 'steps',
    title?, subtitle?, column?, gap?, bordered?, important?,
    name?, label?, addText?, maxLength?, minLength?, fieldType?, autoStep?,
    mode?, selectorName?, selectorInData?, discriminator?,
    list?: [{ id, type, name, label, tips?, description?, rule?, block?, hidden?, props? }],
    itemBlocks?: Block[], // list：列表项内子模块
    blocks?: Block[], // formInfo / object：子模块
    options?: [{ id, title, list?, blocks?: Block[] }], // choice
    items?: [{ id, title, column, list: [...], blocks?: Block[] }] // steps 专用
  }]
}
```

`actions` 由 FormCreator 顶部「添加模块」旁的设置按钮弹窗配置，写入 Schema；`SchemaRenderer` 会读取并渲染居中操作按钮（组件 props 可覆盖 Schema）。设置按钮后面可用 `extraToolbar` 追加自定义按钮。
#### 区块类型

| kind | 说明 | 主要参数 |
|------|------|----------|
| formInfo | 表单信息区块 | title, subtitle, column, gap, bordered, list, **blocks** |
| list | 动态列表 | name, title, important, bordered, maxLength, list, **itemBlocks** |
| tableList | 表格列表 | name, title, bordered, maxLength, list（不支持子模块） |
| object | 对象分组 | name, title, column, gap, list（字段名渲染为 `name.field`）, **blocks** |
| choice | 选项分支 | title, **mode**(`single`\|`multiple`), **minLength** / **maxLength**（仅多选：最少/最多选几项）, selectorName, selectorInData, options[{ title, list, **blocks** }] |
| multiField | 同类型多值 | name, label, fieldType, addText（不支持子模块） |
| steps | 步骤表单 | title, subtitle, bordered, autoStep, items[{ title, column, list, **blocks** }] |

`choice`：顶部同一条选项 UI；`single` 只挂载当前选项内容，`multiple` 平铺所有选中项。多选时可配置 `minLength` / `maxLength` 限制最少、最多选择几个（提交时校验；达到上限后未选项禁用）。JSON Schema 的 oneOf/anyOf 可分别映射为 `mode: 'single'/'multiple'`。`allOf` 无需独立 kind，展开为多个 sibling blocks 即可。

兼容旧版：若仅有顶层 `list` 且无 `blocks`，会自动迁移为一个 `formInfo` 区块。

#### 字段类型

基础：Input、TextArea、InputNumber、Switch、Checkbox、DatePicker  
选择：Select、RadioGroup、CheckboxGroup、SuperSelect、SuperSelectPlus

#### 工具方法

- `createBlock(kind)` / `createStep()` / `createChoiceOption()` / `normalizeSchema(schema)`
- `schemaToDataSchema(schema)` 根据搭建 Schema 生成**提交数据**的 JSON Schema（见下节）
- `SchemaContent` / `SchemaContentInner` 按 Schema + 字段 `valueSchema` 只读展示提交数据
- `preset({ rules, fields })` 一次注册扩展规则与填写项（推荐）
- `parseRuleString(rule)` / `buildRuleString(config)` 校验规则字符串解析/组装

#### schemaToDataSchema

将搭建 Schema 转为描述表单提交数据形状的 JSON Schema（`type: 'object'`）。

```js
import { schemaToDataSchema } from '@kne/form-creator';

const dataSchema = schemaToDataSchema(schema);
// dataSchema.properties / required / oneOf|anyOf（choice）
```

| 搭建块 | 提交数据形状 |
|--------|----------------|
| formInfo | 字段摊平进当前 object |
| object | `properties[name]` = nested object（字段名为相对 name） |
| list / tableList | `properties[name]` = array of object |
| multiField | `properties[name]` = array，元素为 `fieldType` 的 valueSchema |
| steps | 各 step 字段/子块并入当前层 |
| choice（single） | `oneOf`：每支含 selector `const` + 该 option 字段 |
| choice（multiple） | 当前层 selector 为数组 + `anyOf` 各 option 字段支 |

说明：

- **hidden 字段仍进入** data schema（可提交）
- 字段值类型来自 registry 的 `valueSchema`；`rule` 含 `REQ` 时写入父 object 的 `required`（choice 支内同样生效）
- 扩展字段在 `preset` / `registerField` 中声明 `valueSchema`（对象或 `(field) => schema`）；未声明则回退 `{ type: 'string' }`

#### preset（推荐）

应用入口调用一次，同时完成：

1. **运行时校验**：合并进 `@kne/react-form-antd` 的 `RULES`
2. **编辑器规则面板**：写入「填写规则」勾选列表
3. **扩展填写项**：注册到字段类型 registry

内置规则 `REQ` / `TEL` / `EMAIL` 已内置，无需重复配置；传入同名 key 可覆盖运行时规则并更新编辑器 label。

```js
import { preset } from '@kne/form-creator';
import { Rate, Slider } from '@kne/react-form-antd';

preset({
  rules: {
    ID_CARD: {
      label: '身份证格式',
      reg: /^\d{17}[\dXx]$/,
      message: '%s格式不正确'
    },
    RATE_MIN: {
      label: '评分至少3星',
      validator: value => ({
        result: Number(value) >= 3,
        errMsg: Number(value) >= 3 ? '' : '评分至少 3 星'
      })
    }
  },
  fields: {
    Rate: {
      label: '评分',
      groupName: '评价组件',
      component: Rate,
      defaultProps: { count: 5 },
      propsSchema: [
        { name: 'count', label: '星星总数', type: 'number', min: 1, max: 10, defaultValue: 5 }
      ]
    }
  }
});
```

| 配置 | 类型 | 说明 |
|------|------|------|
| `rules` | `Record<string, RuleDef>` | key 为规则 token；`RuleDef` 含 `label` + `reg/message` 或 `validator` |
| `fields` | `Record<string, FieldDef>` | key 为字段 type；见下方 FieldDef |

**FieldDef** 常用字段：`label`、`component`、`groupName`、`defaultProps`、`propsSchema`、`valueSchema`、`hasOptions`、`hasFieldProps` 等。

- `valueSchema`：该类型**提交值**的 JSON Schema 片段；可为对象，或 `(field) => schema`（可按 props 细化）。供 `schemaToDataSchema` 使用；缺省回退 `{ type: 'string' }`。

扩展填写项时，用 `fields` 内的 `propsSchema` 声明可编辑的额外参数（写入字段 `props`），编辑器会按声明自动生成「填写项设置」表单：

```js
fields: {
  Rate: {
    label: '评分',
    component: Rate,
    valueSchema: { type: 'number' },
    propsSchema: [
      { name: 'count', label: '星星总数', type: 'number', min: 1, max: 10, defaultValue: 5 }
    ]
  },
  Slider: {
    label: '滑块',
    component: Slider,
    valueSchema: { type: 'number' },
    defaultProps: { min: 0, max: 100, step: 1 },
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
          { label: '下', value: 'bottom' }
        ]
      },
      { name: 'dots', label: '显示刻度点', type: 'boolean' }
    ]
  }
}
```

#### 扩展组件与校验（示例见「扩展组件与校验规则」）

使用 `preset({ rules, fields })` 即可，无需再单独调用 react-form-antd 的 `preset`。

`propsSchema` 项约定：

| 字段 | 说明 |
|------|------|
| name | 写入 `field.props` 的键名 |
| label | 编辑器展示名 |
| type | `string` \| `number` \| `boolean` \| `select` |
| placeholder | 输入提示（string/number/select） |
| defaultValue | 缺省值 |
| min / max | `type=number` 时的范围 |
| options | `type=select` 的选项 `{ label, value }[]` |

有 `propsSchema` 时会自动开启 `hasFieldProps`，无需再手写开关。

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
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"],_FormInfo(@kne/form-info)[import * as _FormInfo from "@kne/form-info"]

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
            createBlock('editableList', {
                title: '证书资质（行内编辑列表）',
                name: 'certificates',
                addText: '添加证书',
                list: [
                    createField({
                        type: 'Input',
                        name: 'certName',
                        label: '证书名称',
                        rule: 'REQ',
                        props: {placeholder: '请输入证书名称'}
                    }),
                    createField({
                        type: 'DatePicker',
                        name: 'issueDate',
                        label: '获得时间',
                        props: {placeholder: '请选择日期'}
                    })
                ]
            }),
            createBlock('editableList', {
                title: '岗位核心任务（行内编辑列表 + 嵌套）',
                name: 'tasks',
                addText: '添加任务',
                addPosition: 'top',
                minLength: 1,
                list: [
                    createField({
                        type: 'Input',
                        name: 'taskName',
                        label: '任务名称',
                        rule: 'REQ',
                        props: {placeholder: '请输入任务名称'}
                    }),
                    createField({
                        type: 'Select',
                        name: 'frequency',
                        label: '执行频率',
                        props: {
                            placeholder: '请选择',
                            options: [
                                {label: '每天', value: 'daily'},
                                {label: '每周', value: 'weekly'},
                                {label: '每月', value: 'monthly'}
                            ]
                        }
                    })
                ],
                itemBlocks: [
                    createBlock('list', {
                        title: '分析依据',
                        name: 'evidence',
                        addText: '添加依据',
                        list: [
                            createField({
                                type: 'Input',
                                name: 'source',
                                label: '来源',
                                props: {placeholder: '如：JD 原文'}
                            })
                        ]
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
            <Text type="secondary">初始示例已包含表单分组、列表、表格列表、行内编辑列表、列表嵌套、选项切换、多字段、分步等模块。</Text>
        </div>
    </div>;
};

render(<BaseExample />);


```

- Schema 直接渲染表单
- 传入已有 Schema，用 SchemaRenderer 直接展示可提交表单（运行时，不经过编辑器）
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

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
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

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
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_ReactFormAntd(@kne/react-form-antd)[import * as _ReactFormAntd from "@kne/react-form-antd"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: FormCreator, preset, defaultSchema, createBlock, createField } = _FormCreator;
const { Rate, Slider } = _ReactFormAntd;
const { default: JsonView } = _JsonView;
const { useRef, useState } = React;
const { Alert, Typography, Space } = antd;
const { Text, Paragraph } = Typography;

const applyPresetOnce = () => {
  // 勿放在模块顶层：modules-dev 会加载全部示例，顶层 preset 会污染其它示例的 Field Type 下拉
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
};

const PresetExtendExample = () => {
  const presetReady = useRef(false);
  if (!presetReady.current) {
    applyPresetOnce();
    presetReady.current = true;
  }

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
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

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
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"]

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
- SchemaContent：按 Schema + valueSchema 展示提交结果；含长题干问卷与约 480px 窄栏预览，核对上下排布不被 minWidth 撑乱
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"]

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
    createBlock('formInfo', {
      title: '111',
      subtitle: '长题干问卷（用于核对窄栏上下排布）',
      column: 1,
      list: [
        createField({
          type: 'RadioGroup',
          name: 'yearsInRole',
          label: '您在本岗位（人才招聘方向）的工作年限是？（单选题）',
          rule: 'REQ',
          props: {
            inline: true,
            options: [
              { label: 'A. 不到6个月', value: 'lt6m' },
              { label: 'B. 6个月-1年', value: '6m1y' },
              { label: 'C. 1-3年', value: '1to3y' },
              { label: 'D. 3年以上', value: 'gt3y' }
            ]
          }
        }),
        createField({
          type: 'RadioGroup',
          name: 'aiFrequency',
          label: '过去一个月，您使用AI工具（如ChatGPT、Kimi、Copilot、文心一言等）辅助工作的频率是？（单选题）',
          rule: 'REQ',
          props: {
            inline: false,
            options: [
              { label: 'A. 每天都在用', value: 'daily' },
              { label: 'B. 每周几次', value: 'weekly' },
              { label: 'C. 偶尔使用', value: 'rarely' },
              { label: 'D. 几乎不用', value: 'never' }
            ]
          }
        }),
        createField({
          type: 'CheckboxGroup',
          name: 'aiTasks',
          label: '目前您用AI辅助过以下哪些具体工作？（多选题）',
          props: {
            inline: false,
            options: [
              { label: 'A. 撰写或优化职位说明书/JD', value: 'jd' },
              { label: 'H. 其他（请在下方文本框中说明）', value: 'other' }
            ]
          }
        }),
        createField({
          type: 'TextArea',
          name: 'aiTasksOther',
          label: 'H. 其他（请在下方文本框中说明）',
          block: true,
          props: { rows: 2, placeholder: '选填说明' }
        }),
        createField({
          type: 'TextArea',
          name: 'workOpinion',
          label: '您对工作中使用AI工具的整体看法是？（开放题）',
          block: true,
          props: { rows: 3, placeholder: '请输入' }
        })
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
    createBlock('editableList', {
      title: '岗位核心任务（行内编辑列表）',
      name: 'tasks',
      addText: '添加任务',
      addPosition: 'top',
      list: [createField({ type: 'Input', name: 'taskName', label: '任务名称', rule: 'REQ' }), createField({ type: 'Input', name: 'frequency', label: '执行频率' })],
      itemBlocks: [
        createBlock('list', {
          title: '分析依据',
          name: 'evidence',
          list: [createField({ type: 'Input', name: 'source', label: '来源' })]
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
  remark: '可远程办公',
  yearsInRole: 'lt6m',
  aiFrequency: 'daily',
  aiTasks: ['jd', 'other'],
  aiTasksOther: '示例内容',
  workOpinion: '希望团队统一工具与规范，再逐步推广。',
  projects: [
    { projectName: '招聘门户改版', role: '前端' },
    { projectName: '表单搭建器', role: '全栈' }
  ],
  tasks: [
    { taskName: '梳理招聘需求', frequency: '每周', evidence: [{ source: 'JD 原文' }] },
    { taskName: '输出岗位画像', frequency: '每月' }
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
            决定。长题干采用 label 在上、值在下。RadioGroup / CheckboxGroup 支持 <Text code>inline</Text>
            （选项是否横向排列）；示例中「工作年限」为横向，「AI 频率 / 多选」为纵向。右侧窄栏约 480px 用于核对布局。
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
      <Card size="small" title="窄栏预览（模拟弹窗右栏 ~480px）" bordered style={{ maxWidth: 480 }}>
        <SchemaContent schema={demoSchema} data={data} />
      </Card>
    </Space>
  );
};

render(<SchemaContentExample />);


```

- FormInfo 包装为表单字段
- 用 form-info 的 FormModal + useDecorator 把 FormCreator 做成字段；复现外层 Part 嵌套导致模块标题变成二级标签
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],_FormInfo(@kne/form-info)[import * as _FormInfo from "@kne/form-info"],(@kne/form-info/dist/index.css)[import "@kne/form-info/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { default: FormInfo, FormModal, Input, hooks } = _FormInfo;
const { useState } = React;
const { Alert, Button, Space, Typography } = antd;
const { Text, Paragraph } = Typography;
const { useDecorator } = hooks;

/**
 * 业务侧常见写法：把 FormCreator 用 form-info 的 useDecorator 包成表单字段，
 * 再放进 FormModal / FormInfo。外层 Part（常 no-title）会套住内层 Schema 的 FormInfo Part，
 * InfoPage 会把内层标题渲染成「二级标签」胶囊样式。
 */
const FormCreatorField = props => {
  const render = useDecorator(Object.assign({ block: true }, props));
  return render(FormCreator);
};

const demoSchema = {
  ...defaultSchema(),
  blocks: [
    createBlock('formInfo', {
      title: '在校时间',
      bordered: true,
      column: 2,
      list: [
        createField({
          type: 'TextArea',
          name: 'multiLine',
          label: '多行文本',
          block: true,
          props: { placeholder: '请输入多行文本', rows: 3 }
        }),
        createField({
          type: 'Input',
          name: 'decimal',
          label: '小数点保留两位',
          props: { placeholder: '请输入小数点保留两位' }
        }),
        createField({
          type: 'Switch',
          name: 'enabled',
          label: '开关'
        }),
        createField({
          type: 'Select',
          name: 'select',
          label: '下拉选择',
          props: {
            placeholder: '请选择下拉选择',
            options: [
              { label: '选项 A', value: 'a' },
              { label: '选项 B', value: 'b' }
            ]
          }
        })
      ]
    })
  ]
};

const FormInfoFieldExample = () => {
  const [open, setOpen] = useState(false);
  const [schema, setSchema] = useState(demoSchema);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="warning"
        showIcon
        message="嵌套 Part：顶层模块自动重设一级标题"
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              业务里用 <Text code>FormModal</Text> + <Text code>FormInfo</Text> 包一层，再把 <Text code>FormCreator</Text>{' '}
              用 <Text code>useDecorator</Text> 做成字段时，外层 Part 会让内层模块标题变成二级胶囊。
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              Schema 顶层模块会自动挂上 <Text code>InfoPage.partRootClassName</Text>
              ，标题从一级色条重新起算；模块内再嵌套仍为二级。
            </Paragraph>
          </div>
        }
      />
      <Button type="primary" onClick={() => setOpen(true)}>
        打开业务弹窗（FormCreator 作字段）
      </Button>
      <FormModal
        title="编辑表单配置"
        open={open}
        onCancel={() => setOpen(false)}
        width={960}
        formProps={{
          data: { name: '示例项目', schema },
          onSubmit: data => {
            setSchema(data.schema || demoSchema);
            return true;
          }
        }}
      >
        {/* 无 title → Part.no-title，内层 Schema 的 FormInfo 标题会走 InfoPage 二级标签样式 */}
        <FormInfo
          column={1}
          list={[
            <Input key="name" name="name" label="配置名称" rule="REQ" />,
            <FormCreatorField key="schema" name="schema" label="表单搭建" block />
          ]}
        />
      </FormModal>
    </Space>
  );
};

render(<FormInfoFieldExample />);


```

- 语言切换(全屏)
- FormCreator locale prop 切换中/英；检查内置 Field Type 分组与选项、列表类型 Tag、Select/DatePicker 占位，以及 Schema 多语言文案随语言切换
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"],remoteLoader(@kne/remote-loader)

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { createWithRemoteLoader } = remoteLoader;
const { useState } = React;
const { Radio, Space, Typography, Alert } = antd;

const { Text, Paragraph } = Typography;

const languages = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
];

const demoSchema = () => ({
  ...defaultSchema(),
  blocks: [
    createBlock('formInfo', {
      title: { 'zh-CN': '基本信息', 'en-US': 'Basic Info' },
      column: 2,
      list: [
        createField({
          type: 'Input',
          name: 'name',
          label: { 'zh-CN': '姓名', 'en-US': 'Name' },
          rule: 'REQ'
        }),
        createField({
          type: 'Input',
          name: 'email',
          label: { 'zh-CN': '邮箱', 'en-US': 'Email' },
          rule: 'EMAIL LEN-6-30'
        }),
        createField({
          type: 'Select',
          name: 'city',
          label: { 'zh-CN': '城市', 'en-US': 'City' },
          props: {
            options: [
              { label: { 'zh-CN': '上海', 'en-US': 'Shanghai' }, value: 'sh' },
              { label: { 'zh-CN': '北京', 'en-US': 'Beijing' }, value: 'bj' }
            ]
          }
        }),
        createField({
          type: 'DatePicker',
          name: 'birthday',
          label: { 'zh-CN': '生日', 'en-US': 'Birthday' }
        })
      ]
    })
  ]
});

/**
 * 通过 FormCreator 的 locale prop 切换语言，检查：
 * - 编辑器壳层文案（Add Section / Field Type 等）
 * - 内置 Field Type 分组与选项（Single-line Text / Dropdown）
 * - 左侧列表字段类型 Tag、Select/DatePicker 默认占位
 * - Schema 内多语言文案（{ 'zh-CN', 'en-US' }）随 locale 切换；languages 决定编辑时有哪几栏输入
 * - 内置校验（EMAIL / TEL / LEN）错误提示随 locale 切换
 * - DatePicker 面板等 antd 内置文案由外层 PureGlobal 的 preset.locale 决定
 *
 * 注意：扩展字段（Rate/Slider）若曾打开过「preset 扩展」示例，会残留中文 label；
 * 那是全局 registry 污染，不在本示例内重注册（避免热更新循环）。
 */
const LocaleSwitchExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [locale, setLocale] = useState('en-US');
  const [schema, setSchema] = useState(demoSchema);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="Language switch"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            Toggle locale, then open <Text code>Edit Field</Text> and check built-in <Text strong>Field Type</Text> groups/options, type tags, and Select/DatePicker placeholders.
          </Paragraph>
        }
      />
      <Radio.Group
        optionType="button"
        buttonStyle="solid"
        value={locale}
        onChange={e => setLocale(e.target.value)}
        options={languages}
      />
      <PureGlobal key={locale} preset={{ locale }}>
        <FormCreator locale={locale} languages={languages} value={schema} onChange={setSchema} />
      </PureGlobal>
    </Space>
  );
});

render(<LocaleSwitchExample />);


```

- 固定填写项
- 字段设置 locked: true 后不可编辑、删除或移动，所在模块位置固定；适合业务依赖的固定字段
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { useState } = React;
const { Alert, Space, Typography } = antd;
const { Text } = Typography;

const LockedFieldExample = () => {
  const [schema, setSchema] = useState(() => ({
    ...defaultSchema(),
    blocks: [
      createBlock('formInfo', {
        title: '面试评价',
        column: 1,
        list: [
          createField({
            type: 'RadioGroup',
            name: 'recommendation',
            label: '是否通过',
            rule: 'REQ',
            locked: true,
            props: {
              options: [
                { label: '通过', value: 'pass' },
                { label: '待定', value: 'hold' },
                { label: '不通过', value: 'reject' }
              ]
            }
          }),
          createField({ type: 'InputNumber', name: 'score', label: '综合评分（1-5）', rule: 'REQ', locked: true, props: { min: 1, max: 5 } }),
          createField({ type: 'TextArea', name: 'strengths', label: '优势', block: true, props: { rows: 3 } }),
          createField({ type: 'TextArea', name: 'notes', label: '备注', block: true, props: { rows: 3 } })
        ]
      }),
      createBlock('formInfo', {
        title: '补充信息',
        column: 2,
        list: [createField({ type: 'Input', name: 'expectedSalary', label: '期望薪资', props: { placeholder: '请输入期望薪资' } })]
      })
    ]
  }));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="固定填写项"
        description={
          <span>
            字段设置 <Text code>locked: true</Text> 后不可编辑、删除或移动，其他字段也不能换到它前面；所在模块（含步骤、选项）不可删除、不可移动。适合「是否通过」「综合评分」这类业务依赖的固定字段。
          </span>
        }
      />
      <FormCreator value={schema} onChange={setSchema} />
    </Space>
  );
};

render(<LockedFieldExample />);


```

- 超长文案(全屏)
- 模块标题、字段 label、选项、步骤标题均为超长文本并叠加固定/隐藏/整行标签，检查编辑器列表与预览的换行和省略
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField, createStep } = _FormCreator;
const { useState } = React;
const { Alert, Space, Typography } = antd;
const { Text } = Typography;

const LongLabelExample = () => {
  const [schema, setSchema] = useState(() => ({
    ...defaultSchema(),
    blocks: [
      createBlock('formInfo', {
        title: '候选人面试综合评价表（适用于技术岗位、产品岗位以及跨部门协作岗位的多轮面试场景）',
        subtitle: '请面试官在面试结束后 24 小时内完成填写，评价结果将同步给招聘负责人、用人部门负责人以及 HRBP 作为录用决策依据',
        column: 2,
        list: [
          createField({
            type: 'RadioGroup',
            name: 'recommendation',
            label: '综合以上所有面试环节的表现，您是否推荐该候选人进入下一轮面试或直接发放录用通知',
            rule: 'REQ',
            locked: true,
            props: {
              options: [
                { label: '强烈推荐，候选人能力明显超出岗位要求，建议尽快推进后续流程', value: 'pass' },
                { label: '待定，需要结合其他面试官意见或补充一轮面试后再做决定', value: 'hold' },
                { label: '不推荐，候选人在核心能力项上与岗位要求存在明显差距', value: 'reject' }
              ]
            }
          }),
          createField({
            type: 'InputNumber',
            name: 'score',
            label: '综合评分（1-5 分，请结合专业能力、沟通表达、文化契合度与成长潜力综合打分）',
            rule: 'REQ',
            locked: true,
            props: { min: 1, max: 5 }
          }),
          createField({
            type: 'Input',
            name: 'expectedSalaryAndAvailableDateAndOtherRemarks',
            label: '候选人期望薪资、最快到岗时间以及其他需要招聘负责人特别关注的事项说明',
            hidden: true,
            props: { placeholder: '例如：期望 35K × 15 薪，最快一个月后到岗，需要确认是否接受出差' }
          }),
          createField({
            type: 'Select',
            name: 'interviewRound',
            label: '本次面试所属轮次（如为加面或交叉面，请选择最接近的轮次并在备注中说明）',
            props: {
              options: [
                { label: '第一轮：业务部门技术或专业能力面试', value: 'first' },
                { label: '第二轮：部门负责人综合面试', value: 'second' },
                { label: '终面：HRBP 与高管联合面试', value: 'final' }
              ]
            }
          }),
          createField({
            type: 'TextArea',
            name: 'strengthsAndWeaknesses',
            label: '请详细描述候选人在本轮面试中展现出的主要优势、明显短板以及对岗位胜任力的整体判断依据',
            block: true,
            props: { rows: 3 }
          })
        ]
      }),
      createBlock('steps', {
        title: '分步骤填写的超长模块标题：第一步填写基础评价，第二步填写补充说明与附件',
        items: [
          createStep({
            title: '第一步：基础评价信息（包括专业能力、沟通表达与团队协作等维度）',
            column: 1,
            list: [createField({ type: 'Input', name: 'stepRemark', label: '对候选人专业能力与过往项目经验真实性的核实情况说明', props: {} })]
          }),
          createStep({
            title: '第二步：补充说明',
            column: 1,
            list: [createField({ type: 'TextArea', name: 'stepNotes', label: '其他补充说明', props: { rows: 2 } })]
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
        message="超长文案"
        description={
          <span>
            模块标题、副标题、字段 label、选项文案、步骤标题均为超长文本，并叠加 <Text code>locked</Text> / <Text code>hidden</Text> / <Text code>block</Text>{' '}
            标签，用于检查编辑器列表与右侧预览的换行、省略与对齐。
          </span>
        }
      />
      <FormCreator value={schema} onChange={setSchema} />
    </Space>
  );
};

render(<LongLabelExample />);


```

- 条件显示(全屏)
- 字段配置 visibleWhen：按其他字段的值（等于、属于其一、多选包含、数值比较、正则匹配，支持且/或组合）决定是否显示，隐藏时不校验并清空值
- _FormCreator(@kne/form-creator)[import * as _FormCreator from "@kne/form-creator"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField, schemaToDataSchema } = _FormCreator;
const { useState } = React;
const { Alert, Collapse, Space, Typography } = antd;
const { Text } = Typography;

const ConditionalFieldExample = () => {
  const [schema, setSchema] = useState(() => ({
    ...defaultSchema(),
    blocks: [
      createBlock('formInfo', {
        title: '面试评价',
        column: 1,
        list: [
          createField({
            type: 'RadioGroup',
            name: 'recommendation',
            label: '是否通过',
            rule: 'REQ',
            props: {
              options: [
                { label: '通过', value: 'pass' },
                { label: '待定', value: 'hold' },
                { label: '不通过', value: 'reject' }
              ]
            }
          }),
          createField({
            type: 'TextArea',
            name: 'rejectReason',
            label: '不通过原因',
            rule: 'REQ',
            block: true,
            props: { rows: 3 },
            visibleWhen: { logic: 'and', conditions: [{ field: 'recommendation', operator: 'eq', value: 'reject' }] }
          }),
          createField({ type: 'InputNumber', name: 'score', label: '综合评分（1-5）', rule: 'REQ', props: { min: 1, max: 5 } }),
          createField({
            type: 'TextArea',
            name: 'improvement',
            label: '改进建议',
            block: true,
            props: { rows: 3 },
            visibleWhen: { logic: 'and', conditions: [{ field: 'score', operator: 'lte', value: 2 }] }
          }),
          createField({
            type: 'CheckboxGroup',
            name: 'dimensions',
            label: '考察维度',
            props: {
              options: [
                { label: '专业能力', value: 'skill' },
                { label: '沟通表达', value: 'communication' },
                { label: '管理能力', value: 'management' }
              ]
            }
          }),
          createField({
            type: 'InputNumber',
            name: 'teamSize',
            label: '带过的团队规模（人）',
            rule: 'REQ',
            props: { min: 1 },
            visibleWhen: { logic: 'and', conditions: [{ field: 'dimensions', operator: 'includesAny', value: ['management'] }] }
          }),
          createField({ type: 'Input', name: 'interviewerEmail', label: '面试官邮箱' }),
          createField({
            type: 'Input',
            name: 'referrer',
            label: '内部推荐人',
            visibleWhen: { logic: 'and', conditions: [{ field: 'interviewerEmail', operator: 'regex', value: '@leapin\\.ai$', flags: 'i' }] }
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
        message="条件显示"
        description={
          <span>
            字段配置 <Text code>visibleWhen</Text> 后，满足条件才显示：选「不通过」出现「不通过原因」；评分 ≤ 2 出现「改进建议」；考察维度勾选「管理能力」出现「团队规模」；面试官邮箱匹配 <Text code>/@leapin\.ai$/i</Text> 出现「内部推荐人」。隐藏的字段不参与校验，已填的值会被清空。在编辑弹窗的「条件显示」中可修改条件。
          </span>
        }
      />
      <FormCreator value={schema} onChange={setSchema} />
      <Collapse
        items={[
          {
            key: 'data-schema',
            label: 'schemaToDataSchema 输出（条件字段不进 required，description 附条件说明）',
            children: <pre style={{ margin: 0, maxHeight: 360, overflow: 'auto' }}>{JSON.stringify(schemaToDataSchema(schema), null, 2)}</pre>
          }
        ]}
      />
    </Space>
  );
};

render(<ConditionalFieldExample />);


```

- Schema 导入导出
- 复制 / 导出 / 导入收进圆形「更多」下拉，与扩展操作样式一致
- _FormCreator(@components/FormCreator),antd(antd)

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { useState } = React;
const { Alert, Space, Typography } = antd;
const { Text } = Typography;

const SchemaImportExportExample = () => {
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
        message="Schema 导入导出"
        description={
          <span>
            默认开启导入导出：复制、导出、导入（粘贴 / 剪贴板 / 文件）收进「添加模块」旁圆形「更多」下拉，样式与扩展操作一致。传{' '}
            <Text code>schemaImportExport={'{false}'}</Text> 可关闭。
          </span>
        }
      />
      <FormCreator.Field
        value={schema}
        onChange={setSchema}
        schemaImportExport={{ downloadFileName: 'questionnaire-schema.json' }}
      />
    </Space>
  );
};

render(<SchemaImportExportExample />);

```

- 模版列表与保存
- 左侧 FileSystemView；文件夹用 GroupFolder API（groupList/create/save/remove），模版用 list/saveTemplate
- _FormCreator(@components/FormCreator),antd(antd)

```jsx
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
          code: &#96;folder_${Date.now()}&#96;,
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
          id: &#96;tpl-${Date.now()}&#96;,
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

```

- 弹窗适配 components-core Modal
- 内部编辑弹窗默认使用 components-core Modal（固定标题/底部、内容滚动、移动端全屏）；通过 renderModal 可替换为 Drawer 等其它弹层
- _FormCreator(@components/FormCreator),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField, createChoiceOption } = _FormCreator;
const { createWithRemoteLoader } = remoteLoader;
const { useMemo, useState } = React;
const { Alert, Flex, Segmented, Typography } = antd;
const { Text } = Typography;

const createInterviewSchema = () => ({
  ...defaultSchema(),
  blocks: [
    createBlock('formInfo', {
      title: '候选人信息',
      subtitle: '面试官填写前请核对候选人基本资料',
      column: 2,
      list: [
        createField({ type: 'Input', name: 'candidateName', label: '候选人姓名', rule: 'REQ', props: { placeholder: '如：李雨桐' } }),
        createField({ type: 'Input', name: 'position', label: '应聘岗位', rule: 'REQ', props: { placeholder: '如：高级前端工程师' } }),
        createField({ type: 'DatePicker', name: 'interviewDate', label: '面试日期', rule: 'REQ' }),
        createField({
          type: 'Select',
          name: 'round',
          label: '面试轮次',
          rule: 'REQ',
          props: {
            options: [
              { label: '一面（技术）', value: 'tech' },
              { label: '二面（业务）', value: 'business' },
              { label: 'HR 面', value: 'hr' }
            ]
          }
        })
      ]
    }),
    createBlock('choice', {
      title: '面试结论',
      selectorName: 'conclusion',
      options: [
        createChoiceOption({
          title: '通过',
          list: [createField({ type: 'TextArea', name: 'highlight', label: '主要亮点', block: true, rule: 'REQ' })]
        }),
        createChoiceOption({
          title: '不通过',
          list: [createField({ type: 'TextArea', name: 'reason', label: '不通过原因', block: true, rule: 'REQ' })]
        })
      ]
    })
  ]
});

const ModalAdapterExample = createWithRemoteLoader({
  modules: ['components-core:Drawer@createDrawerRender']
})(({ remoteModules }) => {
  const [createDrawerRender] = remoteModules;
  const [schema, setSchema] = useState(createInterviewSchema);
  const [mode, setMode] = useState('modal');

  const renderDrawer = useMemo(() => {
    const renderDrawerBase = createDrawerRender({ placement: 'right', footerButtons: [], bodyScroll: true });
    // 宿主协议：onCancel → onClose，footer 函数需先执行；width 由 Drawer 自身决定（移动端全宽）
    return ({ formProps, saveText, autoClose, cancelText, onCancel, footer, width, ...props }) =>
      renderDrawerBase({
        ...props,
        onClose: onCancel,
        footer: typeof footer === 'function' ? footer() : footer
      });
  }, [createDrawerRender]);

  return (
    <Flex vertical gap={16}>
      <Alert
        type="info"
        showIcon
        message="弹窗适配 components-core"
        description={
          <span>
            本包装层默认把「编辑模块」「编辑填写项」「表单按钮」等内部弹窗统一渲染为 components-core 的 Modal：标题与底部按钮固定、内容区滚动，切到「手机」预览时全屏展示。
            需要换成侧滑抽屉等其它弹层时，传入 <Text code>renderModal</Text> 即可，例如配合 <Text code>components-core:Drawer@createDrawerRender</Text>。
          </span>
        }
      />
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { label: '默认（components-core Modal）', value: 'modal' },
          { label: '自定义 renderModal（Drawer）', value: 'drawer' }
        ]}
      />
      <FormCreator.Field
        key={mode}
        value={schema}
        onChange={setSchema}
        renderModal={mode === 'drawer' ? renderDrawer : undefined}
      />
    </Flex>
  );
});

render(<ModalAdapterExample />);

```

- 扩展添加模块旁的按钮
- extraToolbar 操作列表并入圆形「更多」下拉，与导入导出等扩展操作一致
- _FormCreator(@components/FormCreator),antd(antd)

```jsx
const { default: FormCreator, defaultSchema, createBlock, createField } = _FormCreator;
const { useState } = React;
const { Alert, Space, Typography, message } = antd;
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
            「添加模块」旁通过圆形「更多」下拉收纳扩展操作。传入 <Text code>extraToolbar</Text> 操作列表（或
            <Text code>{'({ schema }) => list'}</Text>
            ）会与导入导出、保存等一并进入下拉，与当前工具栏交互一致。
          </span>
        }
      />
      <FormCreator.Field
        value={schema}
        onChange={setSchema}
        extraToolbar={[
          {
            key: 'custom-action',
            children: '自定义操作',
            onClick: () => message.info('自定义业务按钮')
          }
        ]}
      />
    </Space>
  );
};

render(<ExtraToolbarExample />);

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
| languages | { value, label }[] | - | Schema 文案支持的语言，首项为基础语言；不传为单语言输入（见「多语言文案」） |

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
| languages | { value, label }[] | - | 多语言文案回退顺序，同 FormCreator；不传按 `zh-CN` → `en-US` |
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
| languages | { value, label }[] | - | 多语言文案回退顺序，同 FormCreator；不传按 `zh-CN` → `en-US` |
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

按搭建 Schema 的分组结构展示**已提交数据**（只读）。字段展示形态由各填写项 `valueSchema` 的 `type` / `format` / `display` 决定（boolean → 是/否，enum → 选项文案，日期按 `format`，对象按 `display`）。可用 `formatDisplayValue` 覆盖。布局与 FormInfo 相同，使用 `@kne/info-page` 的 Part + Content。示例见「按 Schema 展示提交数据」。

| 属性 | 类型 | 默认值 | 说明 |
|----|----|-----|----|
| schema | object | - | 搭建 Schema |
| data | object | - | 提交数据；为 `null` / `undefined` 时展示空状态 |
| className | string | - | 根节点类名 |
| empty | ReactNode | - | 自定义空状态；不传则用默认 Empty |
| languages | { value, label }[] | - | 多语言文案回退顺序，同 FormCreator；不传按 `zh-CN` → `en-US` |

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
// LocaleText = string | { [language: string]: string }，如 { 'zh-CN': '姓名', 'en-US': 'Name' }，title / label 等展示文案均可用（见「多语言文案」）
{
  actions?: {
    showSubmit?: boolean,   // 默认 true
    showReset?: boolean,    // 默认 true
    showCancel?: boolean,   // 默认 false（可选取消按钮）
    submitText?: LocaleText,    // 空则用「提交」
    resetText?: LocaleText,     // 空则用「重置」
    cancelText?: LocaleText,    // 空则用「取消」
    align?: 'center' | 'start' | 'end', // 默认 center
    gap?: number,           // 按钮间距，默认 16
    submitButtonProps?: object,
    resetButtonProps?: object,
    cancelButtonProps?: object
  },
  blocks: [{
    id: string,
    kind: 'formInfo' | 'list' | 'tableList' | 'editableList' | 'multiField' | 'object' | 'choice' | 'steps',
    title?, subtitle?, column?, gap?, bordered?, important?,
    name?, label?, addText?, addPosition?, maxLength?, minLength?, fieldType?, autoStep?,
    mode?, selectorName?, selectorInData?, discriminator?,
    list?: [{ id, type, name, label, tips?, description?, rule?, block?, hidden?, locked?, visibleWhen?, props? }],
    itemBlocks?: Block[], // list / editableList：列表项内子模块
    blocks?: Block[], // formInfo / object：子模块
    options?: [{ id, title, list?, blocks?: Block[] }], // choice
    items?: [{ id, title, column, list: [...], blocks?: Block[] }] // steps 专用
  }]
}
```

`actions` 由 FormCreator 顶部「添加模块」旁的设置按钮弹窗配置，写入 Schema；`SchemaRenderer` 会读取并渲染居中操作按钮（组件 props 可覆盖 Schema）。设置按钮后面可用 `extraToolbar` 追加自定义按钮。

字段 `locked: true` 为固定填写项：编辑器中不可编辑、删除或移动，其他字段也不能与其交换位置；包含锁定字段的模块、步骤、选项不可删除、不可移动。渲染与提交不受影响。工具方法 `isFieldLocked(field)`、`blockHasLockedField(block)` 可用于业务侧判断。

#### 条件显示（visibleWhen）

字段可配置 `visibleWhen`，表单中其他字段的值满足条件时才显示该字段（编辑弹窗「条件显示」中配置）：

```js
{
  name: 'rejectReason',
  label: '不通过原因',
  rule: 'REQ',
  visibleWhen: {
    logic: 'and', // 'and' 全部满足 | 'or' 满足任一，缺省 and
    conditions: [{ field: 'recommendation', operator: 'eq', value: 'reject' }]
  }
}
```

| operator | 含义 | value |
|----------|------|-------|
| `eq` / `neq` | 等于 / 不等于 | 单值 |
| `in` | 属于其一 | 数组 |
| `includesAny` | 多选值包含任一 | 数组 |
| `empty` / `notEmpty` | 为空 / 不为空（`undefined`、`null`、`''`、`[]` 视为空） | 无 |
| `gt` / `gte` / `lt` / `lte` | 数值比较，非数字视为不满足 | 数字 |
| `regex` | 正则匹配；值为数组时任一项匹配即满足 | 正则源码（不含 `/`），可加 `flags`（仅 `i` `m` `s` `u`） |

规则：

- `field` 为提交数据中的路径，object 模块内字段带前缀，如 `contact.phone`
- 不满足条件的字段不渲染、不参与校验，已填的值会被清空；`SchemaContent` 按数据同样隐藏
- 列表类模块（list / tableList / editableList / multiField）内的字段既不能配置条件，也不能作为触发字段
- 条件引用的字段不存在、位于列表类模块内或正则无效时，该条件被忽略（编辑器显示「条件失效」）；全部条件失效时字段照常显示
- 编辑器会拦截循环依赖；触发字段改名时自动同步引用
- `schemaToDataSchema` 中条件字段不进入 `required`，并在 `description` 中附加条件说明
- 工具方法：`evaluateVisibleWhen(visibleWhen, formData, knownNames?)`、`evaluateCondition(condition, formData)`、`collectConditionFields(schema)`、`findConditionCycle(schema)`、`renameConditionReferences(schema, oldPath, newPath)`

顶层模块渲染时会自动挂上 `InfoPage.partRootClassName`，嵌入外层 FormInfo Part 时标题从一级重新起算；模块内再嵌套仍为二级胶囊。
#### 多语言文案

Schema 内的展示文案既可以是字符串，也可以是按语言区分的对象：`{ 'zh-CN': '姓名', 'en-US': 'Name' }`。`SchemaRenderer` / `SchemaRendererInner` / `SchemaContent` 渲染前按当前 `locale` 解析：字符串（旧格式）不论语言原样显示；多语言对象先取当前语言，取不到按 `languages` 顺序回退（未传 `languages` 时为 `zh-CN` → `en-US`），都没有内容为空。

| 支持多语言的位置 | 说明 |
|------|------|
| 字段 | label、tips、description、props.placeholder、props.options[].label / description、Switch 的 checkedChildren / unCheckedChildren |
| 模块 | title、subtitle、label、addText；tableList 列 title；choice 选项 title；steps 步骤 title |
| actions | submitText、resetText、cancelText |

支持哪些语言由调用方通过 `languages` 决定，组件不内置语言列表：

```jsx
const languages = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
];

<FormCreator languages={languages} value={schema} onChange={setSchema} />
<SchemaRenderer languages={languages} schema={schema} />
```

FormCreator 不传 `languages` 时为单语言输入（与改造前一致，存字符串）；传入后每种语言一栏输入，首项为基础语言：只填基础语言时存为字符串（与旧 Schema 兼容），填了其它语言才存为对象；选项值联动时取基础语言文案。数据标识（`name`、选项 `value`）与语言无关。

| 方法 / 组件 | 参数 | 返回值 | 说明 |
|------|------|------|------|
| localizeSchema | (schema, locale, languages?) | object | 深度解析多语言文案，返回新对象，不修改原 Schema |
| resolveLocaleText | (value, locale, languages?) | string | 解析单个文案；非多语言对象原样返回 |
| isLocaleText | (value) | boolean | 是否为多语言文案对象 |
| hasLocaleText | (value) | boolean | 文案（字符串或多语言）是否有内容 |
| LocaleInput / LocaleTextArea | 同 react-form-antd 字段，另可传 languages | - | 多语言文案表单字段 |
| LocaleTextControl | value, onChange, placeholder, multiline, compact, languages | - | 非表单场景的多语言输入控件 |
| LocaleTextProvider | languages, children | - | 给内部的 LocaleInput / LocaleTextControl 统一下发 languages（FormCreator 已内置） |

`SchemaRenderer` 创建表单时按当前 `locale` 传入表单级 `rules`，让内置 `TEL` / `EMAIL` / `LEN` 的错误提示随语言切换（`@kne/react-form` 内置提示为中文）；业务通过 `preset` 覆盖了同名规则时不替换，`formProps.rules` 优先级最高。`SchemaRendererInner` 嵌在外部表单中，规则由外部表单决定。

`schemaToDataSchema(schema, { locale, languages })` 与 `formatFieldDisplayValue(field, value, { formatMessage, locale, languages })` 也接受 `locale` / `languages`，回退规则同上。

#### 区块类型

| kind | 说明 | 主要参数 |
|------|------|----------|
| formInfo | 表单信息区块 | title, subtitle, column, gap, bordered, list, **blocks** |
| list | 动态列表 | name, title, important, bordered, maxLength, list, **itemBlocks** |
| tableList | 表格列表 | name, title, bordered, maxLength, list（不支持子模块） |
| editableList | 行内编辑列表（`@kne/form-info` EditableList）：每条只读摘要展示，点击编辑后单独表单填写、保存写回；父表单只注册一个字段，数据量大不卡顿 | name, title, column（编辑态列数）, bordered, addText, **addPosition**（`bottom` 底部追加 \| `top` 标题右侧插入首项 \| `both`，默认 `bottom`）, minLength, maxLength, list, **itemBlocks** |
| object | 对象分组 | name, title, column, gap, bordered, list（字段名渲染为 `name.field`）, **blocks** |
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
| list / tableList / editableList | `properties[name]` = array of object |
| multiField | `properties[name]` = array，元素为 `fieldType` 的 valueSchema |
| steps | 各 step 字段/子块并入当前层 |
| choice（single） | `oneOf`：每支含 selector `const` + 该 option 字段 |
| choice（multiple） | 当前层 selector 为数组 + `anyOf` 各 option 字段支 |

说明：

- **hidden 字段仍进入** data schema（可提交）
- 配置了 `visibleWhen` 的字段不进入 `required`，`description` 追加条件说明（按 `options.locale` 输出中文或英文）
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

**FieldDef** 常用字段：`label`、`component`、`groupName`、`defaultProps`、`propsSchema`、`valueSchema`、`formatDisplayValue`、`hasOptions`、`hasFieldProps` 等。

- `valueSchema`：该类型**提交值**的 JSON Schema 片段；可为对象，或 `(field) => schema`（可按 props 细化）。供 `schemaToDataSchema` 与 **SchemaContent 预览**使用；缺省回退 `{ type: 'string' }`。
  - `type`：`string` / `number` / `boolean` / `object` / `array`
  - `format`（可选）：`date` / `month` / `week` / `time` / `date-time` / `year` / `quarter` / `password` / `color` / `json`
  - `display`（可选）：`option`（取 label）/ `phone` / `file`（`components-core:File@FileLink`，图片用 `components-core:Image` 缩略图）/ `typed-date-range` / `date-to-today` / `html` / `money`
- `formatDisplayValue`：`(value, field, { formatMessage }) => string`，有则覆盖 `valueSchema` 默认预览。

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

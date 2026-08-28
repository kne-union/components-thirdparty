# JSONSchemaForm

### 概述

### 项目概述

`@kne/jsonschema-form` 将 **JSON Schema** 转换为 `@kne/form-creator` Schema，并用 `SchemaRenderer` 渲染可提交表单。v1 以 form-creator 为唯一渲染层，不再在本包内手写字段与 GroupList。

### 主要特性

- **结构映射**：嵌套 `object` → `object` 模块；对象数组 → `list` + `itemBlocks`；标量数组 → `multiField`
- **分支能力**：`oneOf` → `choice`（单选），`anyOf` → `choice`（多选）
- **组合与引用**：`allOf` 合并属性；同文档 `$ref`（`#/$defs`、`#/definitions`）内联
- **字段增强**：`format` 自动映射类型/规则；`x-widget` / `ui:widget` 自定义组件；`x-props` 透传 props
- **双入口**：组件 `JSONSchemaForm` 直接渲染，或 `jsonSchemaToFormCreatorSchema` 只做转换

### 使用场景

- 后端下发 JSON Schema，前端需要快速生成 Ant Design 表单
- 已有 form-creator 生态，希望用标准 JSON Schema 驱动同一套渲染
- 调试 / 中间层需要查看「JSON Schema → form-creator Schema」转换结果


### 示例(全屏)

#### 示例代码

- 基础简历表单
- JSON Schema 含嵌套 object、array→list/itemBlocks、标量数组→multiField；左侧 Schema、右侧表单预览
- _JsonschemaForm(@components/JSONSchemaForm)[import * as _JsonschemaForm from "@components/JSONSchemaForm"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],(@kne/form-info/dist/index.css)[import "@kne/form-info/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const resumeSchema = {
  title: '个人简历',
  description: '请填写完整的求职简历信息',
  type: 'object',
  required: ['name', 'gender', 'phone'],
  properties: {
    name: { type: 'string', title: '姓名', default: '张三' },
    gender: { type: 'string', title: '性别', enum: ['男', '女'], default: '男' },
    phone: { type: 'string', title: '手机号', format: 'tel' },
    email: { type: 'string', title: '邮箱', format: 'email' },
    age: { type: 'integer', title: '年龄', minimum: 16, maximum: 65 },
    isPLA: { type: 'boolean', title: '是否党员', default: false },
    desc: {
      type: 'string',
      title: '个人简介',
      minLength: 0,
      maxLength: 500,
      'x-textarea': true
    },
    education: {
      type: 'array',
      title: '教育经历',
      minItems: 1,
      'x-addText': '添加教育经历',
      items: {
        type: 'object',
        required: ['schoolName'],
        properties: {
          schoolName: { type: 'string', title: '学校名称' },
          type: { type: 'string', title: '招生类型', enum: ['统招', '非统招'] },
          major: { type: 'string', title: '专业' },
          time: {
            type: 'object',
            title: '就读时间',
            properties: {
              startTime: { type: 'string', title: '开始时间', format: 'date' },
              endTime: { type: 'string', title: '结束时间', format: 'date' }
            }
          },
          description: { type: 'string', title: '在校表现', maxLength: 500 }
        }
      }
    },
    language: {
      type: 'array',
      title: '语言能力',
      items: { type: 'string' },
      'x-addText': '添加语言'
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex gap={16} align="flex-start" wrap="wrap">
      <Flex vertical gap={8} style={panelStyle}>
        <Typography.Text strong>JSON Schema</Typography.Text>
        <JsonView data={resumeSchema} theme="light" collapsedFrom={2} searchable={false} />
      </Flex>
      <Flex vertical gap={8} style={panelStyle}>
        <Typography.Text strong>表单预览</Typography.Text>
        <JSONSchemaForm
          schema={resumeSchema}
          column={2}
          gap={24}
          onSubmit={async data => {
            console.log('resume submit', data);
            message.success('简历已提交（详见控制台）');
          }}
        />
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

```

- oneOf / anyOf 选项分支
- oneOf / anyOf 选项分支 + allOf 合并公共字段；左侧 Schema、右侧表单预览
- _JsonschemaForm(@components/JSONSchemaForm)[import * as _JsonschemaForm from "@components/JSONSchemaForm"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],(@kne/form-info/dist/index.css)[import "@kne/form-info/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const schema = {
  title: '客户开户',
  type: 'object',
  required: ['customerType'],
  properties: {
    customerType: {
      title: '客户类型',
      description: 'oneOf：只能选择一种客户类型',
      oneOf: [
        {
          title: '企业客户',
          type: 'object',
          required: ['companyName'],
          properties: {
            companyName: { type: 'string', title: '公司名称' },
            creditCode: { type: 'string', title: '统一社会信用代码' },
            contact: { type: 'string', title: '联系人', format: 'tel' }
          }
        },
        {
          title: '个人客户',
          type: 'object',
          required: ['idName'],
          properties: {
            idName: { type: 'string', title: '姓名' },
            idNo: { type: 'string', title: '证件号' }
          }
        }
      ]
    },
    tags: {
      title: '附加服务',
      description: 'anyOf：可同时选择多项服务包',
      anyOf: [
        {
          title: '发票服务',
          type: 'object',
          properties: {
            invoiceTitle: { type: 'string', title: '发票抬头' }
          }
        },
        {
          title: '邮寄服务',
          type: 'object',
          properties: {
            address: { type: 'string', title: '邮寄地址' }
          }
        }
      ]
    }
  },
  allOf: [
    {
      properties: {
        agreement: {
          type: 'boolean',
          title: '同意开户协议',
          default: false
        }
      },
      required: ['agreement']
    },
    {
      properties: {
        openDate: { type: 'string', title: '期望开户日期', format: 'date' },
        accountManager: { type: 'string', title: '客户经理工号' },
        remark: {
          type: 'string',
          title: '备注',
          maxLength: 200,
          'x-textarea': true
        }
      }
    }
  ]
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        <Typography.Text code>oneOf</Typography.Text> → choice 单选；{' '}
        <Typography.Text code>anyOf</Typography.Text> → choice 多选；{' '}
        <Typography.Text code>allOf</Typography.Text> 合并公共字段（协议、开户日期、备注等）到同一表单。
      </Typography.Paragraph>
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema</Typography.Text>
          <JsonView data={schema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>表单预览</Typography.Text>
          <JSONSchemaForm
            schema={schema}
            onSubmit={data => {
              console.log('choice submit', data);
              message.success('提交成功');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

```

- format 与自定义 widget
- format 自动映射字段类型/规则；x-widget / ui:widget 指定字段组件；左侧 Schema、右侧表单预览
- _JsonschemaForm(@components/JSONSchemaForm)[import * as _JsonschemaForm from "@components/JSONSchemaForm"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],(@kne/form-info/dist/index.css)[import "@kne/form-info/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const schema = {
  title: '联系与日程',
  type: 'object',
  required: ['email', 'mobile'],
  properties: {
    email: { type: 'string', title: '工作邮箱', format: 'email' },
    mobile: { type: 'string', title: '手机号', format: 'tel' },
    birthday: { type: 'string', title: '出生日期', format: 'date' },
    interviewAt: {
      type: 'string',
      title: '面试时间',
      format: 'date-time'
    },
    website: { type: 'string', title: '个人主页', format: 'uri' },
    score: {
      type: 'integer',
      title: '自评分数',
      minimum: 1,
      maximum: 10,
      'ui:widget': 'InputNumber'
    },
    remark: {
      type: 'string',
      title: '备注',
      maxLength: 200,
      'x-widget': 'TextArea',
      'x-props': { placeholder: '补充说明（x-widget=TextArea）' }
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        format 映射规则/组件；可用 <Typography.Text code>x-widget</Typography.Text> /{' '}
        <Typography.Text code>ui:widget</Typography.Text> 覆盖字段类型，
        <Typography.Text code>x-props</Typography.Text> 透传组件 props。
      </Typography.Paragraph>
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema</Typography.Text>
          <JsonView data={schema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>表单预览</Typography.Text>
          <JSONSchemaForm
            schema={schema}
            column={2}
            onSubmit={data => {
              console.log('format submit', data);
              message.success('校验通过并已提交');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

```

- $ref 与 allOf
- 同文档 $defs/$ref 内联展开；allOf 合并 properties 与 required；左侧 Schema、右侧表单预览
- _JsonschemaForm(@components/JSONSchemaForm)[import * as _JsonschemaForm from "@components/JSONSchemaForm"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],(@kne/form-info/dist/index.css)[import "@kne/form-info/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography } = antd;

const schema = {
  title: '收货信息',
  type: 'object',
  required: ['receiver'],
  properties: {
    receiver: { $ref: '#/$defs/personName' },
    phone: { $ref: '#/$defs/mobile' },
    region: { $ref: '#/definitions/region' }
  },
  allOf: [
    {
      properties: {
        city: { type: 'string', title: '城市' }
      },
      required: ['city']
    },
    {
      properties: {
        detail: { type: 'string', title: '详细地址', maxLength: 120 }
      }
    }
  ],
  $defs: {
    personName: { type: 'string', title: '收货人' },
    mobile: { type: 'string', title: '联系电话', format: 'tel' }
  },
  definitions: {
    region: {
      type: 'string',
      title: '所在地区',
      enum: ['华东', '华北', '华南', '西南']
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        同文档 <Typography.Text code>$ref</Typography.Text>（$defs / definitions）会内联展开；
        <Typography.Text code>allOf</Typography.Text> 会合并属性与必填后再生成表单。
      </Typography.Paragraph>
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema</Typography.Text>
          <JsonView data={schema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>表单预览</Typography.Text>
          <JSONSchemaForm
            schema={schema}
            onSubmit={data => {
              console.log('ref/allOf submit', data);
              message.success('提交成功');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

```

- 仅转换 Schema
- jsonSchemaToFormCreatorSchema 转换结果；左侧 JSON Schema 输入、右侧 form-creator Schema 输出
- _JsonschemaForm(@components/JSONSchemaForm)[import * as _JsonschemaForm from "@components/JSONSchemaForm"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { jsonSchemaToFormCreatorSchema } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { Flex, Typography, Button, message } = antd;
const { useMemo, useState } = React;

const sourceSchema = {
  title: '演示转换',
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', title: '姓名' },
    tags: { type: 'array', title: '标签', items: { type: 'string' } },
    profile: {
      type: 'object',
      title: '档案',
      properties: {
        city: { type: 'string', title: '城市' }
      }
    }
  }
};

const panelStyle = { flex: '1 1 360px', minWidth: 320 };

const BaseExample = () => {
  const creatorSchema = useMemo(() => jsonSchemaToFormCreatorSchema(sourceSchema, { column: 2, gap: 24 }), []);
  const [copied, setCopied] = useState(false);

  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        仅调用 <Typography.Text code>jsonSchemaToFormCreatorSchema</Typography.Text>
        ，得到可交给 form-creator <Typography.Text code>SchemaRenderer</Typography.Text> 的 Schema。
      </Typography.Paragraph>
      <Flex gap={8}>
        <Button
          type="primary"
          onClick={async () => {
            const text = JSON.stringify(creatorSchema, null, 2);
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              message.success('已复制转换结果');
            } catch (e) {
              console.log(text);
              message.info('已输出到控制台');
            }
          }}
        >
          复制转换结果
        </Button>
        {copied ? <Typography.Text type="success">已复制</Typography.Text> : null}
      </Flex>
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema（输入）</Typography.Text>
          <JsonView data={sourceSchema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>form-creator Schema（输出）</Typography.Text>
          <JsonView data={creatorSchema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<BaseExample />);

```

- 超复杂综合场景
- 企业项目立项：$ref/allOf、嵌套 object、list+itemBlocks、multiField、oneOf/anyOf、format/x-widget 等能力同屏演示
- _JsonschemaForm(@components/JSONSchemaForm)[import * as _JsonschemaForm from "@components/JSONSchemaForm"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],(@kne/form-info/dist/index.css)[import "@kne/form-info/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { message, Flex, Typography, Divider } = antd;
const { useState } = React;

/** 企业项目立项 — 覆盖 $ref、allOf、嵌套 object、list/itemBlocks、multiField、oneOf、anyOf、format、x-widget 等 */
const complexSchema = {
  title: '企业项目立项申请',
  description: '综合演示 JSON Schema 到 form-creator 的完整转换能力',
  type: 'object',
  required: ['projectName', 'applicant', 'contact'],
  allOf: [
    {
      properties: {
        compliance: {
          type: 'boolean',
          title: '已阅读并同意合规条款',
          default: false
        }
      },
      required: ['compliance']
    },
    {
      properties: {
        riskLevel: {
          type: 'string',
          title: '风险等级',
          enum: ['低', '中', '高'],
          default: '中'
        }
      }
    }
  ],
  properties: {
    projectName: {
      type: 'string',
      title: '项目名称',
      minLength: 2,
      maxLength: 80,
      default: '智能客服平台升级'
    },
    projectCode: { $ref: '#/$defs/projectCode' },
    priority: {
      type: 'string',
      title: '优先级',
      enum: ['P0', 'P1', 'P2', 'P3'],
      enumNames: ['紧急', '高', '中', '低'],
      default: 'P1'
    },
    budget: {
      type: 'number',
      title: '预算（万元）',
      minimum: 0,
      maximum: 9999,
      default: 120
    },
    launchDate: { type: 'string', title: '计划上线日期', format: 'date' },
    reviewAt: { type: 'string', title: '评审时间', format: 'date-time' },
    wikiUrl: { type: 'string', title: '方案文档', format: 'uri' },
    applicant: { $ref: '#/$defs/person' },
    contact: {
      type: 'object',
      title: '业务对接人',
      required: ['name', 'mobile'],
      properties: {
        name: { type: 'string', title: '姓名', default: '王芳' },
        mobile: { type: 'string', title: '手机号', format: 'tel' },
        email: { type: 'string', title: '邮箱', format: 'email' },
        region: { $ref: '#/definitions/region' }
      }
    },
    teamMembers: {
      type: 'array',
      title: '团队成员',
      minItems: 1,
      maxItems: 20,
      'x-addText': '添加成员',
      items: {
        type: 'object',
        required: ['name', 'role'],
        properties: {
          name: { type: 'string', title: '姓名' },
          role: {
            type: 'string',
            title: '角色',
            enum: ['产品', '前端', '后端', '测试', '设计', '运维']
          },
          allocation: {
            type: 'integer',
            title: '投入比例（%）',
            minimum: 1,
            maximum: 100,
            default: 50
          },
          skills: {
            type: 'array',
            title: '技能标签',
            items: { type: 'string' },
            'x-addText': '添加技能'
          },
          profile: {
            type: 'object',
            title: '成员档案',
            properties: {
              years: { type: 'integer', title: '工作年限', minimum: 0, maximum: 40 },
              level: {
                type: 'string',
                title: '职级',
                enum: ['初级', '中级', '高级', '专家']
              },
              intro: {
                type: 'string',
                title: '简介',
                maxLength: 200,
                'x-textarea': true
              }
            }
          }
        }
      }
    },
    techStack: {
      type: 'array',
      title: '技术栈',
      items: { type: 'string' },
      'x-addText': '添加技术'
    },
    deliveryMode: {
      title: '交付模式（oneOf）',
      description: '选择一种交付方式并填写对应字段',
      oneOf: [
        {
          title: '敏捷迭代',
          type: 'object',
          required: ['sprintWeeks'],
          properties: {
            sprintWeeks: {
              type: 'integer',
              title: '迭代周数',
              minimum: 1,
              maximum: 4,
              default: 2
            },
            ceremonies: {
              type: 'string',
              title: '仪式说明',
              'x-widget': 'TextArea',
              'x-props': { rows: 2, placeholder: '站会、评审、回顾…' }
            }
          }
        },
        {
          title: '瀑布交付',
          type: 'object',
          required: ['signOffDept'],
          properties: {
            milestones: {
              type: 'string',
              title: '里程碑计划',
              maxLength: 500,
              'x-textarea': true
            },
            signOffDept: { type: 'string', title: '验收部门' }
          }
        },
        {
          title: '混合模式',
          type: 'object',
          properties: {
            agileRatio: {
              type: 'integer',
              title: '敏捷占比（%）',
              minimum: 0,
              maximum: 100,
              'ui:widget': 'InputNumber'
            },
            waterfallRatio: {
              type: 'integer',
              title: '瀑布占比（%）',
              minimum: 0,
              maximum: 100,
              'ui:widget': 'InputNumber'
            }
          }
        }
      ]
    },
    addons: {
      title: '附加服务（anyOf）',
      description: '可同时勾选多项增值服务',
      anyOf: [
        {
          title: '安全审计',
          type: 'object',
          properties: {
            auditLevel: {
              type: 'string',
              title: '审计等级',
              enum: ['L1-基础', 'L2-标准', 'L3-增强']
            },
            pentest: { type: 'boolean', title: '含渗透测试', default: false }
          }
        },
        {
          title: '培训支持',
          type: 'object',
          properties: {
            trainingHours: { type: 'integer', title: '培训课时', minimum: 1 },
            audience: { type: 'string', title: '培训对象' }
          }
        },
        {
          title: '运维托管',
          type: 'object',
          properties: {
            sla: { type: 'string', title: 'SLA 等级', enum: ['99.5%', '99.9%', '99.99%'] },
            onCall: { type: 'boolean', title: '7×24 值守', default: true }
          }
        }
      ]
    },
    remark: {
      type: 'string',
      title: '补充说明',
      maxLength: 500,
      'x-widget': 'TextArea',
      'x-props': { rows: 4, placeholder: '其它需要审批委知晓的信息' }
    }
  },
  $defs: {
    projectCode: {
      type: 'string',
      title: '项目编号',
      default: 'PRJ-2026'
    },
    person: {
      type: 'object',
      title: '申请人信息',
      required: ['name', 'dept'],
      properties: {
        name: { type: 'string', title: '姓名', default: '李四' },
        dept: { type: 'string', title: '所属部门', default: '数字化中心' },
        employeeNo: { type: 'string', title: '工号', default: 'EMP10086' }
      }
    }
  },
  definitions: {
    region: {
      type: 'string',
      title: '所在区域',
      enum: ['华东', '华北', '华南', '西南', '海外']
    }
  }
};

const panelStyle = { flex: '1 1 420px', minWidth: 360 };

const ComplexExample = () => {
  const [result, setResult] = useState(null);

  return (
    <Flex vertical gap={16}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        综合场景：根级 formInfo 字段 + <Typography.Text code>$ref</Typography.Text> /{' '}
        <Typography.Text code>allOf</Typography.Text> + 嵌套 object + 列表内 object/multiField +{' '}
        <Typography.Text code>oneOf</Typography.Text> / <Typography.Text code>anyOf</Typography.Text> + 多种 format 与
        widget。
      </Typography.Paragraph>
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema</Typography.Text>
          <JsonView data={complexSchema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={{ ...panelStyle, flex: '1 1 480px' }}>
          <Typography.Text strong>表单预览</Typography.Text>
          <JSONSchemaForm
            schema={complexSchema}
            column={2}
            gap={24}
            onSubmit={async data => {
              setResult(data);
              console.log('complex submit', data);
              message.success('立项申请已提交（详见控制台与下方结果）');
            }}
          />
          {result ? (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <Typography.Text strong>提交结果</Typography.Text>
              <JsonView data={result} theme="light" collapsedFrom={2} searchable={false} />
            </>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<ComplexExample />);

```

- 超多层列表嵌套
- 多级 array/object 嵌套至讨论/回复/提及/链接；左侧 Schema、右侧带初始数据的表单
- _JsonschemaForm(@components/JSONSchemaForm)[import * as _JsonschemaForm from "@components/JSONSchemaForm"],_JsonView(@kne/json-view)[import * as _JsonView from "@kne/json-view"],(@kne/json-view/dist/index.css)[import "@kne/json-view/dist/index.css"],(@kne/form-creator/dist/index.css)[import "@kne/form-creator/dist/index.css"],(@kne/form-info/dist/index.css)[import "@kne/form-info/dist/index.css"],antd(antd)[import antd from "antd"]

```jsx
const { default: JSONSchemaForm } = _JsonschemaForm;
const { default: JsonView } = _JsonView;
const { Flex, Typography, Alert, message } = antd;

/** 部门 → … → 批注 → 讨论 → 回复 → 提及 → 链接 */
const nestedDeepSchema = {
  title: '组织架构',
  description: '多级 array / object 嵌套，用于验证深层 list 与 itemBlocks 渲染',
  type: 'object',
  properties: {
    departments: {
      type: 'array',
      title: '部门',
      minItems: 1,
      'x-addText': '添加部门',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', title: '部门名称' },
          teams: {
            type: 'array',
            title: '下属小组',
            minItems: 1,
            'x-addText': '添加小组',
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', title: '小组名称' },
                members: {
                  type: 'array',
                  title: '小组成员',
                  minItems: 1,
                  'x-addText': '添加成员',
                  items: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string', title: '姓名' },
                      role: { type: 'string', title: '角色' },
                      contact: {
                        type: 'object',
                        title: '联系资料',
                        properties: {
                          email: { type: 'string', title: '邮箱', format: 'email' },
                          city: { type: 'string', title: '城市' }
                        }
                      },
                      tasks: {
                        type: 'array',
                        title: '任务明细',
                        'x-addText': '添加任务',
                        items: {
                          type: 'object',
                          required: ['title'],
                          properties: {
                            title: { type: 'string', title: '任务' },
                            note: {
                              type: 'string',
                              title: '备注',
                              maxLength: 200,
                              'x-textarea': true
                            },
                            steps: {
                              type: 'array',
                              title: '子步骤',
                              'x-addText': '添加步骤',
                              items: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                  name: { type: 'string', title: '步骤名' },
                                  checks: {
                                    type: 'array',
                                    title: '检查项',
                                    'x-addText': '添加检查项',
                                    items: {
                                      type: 'object',
                                      required: ['label'],
                                      properties: {
                                        label: { type: 'string', title: '检查点' },
                                        remarks: {
                                          type: 'array',
                                          title: '备注',
                                          'x-addText': '添加备注',
                                          items: {
                                            type: 'object',
                                            properties: {
                                              content: {
                                                type: 'string',
                                                title: '说明',
                                                maxLength: 300,
                                                'x-textarea': true
                                              },
                                              attachments: {
                                                type: 'array',
                                                title: '附件',
                                                'x-addText': '添加附件',
                                                items: {
                                                  type: 'object',
                                                  required: ['name'],
                                                  properties: {
                                                    name: { type: 'string', title: '附件名称' },
                                                    files: {
                                                      type: 'array',
                                                      title: '文件',
                                                      'x-addText': '添加文件',
                                                      items: {
                                                        type: 'object',
                                                        required: ['fileName'],
                                                        properties: {
                                                          fileName: { type: 'string', title: '文件名' },
                                                          revisions: {
                                                            type: 'array',
                                                            title: '修订记录',
                                                            'x-addText': '添加修订',
                                                            items: {
                                                              type: 'object',
                                                              required: ['version'],
                                                              properties: {
                                                                version: { type: 'string', title: '版本号' },
                                                                summary: {
                                                                  type: 'string',
                                                                  title: '变更摘要',
                                                                  maxLength: 120,
                                                                  'x-textarea': true
                                                                },
                                                                annotations: {
                                                                  type: 'array',
                                                                  title: '批注',
                                                                  'x-addText': '添加批注',
                                                                  items: {
                                                                    type: 'object',
                                                                    properties: {
                                                                      author: { type: 'string', title: '批注人' },
                                                                      text: {
                                                                        type: 'string',
                                                                        title: '批注内容',
                                                                        maxLength: 200,
                                                                        'x-textarea': true
                                                                      },
                                                                      threads: {
                                                                        type: 'array',
                                                                        title: '讨论',
                                                                        'x-addText': '添加讨论',
                                                                        items: {
                                                                          type: 'object',
                                                                          required: ['topic'],
                                                                          properties: {
                                                                            topic: { type: 'string', title: '主题' },
                                                                            replies: {
                                                                              type: 'array',
                                                                              title: '回复',
                                                                              'x-addText': '添加回复',
                                                                              items: {
                                                                                type: 'object',
                                                                                required: ['content'],
                                                                                properties: {
                                                                                  content: {
                                                                                    type: 'string',
                                                                                    title: '回复内容',
                                                                                    maxLength: 200,
                                                                                    'x-textarea': true
                                                                                  },
                                                                                  mentions: {
                                                                                    type: 'array',
                                                                                    title: '提及',
                                                                                    'x-addText': '添加提及',
                                                                                    items: {
                                                                                      type: 'object',
                                                                                      required: ['user'],
                                                                                      properties: {
                                                                                        user: { type: 'string', title: '被提及人' },
                                                                                        links: {
                                                                                          type: 'array',
                                                                                          title: '链接',
                                                                                          'x-addText': '添加链接',
                                                                                          items: {
                                                                                            type: 'object',
                                                                                            properties: {
                                                                                              label: { type: 'string', title: '链接文案' },
                                                                                              url: {
                                                                                                type: 'string',
                                                                                                title: '链接地址',
                                                                                                format: 'uri'
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const defaultData = {
  departments: [
    {
      name: '研发中心',
      teams: [
        {
          name: '前端组',
          members: [
            {
              name: '张三',
              role: '工程师',
              contact: { email: 'zhangsan@example.com', city: '上海' },
              tasks: [
                {
                  title: '表单搭建',
                  note: '深层嵌套样式验收',
                  steps: [
                    {
                      name: '样式验收',
                      checks: [
                        {
                          label: '满宽色条',
                          remarks: [
                            {
                              content: '更深层级仍保持内容区宽度',
                              attachments: [
                                {
                                  name: '设计稿',
                                  files: [
                                    {
                                      fileName: 'layout-v3.pdf',
                                      revisions: [
                                        {
                                          version: 'v3.2',
                                          summary: '调整列表间距与色条',
                                          annotations: [
                                            {
                                              author: '李四',
                                              text: '更深层级仍保持内容区宽度',
                                              threads: [
                                                {
                                                  topic: '色条与间距',
                                                  replies: [
                                                    {
                                                      content: '建议统一为 4px 间距',
                                                      mentions: [
                                                        {
                                                          user: '王五',
                                                          links: [{ label: '设计规范', url: 'https://example.com/design' }]
                                                        }
                                                      ]
                                                    }
                                                  ]
                                                }
                                              ]
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const panelStyle = { flex: '1 1 420px', minWidth: 360 };

const NestedDeepExample = () => {
  return (
    <Flex vertical gap={16}>
      <Alert
        type="info"
        showIcon
        message="超多层列表嵌套"
        description="JSON Schema 通过 array of object 逐级嵌套：部门 → 小组 → 成员 → 任务 → 子步骤 → 检查项 → 备注 → 附件 → 文件 → 修订 → 批注 → 讨论 → 回复 → 提及 → 链接。"
      />
      <Flex gap={16} align="flex-start" wrap="wrap">
        <Flex vertical gap={8} style={panelStyle}>
          <Typography.Text strong>JSON Schema</Typography.Text>
          <JsonView data={nestedDeepSchema} theme="light" collapsedFrom={2} searchable={false} />
        </Flex>
        <Flex vertical gap={8} style={{ ...panelStyle, flex: '1 1 480px' }}>
          <Typography.Text strong>表单预览</Typography.Text>
          <JSONSchemaForm
            schema={nestedDeepSchema}
            column={2}
            gap={24}
            formProps={{ data: defaultData }}
            onSubmit={data => {
              console.log('nested-deep submit', data);
              message.success('提交成功（详见控制台）');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

render(<NestedDeepExample />);

```

### API

### JSONSchemaForm

将 JSON Schema 转为 form-creator Schema，并委托 `SchemaRenderer` 渲染。

#### 属性

| 属性名 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| schema | `object` | - | JSON Schema 根对象 |
| column | `number` | `2` | 转换时写入各模块的默认列数 |
| gap | `number` | `24` | 字段间距 |
| onSubmit | `(data, ...args) => any` | - | 提交回调（写入 `formProps.onSubmit`） |
| formProps | `object` | - | 透传给 SchemaRenderer / 底层 Form |
| rules | `object` | - | 额外校验规则，合并进 `formProps.rules` |
| footer | `ReactNode \| false` | - | `false` 隐藏操作区；传入节点时作为自定义 actions |
| actions | `ReactNode \| object \| false` | - | 同 form-creator `SchemaRenderer` 的 actions；`false` 隐藏操作区 |
| ...rest | `object` | - | 其余属性合并进 `formProps` |

### jsonSchemaToFormCreatorSchema

纯函数：JSON Schema → `@kne/form-creator` Schema（含 `blocks`）。

#### 参数

| 参数名 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| jsonSchema | `object` | - | JSON Schema |
| options.column | `number` | `2` | 默认列数 |
| options.gap | `number` | `24` | 默认间距 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `object` | form-creator Schema：`{ title, subtitle, column, gap, blocks, actions? }` |

### 转换对照

| JSON Schema | form-creator |
|-------------|--------------|
| object 标量字段 | `formInfo` / `object` 的 `list` |
| 嵌套 object | `object`（可再挂 `blocks`） |
| array of object | `list` + `itemBlocks` |
| array of 标量 | `multiField` |
| oneOf | `choice`（`mode: 'single'`） |
| anyOf | `choice`（`mode: 'multiple'`） |
| allOf | 合并 `properties` / `required` 后再转 |
| 同文档 `$ref` | 内联展开 |
| format / x-widget / ui:widget | 字段类型与规则 |

### resolveRef / mergeAllOf / fieldFromSchema

底层转换工具，一般无需直接使用；需要定制转换流水线时可单独导入。

| 导出 | 描述 |
|------|------|
| `resolveRef(schema, root)` | 解析同文档 `$ref` |
| `mergeAllOf(schema, root)` | 合并 `allOf` |
| `fieldFromSchema(name, schema, options?)` | 单个属性 → form-creator field |
| `FORMAT_FIELD_MAP` | format → 字段类型/规则映射表 |

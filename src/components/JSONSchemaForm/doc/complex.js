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

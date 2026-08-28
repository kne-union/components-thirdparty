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

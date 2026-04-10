
# JSONEditor


### 概述

JSON数据编辑器，支持代码编辑与预览切换，可作为表单字段使用。


### 示例

#### 示例代码

- 基础用法
- 使用 JSONEditor.Field 直接渲染 JSON 编辑器，支持代码编辑和预览切换
- _JSONEditor(@components/JSONEditor),antd(antd)

```jsx
const { default: JSONEditor } = _JSONEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title } = Typography;

const initData = JSON.stringify(
  {
    name: '张三',
    department: '技术部',
    position: '高级前端工程师',
    skills: ['React', 'TypeScript', 'Node.js'],
    contact: {
      email: 'zhangsan@example.com',
      phone: '138-0000-0001'
    }
  },
  null,
  2
);

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>基础JSON编辑器</Title>
          <JSONEditor.Field value={content} onChange={setContent} />
          <Divider orientation="left">数据预览</Divider>
          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <pre style={{ margin: 0 }}>{content}</pre>
          </div>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

```

- 在Form中使用
- 作为表单字段嵌入 FormInfo 表单中，自动绑定数据
- _JSONEditor(@components/JSONEditor),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const { createWithRemoteLoader } = remoteLoader;
const { default: JSONEditor } = _JSONEditor;
const { Flex, Card, Space, Typography } = antd;
const { Title } = Typography;

const initContent = JSON.stringify(
  {
    projectName: '智能办公平台',
    version: '2.1.0',
    features: ['权限管理', '数据看板', '消息通知'],
    config: {
      theme: 'dark',
      language: 'zh-CN',
      pageSize: 20
    }
  },
  null,
  2
);

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>在Form中使用JSONEditor</Title>
          <Form data={{ name: '项目配置', content: initContent }}>
            <FormInfo
              column={1}
              list={[
                <Input name="name" label="配置名称" rule="REQ" />,
                <JSONEditor name="content" label="配置内容" />
              ]}
            />
          </Form>
        </Space>
      </Card>
    </Flex>
  );
});

render(<BaseExample />);

```


### API

|属性名|说明|类型|默认值|
|  ---  | --- | --- | --- |
|value|编辑器的JSON字符串值|string|-
|onChange|内容变化回调函数|function(value: string)|-

### JSONEditor.Field

直接使用的不带表单装饰器的纯UI组件，需手动传入 `value` 和 `onChange`。

### JSONEditor（默认导出）

通过 `createWithRemoteLoader` 包装的表单字段组件，在 FormInfo 表单中使用时自动通过 `useDecorator` 绑定表单上下文，支持 `name`、`label`、`rule` 等表单字段属性。


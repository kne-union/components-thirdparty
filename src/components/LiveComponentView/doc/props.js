const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography, Input, Form } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const RESULT_CONTENT =
  'ZKzDIm9H5FqhmrsBqbOSeTQj8bhDvZc-Qc1wCyox3v9X88SIaG85gIWfN1X314bVXXR-cEOzTTLVYAS9BjtTUpxkEJS4ssD86K8U2fiCozaToeMB5ZCCZWG5DotWmhOfvnPe51rqgHdwWUVpx24bPTTXD9hhHMbtbLpkSv8UOq3CS96n9H0zPc35fwO5Vk0SaQ1YGV7VI6nqFBPDIjID2haLHp6oMAu86PZh81_2ie2UzJd80yV0OGUGWJBT9yB5FU8AZQktaMmagj6JpGjLRyh6FKGPM9PSvq2zbOwUvE15jJzalQ_YP79pcewxglhy-tKk1xtqkvCEXx9rBVirsKcC3IFzV5pWwgedQsVJQdloEb9nydCIw_2LHzV8duxRylPkzd0vwxv3fBlRdZQ4KVG7';

const PropsExample = () => {
  const [headline, setHeadline] = useState('春季校招 · 简历已提交');
  const [subTitle, setSubTitle] = useState('HR 将在 3 个工作日内通过邮件通知面试安排。');
  const [actionLabel, setActionLabel] = useState('查看投递记录');

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 560 }}>
      <Card title="覆盖组件参数">
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          <Text code>LiveComponentView</Text> 的 <Text code>props</Text> 会覆盖 content 配置里的同名默认值，便于同一套模板在不同业务下复用。
        </Paragraph>
        <Form layout="vertical" style={{ marginBottom: 24 }}>
          <Form.Item label="主标题 headline">
            <Input value={headline} onChange={e => setHeadline(e.target.value)} />
          </Form.Item>
          <Form.Item label="副标题 subTitle">
            <Input value={subTitle} onChange={e => setSubTitle(e.target.value)} />
          </Form.Item>
          <Form.Item label="按钮文案 actionLabel">
            <Input value={actionLabel} onChange={e => setActionLabel(e.target.value)} />
          </Form.Item>
        </Form>
        <LiveComponentView
          content={RESULT_CONTENT}
          props={{
            headline,
            subTitle,
            actionLabel
          }}
        />
      </Card>
    </Space>
  );
};

render(<PropsExample />);

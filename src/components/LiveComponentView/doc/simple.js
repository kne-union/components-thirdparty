const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography } = antd;
const { Title, Paragraph } = Typography;

const RESULT_CONTENT =
  'ZKzDIm9H5FqhmrsBqbOSeTQj8bhDvZc-Qc1wCyox3v9X88SIaG85gIWfN1X314bVXXR-cEOzTTLVYAS9BjtTUpxkEJS4ssD86K8U2fiCozaToeMB5ZCCZWG5DotWmhOfvnPe51rqgHdwWUVpx24bPTTXD9hhHMbtbLpkSv8UOq3CS96n9H0zPc35fwO5Vk0SaQ1YGV7VI6nqFBPDIjID2haLHp6oMAu86PZh81_2ie2UzJd80yV0OGUGWJBT9yB5FU8AZQktaMmagj6JpGjLRyh6FKGPM9PSvq2zbOwUvE15jJzalQ_YP79pcewxglhy-tKk1xtqkvCEXx9rBVirsKcC3IFzV5pWwgedQsVJQdloEb9nydCIw_2LHzV8duxRylPkzd0vwxv3fBlRdZQ4KVG7';

const SimpleExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 560 }}>
      <Card>
        <Title level={4}>活动结果页</Title>
        <Paragraph type="secondary">
          仅使用 Antd 组件，不声明 scope。标题、副标题、按钮文案来自 content 内 props 默认值。
        </Paragraph>
        <LiveComponentView content={RESULT_CONTENT} />
      </Card>
    </Space>
  );
};

render(<SimpleExample />);

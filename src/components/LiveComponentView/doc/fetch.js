const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography } = antd;
const { Title, Paragraph, Text } = Typography;

const RESULT_CONTENT =
  'ZKzDIm9H5FqhmrsBqbOSeTQj8bhDvZc-Qc1wCyox3v9X88SIaG85gIWfN1X314bVXXR-cEOzTTLVYAS9BjtTUpxkEJS4ssD86K8U2fiCozaToeMB5ZCCZWG5DotWmhOfvnPe51rqgHdwWUVpx24bPTTXD9hhHMbtbLpkSv8UOq3CS96n9H0zPc35fwO5Vk0SaQ1YGV7VI6nqFBPDIjID2haLHp6oMAu86PZh81_2ie2UzJd80yV0OGUGWJBT9yB5FU8AZQktaMmagj6JpGjLRyh6FKGPM9PSvq2zbOwUvE15jJzalQ_YP79pcewxglhy-tKk1xtqkvCEXx9rBVirsKcC3IFzV5pWwgedQsVJQdloEb9nydCIw_2LHzV8duxRylPkzd0vwxv3fBlRdZQ4KVG7';

const FetchExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 560 }}>
      <Card>
        <Title level={4}>远程内容拉取</Title>
        <Paragraph type="secondary">
          <Text code>LiveComponentView.Fetch</Text> 基于 <Text code>@kne/react-fetch</Text>，传入内容短链{' '}
          <Text code>url</Text>（如 <Text code>{'{prefix}/content/{code}'}</Text>
          ）拉取配置后渲染；也可传 <Text code>loader</Text> 自行返回配置字符串。业务参数直接写在组件上（如{' '}
          <Text code>headline</Text>），与 <Text code>libs</Text> 等并列。
        </Paragraph>
        <LiveComponentView.Fetch
          loader={() => Promise.resolve(RESULT_CONTENT)}
          headline="通过 Fetch 渲染"
          subTitle="本示例用 loader 模拟内容短链返回的 text/plain 配置。"
        />
      </Card>
    </Space>
  );
};

render(<FetchExample />);

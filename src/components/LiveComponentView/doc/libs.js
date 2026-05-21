const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography } = antd;
const { Title, Paragraph, Text } = Typography;

const STATS_CONTENT =
  'RP7DIiD054PVvJ8RMuYf5j5Qse3emarN2bACo90Psv5a9cIcfJ44n8tLZGf2G1IfuCz22eAwQS6NiMcpwYj8L2f2T_SkphaVtmsG9RYYNA4YAgrmHVHLx15GJDcqRABFtcaStSSFHwF7jeb0Aj-cvI001xUs657r8Ypavo0C3PC3_F0RBhOe4EPHIp71ooPgKayn2zkfW1saMeSHObCJVMCJK675f6BMvFgmTplgTkBeFObUJGHDR3TeEI3OtvUPhBudF0Uhp4orMgtELYgpQskmlbvqd9bi2Bb_vatV5JKFktLVtwGj1SftKxsabk04U_ua241y_JouU4ewRydDtQZxaKJTvFXiSDuUTJlZ_jLqdLIUu3KZsDLbmybip-SB6YmlQf2VdzEWiBIJ3KkvQQ01yNDdt6yFBr_05WJBEiGln_5XRzm_-Oq_dVikE_VNjc7otpLzde4qv7h2bQWOX1gIbd1fEePV';

const LibsExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 480 }}>
      <Card>
        <Title level={4}>注入工具库</Title>
        <Paragraph type="secondary">
          通过 <Text code>libs=&#123;&#123; lodash, dayjs &#125;&#125;</Text> 将库注入运行环境，动态 JSX 中可直接使用
          <Text code>dayjs()</Text>、<Text code>_.sum()</Text> 等。
        </Paragraph>
        <LiveComponentView content={STATS_CONTENT} libs={{ lodash, dayjs }} />
      </Card>
    </Space>
  );
};

render(<LibsExample />);

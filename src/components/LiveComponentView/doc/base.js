const { default: LiveComponentView } = _LiveComponentView;
const { Card, Space, Typography, Alert } = antd;
const { Title, Paragraph, Text } = Typography;

// LiveComponentEditor 默认 Demo：员工信息采集（FormInfo + 可编辑列表）
const FORM_CONTENT =
  'xLLDQzj04FqhornoaHsdfo8iGngI4WY5DgMNRW-oF4xLh7U5j0eEGf0G2ad0E12tXb8ewGSr3Kro2A7uaZzZAVQ_AEiFHKgTXj9hT95sPjxRUSFJRW2Mu1Av11sAIyAjBVEgoAiFKZ6bQGH169OeByvpMSalCQoJ3NIbRPcCh9cE4SmzK6b224dGHDgIeH4uhd2y_70H4cPxqWXUZaepvVcgZQpYvPUvuql2pHeQ5DIB0c5c6Pb18Vf-61qqA13NPohzRF4fMLbyaYlavWe52hCbZVo5UHKPMWbr1HtJbJNaChN1OASpQ7So6r0Wmf6su5wcR_K4GvW-4-zlnHzF1pkT6Mt3P3xg598GXL2RZXgqjgBMIGQLX2Y4rw1NuHt25bwZjLuMzSUky1rIPi9QdwYqkKGNlRJ6wErv_-BBtR8eHDiV1jz-KaZwcmHkaKGXFczVVMwd49F0xOYzmtZlE6eSNxK-fN6PyByCupdMvRoBPdOE5VGirnuAJeqYRZRxbsVAE2D2HNx3nVaLsvDZArE8TjlzeqxyxYnkd52Oa2jJAzPxRzzx-t-z_OSHhq_SDxudxUgcGS529Pt2wEnzE3bwimDSzSirMpxofHIy53SFUjslnTdfsMdm1PDRoCO5KVDzVB6RWcUouqvdarRLJN5ZbRbJIg21Pma7GGzWaW4TB55p14SklPmbNDIJLAZ1y1fHzSD_KNrKi6hwJBvGOmKTUhz-zBhTtkLHl7qA6iXDHG-UT6s-1c4O_WO0';

const BaseExample = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 720 }}>
      <Card>
        <Title level={4}>信息采集表单</Title>
        <Paragraph type="secondary">
          下方区块由 <Text code>content</Text> 动态渲染，配置内含 <Text code>scope.FormInfo</Text> 远程模块。可在
          LiveComponentEditor 中编辑后复制新的编码替换本示例常量。
        </Paragraph>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="配置说明"
          description="解码后包含姓名、部门、兴趣等字段及可增删的列表行，默认标题为「个人信息」。"
        />
        <LiveComponentView content={FORM_CONTENT} libs={{ lodash, dayjs }} />
      </Card>
    </Space>
  );
};

render(<BaseExample />);

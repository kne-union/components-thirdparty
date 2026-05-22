const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;

const sampleOption = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
};

const encodedOption = encodeURIComponent(JSON.stringify(sampleOption));

const initData = `<h2>ECharts 图表示例</h2>
<p>点击工具栏 <strong>图表</strong> 按钮，在弹窗中用 JSONEditor 编辑 ECharts <code>option</code> 后插入。选中图表可拖拽调整大小，双击可再次编辑配置。</p>
<figure class="ck-echart" style="height:400px;">
  <div class="ck-echart-inner" data-echart-option="${encodedOption}" style="height:400px;"></div>
</figure>`;

const EchartExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>插入 ECharts 图表</Title>
            <Paragraph type="secondary">
              编辑区与预览区均通过 @components/Echart 渲染；配置以 JSON 存入 <code>data-echart-option</code>
            </Paragraph>
          </div>
          <CKEditor.Field value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<EchartExample />);

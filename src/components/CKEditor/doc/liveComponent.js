const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const initData = `<h2>
    交互组件示例
</h2>
<section class="component-box ck-live-component" data-live-component="xLLDIzn06FuhOIvUijcrfn9s5rIq259eBRqqFMGdipPrCXCc4ra90QKKjB2iuBOBKYZsWowLgWUHiXV_p2Rk_elEn4rCx6eflJgNvFru7kPvysGc090IZWW7EgWkKUOiaoRLv4lT8DKvmYrj2QEMie4Ojw69bJNJhGMp3q9HLiJAC0gtEKQrm6NKzRGa21LiUxmMlBXgBRHhJHjXozEMYUjpXPWEgXb0FWoWOBE1i0YZx_lHNbiac8zb-UdY4sLbyN6fKfgjL0nGhgjt4AyYZ636R27NPDmHEdFyupVzSQzVu1S1TRbDYLVOjbn10jDdudTRySSJWPrHDqpi8zq0MSe0eJeTDUvkHTtZ0YfB2TGrw6Lujww5LmYkDsZh4QE-gpGmXUkfI5jyI8QylCJexTde_ClVLOdExOFnjvy6oBQN9cvH95IVzIu_ztA8D74xOdS_tZsAsaUNtKzvN27z3xDuXbfyZY6pE0OBUP3PYTxS9E9EPtHnAbrpHIYvRrXOMn5sdVXOwD_fZGxxyVlJk7qiU2Raqj6IzTxOzyR-FsF_OSFhm_Qrxt6xkIbaGYIb2vd9iVimFNMB0rpr6uxDvttEAQd7dRtXu6krFBqw3RvW4eZmf27gV8ZFTtBmGdMoqtAsLNb9t8YAbmXGGN8Z03q0oPybNopKD7tCdyinYNjd-El7S30ONXp6soUYds-wCkjnPfCr48Ogy21r4s3ABSgGEYubOZnU2LA6zAmKXhy1">
    &nbsp;
</section>
<p>
    点击工具栏「交互组件」按钮，在弹窗中使用 LiveComponentEditor 编写组件，确认后以特殊标签插入文档。
</p>`;

const liveComponentConfig = {
  height: 400,
  libs: { lodash, dayjs },
  editor: {
    height: 560,
    libs: { lodash, dayjs },
    sites: [
      { host: 'localStorage:live-component-demo', name: '本地演示' },
      { host: 'localStorage:live-component-demo-2', name: '本地演示 2' }
    ],
    siteActionsOpen: true
  }
};

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>交互组件</Title>
            <Paragraph type="secondary">
              通过 <Text code>config.liveComponent</Text> 配置预览与插入弹窗（含多站点文件面板）；编辑区与
              CKEditor.Content 预览均通过 LiveComponentView 渲染。双击已插入组件可再次编辑。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              message: messageApi,
              liveComponent: liveComponentConfig
            }}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content liveComponent={liveComponentConfig}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

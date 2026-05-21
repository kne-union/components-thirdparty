const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;

const initData = `<h2>视频上传示例</h2><p>点击工具栏中的<span style="color: #1677ff;">视频按钮</span>，选择 <strong>mp4 / webm / mov</strong> 等文件即可插入编辑器。</p><p>未配置上传接口时，视频会以 base64 嵌入内容；配置 <code>videoUpload.upload</code> 或 <code>uploadAdapter.upload</code> 后走服务端上传。</p>`;

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>视频上传</Title>
            <Paragraph type="secondary">点击工具栏中的视频按钮上传视频文件，编辑器与预览均使用 HTML5 video 播放</Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              message: messageApi
            }}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

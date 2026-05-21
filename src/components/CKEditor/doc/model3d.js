const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Divider, message } = antd;
const { useState } = React;
const { Title, Paragraph } = Typography;
const { getPublicPath } = remoteLoader;

const initData = `<h2>3D模型上传示例</h2><p>点击工具栏中的<span style="color: #1677ff;">3D模型按钮</span>，选择 <strong>.glb</strong> 文件即可插入编辑器。</p><p>未配置上传接口时，模型会以 base64 嵌入内容；配置 <code>modelUpload.upload</code> 或 <code>uploadAdapter.upload</code> 后走服务端上传。
<figure class="ck-model3d" style="height:626px;">
    <div class="ck-model3d" style="height:626px;">
        <model-viewer style="height:626px;width:100%;" src="${getPublicPath('components-thirdparty')}/3d/NeilArmstrong.glb" alt="NeilArmstrong.glb" camera-controls="" auto-rotate="" loading="lazy"></model-viewer>
    </div>
</figure>
</p>`;

const BaseExample = () => {
  const [content, setContent] = useState(initData);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>3D模型上传</Title>
            <Paragraph type="secondary">点击工具栏中的 3D模型 按钮上传模型文件，编辑器与预览均使用 @google/model-viewer 渲染</Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{ message: messageApi }}
            model3d={{
              viewer: {
                autoRotate: true,
                cameraControls: true,
                loading: 'lazy'
              }
            }}
          />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content
            model3d={{
              viewer: {
                autoRotate: true,
                cameraControls: true,
                loading: 'lazy'
              },
              preview: { enableFullscreen: true }
            }}>
            {content}
          </CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Radio, Divider } = antd;
const { useState } = React;
const { Title } = Typography;

const CustomConfigExample = () => {
  const [toolbarType, setToolbarType] = useState('full');
  const [content, setContent] = useState(`<h2>自定义配置示例</h2>\n<p>根据选择的工具栏类型，显示不同的编辑功能。</p>`);

  const toolbarConfigs = {
    simple: {
      toolbar: {
        items: ['bold', 'italic', 'underline', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
      }
    },
    standard: {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'link',
          'blockQuote',
          'codeBlock'
        ]
      }
    },
    full: {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'link',
          'bulletedList',
          'numberedList',
          'todoList',
          'fontBackgroundColor',
          'fontColor',
          'fontSize',
          '|',
          'alignment',
          'pageBreak',
          'outdent',
          'indent',
          '|',
          'specialCharacters',
          'subscript',
          'superscript',
          '|',
          'imageUpload',
          'blockQuote',
          'insertTable',
          'codeBlock',
          'htmlEmbed',
          'highlight',
          'horizontalLine',
          '|',
          'selectAll',
          'removeFormat',
          'sourceEditing'
        ]
      }
    }
  };

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>自定义工具栏配置</Title>
          <Radio.Group value={toolbarType} onChange={(e) => setToolbarType(e.target.value)} buttonStyle="solid">
            <Radio.Button value="simple">简单</Radio.Button>
            <Radio.Button value="standard">标准</Radio.Button>
            <Radio.Button value="full">完整</Radio.Button>
          </Radio.Group>
          <CKEditor.Field key={toolbarType} config={toolbarConfigs[toolbarType]} value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content key={`preview-${toolbarType}`}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<CustomConfigExample />);

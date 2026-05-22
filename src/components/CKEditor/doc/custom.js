const { default: CKEditor } = _CKEditor;
const { Flex, Card, Space, Typography, Radio, Divider, Alert } = antd;
const { useState } = React;
const { Title } = Typography;

/** 与 CKEditor.Field 默认 config.toolbar.items 一致，代表「全部」档位 */
const FULL_TOOLBAR_ITEMS = [
  'undo',
  'redo',
  '|',
  'heading',
  'style',
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
  'model3dUpload',
  'videoUpload',
  'insertLiveComponent',
  'insertEchart',
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
];

/**
 * 简单：文字样式 + 基础排版（列表 / 对齐 / 缩进）
 * 标准：日常最常用（结构、列表、链接、对齐、图片、表格、代码块等）
 * 全部：组件默认工具栏全量能力
 */
const TOOLBAR_PRESETS = {
  simple: {
    label: '简单',
    hint: '文字样式与基础排版：加粗/斜体/下划线、列表、对齐、缩进',
    config: {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'alignment',
          'outdent',
          'indent',
          '|',
          'removeFormat'
        ]
      }
    }
  },
  standard: {
    label: '标准',
    hint: '最常用：标题、文字样式与链接、列表、对齐、图片、引用、表格、代码块',
    config: {
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
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'alignment',
          'outdent',
          'indent',
          '|',
          'imageUpload',
          'blockQuote',
          'insertTable',
          'codeBlock',
          '|',
          'removeFormat'
        ]
      }
    }
  },
  full: {
    label: '全部',
    hint: '开放默认工具栏全部功能（含预设样式、富媒体、源码编辑等）',
    config: {
      toolbar: {
        items: FULL_TOOLBAR_ITEMS
      }
    }
  }
};

const CustomConfigExample = () => {
  const [toolbarType, setToolbarType] = useState('simple');
  const [content, setContent] = useState(
    `<h2>自定义配置示例</h2>\n<p>切换下方档位，工具栏按钮数量会明显变化。</p>`
  );

  const preset = TOOLBAR_PRESETS[toolbarType];
  const toolbarItemCount = preset.config.toolbar.items.filter(item => item !== '|').length;

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>自定义工具栏配置</Title>
          <Radio.Group value={toolbarType} onChange={e => setToolbarType(e.target.value)} buttonStyle="solid">
            {Object.entries(TOOLBAR_PRESETS).map(([key, { label }]) => (
              <Radio.Button key={key} value={key}>
                {label}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Alert
            type="info"
            showIcon
            message={`当前：${preset.label}（${toolbarItemCount} 个工具按钮）`}
            description={preset.hint}
          />
          <CKEditor.Field key={toolbarType} config={preset.config} value={content} onChange={setContent} />
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content key={`preview-${toolbarType}`}>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<CustomConfigExample />);

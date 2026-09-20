const { default: CKEditor, EMAIL_STYLE_DEFINITIONS, EMAIL_TOOLBAR_ITEMS } = _CKEditor;
const { Flex, Card, Space, Typography, Divider } = antd;
const { useState } = React;
const { Title, Paragraph, Text } = Typography;

const templateVariableConfig = {
  variables: [
    { name: 'userName', label: '用户名' },
    { name: 'couponCode', label: '优惠码' },
    { name: 'companyName', label: '公司名' }
  ]
};

const templateConditionConfig = {
  operators: ['truthy', 'falsy', 'filled', 'empty', 'eq', 'neq'],
  allowElse: true,
  allowNesting: true
};

const initData = `<p>亲爱的<% if (userName == 'VIP') { %>尊贵的<%= userName %><% } else { %>朋友<% } %>，您好！</p><p>使用优惠码<% if (couponCode != null && couponCode !== '') { %><%= couponCode %>可享折扣<% } %>。</p>`;

const BaseExample = () => {
  const [content, setContent] = useState(initData);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Title level={4}>邮件模版条件</Title>
            <Paragraph type="secondary">
              工具栏「条件」插入行内**单条件**壳；选中后浮动条可编辑条件（弹窗内可「添加条件」做扁平且/或）、切换否则，或切成块级。块级里可以选标题和样式，也可以再套一层条件；切回行内时会去掉块级标签和回车换行，只保留文字、变量和仍为行内的嵌套条件。
              <Text code>getData</Text> 在条件最外层保留属性（含 <Text code>data-template-condition-clauses</Text> / <Text code>joiner</Text>），内部仍是 lodash <Text code>{'<% if %>'}</Text>。
            </Paragraph>
          </div>
          <CKEditor.Field
            value={content}
            onChange={setContent}
            config={{
              toolbar: { items: EMAIL_TOOLBAR_ITEMS },
              style: { definitions: EMAIL_STYLE_DEFINITIONS },
              templateVariable: templateVariableConfig,
              templateCondition: templateConditionConfig
            }}
          />
          <Divider orientation="left">getData / onChange 原始内容</Divider>
          <Text code style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
            {content}
          </Text>
          <Divider orientation="left">内容预览</Divider>
          <CKEditor.Content>{content}</CKEditor.Content>
        </Space>
      </Card>
    </Flex>
  );
};

render(<BaseExample />);

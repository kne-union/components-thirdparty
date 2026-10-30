const { default: TemplateEditor, renderTemplate } = _TemplateEditor;
const { Flex, Segmented, Typography } = antd;
const { useState } = React;

const variables = [
  { name: 'user.name', label: '用户姓名' },
  { name: 'user.level', label: '会员等级' },
  { name: 'couponCode', label: '优惠码' }
];

const condition = {
  operators: ['truthy', 'falsy', 'filled', 'empty', 'eq', 'neq'],
  allowElse: true,
  allowNesting: true
};

const samples = {
  vip: { label: 'VIP 会员', data: { user: { name: '李娜', level: 'VIP' }, couponCode: 'VIP2026' } },
  normal: { label: '普通会员', data: { user: { name: '陈强', level: '普通' }, couponCode: '' } }
};

const initContent = `<h2 class="email-title">双十一会员专享</h2>
<p class="email-lead">{% if user.level == 'VIP' %}尊敬的 VIP 会员 {{ user.name }}{% else %}亲爱的 {{ user.name }}{% endif %}，您好！</p>
<p class="email-text">{% if couponCode != blank %}您的专属优惠码 {{ couponCode }} 已到账，下单立减 200 元。{% else %}升级 VIP 即可领取专属优惠码。{% endif %}</p>
<p class="email-footer">活动时间：2026-11-01 至 2026-11-11</p>`;

const subject = '{{ user.name }}，您的双十一专属福利已送达';

const ConditionExample = () => {
  const [content, setContent] = useState(initContent);
  const [sample, setSample] = useState('vip');
  const { data } = samples[sample];
  return (
    <Flex vertical gap={12}>
      <Flex gap={8} align="center" wrap>
        <Typography.Text>预览示例数据：</Typography.Text>
        <Segmented value={sample} onChange={setSample} options={Object.entries(samples).map(([value, { label }]) => ({ value, label }))} />
      </Flex>
      <TemplateEditor.Field value={content} onChange={setContent} variables={variables} condition={condition} previewData={data} subject={subject} height={320} />
      <Typography.Text type="secondary">renderTemplate 渲染主题：{renderTemplate(subject, data)}</Typography.Text>
    </Flex>
  );
};

render(<ConditionExample />);

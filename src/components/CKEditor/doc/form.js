const { createWithRemoteLoader } = remoteLoader;
const { default: CKEditor } = _CKEditor;
const { Button, Flex, Typography } = antd;
const { useState } = React;
const { Paragraph, Text } = Typography;

const initData = `<h2>欢迎使用 CKEditor 5</h2><p>这是一个功能强大的富文本编辑器，支持：</p><ul>  <li><strong>文本格式</strong>：加粗、斜体、下划线、删除线等</li>  <li><strong>段落</strong>：标题、引用、代码块等</li>  <li><strong>列表</strong>：有序列表、无序列表、待办事项</li>  <li><strong>图片</strong>：上传、调整大小、设置样式</li>  <li><strong>表格</strong>：插入和编辑表格</li>  <li><strong>链接</strong>：插入和管理链接</li>  <li><strong>更多</strong>：水平线、分页符、特殊字符等</li></ul><p>尝试编辑上面的内容，体验各种编辑功能！</p>`;

const templateVariableConfig = {
  // 列表刻意加长，用于验收弹窗内变量下拉 max-height（约 280px / 40vh）与滚动
  variables: [
    { name: 'userName', label: '用户名' },
    { name: 'companyName', label: '公司名' },
    { name: 'email', label: '邮箱' },
    { name: 'phone', label: '手机号' },
    { name: 'address', label: '地址' },
    { name: 'orderNo', label: '订单号' },
    { name: 'productName', label: '产品名' },
    { name: 'productSku', label: '产品SKU' },
    { name: 'quantity', label: '数量' },
    { name: 'unitPrice', label: '单价' },
    { name: 'totalAmount', label: '总金额' },
    { name: 'discount', label: '折扣' },
    { name: 'couponCode', label: '优惠码' },
    { name: 'paymentMethod', label: '支付方式' },
    { name: 'shippingAddress', label: '收货地址' },
    { name: 'trackingNo', label: '物流单号' },
    { name: 'orderStatus', label: '订单状态' },
    { name: 'createdAt', label: '下单时间' },
    { name: 'paidAt', label: '支付时间' },
    { name: 'shippedAt', label: '发货时间' },
    { name: 'customerNote', label: '客户备注' },
    { name: 'salesName', label: '销售姓名' },
    { name: 'department', label: '所属部门' },
    { name: 'tenantName', label: '租户名称' },
    { name: 'rawHtml', label: '原始HTML', kind: 'escape' }
  ]
};

const modalToolbarItems = ['undo', 'redo', '|', 'bold', 'italic', '|', 'insertTemplateVariable', 'insertTemplateCondition', '|', 'sourceEditing'];

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:FormInfo@useFormModal']
})(({ remoteModules }) => {
  const [FormInfo, useFormModal] = remoteModules;
  const { Form } = FormInfo;
  const { Input } = FormInfo.fields;
  const formModal = useFormModal();
  const [modalResult, setModalResult] = useState('');

  const openModal = () => {
    const modalApi = formModal({
      title: '编辑内容',
      size: 'large',
      formProps: {
        data: { title: '文章标题', content: initData },
        onSubmit: data => {
          setModalResult(data?.content || '');
          modalApi.close();
        }
      },
      children: (
        <FormInfo
          column={1}
          list={[
            <Input name="title" label="标题" rule="REQ" />,
            <CKEditor
              name="content"
              label="内容"
              config={{
                toolbar: { items: modalToolbarItems },
                templateVariable: templateVariableConfig,
                templateCondition: {
                  operators: ['truthy', 'falsy', 'filled', 'empty', 'eq', 'neq'],
                  allowElse: true
                }
              }}
            />
          ]}
        />
      )
    });
  };

  return (
    <Flex vertical gap={16}>
      <Form data={{ title: '文章标题', content: initData }}>
        <FormInfo column={1} list={[<Input name="title" label="标题" rule="REQ" />, <CKEditor name="content" label="内容" />]} />
      </Form>
      <div>
        <Button type="primary" onClick={openModal}>
          useFormModal 中编辑
        </Button>
        {modalResult ? (
          <Paragraph style={{ marginTop: 12 }}>
            <Text type="secondary">弹窗提交内容：</Text>
            <Text code style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
              {modalResult}
            </Text>
          </Paragraph>
        ) : null}
      </div>
    </Flex>
  );
});

render(<BaseExample />);

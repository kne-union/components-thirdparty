const { default: DiffEditor } = _DiffEditor;

const original = `const calcOrderAmount = order => {
  const { items = [], coupon } = order;
  const total = items.reduce((sum, { price, quantity }) => sum + price * quantity, 0);
  if (coupon && total >= coupon.threshold) {
    return total - coupon.discount;
  }
  return total;
};

export default calcOrderAmount;
`;

const modified = `const calcOrderAmount = (order, { freeShipping = false } = {}) => {
  const { items = [], coupon, shippingFee = 0 } = order;
  const total = items.reduce((sum, { price, quantity }) => sum + price * quantity, 0);
  const shipping = freeShipping ? 0 : shippingFee;
  if (coupon && total >= coupon.threshold) {
    return total - coupon.discount + shipping;
  }
  return total + shipping;
};

export default calcOrderAmount;
`;

const BaseExample = () => {
  return <DiffEditor height={320} language="javascript" original={original} modified={modified} />;
};

render(<BaseExample />);

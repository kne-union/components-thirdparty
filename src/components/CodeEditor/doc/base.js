const { default: CodeEditor } = _CodeEditor;

const messyCode = `const calcOrderAmount=(order)=>{
const {items=[],coupon}=order;
  const total=items.reduce((sum,{price,quantity})=>sum+price*quantity,0);
if(coupon&&total>=coupon.threshold){return total-coupon.discount}
      return total;
};

export default calcOrderAmount;
`;

const BaseExample = () => {
  return <CodeEditor height={300} defaultLanguage="javascript" defaultValue={messyCode} />;
};

render(<BaseExample />);

const { default: LottiePlayer } = _LottiePlayer;
const { default: data } = _data;

console.log(data);

const BaseExample = () => {
  return <LottiePlayer animationData={data}/>;
};

render(<BaseExample />);

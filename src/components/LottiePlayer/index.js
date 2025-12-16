import lottie from 'lottie-web';
import { useEffect, useRef } from 'react';

const LottiePlayer = ({ path, animationData, loop = true, renderer = 'canvas', ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: ref.current,
      renderer,
      loop,
      autoplay: true,
      path,
      animationData
    });

    return () => {
      animation.destroy();
    };
  }, [path, animationData, renderer, loop]);
  return <div {...props} ref={ref} />;
};

export default LottiePlayer;

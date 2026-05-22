import lottie from 'lottie-web';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Spin } from 'antd';
import style from './style.module.scss';

const LottiePlayer = ({ path, animationData, loop = true, renderer = 'canvas', className, ...props }) => {
  const ref = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const animation = lottie.loadAnimation({
        container,
        renderer,
        loop,
        autoplay: true,
        path,
        animationData
      });

      // animationData 直接传入时数据已就绪，dataReady 在 loadAnimation 同步期间已触发
      // 此时事件监听器尚未添加，所以不会收到回调，需要直接关闭 loading
      if (animationData) {
        setIsLoading(false);
      } else {
        animation.addEventListener('dataReady', handleComplete);
        animation.addEventListener('dataFailed', handleError);
      }

      return () => {
        if (!animationData) {
          animation.removeEventListener('dataReady', handleComplete);
          animation.removeEventListener('dataFailed', handleError);
        }
        animation.destroy();
      };
    } catch (e) {
      setIsLoading(false);
      setHasError(true);
    }
  }, [path, animationData, renderer, loop, handleComplete, handleError]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {isLoading && (
        <div className={style['lottie-loading']}>
          <Spin />
        </div>
      )}
      {hasError && (
        <div className={style['lottie-error']}>
          Failed to load animation
        </div>
      )}
      <div ref={ref} className={style['lottie-container']} {...props} />
    </div>
  );
};

export default LottiePlayer;

import { useEffect, useRef, useState, useCallback } from 'react';
import classNames from 'classnames';
import { Spin } from 'antd';
import whenModelViewerReady from '../../common/loadModelViewer';
import style from './style.module.scss';

const ModelView = ({
  src,
  poster,
  alt = '3D model',
  autoRotate = false,
  cameraControls = true,
  disableZoom = false,
  loading = 'auto',
  reveal = 'auto',
  backgroundColor = 'transparent',
  shadowIntensity = 1,
  shadowSoftness = 1,
  exposure = 1,
  className,
  style: customStyle,
  ...props
}) => {
  const ref = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(null);
  }, []);

  const handleError = useCallback((event) => {
    setIsLoading(false);
    setHasError(event.detail?.error || new Error('Failed to load 3D model'));
  }, []);

  useEffect(() => {
    const viewer = ref.current;
    if (!viewer || viewer.modelViewer) {
      return;
    }

    whenModelViewerReady().then(() => {
      if (ref.current) {
        ref.current.modelViewer = true;
        if (typeof customElements !== 'undefined' && customElements.upgrade) {
          customElements.upgrade(ref.current);
        }
      }
    });
  }, []);

  useEffect(() => {
    const viewer = ref.current;
    if (!viewer) return;

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [handleLoad, handleError]);

  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setHasError(null);
    }
  }, [src]);

  return (
    <div className={classNames(style.modelViewContainer, className)} style={{ backgroundColor, ...customStyle }}>
      {isLoading && src && (
        <div className={style['loading-overlay']}>
          <Spin />
        </div>
      )}
      {hasError && (
        <div className={style['error-overlay']}>
          <span>{typeof hasError === 'string' ? hasError : hasError.message || 'Failed to load 3D model'}</span>
        </div>
      )}
      <model-viewer
        ref={ref}
        src={src}
        poster={poster}
        alt={alt}
        auto-rotate={autoRotate ? '' : undefined}
        camera-controls={cameraControls ? '' : undefined}
        disable-zoom={disableZoom ? '' : undefined}
        loading={loading}
        reveal={reveal}
        shadow-intensity={shadowIntensity}
        shadow-softness={shadowSoftness}
        exposure={exposure}
        {...props}
      />
    </div>
  );
};

export default ModelView;

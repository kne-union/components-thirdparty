import { useEffect, useRef } from 'react';
import classNames from 'classnames';
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

  useEffect(() => {
    if (!ref.current || ref.current.modelViewer) {
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

  return (
    <div className={classNames(style.modelViewContainer, className)} style={{ backgroundColor, ...customStyle }}>
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

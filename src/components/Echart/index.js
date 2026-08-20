import { getOrLoadRemote, getPublicPath } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useRef, useEffect, useMemo } from 'react';
import useResize from '@kne/use-resize';
import classNames from 'classnames';
import style from './style.module.scss';
import { buildWordCloudOption } from './WordCloud';

const loadedScripts = new Set();

const loadScriptOnce = src => {
  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (existing.getAttribute('data-status') === 'success' || existing.dataset.loaded === 'true') {
      loadedScripts.add(src);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => {
        loadedScripts.add(src);
        resolve();
      });
      existing.addEventListener('error', reject);
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      loadedScripts.add(src);
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const loadEcharts = async () => {
  const publicPath = getPublicPath('components-thirdparty');
  await getOrLoadRemote('echarts', '', `${publicPath}/echarts/echarts.js`);
  const echarts = window.echarts;
  await loadScriptOnce(`${publicPath}/echarts/extension/word-cloud.js`);
  if (echarts && window.wordCloudCustomSeriesInstaller) {
    echarts.use(window.wordCloudCustomSeriesInstaller);
  }
  return { echarts };
};

const loader = {
  loading: null,
  loader: loadEcharts
};

export const EchartCanvas = ({ data, option, className, ...props }) => {
  const instanceRef = useRef(null);
  const optionRef = useRef(option);
  optionRef.current = option;
  const ref = useResize(() => {
    if (instanceRef.current) {
      instanceRef.current.resize();
      if (ref.current && (ref.current.clientWidth > 0 && ref.current.clientHeight > 0) && optionRef.current) {
        instanceRef.current.setOption(optionRef.current);
      }
    }
  });
  const { echarts } = data;
  useEffect(() => {
    if (!echarts || !ref.current) {
      return;
    }
    instanceRef.current = echarts.init(ref.current);
    return () => {
      instanceRef.current && instanceRef.current.dispose();
      instanceRef.current = null;
    };
  }, [echarts, ref]);
  useEffect(() => {
    if (!instanceRef.current) {
      return;
    }
    if (ref.current && (ref.current.clientWidth === 0 || ref.current.clientHeight === 0)) {
      return;
    }
    instanceRef.current.setOption(option);
  }, [option, ref]);
  return <div className={classNames(style['echart-container'], className)} {...props} ref={ref} />;
};

const Echart = ({ loading, error, ...props }) => {
  return (
    <Fetch
      {...Object.assign({}, loader, { loading, error })}
      render={({ data }) => {
        return <EchartCanvas {...props} data={data} />;
      }}
    />
  );
};

const WordCloud = ({ data, tooltip = true, option, shape, sizeRange, rotationRange, rotationStep, gridSize, drawOutOfBound, keepAspect, shrinkToFit, maskImage, left, top, right, bottom, ...props }) => {
  const chartOption = useMemo(
    () =>
      buildWordCloudOption({
        data,
        tooltip,
        option,
        shape,
        sizeRange,
        rotationRange,
        rotationStep,
        gridSize,
        drawOutOfBound,
        keepAspect,
        shrinkToFit,
        maskImage,
        left,
        top,
        right,
        bottom
      }),
    [data, tooltip, option, shape, sizeRange, rotationRange, rotationStep, gridSize, drawOutOfBound, keepAspect, shrinkToFit, maskImage, left, top, right, bottom]
  );

  return <Echart {...props} option={chartOption} />;
};

Echart.WordCloud = WordCloud;

export { WordCloud, buildWordCloudOption };
export { normalizeWordCloudData } from './WordCloud';
export default Echart;

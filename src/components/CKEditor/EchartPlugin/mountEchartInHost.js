import { createElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadEcharts, EchartCanvas } from '@components/Echart';
import { DEFAULT_ECHART_OPTION } from './constants';
import { parseStoredOption } from './optionCodec';

const roots = new WeakMap();

const EchartHost = ({ option, height = '400px' }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    loadEcharts()
      .then(result => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch(error => {
        console.error('ECharts 加载失败', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return null;
  }

  return createElement(EchartCanvas, {
    data,
    option,
    style: { width: '100%', height: '100%', minHeight: height }
  });
};

const resolveMountOption = option => {
  try {
    if (typeof option === 'string') {
      return parseStoredOption(option);
    }

    return option && typeof option === 'object' ? option : { ...DEFAULT_ECHART_OPTION };
  } catch (error) {
    console.error('ECharts option 解析失败', error);
    return { ...DEFAULT_ECHART_OPTION };
  }
};

export const mountEchartInHost = (host, { option, height = '400px' } = {}) => {
  if (!host) {
    return;
  }

  const resolvedOption = resolveMountOption(option);

  host.style.width = '100%';
  host.style.height = height;
  host.style.minHeight = height;

  let root = roots.get(host);

  if (!root) {
    root = createRoot(host);
    roots.set(host, root);
  }

  root.render(createElement(EchartHost, { option: resolvedOption, height }));
};

export const remountEchartInHost = (host, mountOptions) => {
  unmountEchartInHost(host);
  mountEchartInHost(host, mountOptions);
};

export const unmountEchartInHost = host => {
  const root = roots.get(host);

  if (!root) {
    return;
  }

  try {
    root.unmount();
  } catch {
    // 宿主已从文档移除时忽略
  }

  roots.delete(host);
};

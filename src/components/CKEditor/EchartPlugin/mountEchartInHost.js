import { createElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadEcharts, EchartCanvas } from '@components/Echart';
import { DEFAULT_ECHART_OPTION } from './constants';
import { hasRenderableEchartOption, parseStoredOption } from './optionCodec';

const roots = new WeakMap();

const EchartHost = ({ option, height = '400px' }) => {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    loadEcharts()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoadError(null);
        }
      })
      .catch(error => {
        console.error('ECharts 加载失败', error);
        if (!cancelled) {
          setLoadError(error?.message || 'ECharts 加载失败');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          minHeight: height,
          color: '#ff4d4f',
          fontSize: 12,
          padding: 8
        }
      },
      loadError
    );
  }

  if (!data) {
    return createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          minHeight: height
        }
      }
    );
  }

  return createElement(EchartCanvas, {
    data,
    option,
    style: { width: '100%', height: '100%', minHeight: height }
  });
};

const resolveMountOption = option => {
  try {
    let resolved;

    if (typeof option === 'string') {
      resolved = parseStoredOption(option);
    } else {
      resolved = option && typeof option === 'object' ? option : { ...DEFAULT_ECHART_OPTION };
    }

    if (!hasRenderableEchartOption(resolved)) {
      return { ...DEFAULT_ECHART_OPTION };
    }

    return resolved;
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
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height || '400px';

  host.style.width = '100%';
  host.style.height = resolvedHeight;
  host.style.minHeight = resolvedHeight;

  let root = roots.get(host);

  if (!root) {
    root = createRoot(host);
    roots.set(host, root);
  }

  root.render(createElement(EchartHost, { option: resolvedOption, height: resolvedHeight }));
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

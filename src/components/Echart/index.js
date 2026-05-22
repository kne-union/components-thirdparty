import { getOrLoadRemote, getPublicPath } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useRef, useEffect } from 'react';
import useResize from '@kne/use-resize';
import classNames from 'classnames';
import style from './style.module.scss';

export const loadEcharts = async () => {
  await getOrLoadRemote('echarts', '', `${getPublicPath('components-thirdparty')}/echarts/echarts.js`);
  return { echarts: window.echarts };
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

export default Echart;

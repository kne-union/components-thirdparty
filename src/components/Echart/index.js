import { getOrLoadRemote, getPublicPath } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useRef, useEffect } from 'react';
import useResize from '@kne/use-resize';

const loader = {
  loading: null,
  loader: async () => {
    await getOrLoadRemote('echarts', '', `${getPublicPath('components-thirdparty')}/echarts/echarts.js`);
    return { echarts: window.echarts };
  }
};

const EchartInner = ({ data, option, ...props }) => {
  const ref = useResize(() => {
    instanceRef.current && instanceRef.current.resize();
  });
  const instanceRef = useRef(null);
  const { echarts } = data;
  useEffect(() => {
    instanceRef.current = echarts.init(ref.current);
    return () => {
      //echarts.dispose(ref.current);
    };
  }, [echarts, ref]);
  useEffect(() => {
    instanceRef.current && instanceRef.current.setOption(option);
  }, [option]);
  return <div {...props} ref={ref} />;
};

const Echart = ({ loading, error, ...props }) => {
  return (
    <Fetch
      {...Object.assign({}, loader, { loading, error })}
      render={({ data }) => {
        return <EchartInner {...props} data={data} />;
      }}
    />
  );
};

export default Echart;

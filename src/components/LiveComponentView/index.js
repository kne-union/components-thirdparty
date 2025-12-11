import React, { useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { decode } from 'plantuml-encoder';
import { useState } from 'react';
import { withRemoteLoader, createWithRemoteLoader } from '@kne/remote-loader';
import ErrorBoundary from '@kne/react-error-boundary';
import lodash from 'lodash';
import dayjs from 'dayjs';
import { transform as _transform } from '@babel/standalone';
import * as Antd from 'antd';
import { Flex, Spin } from 'antd';
import style from './style.module.scss';

const { transform, memoize } = lodash;

const ErrorComponent = ({ error }) => {
  return (
    <div className={style['error-message']}>
      <pre>{error}</pre>
    </div>
  );
};

const LiveComponent = withRemoteLoader(({ remoteModules, children, props, themeToken, locale, container }) => {
  const [error, setError] = useState(null);
  const { content, moduleNames } = children;
  const rootRef = useRef(null);
  const scope = useMemo(() => {
    return memoize(moduleNames => {
      return transform(
        remoteModules,
        (result, module, index) => {
          result[moduleNames[index]] = module;
        },
        {}
      );
    })(moduleNames);
  }, [remoteModules, moduleNames]);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }
    const el = document.createElement('div');
    rootRef.current.innerHTML = '';
    setError(null);
    rootRef.current.appendChild(el);
    const root = ReactDOM.createRoot(el);
    try {
      const ContainerComponent = container || (({ children }) => children);
      const code = _transform(
        `render(<ErrorBoundary errorComponent={ErrorComponent}>
  <PureGlobal themeToken={${JSON.stringify(themeToken)}} preset={${JSON.stringify({
    locale
  })}}>
    <ContainerComponent>
      ${content}
    </ContainerComponent>
  </PureGlobal>
</ErrorBoundary>);`,
        { presets: ['es2015', 'react'] }
      ).code;
      // eslint-disable-next-line no-new-func
      const runnerFunction = new Function(
        'React',
        'render',
        'props',
        'Antd',
        'ErrorBoundary',
        'ErrorComponent',
        'ContainerComponent',
        'lodash',
        'dayjs',
        ...moduleNames,
        code
      );
      runnerFunction(
        React,
        jsx => root.render(jsx),
        props,
        Antd,
        ErrorBoundary,
        ErrorComponent,
        ContainerComponent,
        lodash,
        dayjs,
        ...moduleNames.map(name => scope[name])
      );
    } catch (e) {
      setError(e);
    }
    return () => {
      if (rootRef.current) {
        rootRef.current.innerHTML = '';
      }
    };
  }, [scope, moduleNames, props, content]);

  return (
    <Flex vertical>
      {moduleNames.length !== remoteModules.length ? <Spin /> : <div ref={rootRef} />}
      {error && <ErrorComponent error={error.message} />}
    </Flex>
  );
});

const LiveComponentView = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalContext']
})(({ remoteModules, content: inputStr, themeColor, locale, container, props: componentProps }) => {
  const [useGlobalContext] = remoteModules;
  const { global } = useGlobalContext();
  const { content, props, scope, error } = useMemo(() => {
    try {
      if (!inputStr) {
        return { error: '组件为空' };
      }
      const { content, props, scope } = JSON.parse(decode(inputStr));

      return Object.assign(
        {},
        {
          content: content || '',
          scope: Object.assign({}, scope),
          props: Object.assign(
            {},
            props &&
              transform(
                props,
                (result, value, name) => {
                  result[name] = (() => {
                    if (['array', 'object', 'boolean', 'number'].indexOf(value.type) > -1) {
                      return JSON.parse(value.defaultValue);
                    }
                    if (value.type === 'string') {
                      return value.defaultValue;
                    }
                    if (value.type === 'function') {
                      return () => null;
                    }
                  })();
                },
                {}
              )
          ),
          error: null
        }
      );
    } catch (e) {
      return { error: e.message || '参数无法解析' };
    }
  }, [inputStr]);

  const targetProps = useMemo(() => {
    return Object.assign({}, props, componentProps);
  }, [componentProps, props]);

  if (error) {
    return <ErrorComponent error={error} />;
  }
  const moduleNames = Object.keys(scope);

  return (
    <LiveComponent
      props={targetProps}
      container={container}
      themeToken={themeColor || global.themeToken}
      locale={locale || global.locale}
      modules={['components-core:Global@PureGlobal'].concat(moduleNames.map(name => scope[name]))}
      children={{ content, moduleNames: ['PureGlobal'].concat(moduleNames) }}
    />
  );
});

export default LiveComponentView;

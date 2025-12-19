import React, { useEffect, useMemo } from 'react';
import { decode } from 'plantuml-encoder';
import { useState, useRef } from 'react';
import { withRemoteLoader } from '@kne/remote-loader';
import ErrorBoundary from '@kne/react-error-boundary';
import { transform as _transform } from '@babel/standalone';
import transform from 'lodash/transform';
import * as Antd from 'antd';
import { Flex, Spin } from 'antd';
import style from './style.module.scss';

const ErrorComponent = ({ error }) => {
  return (
    <div className={style['error-message']}>
      <pre>{error}</pre>
    </div>
  );
};

const LiveComponent = withRemoteLoader(({ remoteModules, children, props, libs = {} }) => {
  const [error, setError] = useState(null);
  const { content, moduleNames } = children;
  const scope = useMemo(() => {
    return transform(
      remoteModules,
      (result, module, index) => {
        result[moduleNames[index]] = module;
      },
      {}
    );
  }, [remoteModules, moduleNames]);
  const [renderJsx, setRenderJsx] = useState(null);
  const libsRef = useRef(libs);
  useEffect(() => {
    const libs = libsRef.current;
    try {
      setError(null);
      const code = _transform(`render(${content});`, { presets: ['es2015', 'react'] }).code;
      // eslint-disable-next-line no-new-func
      const runnerFunction = new Function('React', 'render', 'props', 'Antd', ...Object.keys(libs), ...moduleNames, code);
      runnerFunction(React, jsx => setRenderJsx(jsx), props, Antd, ...Object.values(libs), ...moduleNames.map(name => scope[name]));
    } catch (e) {
      setError(e);
    }
  }, [scope, moduleNames, props, content]);

  return (
    <Flex vertical>
      <ErrorBoundary errorComponent={ErrorComponent}>{moduleNames.length !== remoteModules.length ? <Spin /> : renderJsx}</ErrorBoundary>
      {error && <ErrorComponent error={error.message} />}
    </Flex>
  );
});

const LiveComponentView = ({ content: inputStr, props: componentProps, libs }) => {
  const { content, props, scope, error } = useMemo(() => {
    try {
      if (!inputStr) {
        return { content: '', scope: {}, props: {}, error: null };
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
      libs={libs}
      modules={['components-core:Global@PureGlobal'].concat(moduleNames.map(name => scope[name]))}
      children={{ content, moduleNames: ['PureGlobal'].concat(moduleNames) }}
    />
  );
};

export default LiveComponentView;

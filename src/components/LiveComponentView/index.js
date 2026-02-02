import React, { useEffect, useMemo, memo, useCallback, useState, useRef } from 'react';
import { decode } from 'plantuml-encoder';
import { withRemoteLoader } from '@kne/remote-loader';
import ErrorBoundary from '@kne/react-error-boundary';
import { transform as _transform } from '@babel/standalone';
import transform from 'lodash/transform';
import debounce from 'lodash/debounce';
import * as Antd from 'antd';
import { Flex, Spin } from 'antd';
import style from './style.module.scss';

const ErrorComponent = memo(({ error }) => {
  return (
    <div className={style['error-message']}>
      <pre>{error}</pre>
    </div>
  );
});

const LiveComponent = withRemoteLoader(({ remoteModules, children, props, libs = {} }) => {
  const [error, setError] = useState(null);
  const [renderJsx, setRenderJsx] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);
  const [moduleScopeValues, setModuleScopeValues] = useState([]);
  
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

  // 预计算 libs keys 和 values
  const libKeys = useMemo(() => Object.keys(libs), [libs]);
  const libValues = useMemo(() => Object.values(libs), [libs]);

  // 拆分 useEffect: 1) 编译代码 (content 变化时)
  useEffect(() => {
    if (!content) {
      setCompiledCode(null);
      return;
    }
    
    try {
      setError(null);
      const code = _transform(`render(${content});`, { presets: ['es2015', 'react'] }).code;
      setCompiledCode(code);
    } catch (e) {
      setError(e);
      setCompiledCode(null);
    }
  }, [content]);

  // 拆分 useEffect: 2) 渲染组件 (scope/moduleNames/libs 变化时，不需要重新编译)
  useEffect(() => {
    if (!compiledCode) return;

    try {
      setError(null);
      // eslint-disable-next-line no-new-func
      const runnerFunction = new Function('React', 'render', 'props', 'Antd', ...libKeys, ...moduleNames, compiledCode);
      const newModuleScopeValues = moduleNames.map(name => scope[name]);
      setModuleScopeValues(newModuleScopeValues);
      
      runnerFunction(React, jsx => setRenderJsx(jsx), props, Antd, ...libValues, ...newModuleScopeValues);
    } catch (e) {
      setError(e);
    }
  }, [compiledCode, scope, moduleNames, props, libKeys, libValues]);

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

  const { children, modules } = useMemo(() => {
    const moduleNames = Object.keys(scope);
    return {
      modules: ['components-core:Global@PureGlobal'].concat(moduleNames.map(name => scope[name])),
      children: { content, moduleNames: ['PureGlobal'].concat(moduleNames) }
    };
  }, [scope]); // 只依赖 scope，不需要依赖 content

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return <LiveComponent props={targetProps} libs={libs} modules={modules} children={children} />;
};

const LiveComponentsViewCatch = memo(props => {
  return (
    <ErrorBoundary errorComponent={ErrorComponent}>
      <LiveComponentView {...props} />
    </ErrorBoundary>
  );
});

export default LiveComponentsViewCatch;

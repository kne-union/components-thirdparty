import React, { useEffect, useMemo, memo, useState } from 'react';
import { decodeLiveComponentConfig } from './decodeConfig';
import { withRemoteLoader } from '@kne/remote-loader';
import ErrorBoundary from '@kne/react-error-boundary';
import { transform as babelTransform } from '@babel/standalone';
import transform from 'lodash/transform';
import * as Antd from 'antd';
import { Flex, Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import style from './style.module.scss';

const formatErrorMessage = error => {
  if (error == null) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.stack || error.message;
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
};

const ErrorComponent = memo(({ error }) => {
  return (
    <div className={style['error-message']}>
      <pre>{formatErrorMessage(error)}</pre>
    </div>
  );
});

const FORM_INFO_SCOPE_TOKEN = 'components-core:FormInfo';

/** FormInfo 字段/列表依赖 Form 上下文，LiveComponentView 独立渲染时需外包 FormInfo.Form */
const ensureFormInfoFormWrapper = (jsxContent, scope = {}) => {
  const text = (jsxContent || '').trim();

  if (!text) {
    return text;
  }

  const usesFormInfo =
    Object.values(scope).includes(FORM_INFO_SCOPE_TOKEN) || /<FormInfo[\s.>/]/.test(text);

  if (!usesFormInfo || /<FormInfo\.Form[\s>]/.test(text)) {
    return text;
  }

  return `<FormInfo.Form data={{}}>\n${text}\n</FormInfo.Form>`;
};

const LiveComponent = withRemoteLoader(({ remoteModules, children, props, libs = {} }) => {
  const [error, setError] = useState(null);
  const [renderJsx, setRenderJsx] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);

  const { content, moduleNames } = children;
  const moduleNamesKey = moduleNames.join('\0');
  const scope = useMemo(
    () =>
      transform(
        remoteModules,
        (result, module, index) => {
          result[moduleNames[index]] = module;
        },
        {}
      ),
    // moduleNamesKey 已编码 moduleNames 内容
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoteModules, moduleNamesKey]
  );

  const libKeysKey = Object.keys(libs).sort().join('\0');
  const libKeys = useMemo(() => (libKeysKey ? libKeysKey.split('\0') : []), [libKeysKey]);
  const libValues = useMemo(
    () => libKeys.map(key => libs[key]),
    // libKeysKey 为 libs 键的稳定签名，避免 libs 引用每轮变化导致重复计算
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [libKeysKey]
  );
  const propsKey = JSON.stringify(props);

  // 拆分 useEffect: 1) 编译代码 (content 变化时)
  useEffect(() => {
    if (!content) {
      setCompiledCode(null);
      return;
    }
    
    try {
      setError(null);
      const code = babelTransform(`render(${content});`, { presets: ['es2015', 'react'] }).code;
      setCompiledCode(code);
    } catch (e) {
      setError(e);
      setCompiledCode(null);
    }
  }, [content]);

  // 拆分 useEffect: 2) 渲染组件 (scope/moduleNames/libs 变化时，不需要重新编译)
  useEffect(() => {
    if (!compiledCode) {
      setRenderJsx(null);
      return;
    }

    try {
      setError(null);
      // eslint-disable-next-line no-new-func
      const runnerFunction = new Function('React', 'render', 'props', 'Antd', ...libKeys, ...moduleNames, compiledCode);
      const newModuleScopeValues = moduleNames.map(name => scope[name]);
      runnerFunction(React, jsx => setRenderJsx(jsx), props, Antd, ...libValues, ...newModuleScopeValues);
    } catch (e) {
      setError(e);
    }
    // propsKey / libKeysKey 为序列化签名，避免 props、libs 引用变化导致重复执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledCode, scope, moduleNamesKey, propsKey, libKeysKey, libValues]);

  return (
    <Flex vertical>
      <ErrorBoundary errorComponent={ErrorComponent}>{moduleNames.length !== remoteModules.length ? <Spin /> : renderJsx}</ErrorBoundary>
      {error && <ErrorComponent error={error} />}
    </Flex>
  );
});

/** 将配置中的 prop 定义解析为运行时值 */
const resolvePropValue = (type, defaultValue) => {
  if (type === 'function') {
    return () => null;
  }
  if (['array', 'object', 'boolean', 'number'].includes(type)) {
    try {
      return JSON.parse(defaultValue);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

const LiveComponentView = withLocale(({ content: inputStr, props: componentProps, libs }) => {
  const { formatMessage, locale } = useIntl();
  const { content, props, scope, error } = useMemo(() => {
    try {
      if (!inputStr) {
        return { content: '', scope: {}, props: {}, error: null };
      }

      const parsed = decodeLiveComponentConfig(inputStr);
      if (!parsed) {
        return { content: '', scope: {}, props: {}, error: formatMessage({ id: 'ParseError' }) };
      }

      const resolvedScope = parsed.scope;

      return {
        content: ensureFormInfoFormWrapper(parsed.content, resolvedScope),
        scope: resolvedScope,
        props: transform(
          parsed.props || {},
          (result, value, name) => {
            if (value && typeof value === 'object' && value.type) {
              result[name] = resolvePropValue(value.type, value.defaultValue);
            }
          },
          {}
        ),
        error: null
      };
    } catch (e) {
      return { content: '', scope: {}, props: {}, error: e.message || formatMessage({ id: 'ParseError' }) };
    }
    // locale 切换时需刷新解析错误文案；勿将 formatMessage 放入依赖（引用每轮会变）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputStr, locale]);

  const targetProps = useMemo(() => {
    return Object.assign({}, props, componentProps);
  }, [componentProps, props]);

  const scopeKeysKey = Object.keys(scope).sort().join('\0');
  const scopeModuleNames = useMemo(
    () => (scopeKeysKey ? scopeKeysKey.split('\0') : []),
    [scopeKeysKey]
  );
  const runtimeModuleNames = useMemo(
    () => ['PureGlobal'].concat(scopeModuleNames),
    [scopeModuleNames]
  );

  const { children, modules } = useMemo(
    () => ({
      modules: ['components-core:Global@PureGlobal'].concat(scopeModuleNames.map(name => scope[name])),
      children: { content, moduleNames: runtimeModuleNames }
    }),
    [scope, scopeModuleNames, content, runtimeModuleNames]
  );

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return <LiveComponent props={targetProps} libs={libs} modules={modules} children={children} />;
});

const LiveComponentsViewCatch = memo(props => {
  return (
    <ErrorBoundary errorComponent={ErrorComponent}>
      <LiveComponentView {...props} />
    </ErrorBoundary>
  );
});

export default LiveComponentsViewCatch;

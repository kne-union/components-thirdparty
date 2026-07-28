import React, { Component, useEffect, useMemo, memo, useState } from 'react';
import { decodeLiveComponentConfig } from './decodeConfig';
import { withRemoteLoader } from '@kne/remote-loader';
import { createWithFetch } from '@kne/react-fetch';
import { transform as babelTransform } from '@babel/standalone';
import transform from 'lodash/transform';
import omit from 'lodash/omit';
import * as Antd from 'antd';
import { Flex, Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import createJsxSourceLocatePlugin from './jsxSourceLocatePlugin';
import style from './style.module.scss';
import preset, { getLibs } from './preset';

export { default as preset, getLibs } from './preset';

const RENDER_WRAP_PREFIX = 'render(';

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

/**
 * 内容变更时自动清空错误态，避免预览卡在旧的运行时错误上。
 * （@kne/react-error-boundary 捕获后不会随 props 恢复）
 */
class ResettableErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error != null && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      const ErrorCmp = this.props.errorComponent || ErrorComponent;
      return <ErrorCmp error={this.state.error} />;
    }
    return this.props.children;
  }
}
const FORM_INFO_SCOPE_TOKEN = 'components-core:FormInfo';

/** FormInfo 字段/列表依赖 Form 上下文，LiveComponentView 独立渲染时需外包 FormInfo.Form */
const ensureFormInfoFormWrapper = (jsxContent, scope = {}) => {
  const text = (jsxContent || '').trim();

  if (!text) {
    return { content: text, lineOffset: 0 };
  }

  const usesFormInfo =
    Object.values(scope).includes(FORM_INFO_SCOPE_TOKEN) || /<FormInfo[\s.>/]/.test(text);

  if (!usesFormInfo || /<FormInfo\.Form[\s>]/.test(text)) {
    return { content: text, lineOffset: 0 };
  }

  return {
    content: `<FormInfo.Form data={{}}>\n${text}\n</FormInfo.Form>`,
    lineOffset: 1
  };
};

const LiveComponent = withRemoteLoader(({ remoteModules, children, props, libs = {}, enableSourceLocate = false }) => {
  const [error, setError] = useState(null);
  const [renderJsx, setRenderJsx] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);

  const { content, moduleNames, lineOffset = 0 } = children;
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
      const plugins = enableSourceLocate
        ? [createJsxSourceLocatePlugin({ lineOffset, wrapPrefix: RENDER_WRAP_PREFIX })]
        : [];
      const code = babelTransform(`${RENDER_WRAP_PREFIX}${content});`, {
        presets: ['es2015', 'react'],
        plugins
      }).code;
      setCompiledCode(code);
    } catch (e) {
      setError(e);
      setCompiledCode(null);
    }
  }, [content, lineOffset, enableSourceLocate]);

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
      setRenderJsx(null);
    }
    // propsKey / libKeysKey 为序列化签名，避免 props、libs 引用变化导致重复执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledCode, scope, moduleNamesKey, propsKey, libKeysKey, libValues]);

  return (
    <Flex vertical>
      <ResettableErrorBoundary resetKey={content} errorComponent={ErrorComponent}>
        {moduleNames.length !== remoteModules.length ? <Spin /> : renderJsx}
      </ResettableErrorBoundary>
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

const LiveComponentView = withLocale(({ content: inputStr, props: componentProps, libs, enableSourceLocate = false }) => {
  const { formatMessage, locale } = useIntl();
  const { content, lineOffset, props, scope, error } = useMemo(() => {
    try {
      if (!inputStr) {
        return { content: '', lineOffset: 0, scope: {}, props: {}, error: null };
      }

      const parsed = decodeLiveComponentConfig(inputStr);
      if (!parsed) {
        return { content: '', lineOffset: 0, scope: {}, props: {}, error: formatMessage({ id: 'ParseError' }) };
      }

      const resolvedScope = parsed.scope;
      const wrapped = ensureFormInfoFormWrapper(parsed.content, resolvedScope);

      return {
        content: wrapped.content,
        lineOffset: wrapped.lineOffset,
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
      return { content: '', lineOffset: 0, scope: {}, props: {}, error: e.message || formatMessage({ id: 'ParseError' }) };
    }
    // locale 切换时需刷新解析错误文案；勿将 formatMessage 放入依赖（引用每轮会变）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputStr, locale]);

  const targetProps = useMemo(() => {
    return Object.assign({}, props, componentProps);
  }, [componentProps, props]);

  const targetLibs = useMemo(() => Object.assign({}, getLibs(), libs), [libs]);

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
      children: { content, moduleNames: runtimeModuleNames, lineOffset }
    }),
    [scope, scopeModuleNames, content, runtimeModuleNames, lineOffset]
  );

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <LiveComponent
      props={targetProps}
      libs={targetLibs}
      modules={modules}
      children={children}
      enableSourceLocate={enableSourceLocate}
    />
  );
});

const LiveComponentsViewCatch = memo(props => {
  const resetKey = typeof props.content === 'string' ? props.content : String(props.content || '');
  return (
    <ResettableErrorBoundary resetKey={resetKey} errorComponent={ErrorComponent}>
      <LiveComponentView {...props} />
    </ResettableErrorBoundary>
  );
});

/** 内容短链等接口直出 text/plain（或字符串），需适配 react-fetch 的 code/results 约定 */
const transformContentResponse = response => {
  const status = response.status;
  const ok = status === 200 || status === undefined;
  const body = response.data;
  const content =
    typeof body === 'string'
      ? body
      : body && typeof body === 'object' && typeof body.data === 'string'
        ? body.data
        : body == null
          ? ''
          : String(body);

  return {
    data: {
      code: ok ? 200 : status || 500,
      msg: ok ? '' : (body && body.msg) || '加载内容失败',
      results: content
    }
  };
};

const FETCH_RESULT_KEYS = [
  'data',
  'fetchProps',
  'isComplete',
  'refresh',
  'reload',
  'setData',
  'loadMore',
  'send',
  'requestParams'
];

/**
 * 通过内容 url（如 `{prefix}/content/{contentShorten}`）拉取配置后渲染。
 * libs / enableSourceLocate 同 LiveComponentView；其余业务字段（如 headline）直接作为 props 传入。
 */
const LiveComponentViewFetch = createWithFetch({
  method: 'GET',
  transformResponse: transformContentResponse
})(props => {
  const { data, libs, enableSourceLocate, props: componentProps, ...rest } = props;
  const runtimeProps = Object.assign({}, omit(rest, FETCH_RESULT_KEYS), componentProps);
  return (
    <LiveComponentsViewCatch content={data} libs={libs} enableSourceLocate={enableSourceLocate} props={runtimeProps} />
  );
});

LiveComponentsViewCatch.Fetch = LiveComponentViewFetch;
LiveComponentsViewCatch.preset = preset;

export default LiveComponentsViewCatch;

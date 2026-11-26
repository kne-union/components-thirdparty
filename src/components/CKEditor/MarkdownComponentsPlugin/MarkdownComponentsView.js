import { Component, createElement, useMemo } from 'react';
import { Alert } from 'antd';
import MarkdownRender from '@components/MarkdownRender';
import defaultComponents from './defaultComponents';
import { parseInlineSource } from './constants';

class RenderErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.inline ? (
        <code>{this.props.fallback}</code>
      ) : (
        <Alert type="error" showIcon message={this.state.error?.message || String(this.state.error)} />
      );
    }
    return this.props.children;
  }
}

const useMergedComponents = components => useMemo(() => Object.assign({}, defaultComponents, components), [components]);

/** 与 markdown-components-render 一致：props 中 $name 取 variables[name] */
const compileVariables = (value, variables) => {
  if (Array.isArray(value)) {
    return value.map(item => compileVariables(item, variables));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, compileVariables(item, variables)]));
  }
  if (typeof value === 'string' && value.charAt(0) === '$' && variables?.[value.slice(1)] !== undefined) {
    return variables[value.slice(1)];
  }
  return value;
};

/**
 * 用 markdown-components-render 渲染 Markdown；默认提供 RemoteLoader 与 antd 基础组件，
 * components / variables 与默认值合并，同名覆盖。
 */
const MarkdownComponentsView = ({ className, children, components, variables }) => {
  const mergedComponents = useMergedComponents(components);

  return (
    <div className={className}>
      <RenderErrorBoundary key={children}>
        <MarkdownRender components={mergedComponents} variables={variables}>
          {children || ''}
        </MarkdownRender>
      </RenderErrorBoundary>
    </div>
  );
};

/** 行内组件直接渲染，不经过 Markdown 段落包裹，保证与文字同行 */
const InlineComponent = ({ source, components, variables }) => {
  const mergedComponents = useMergedComponents(components);
  const { type, props } = parseInlineSource(source);
  const Target = mergedComponents[type];

  if (!Target) {
    return <code>{source}</code>;
  }
  return createElement(Target, compileVariables(props, variables));
};

export const MarkdownInlineComponent = props => (
  <RenderErrorBoundary key={props.source} inline fallback={props.source}>
    <InlineComponent {...props} />
  </RenderErrorBoundary>
);

export default MarkdownComponentsView;

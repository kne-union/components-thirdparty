import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ConfigProvider } from 'antd';
import FormCreatorGlobalShell, { resolveIsolatedThemeToken } from '../FormCreatorPlugin/FormCreatorGlobalShell';
import MarkdownComponentsView, { MarkdownInlineComponent } from './MarkdownComponentsView';

const roots = new WeakMap();

/**
 * 在 RawElement 宿主上渲染 md-components，返回卸载函数。
 * 行内组件只包 ConfigProvider：PureGlobal 等外壳会引入块级节点，破坏同行排版。
 */
export const mountMarkdownComponent = (host, { markdown, inlineSource, components, variables, themeToken, locale }) => {
  let root = roots.get(host);

  if (!root) {
    root = createRoot(host);
    roots.set(host, root);
  }

  if (inlineSource !== undefined) {
    const token = resolveIsolatedThemeToken(themeToken);
    root.render(
      <ConfigProvider theme={token?.colorPrimary ? { token: { colorPrimary: token.colorPrimary } } : undefined}>
        <MarkdownInlineComponent source={inlineSource} components={components} variables={variables} />
      </ConfigProvider>
    );
  } else {
    root.render(
      <FormCreatorGlobalShell themeToken={themeToken} locale={locale}>
        <MarkdownComponentsView components={components} variables={variables}>
          {markdown}
        </MarkdownComponentsView>
      </FormCreatorGlobalShell>
    );
  }

  return () => {
    const current = roots.get(host);

    if (!current) {
      return;
    }

    try {
      flushSync(() => {
        current.unmount();
      });
    } catch {
      // 宿主已从文档移除时忽略
    }
    roots.delete(host);
  };
};

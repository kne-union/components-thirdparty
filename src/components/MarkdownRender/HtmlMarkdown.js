import { useMemo } from 'react';
import MarkdownComponentsRender from '@kne/markdown-components-render';
import HtmlBlock from './HtmlBlock';
import { prepareHtmlMarkdown } from './prepareHtmlMarkdown';

/**
 * 带 HtmlBlock 解析的 Markdown 渲染：```html 围栏会渲染为真实 HTML 元素。
 */
const HtmlMarkdown = ({ children, components, variables, options, ...props }) => {
  const prepared = useMemo(() => prepareHtmlMarkdown(children), [children]);
  const mergedOptions = useMemo(
    () => ({
      ...(options || {}),
      config: {
        html: true,
        ...(options?.config || {})
      }
    }),
    [options]
  );

  return (
    <MarkdownComponentsRender
      {...props}
      options={mergedOptions}
      components={{ HtmlBlock, ...(components || {}) }}
      variables={{ ...(prepared.variables || {}), ...(variables || {}) }}>
      {prepared.text}
    </MarkdownComponentsRender>
  );
};

export default HtmlMarkdown;

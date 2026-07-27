import style from './html-block.module.scss';

/**
 * MarkdownRender 解析组件：将 props.html 渲染为真实 DOM，而非代码块。
 * 配合 md-components YML：type: HtmlBlock, props.html: $var
 */
const HtmlBlock = ({ html = '', className }) => {
  const content = String(html || '');
  if (!content.trim()) {
    return null;
  }
  return (
    <div
      className={`${style['html-block']}${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

HtmlBlock.displayName = 'HtmlBlock';

export default HtmlBlock;

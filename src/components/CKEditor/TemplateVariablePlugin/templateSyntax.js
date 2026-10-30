export { normalizeVariableKind, wrapVariable, resolveVariableLabel, findTemplateMatches } from '@kne/message-template';

/**
 * 读取并规范化 config.templateVariable；语法固定为 Liquid，不再读取 interpolate / escape / evaluate
 */
export const resolveTemplateVariableSettings = (config = {}) => {
  const variables = Array.isArray(config.variables) ? config.variables : [];
  return { variables };
};

/**
 * 将 HTML 中的模版变量 span 还原为纯文本标签（供 getData）
 */
export const unwrapTemplateVariableSpans = html => {
  if (!html || typeof html !== 'string' || !html.includes('ck-template-variable')) {
    return html;
  }

  if (typeof DOMParser === 'undefined') {
    return html.replace(/<span\b[^>]*\bck-template-variable\b[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="ck-template-variable-root">${html}</div>`, 'text/html');
  const root = doc.getElementById('ck-template-variable-root');
  if (!root) {
    return html;
  }

  root.querySelectorAll('span.ck-template-variable').forEach(span => {
    const text = doc.createTextNode(span.textContent || '');
    span.parentNode?.replaceChild(text, span);
  });

  return root.innerHTML;
};

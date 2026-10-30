import get from 'lodash/get';
import { findTemplateMatches } from '@kne/message-template';

export { normalizeVariableKind, wrapVariable, resolveVariableLabel, findTemplateMatches } from '@kne/message-template';

/**
 * 读取并规范化 config.templateVariable；语法固定为 Liquid，不再读取 interpolate / escape / evaluate
 */
export const resolveTemplateVariableSettings = (config = {}) => {
  const variables = Array.isArray(config.variables) ? config.variables : [];
  const previewData = config.previewData && typeof config.previewData === 'object' ? config.previewData : {};
  return { variables, previewData };
};

/** 编辑区样式取值：previewData 优先，其次 variables[].example；取不到返回 undefined */
export const resolveStyleVariableValue = (name, { variables, previewData }) => {
  const value = get(previewData, name);
  if (value !== undefined && value !== null && value !== '') {
    return String(value);
  }
  const example = variables.find(item => item?.name === name)?.example;
  return example !== undefined && example !== null && example !== '' ? String(example) : undefined;
};

/** 把样式值里的 {{ 变量 }} 换成示例值；有变量取不到值时原样返回 */
export const resolveStyleValue = (value, settings) => {
  if (typeof value !== 'string' || !value.includes('{{')) {
    return value;
  }
  let resolved = value;
  for (const match of findTemplateMatches(value)) {
    const replacement = resolveStyleVariableValue(match.name, settings);
    if (replacement === undefined) {
      return value;
    }
    resolved = resolved.replace(match.raw, replacement);
  }
  return resolved;
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

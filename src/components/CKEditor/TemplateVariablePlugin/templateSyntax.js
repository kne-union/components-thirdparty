import { DEFAULT_ESCAPE, DEFAULT_INTERPOLATE, KIND_ESCAPE, KIND_INTERPOLATE } from './constants';

const isSameRegex = (a, b) => a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags;

/**
 * 读取并规范化 config.templateVariable（字段名对齐 lodash.templateSettings）
 */
export const resolveTemplateVariableSettings = (config = {}) => {
  const interpolate = config.interpolate instanceof RegExp ? config.interpolate : DEFAULT_INTERPOLATE;
  const escape = config.escape instanceof RegExp ? config.escape : DEFAULT_ESCAPE;
  const variables = Array.isArray(config.variables) ? config.variables : [];

  return {
    interpolate,
    escape,
    evaluate: config.evaluate instanceof RegExp ? config.evaluate : undefined,
    variables
  };
};

const cloneGlobalRegex = regex => {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
};

/**
 * 将 RegExp source 中的转义还原为字面量（用于由正则还原包裹串）
 */
const unescapeRegexSource = source => source.replace(/\\(.)/g, '$1');

/**
 * 用 name 替换正则中第一个捕获组，得到输出串。
 * 默认 lodash 语法带空格：<%= name %> / <%- name %>
 */
export const wrapVariable = (name, kind, settings) => {
  const trimmed = String(name ?? '').trim();
  const regex = kind === KIND_ESCAPE ? settings.escape : settings.interpolate;
  const defaults = kind === KIND_ESCAPE ? DEFAULT_ESCAPE : DEFAULT_INTERPOLATE;

  if (isSameRegex(regex, defaults)) {
    return kind === KIND_ESCAPE ? `<%- ${trimmed} %>` : `<%= ${trimmed} %>`;
  }

  let replaced = false;
  const nextSource = regex.source.replace(/\((?:\?(?:[:!=]|<[=!])|[^)])*\)/, match => {
    // 只替换第一个「捕获组」（非 lookahead/lookbehind 的 (?:) 等仍会命中部分情况；默认与自定义插值足够）
    if (
      replaced ||
      match.startsWith('(?:') ||
      match.startsWith('(?=') ||
      match.startsWith('(?!') ||
      match.startsWith('(?<=') ||
      match.startsWith('(?<!')
    ) {
      return match;
    }
    replaced = true;
    return trimmed;
  });

  if (!replaced) {
    return kind === KIND_ESCAPE ? `<%- ${trimmed} %>` : `<%= ${trimmed} %>`;
  }

  return unescapeRegexSource(nextSource);
};

/**
 * 按 variables 列表解析展示 label
 */
export const resolveVariableLabel = (name, kind, variables = []) => {
  const trimmed = String(name ?? '').trim();
  const found = variables.find(item => item && item.name === trimmed && (item.kind || KIND_INTERPOLATE) === kind);
  if (found?.label) {
    return found.label;
  }
  const byName = variables.find(item => item && item.name === trimmed);
  if (byName?.label) {
    return byName.label;
  }
  return trimmed;
};

/**
 * 在纯文本中找出 escape / interpolate 匹配（escape 优先，避免重叠）
 */
export const findTemplateMatches = (text, settings) => {
  if (!text) {
    return [];
  }

  const collected = [];

  const collect = (kind, regex) => {
    const re = cloneGlobalRegex(regex);
    let match;
    while ((match = re.exec(text)) !== null) {
      collected.push({
        start: match.index,
        end: match.index + match[0].length,
        name: String(match[1] ?? '').trim(),
        kind,
        raw: match[0]
      });
      if (match[0].length === 0) {
        re.lastIndex += 1;
      }
    }
  };

  collect(KIND_ESCAPE, settings.escape);
  collect(KIND_INTERPOLATE, settings.interpolate);

  collected.sort((a, b) => a.start - b.start || (a.kind === KIND_ESCAPE ? -1 : 1));

  const result = [];
  let cursor = 0;
  for (const item of collected) {
    if (item.start < cursor || !item.name) {
      continue;
    }
    result.push(item);
    cursor = item.end;
  }
  return result;
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

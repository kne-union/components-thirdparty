import { normalizeConditionClauses, readClausesFromAttributes, wrapConditionEvaluate } from '@kne/message-template';
import {
  DEFAULT_MAX_CLAUSES,
  DEFAULT_OPERATORS,
  OPERATOR_FILLED,
  TEMPLATE_CONDITION_CLASS,
  LAYOUT_BLOCK,
  TEMPLATE_CONDITION_CLAUSES_ATTR,
  TEMPLATE_CONDITION_HAS_ELSE_ATTR,
  TEMPLATE_CONDITION_JOINER_ATTR,
  TEMPLATE_CONDITION_LAYOUT_ATTR,
  TEMPLATE_CONDITION_OPERATOR_ATTR,
  TEMPLATE_CONDITION_SUBJECT_ATTR,
  TEMPLATE_CONDITION_VALUE_ATTR
} from './constants';
import { unwrapTemplateVariableSpans } from '../TemplateVariablePlugin/templateSyntax';

export {
  LIQUID_IF_OPEN_RE,
  normalizeOperator,
  normalizeJoiner,
  resolveSubjectLabel,
  normalizeConditionClauses,
  formatClauseBadge,
  formatJoinerLabel,
  formatConditionBadge,
  buildClauseExpression,
  buildConditionExpression,
  parseSingleClauseExpression,
  parseConditionExpression,
  readClausesFromAttributes,
  wrapConditionEvaluate,
  findConditionMatches,
  findUnbalancedTemplateTags,
  validateTemplateHtml
} from '@kne/message-template';

/**
 * 规范化 config.templateCondition
 */
export const resolveTemplateConditionSettings = (config = {}, variableConfig = {}) => {
  const variables = Array.isArray(config.variables) ? config.variables : Array.isArray(variableConfig.variables) ? variableConfig.variables : [];
  const operators = Array.isArray(config.operators) && config.operators.length ? config.operators : DEFAULT_OPERATORS;
  const allowElse = config.allowElse !== false;
  const allowNesting = config.allowNesting !== false;
  const allowBlock = config.allowBlock !== false;
  const maxClauses = Number.isFinite(config.maxClauses) && config.maxClauses > 0 ? Math.floor(config.maxClauses) : DEFAULT_MAX_CLAUSES;

  return {
    variables,
    operators,
    allowElse,
    allowNesting,
    allowBlock,
    maxClauses,
    display: 'inline',
    openCompareValueModal: typeof config.openCompareValueModal === 'function' ? config.openCompareValueModal : undefined,
    openConditionEditorModal: typeof config.openConditionEditorModal === 'function' ? config.openConditionEditorModal : undefined
  };
};

/** model 元素 → { clauses, joiner } */
export const readClausesFromModel = modelElement => {
  if (!modelElement) {
    return normalizeConditionClauses({});
  }
  const stored = modelElement.getAttribute('clauses');
  if (Array.isArray(stored) && stored.length) {
    return normalizeConditionClauses({
      clauses: stored,
      joiner: modelElement.getAttribute('joiner')
    });
  }
  return normalizeConditionClauses({
    subject: modelElement.getAttribute('subject'),
    operator: modelElement.getAttribute('operator'),
    value: modelElement.getAttribute('value'),
    joiner: modelElement.getAttribute('joiner')
  });
};

/** 写入 model 的 attributes（含兼容首条三属性） */
export const buildConditionModelAttributes = (input = {}, { hasElse, operators } = {}) => {
  const { clauses, joiner } = normalizeConditionClauses(input, operators);
  const first = clauses[0];
  return {
    subject: first.subject,
    operator: first.operator,
    value: first.value,
    clauses,
    joiner,
    ...(hasElse !== undefined ? { hasElse: !!hasElse } : {})
  };
};

const getAttr = (el, name) => el.getAttribute?.(name) || '';

const VOID_TAGS = new Set(['br', 'hr', 'img', 'wbr']);

const escapeAttr = value => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** 块级分支保留标题、段落和样式 class；文本用 textContent，避免把模版标签里的字符编成实体 */
const serializeElementChildren = el => {
  if (!el) {
    return '';
  }
  let html = '';
  el.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      html += node.textContent || '';
      return;
    }
    if (node.nodeType !== 1) {
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') {
      html += '<br>';
      return;
    }
    const attrs = [];
    Array.from(node.attributes || []).forEach(attr => {
      if (attr.name === 'contenteditable' || attr.name.startsWith('data-cke') || attr.name === 'data-branch') {
        return;
      }
      if (attr.name === 'class') {
        const classes = attr.value
          .split(/\s+/)
          .filter(name => name && !name.startsWith('ck-') && !name.startsWith(`${TEMPLATE_CONDITION_CLASS}`));
        if (classes.length) {
          attrs.push(`class="${escapeAttr(classes.join(' '))}"`);
        }
        return;
      }
      attrs.push(`${attr.name}="${escapeAttr(attr.value)}"`);
    });
    const attrText = attrs.length ? ` ${attrs.join(' ')}` : '';
    if (VOID_TAGS.has(tag)) {
      html += `<${tag}${attrText}>`;
      return;
    }
    html += `<${tag}${attrText}>${serializeElementChildren(node)}</${tag}>`;
  });
  return html;
};

/** 槽内只允许文本和变量芯片；用 textContent 取出，避免 innerHTML 把模版标签里的字符编成实体。换行存成 &lt;br&gt;，避免真实 br 把 if 拆成多段文本。 */
const readBranchText = el => {
  if (!el) {
    return '';
  }
  let html = '';
  el.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      html += node.textContent || '';
      return;
    }
    if (node.nodeType === 1 && node.tagName === 'BR') {
      html += '&lt;br&gt;';
      return;
    }
    if (node.nodeType === 1) {
      html += readBranchText(node);
    }
  });
  return html;
};

/**
 * 将数据态 condition span 的内部还原为 Liquid if（供 getData）
 * 外层 span 及其 data-template-condition-* 属性保留；badge / 否则分隔不进入导出文本
 */
export const unwrapTemplateConditionSpans = html => {
  if (!html || typeof html !== 'string' || !html.includes(TEMPLATE_CONDITION_CLASS)) {
    return html;
  }

  const withVars = unwrapTemplateVariableSpans(html);

  if (typeof DOMParser === 'undefined') {
    return withVars.replace(new RegExp(`<span\\b[^>]*\\b${TEMPLATE_CONDITION_CLASS}\\b[^>]*>[\\s\\S]*?<\\/span>`, 'gi'), '');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="ck-template-condition-root">${withVars}</div>`, 'text/html');
  const root = doc.getElementById('ck-template-condition-root');
  if (!root) {
    return withVars;
  }

  const replacements = [];
  const conditionNodes = Array.from(root.querySelectorAll(`span.${TEMPLATE_CONDITION_CLASS}, div.${TEMPLATE_CONDITION_CLASS}`)).sort((a, b) => {
    let depthA = 0;
    let depthB = 0;
    for (let node = a.parentElement; node; node = node.parentElement) depthA += 1;
    for (let node = b.parentElement; node; node = node.parentElement) depthB += 1;
    return depthB - depthA;
  });

  conditionNodes.forEach((span, index) => {
    const { clauses, joiner } = readClausesFromAttributes(name => getAttr(span, name));
    const hasElse = getAttr(span, TEMPLATE_CONDITION_HAS_ELSE_ATTR) === 'true';
    const layout =
      getAttr(span, TEMPLATE_CONDITION_LAYOUT_ATTR) === LAYOUT_BLOCK || span.classList.contains(`${TEMPLATE_CONDITION_CLASS}--block`)
        ? LAYOUT_BLOCK
        : 'inline';

    const thenEl = span.querySelector(':scope > .ck-template-condition__then');
    if (!thenEl) {
      return;
    }
    const elseEl = span.querySelector(':scope > .ck-template-condition__else');
    let thenHtml = layout === LAYOUT_BLOCK ? serializeElementChildren(thenEl) : readBranchText(thenEl);
    let elseHtml = layout === LAYOUT_BLOCK ? serializeElementChildren(elseEl) : readBranchText(elseEl);
    replacements.forEach(([marker, text]) => {
      thenHtml = thenHtml.split(marker).join(text);
      elseHtml = elseHtml.split(marker).join(text);
    });
    const text = wrapConditionEvaluate({
      clauses,
      joiner,
      hasElse,
      thenHtml,
      elseHtml
    });

    span.setAttribute(TEMPLATE_CONDITION_LAYOUT_ATTR, layout);
    span.setAttribute(TEMPLATE_CONDITION_CLAUSES_ATTR, JSON.stringify(clauses));
    span.setAttribute(TEMPLATE_CONDITION_JOINER_ATTR, joiner);
    const first = clauses[0] || {};
    span.setAttribute(TEMPLATE_CONDITION_SUBJECT_ATTR, first.subject || '');
    span.setAttribute(TEMPLATE_CONDITION_OPERATOR_ATTR, first.operator || OPERATOR_FILLED);
    span.setAttribute(TEMPLATE_CONDITION_VALUE_ATTR, first.value || '');

    while (span.firstChild) {
      span.removeChild(span.firstChild);
    }

    const marker = `%%CK-TEMPLATE-CONDITION-${index}%%`;
    replacements.push([marker, text]);
    span.appendChild(doc.createTextNode(marker));
  });

  let output = root.innerHTML;
  replacements.forEach(([marker, text]) => {
    output = output.split(marker).join(text);
  });
  return output;
};

export { ELSE_SEP_TEXT, JOINER_AND, JOINER_OR } from './constants';

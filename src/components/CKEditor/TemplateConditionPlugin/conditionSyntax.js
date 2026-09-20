import {
  DEFAULT_JOINER,
  DEFAULT_MAX_CLAUSES,
  DEFAULT_OPERATORS,
  ELSE_SEP_TEXT,
  JOINER_AND,
  JOINER_OR,
  OPERATOR_EMPTY,
  OPERATOR_EQ,
  OPERATOR_FALSY,
  OPERATOR_FILLED,
  OPERATOR_NEQ,
  OPERATOR_TRUTHY,
  TEMPLATE_CONDITION_CLASS,
  CONDITION_LAYOUT_BLOCK_MARKER,
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

const IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/;

/**
 * 规范化 config.templateCondition
 */
export const resolveTemplateConditionSettings = (config = {}, variableConfig = {}) => {
  const variables = Array.isArray(config.variables) ? config.variables : Array.isArray(variableConfig.variables) ? variableConfig.variables : [];
  const operators = Array.isArray(config.operators) && config.operators.length ? config.operators : DEFAULT_OPERATORS;
  const allowElse = config.allowElse !== false;
  const allowNesting = config.allowNesting !== false;
  const maxClauses = Number.isFinite(config.maxClauses) && config.maxClauses > 0 ? Math.floor(config.maxClauses) : DEFAULT_MAX_CLAUSES;

  return {
    variables,
    operators,
    allowElse,
    allowNesting,
    maxClauses,
    display: 'inline',
    openCompareValueModal: typeof config.openCompareValueModal === 'function' ? config.openCompareValueModal : undefined,
    openConditionEditorModal: typeof config.openConditionEditorModal === 'function' ? config.openConditionEditorModal : undefined
  };
};

export const normalizeOperator = (operator, allowed = DEFAULT_OPERATORS) => {
  const next = String(operator || OPERATOR_FILLED);
  return allowed.includes(next) ? next : OPERATOR_FILLED;
};

export const normalizeJoiner = joiner => (joiner === JOINER_OR ? JOINER_OR : JOINER_AND);

export const resolveSubjectLabel = (subject, variables = []) => {
  const trimmed = String(subject ?? '').trim();
  const found = variables.find(item => item && item.name === trimmed);
  return found?.label || trimmed;
};

const normalizeClause = (clause = {}, operators = DEFAULT_OPERATORS) => ({
  subject: String(clause.subject ?? '').trim(),
  operator: normalizeOperator(clause.operator, operators),
  value: clause.value == null ? '' : String(clause.value)
});

/** 从 model / 表单 / 旧三属性归一成 { clauses, joiner } */
export const normalizeConditionClauses = (input = {}, operators = DEFAULT_OPERATORS) => {
  const joiner = normalizeJoiner(input.joiner);
  let clauses = [];

  if (Array.isArray(input.clauses) && input.clauses.length) {
    clauses = input.clauses.map(item => normalizeClause(item, operators)).filter(item => item.subject);
  } else if (input.subject) {
    clauses = [normalizeClause(input, operators)];
  }

  if (!clauses.length) {
    clauses = [normalizeClause({ subject: '', operator: OPERATOR_FILLED, value: '' }, operators)];
  }

  return { clauses, joiner };
};

/** 单条谓词 badge 文案 */
export const formatClauseBadge = ({ subject, operator, value }, variables = []) => {
  const label = resolveSubjectLabel(subject, variables);
  const op = normalizeOperator(operator);

  if (op === OPERATOR_TRUTHY) {
    return `${label}为真`;
  }
  if (op === OPERATOR_FALSY) {
    return `${label}为假`;
  }
  if (op === OPERATOR_FILLED) {
    return `${label}有值`;
  }
  if (op === OPERATOR_EMPTY) {
    return `${label}空值`;
  }
  if (op === OPERATOR_EQ) {
    return `${label}=${value ?? ''}`;
  }
  if (op === OPERATOR_NEQ) {
    return `${label}≠${value ?? ''}`;
  }
  return label;
};

/** 连接符展示文案 */
export const formatJoinerLabel = joiner => (normalizeJoiner(joiner) === JOINER_OR ? '或' : '且');

/** 编辑态 badge 纯文本（调试 / 兼容）；多条完整拼接 */
export const formatConditionBadge = (input, variables = []) => {
  const { clauses, joiner } = normalizeConditionClauses(input);
  const joinerLabel = formatJoinerLabel(joiner);

  if (clauses.length <= 1) {
    return formatClauseBadge(clauses[0] || {}, variables);
  }

  return clauses.map(clause => formatClauseBadge(clause, variables)).join(` ${joinerLabel} `);
};

const quoteLiteral = value => {
  if (value === null || value === undefined) {
    return "''";
  }
  const raw = String(value);
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return raw;
  }
  return `'${raw.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
};

const unquoteLiteral = raw => {
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    return raw.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return raw;
};

/** 单条谓词 → lodash 表达式片段（可不带外层括号） */
export const buildClauseExpression = ({ subject, operator, value }) => {
  const name = String(subject ?? '').trim();
  if (!name || !IDENTIFIER_RE.test(name)) {
    return 'false';
  }
  const op = normalizeOperator(operator);

  if (op === OPERATOR_TRUTHY) {
    return name;
  }
  if (op === OPERATOR_FALSY) {
    return `!${name}`;
  }
  if (op === OPERATOR_FILLED) {
    return `${name} != null && ${name} !== ''`;
  }
  if (op === OPERATOR_EMPTY) {
    return `${name} == null || ${name} === ''`;
  }
  if (op === OPERATOR_EQ) {
    return `${name} == ${quoteLiteral(value)}`;
  }
  if (op === OPERATOR_NEQ) {
    return `${name} != ${quoteLiteral(value)}`;
  }
  return name;
};

/** 导出到 lodash evaluate 的条件表达式（不含 if 外壳）；多条款每条加括号 */
export const buildConditionExpression = input => {
  const { clauses, joiner } = normalizeConditionClauses(input);
  const token = joiner === JOINER_OR ? '||' : '&&';

  if (clauses.length === 1) {
    return buildClauseExpression(clauses[0]);
  }

  return clauses.map(clause => `(${buildClauseExpression(clause)})`).join(` ${token} `);
};

/** 解析单条规范谓词（可带一层括号）→ { subject, operator, value } | null */
export const parseSingleClauseExpression = expr => {
  let text = String(expr ?? '').trim();
  if (!text) {
    return null;
  }

  if (text.startsWith('(') && text.endsWith(')')) {
    let depth = 0;
    let wrapsWhole = true;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0 && i < text.length - 1) {
          wrapsWhole = false;
          break;
        }
      }
    }
    if (wrapsWhole) {
      text = text.slice(1, -1).trim();
    }
  }

  let match = text.match(/^([A-Za-z_$][\w$]*)\s*!=\s*null\s*&&\s*\1\s*!==\s*''$/);
  if (match) {
    return { subject: match[1], operator: OPERATOR_FILLED, value: '' };
  }

  match = text.match(/^([A-Za-z_$][\w$]*)\s*==\s*null\s*\|\|\s*\1\s*===\s*''$/);
  if (match) {
    return { subject: match[1], operator: OPERATOR_EMPTY, value: '' };
  }

  match = text.match(/^!(?:\(([A-Za-z_$][\w$]*)\)|([A-Za-z_$][\w$]*))$/);
  if (match) {
    return { subject: match[1] || match[2], operator: OPERATOR_FALSY, value: '' };
  }

  match = text.match(/^([A-Za-z_$][\w$]*)$/);
  if (match) {
    return { subject: match[1], operator: OPERATOR_TRUTHY, value: '' };
  }

  match = text.match(/^([A-Za-z_$][\w$]*)\s*==\s*(.+)$/);
  if (match) {
    return { subject: match[1], operator: OPERATOR_EQ, value: unquoteLiteral(match[2].trim()) };
  }

  match = text.match(/^([A-Za-z_$][\w$]*)\s*!=\s*(.+)$/);
  if (match) {
    return { subject: match[1], operator: OPERATOR_NEQ, value: unquoteLiteral(match[2].trim()) };
  }

  return null;
};

/** 按顶层 && / || 切开（忽略括号内） */
const splitTopLevelJoin = text => {
  const parts = [];
  let depth = 0;
  let buf = '';
  let joiner = null;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (ch === '(') {
      depth += 1;
      buf += ch;
      i += 1;
      continue;
    }
    if (ch === ')') {
      depth -= 1;
      buf += ch;
      i += 1;
      continue;
    }
    if (depth === 0 && text.startsWith('&&', i)) {
      if (joiner === JOINER_OR) {
        return null;
      }
      joiner = JOINER_AND;
      parts.push(buf.trim());
      buf = '';
      i += 2;
      continue;
    }
    if (depth === 0 && text.startsWith('||', i)) {
      if (joiner === JOINER_AND) {
        return null;
      }
      joiner = JOINER_OR;
      parts.push(buf.trim());
      buf = '';
      i += 2;
      continue;
    }
    buf += ch;
    i += 1;
  }

  parts.push(buf.trim());
  return { parts: parts.filter(Boolean), joiner: joiner || DEFAULT_JOINER };
};

/**
 * 解析本插件规范形态的条件表达式
 * → { clauses, joiner, subject, operator, value } | null
 * 兼容字段 subject/operator/value = 首条
 */
export const parseConditionExpression = expr => {
  const text = String(expr ?? '').trim();
  if (!text) {
    return null;
  }

  const single = parseSingleClauseExpression(text);
  if (single) {
    return {
      clauses: [single],
      joiner: DEFAULT_JOINER,
      subject: single.subject,
      operator: single.operator,
      value: single.value
    };
  }

  const split = splitTopLevelJoin(text);
  if (!split || split.parts.length < 2) {
    return null;
  }

  const clauses = [];
  for (const part of split.parts) {
    const parsed = parseSingleClauseExpression(part);
    if (!parsed) {
      return null;
    }
    clauses.push(parsed);
  }

  return {
    clauses,
    joiner: split.joiner,
    subject: clauses[0].subject,
    operator: clauses[0].operator,
    value: clauses[0].value
  };
};

/** 从 DOM / view 属性读取 clauses */
export const readClausesFromAttributes = getAttr => {
  const rawClauses = typeof getAttr === 'function' ? getAttr(TEMPLATE_CONDITION_CLAUSES_ATTR) : '';
  const joiner = normalizeJoiner(typeof getAttr === 'function' ? getAttr(TEMPLATE_CONDITION_JOINER_ATTR) : '');

  if (rawClauses) {
    try {
      const parsed = JSON.parse(rawClauses);
      if (Array.isArray(parsed) && parsed.length) {
        return normalizeConditionClauses({ clauses: parsed, joiner });
      }
    } catch (e) {
      // fall through
    }
  }

  return normalizeConditionClauses({
    subject: typeof getAttr === 'function' ? getAttr(TEMPLATE_CONDITION_SUBJECT_ATTR) : '',
    operator: typeof getAttr === 'function' ? getAttr(TEMPLATE_CONDITION_OPERATOR_ATTR) : OPERATOR_FILLED,
    value: typeof getAttr === 'function' ? getAttr(TEMPLATE_CONDITION_VALUE_ATTR) : '',
    joiner
  });
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
  const first = clauses[0] || normalizeClause({});
  return {
    subject: first.subject,
    operator: first.operator,
    value: first.value,
    clauses,
    joiner,
    ...(hasElse !== undefined ? { hasElse: !!hasElse } : {})
  };
};

/**
 * 用 then/else 内 HTML（变量已 unwrap）拼 lodash evaluate 片段
 */
export const wrapConditionEvaluate = ({ subject, operator, value, clauses, joiner, hasElse, thenHtml, elseHtml }) => {
  const expr = buildConditionExpression({ subject, operator, value, clauses, joiner });
  const thenPart = thenHtml ?? '';
  if (hasElse) {
    return `<% if (${expr}) { %>${thenPart}<% } else { %>${elseHtml ?? ''}<% } %>`;
  }
  return `<% if (${expr}) { %>${thenPart}<% } %>`;
};

const getAttr = (el, name) => el.getAttribute?.(name) || '';

const VOID_TAGS = new Set(['br', 'hr', 'img', 'wbr']);

const escapeAttr = value => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** 块级分支保留标题、段落和样式 class；文本用 textContent，避免把 <%= %> 编成实体 */
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

/** 槽内只允许文本和变量芯片；用 textContent 取出，避免 innerHTML 把 <%= %> 编成 &lt;%=。换行存成 &lt;br&gt;，避免真实 br 把 if 拆成多段文本。 */
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
 * 将数据态 condition span 的内部还原为 lodash evaluate（供 getData）
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

/**
 * 在纯文本中找出本插件规范形态的 if/else（不识别任意 JS）
 */
export const findConditionMatches = text => {
  if (!text || !/<%\s*(?:\/\*ck-layout:block\*\/\s*)?if\b/.test(text)) {
    return [];
  }

  const results = [];
  const openRe = /<%\s*(?:\/\*ck-layout:block\*\/\s*)?if\s*\(\s*([\s\S]*?)\s*\)\s*\{\s*%>/g;
  let openMatch;

  while ((openMatch = openRe.exec(text)) !== null) {
    const parsed = parseConditionExpression(openMatch[1]);
    if (!parsed) {
      continue;
    }

    const start = openMatch.index;
    const afterOpen = openMatch.index + openMatch[0].length;
    const elseToken = '<% } else { %>';
    const closeToken = '<% } %>';
    const elseIndex = text.indexOf(elseToken, afterOpen);
    const closeIndex = text.indexOf(closeToken, afterOpen);

    if (closeIndex === -1) {
      continue;
    }

    let hasElse = false;
    let thenHtml = '';
    let elseHtml = '';
    let end = closeIndex + closeToken.length;

    if (elseIndex !== -1 && elseIndex < closeIndex) {
      const afterElse = elseIndex + elseToken.length;
      const finalClose = text.indexOf(closeToken, afterElse);
      if (finalClose === -1) {
        continue;
      }
      hasElse = true;
      thenHtml = text.slice(afterOpen, elseIndex);
      elseHtml = text.slice(afterElse, finalClose);
      end = finalClose + closeToken.length;
    } else {
      thenHtml = text.slice(afterOpen, closeIndex);
    }

    results.push({
      start,
      end,
      raw: text.slice(start, end),
      ...parsed,
      hasElse,
      layout: openMatch[0].includes(CONDITION_LAYOUT_BLOCK_MARKER) ? LAYOUT_BLOCK : 'inline',
      thenHtml,
      elseHtml
    });

    openRe.lastIndex = end;
  }

  return results;
};

/**
 * 扫描 <% %> 是否配对（保存前校验）
 * @returns {string|null} 错误信息；合法则 null
 */
export const findUnbalancedTemplateTags = text => {
  const source = String(text ?? '');
  let openCount = 0;
  let index = 0;

  while (index < source.length) {
    if (source.startsWith('<%', index)) {
      openCount += 1;
      index += 2;
      continue;
    }
    if (source.startsWith('%>', index)) {
      if (openCount === 0) {
        return 'unmatched %>';
      }
      openCount -= 1;
      index += 2;
      continue;
    }
    index += 1;
  }

  if (openCount > 0) {
    return 'unclosed <%';
  }
  return null;
};

/**
 * 校验模版 HTML：标签配对；可选 dry-run lodash.template
 * @returns {{ ok: boolean, error?: string }}
 */
export const validateTemplateHtml = (html, { template } = {}) => {
  const unbalanced = findUnbalancedTemplateTags(html);
  if (unbalanced) {
    return { ok: false, error: unbalanced };
  }

  if (typeof template === 'function') {
    try {
      template(String(html ?? ''));
    } catch (error) {
      return { ok: false, error: error?.message || String(error) };
    }
  }

  return { ok: true };
};

export { ELSE_SEP_TEXT, JOINER_AND, JOINER_OR };

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
  LAYOUT_BLOCK,
  TEMPLATE_CONDITION_CLAUSES_ATTR,
  TEMPLATE_CONDITION_HAS_ELSE_ATTR,
  TEMPLATE_CONDITION_JOINER_ATTR,
  TEMPLATE_CONDITION_LAYOUT_ATTR,
  TEMPLATE_CONDITION_OPERATOR_ATTR,
  TEMPLATE_CONDITION_SUBJECT_ATTR,
  TEMPLATE_CONDITION_VALUE_ATTR
} from './constants';
import { Liquid, Tokenizer, TokenKind } from 'liquidjs';
import { unwrapTemplateVariableSpans } from '../TemplateVariablePlugin/templateSyntax';
import { VARIABLE_PATH_RE, VARIABLE_PATH_SOURCE } from '../TemplateVariablePlugin/constants';

const IDENTIFIER_RE = VARIABLE_PATH_RE;
const PATH = VARIABLE_PATH_SOURCE;
const LITERAL = `(?:-?\\d+(?:\\.\\d+)?|'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")`;

/** {% if %} 开始标签（可带块级注释前缀）；只用于定位，表达式是否合规由 parseConditionExpression 判断 */
export const LIQUID_IF_OPEN_RE = /(?:\{%\s*#\s*ck-layout:block\s*%\}\s*)?\{%\s*if\s+[\s\S]*?%\}/;

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
    return raw.slice(1, -1).replace(/\\(.)/g, '$1');
  }
  return raw;
};

/** 单条谓词 → Liquid 条件片段 */
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
    return `${name} == false`;
  }
  if (op === OPERATOR_FILLED) {
    return `${name} != blank`;
  }
  if (op === OPERATOR_EMPTY) {
    return `${name} == blank`;
  }
  if (op === OPERATOR_EQ) {
    return `${name} == ${quoteLiteral(value)}`;
  }
  if (op === OPERATOR_NEQ) {
    return `${name} != ${quoteLiteral(value)}`;
  }
  return name;
};

/** 导出到 {% if %} 的条件表达式；Liquid 不支持括号，多条款只用同一种 and / or 扁平连接 */
export const buildConditionExpression = input => {
  const { clauses, joiner } = normalizeConditionClauses(input);
  const token = joiner === JOINER_OR ? 'or' : 'and';
  return clauses.map(clause => buildClauseExpression(clause)).join(` ${token} `);
};

const CLAUSE_PATTERNS = [
  [new RegExp(`^(${PATH})\\s*==\\s*false$`), OPERATOR_FALSY],
  [new RegExp(`^(${PATH})\\s*!=\\s*blank$`), OPERATOR_FILLED],
  [new RegExp(`^(${PATH})\\s*==\\s*blank$`), OPERATOR_EMPTY],
  [new RegExp(`^(${PATH})\\s*==\\s*(${LITERAL})$`), OPERATOR_EQ],
  [new RegExp(`^(${PATH})\\s*!=\\s*(${LITERAL})$`), OPERATOR_NEQ],
  [new RegExp(`^(${PATH})$`), OPERATOR_TRUTHY]
];

/** 解析单条规范谓词 → { subject, operator, value } | null */
export const parseSingleClauseExpression = expr => {
  const text = String(expr ?? '').trim();
  if (!text) {
    return null;
  }

  for (const [re, operator] of CLAUSE_PATTERNS) {
    const match = text.match(re);
    if (match) {
      const value = operator === OPERATOR_EQ || operator === OPERATOR_NEQ ? unquoteLiteral(match[2]) : '';
      return { subject: match[1], operator, value };
    }
  }

  return null;
};

/** 按引号外的 and / or 切开；同一表达式混用 and / or 返回 null */
const splitTopLevelJoin = text => {
  const parts = [];
  let buf = '';
  let joiner = null;
  let quote = null;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (quote) {
      buf += ch;
      if (ch === '\\' && i + 1 < text.length) {
        buf += text[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      buf += ch;
      i += 1;
      continue;
    }
    const word = text.slice(i).match(/^\s+(and|or)\s+/);
    if (word) {
      const next = word[1] === 'or' ? JOINER_OR : JOINER_AND;
      if (joiner && joiner !== next) {
        return null;
      }
      joiner = next;
      parts.push(buf.trim());
      buf = '';
      i += word[0].length;
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
 * 用 then/else 内 HTML（变量已 unwrap）拼 Liquid if 片段
 */
export const wrapConditionEvaluate = ({ subject, operator, value, clauses, joiner, hasElse, thenHtml, elseHtml }) => {
  const expr = buildConditionExpression({ subject, operator, value, clauses, joiner });
  const thenPart = thenHtml ?? '';
  if (hasElse) {
    return `{% if ${expr} %}${thenPart}{% else %}${elseHtml ?? ''}{% endif %}`;
  }
  return `{% if ${expr} %}${thenPart}{% endif %}`;
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

/**
 * 在纯文本中找出本插件规范形态的 if/else（白名单外的写法不识别）
 */
export const findConditionMatches = text => {
  if (!text || !/\{%\s*if\s/.test(text)) {
    return [];
  }

  const results = [];
  const openRe = /(?:\{%\s*#\s*ck-layout:block\s*%\}\s*)?\{%\s*if\s+([\s\S]*?)\s*%\}/g;
  let openMatch;

  while ((openMatch = openRe.exec(text)) !== null) {
    const parsed = parseConditionExpression(openMatch[1]);
    if (!parsed) {
      continue;
    }

    const start = openMatch.index;
    const afterOpen = openMatch.index + openMatch[0].length;
    const elseToken = '{% else %}';
    const closeToken = '{% endif %}';
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
      layout: /^\{%\s*#/.test(openMatch[0]) ? LAYOUT_BLOCK : 'inline',
      thenHtml,
      elseHtml
    });

    openRe.lastIndex = end;
  }

  return results;
};

const TAG_PAIRS = [
  ['{{', '}}'],
  ['{%', '%}']
];

/**
 * 扫描 {{ }} / {% %} 是否配对（保存前校验）
 * @returns {string|null} 错误信息；合法则 null
 */
export const findUnbalancedTemplateTags = text => {
  const source = String(text ?? '');
  let open = null;
  let index = 0;

  while (index < source.length) {
    const opening = TAG_PAIRS.find(([start]) => source.startsWith(start, index));
    if (opening) {
      if (open) {
        return `unclosed ${open[0]}`;
      }
      open = opening;
      index += 2;
      continue;
    }
    const closing = TAG_PAIRS.find(([, end]) => source.startsWith(end, index));
    if (closing) {
      if (!open) {
        return `unmatched ${closing[1]}`;
      }
      if (open !== closing) {
        return `unclosed ${open[0]}`;
      }
      open = null;
      index += 2;
      continue;
    }
    index += 1;
  }

  if (open) {
    return `unclosed ${open[0]}`;
  }
  return null;
};

const OUTPUT_CONTENT_RE = new RegExp(`^\\s*${PATH}\\s*(?:\\|\\s*raw\\s*)?$`);

const isBlockMarkerToken = token => token.kind === TokenKind.Tag && token.name === '#' && String(token.args).trim() === 'ck-layout:block';

/** 按白名单逐个检查顶层 token；返回错误信息或 null */
const findDisallowedToken = source => {
  const tokens = new Tokenizer(source).readTopLevelTokens();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.kind === TokenKind.HTML) {
      continue;
    }
    const text = token.getText();
    if (token.trimLeft || token.trimRight) {
      return `whitespace control is not allowed: ${text}`;
    }
    if (token.kind === TokenKind.Output) {
      if (!OUTPUT_CONTENT_RE.test(token.content)) {
        return `output not allowed: ${text}`;
      }
      continue;
    }
    if (token.kind !== TokenKind.Tag) {
      return `syntax not allowed: ${text}`;
    }
    if (isBlockMarkerToken(token)) {
      const next = tokens[i + 1];
      if (!next || next.kind !== TokenKind.Tag || next.name !== 'if') {
        return `${text} must be followed by {% if %}`;
      }
      continue;
    }
    if (token.name === 'if') {
      if (!parseConditionExpression(token.args)) {
        return `condition not allowed: ${text}`;
      }
      continue;
    }
    if ((token.name === 'else' || token.name === 'endif') && !String(token.args).trim()) {
      continue;
    }
    return `tag not allowed: ${text}`;
  }
  return null;
};

let liquidEngine = null;
const getLiquidEngine = () => {
  if (!liquidEngine) {
    liquidEngine = new Liquid({ outputEscape: 'escape', strictFilters: true });
  }
  return liquidEngine;
};

/**
 * 校验模版 HTML：标签配对 + 语法白名单（{{ path }} / {{ path | raw }} / {% if %} / {% else %} / {% endif %}）+ liquidjs 解析
 * @returns {{ ok: boolean, error?: string }}
 */
export const validateTemplateHtml = html => {
  const source = String(html ?? '');
  const unbalanced = findUnbalancedTemplateTags(source);
  if (unbalanced) {
    return { ok: false, error: unbalanced };
  }

  try {
    const disallowed = findDisallowedToken(source);
    if (disallowed) {
      return { ok: false, error: disallowed };
    }
    getLiquidEngine().parse(source);
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }

  return { ok: true };
};

export { ELSE_SEP_TEXT, JOINER_AND, JOINER_OR };

const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const indexFromLineColumn = (text, line, column) => {
  const source = String(text || '');
  const lines = source.split('\n');
  if (!lines.length) {
    return 0;
  }
  const lineIdx = Math.min(Math.max((line || 1) - 1, 0), lines.length - 1);
  let index = 0;
  for (let i = 0; i < lineIdx; i += 1) {
    index += lines[i].length + 1;
  }
  return Math.min(index + Math.max((column || 1) - 1, 0), source.length);
};

const lineColumnFromIndex = (text, index) => {
  const source = String(text || '');
  const safeIndex = Math.max(0, Math.min(index, source.length));
  const lines = source.slice(0, safeIndex).split('\n');
  return {
    line: lines.length,
    column: (lines[lines.length - 1] || '').length + 1
  };
};

/** 跳过 JSX 属性中的成对引号 / 表达式，定位开标签结束位置 */
const scanJsxOpeningTagEnd = (text, fromIndex) => {
  let i = fromIndex;
  let quote = null;
  while (i < text.length) {
    const ch = text[i];
    if (quote) {
      if (ch === quote && text[i - 1] !== '\\') {
        quote = null;
      }
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      i += 1;
      continue;
    }
    if (ch === '{') {
      let depth = 1;
      i += 1;
      while (i < text.length && depth > 0) {
        const c = text[i];
        if (c === '"' || c === "'" || c === '`') {
          const q = c;
          i += 1;
          while (i < text.length && text[i] !== q) {
            i += 1;
          }
          i += 1;
          continue;
        }
        if (c === '{') {
          depth += 1;
        } else if (c === '}') {
          depth -= 1;
        }
        i += 1;
      }
      continue;
    }
    if (ch === '/' && text[i + 1] === '>') {
      return { end: i + 2, selfClosing: true };
    }
    if (ch === '>') {
      return { end: i + 1, selfClosing: false };
    }
    i += 1;
  }
  return { end: text.length, selfClosing: false };
};

/**
 * 按 1-based 行列定位完整 JSX 元素的字符区间 [start, end)
 * data-live-line/column 指向开标签起点
 */
export const findJsxElementCharRange = (content, line, column) => {
  const text = String(content || '');
  if (!text.trim() || !line || line < 1) {
    return null;
  }

  let start = indexFromLineColumn(text, line, column);
  if (text[start] !== '<') {
    let found = -1;
    for (let i = Math.min(start, text.length - 1); i >= 0; i -= 1) {
      if (text[i] !== '<') {
        continue;
      }
      const next = text[i + 1];
      if (!next || next === '/' || next === '!' || next === '?' || next === '>') {
        continue;
      }
      if (!/[A-Za-z]/.test(next)) {
        continue;
      }
      found = i;
      break;
    }
    if (found < 0) {
      return null;
    }
    start = found;
  }

  const openMatch = text.slice(start).match(/^<\s*([A-Za-z][\w.]*)/);
  if (!openMatch) {
    return null;
  }
  const tagName = openMatch[1];
  const opening = scanJsxOpeningTagEnd(text, start + openMatch[0].length);
  if (opening.selfClosing) {
    return { start, end: opening.end, tagName };
  }

  const openToken = new RegExp(`^<\\s*${escapeRegExp(tagName)}(?=[\\s>/])`);
  const closeToken = new RegExp(`^</\\s*${escapeRegExp(tagName)}\\s*>`);
  let depth = 1;
  let i = opening.end;

  while (i < text.length && depth > 0) {
    if (text[i] !== '<') {
      i += 1;
      continue;
    }
    const slice = text.slice(i);
    const closeMatch = slice.match(closeToken);
    if (closeMatch) {
      depth -= 1;
      i += closeMatch[0].length;
      if (depth === 0) {
        return { start, end: i, tagName };
      }
      continue;
    }
    if (openToken.test(slice)) {
      const nestedOpen = slice.match(openToken);
      const nestedEnd = scanJsxOpeningTagEnd(text, i + nestedOpen[0].length);
      if (nestedEnd.selfClosing) {
        i = nestedEnd.end;
      } else {
        depth += 1;
        i = nestedEnd.end;
      }
      continue;
    }
    i += 1;
  }

  return { start, end: Math.min(i, text.length), tagName };
};

const cleanupAfterJsxDelete = (text, joinIndex) => {
  let next = String(text || '');
  const at = Math.max(0, Math.min(joinIndex, next.length));
  const before = next.slice(0, at).replace(/[ \t]+$/, '');
  const after = next.slice(at).replace(/^[ \t]*\n/, '\n');
  next = before + after;
  // 去掉因删除产生的多余空行（标签之间）
  next = next.replace(/>[ \t]*\n(?:[ \t]*\n)+([ \t]*)(?=<\/?|[{\w])/g, '>\n$1');
  next = next.replace(/\n{3,}/g, '\n\n');
  return next;
};

/** 从 content 中按 1-based line/column 抽取完整 JSX 片段 */
export const extractSelectionFromContent = (content, line, column) => {
  const text = String(content || '');
  const range = findJsxElementCharRange(text, line, column);
  if (!range) {
    return null;
  }
  const startPos = lineColumnFromIndex(text, range.start);
  const endPos = lineColumnFromIndex(text, range.end);
  const code = text.slice(range.start, range.end);
  return {
    startLine: startPos.line,
    endLine: endPos.line,
    column: startPos.column,
    endColumn: endPos.column,
    startOffset: range.start,
    endOffset: range.end,
    code,
    label: range.tagName ? `${range.tagName} @ L${startPos.line}` : `L${startPos.line}`
  };
};

export const applySelectionToContent = (content, selection, nextCode) => {
  const text = String(content || '');
  if (Number.isFinite(selection?.startOffset) && Number.isFinite(selection?.endOffset)) {
    const mid = String(nextCode || '').replace(/\n$/, '');
    return text.slice(0, selection.startOffset) + mid + text.slice(selection.endOffset);
  }
  if (!selection?.startLine || !selection?.endLine) {
    return nextCode;
  }
  const range = findJsxElementCharRange(text, selection.startLine, selection.column || 1);
  if (range) {
    const mid = String(nextCode || '').replace(/\n$/, '');
    return text.slice(0, range.start) + mid + text.slice(range.end);
  }
  const lines = text.split('\n');
  const before = lines.slice(0, selection.startLine - 1);
  const after = lines.slice(selection.endLine);
  const mid = String(nextCode || '').replace(/\n$/, '').split('\n');
  return [...before, ...mid, ...after].join('\n');
};

/** 从 content 中删除选中的完整 JSX 元素 */
export const deleteSelectionFromContent = (content, selection) => {
  const text = String(content || '');
  let range = null;
  if (Number.isFinite(selection?.startOffset) && Number.isFinite(selection?.endOffset)) {
    range = { start: selection.startOffset, end: selection.endOffset };
  } else if (selection?.startLine) {
    range = findJsxElementCharRange(text, selection.startLine, selection.column || 1);
  }
  if (!range) {
    return text;
  }
  const next = text.slice(0, range.start) + text.slice(range.end);
  return cleanupAfterJsxDelete(next, range.start);
};

export const stripCodeFence = text => {
  const raw = String(text || '').trim();
  if (!raw) {
    return '';
  }

  // 整段就是一个代码围栏
  const whole = raw.match(/^```(?:jsx|javascript|js|tsx|ts)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i);
  if (whole) {
    return whole[1].trim();
  }

  // 混有说明文字时，优先取 jsx/js 围栏
  const preferred = raw.match(/```(?:jsx|javascript|js|tsx|ts)\s*\r?\n?([\s\S]*?)\r?\n?```/i);
  if (preferred) {
    return preferred[1].trim();
  }

  // 任意围栏
  const generic = raw.match(/```[^\n]*\r?\n([\s\S]*?)\r?\n?```/);
  if (generic) {
    return generic[1].trim();
  }

  // 残缺围栏（只有开头）
  if (/^```/.test(raw)) {
    return raw.replace(/^```[^\n]*\r?\n?/, '').replace(/\r?\n?```\s*$/, '').trim();
  }

  // 无围栏但前面有说明：从第一个 JSX 根截取
  if (!/^[<!(]/.test(raw)) {
    const idx = raw.search(/<(?:[A-Za-z!/?]|>)/);
    if (idx >= 0) {
      return raw.slice(idx).trim();
    }
  }

  return raw;
};

const inferPropDef = (code, name) => {
  if (/^on[A-Z]/.test(name)) {
    return { type: 'function', defaultValue: '()=>null' };
  }
  const access = `props(?:\\?\\.)?\\.${escapeRegExp(name)}`;
  const orString = code.match(new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*['"\`]([^'"\`]*)['"\`]`));
  if (orString) {
    return { type: 'string', defaultValue: orString[1] };
  }
  const orNum = code.match(new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (orNum) {
    return { type: 'number', defaultValue: orNum[1] };
  }
  const orBool = code.match(new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*(true|false)\\b`));
  if (orBool) {
    return { type: 'boolean', defaultValue: orBool[1] };
  }
  if (new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*\\[`).test(code)) {
    return { type: 'array', defaultValue: '[]' };
  }
  if (new RegExp(`${access}\\s*(?:\\|\\||\\?\\?)\\s*\\{`).test(code)) {
    return { type: 'object', defaultValue: '{}' };
  }
  return { type: 'string', defaultValue: '' };
};

/** 从 JSX/content 中收集 props.xxx 用法，生成可写入「组件参数」的声明 */
export const extractPropsFromCode = (code, existingProps = {}) => {
  const text = String(code || '');
  if (!text.trim()) {
    return {};
  }
  const names = new Set();
  const re = /props(?:\?\.)?\.([A-Za-z_$][\w$]*)|props\[\s*['"`]([^'"`]+)['"`]\s*\]/g;
  let match;
  while ((match = re.exec(text))) {
    const name = match[1] || match[2];
    if (name) {
      names.add(name);
    }
  }
  const result = {};
  names.forEach(name => {
    if (existingProps && existingProps[name]) {
      return;
    }
    result[name] = inferPropDef(text, name);
  });
  return result;
};

/** 合并 AI suggestProps 与代码扫描结果（工具声明优先） */
export const mergeSuggestedProps = (code, suggestedProps, existingProps = {}) => {
  const extracted = extractPropsFromCode(code, existingProps);
  return Object.assign({}, extracted, suggestedProps && typeof suggestedProps === 'object' ? suggestedProps : {});
};

/** 从 preset remotes 收集 AI 索引清单（跳过别名 / 非组件库） */
export const collectRemotesPayload = remotes => {
  if (!remotes || typeof remotes !== 'object') {
    return [];
  }
  const skip = new Set(['default', 'fastify-app']);
  const seen = new Set();
  return Object.entries(remotes)
    .filter(([name]) => name && !skip.has(name))
    .map(([name, cfg]) => ({
      name,
      version: cfg?.version || cfg?.defaultVersion || 'latest',
      packageName: cfg?.packageName
    }))
    .filter(item => {
      const key = `${item.name}@${item.version}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

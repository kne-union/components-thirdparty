/** 从 content 中按 1-based line 抽取大致 JSX 片段 */
export const extractSelectionFromContent = (content, line, column) => {
  const text = String(content || '');
  if (!text.trim() || !line || line < 1) {
    return null;
  }
  const lines = text.split('\n');
  let startIdx = Math.min(Math.max(line - 1, 0), lines.length - 1);

  while (startIdx > 0 && !/<\s*[A-Za-z]/.test(lines[startIdx])) {
    startIdx -= 1;
  }

  const startLineText = lines[startIdx] || '';
  const openMatch = startLineText.match(/<\s*([A-Za-z][\w.]*)/);
  const tagName = openMatch?.[1];
  const label = tagName ? `${tagName} @ L${startIdx + 1}` : `L${startIdx + 1}`;

  let endIdx = startIdx;
  if (tagName && !/\/\s*>/.test(startLineText) && !new RegExp(`</\\s*${tagName.replace('.', '\\.')}\\s*>`).test(startLineText)) {
    let depth = 0;
    const openRe = new RegExp(`<\\s*${tagName.replace('.', '\\.')}(\\s|>|/)`, 'g');
    const closeRe = new RegExp(`</\\s*${tagName.replace('.', '\\.')}\\s*>`, 'g');
    for (let i = startIdx; i < lines.length; i += 1) {
      const row = lines[i];
      const opens = row.match(openRe) || [];
      const closes = row.match(closeRe) || [];
      const selfClosing = (row.match(new RegExp(`<\\s*${tagName.replace('.', '\\.')}[^>]*?/\\s*>`, 'g')) || []).length;
      depth += opens.length - selfClosing - closes.length;
      endIdx = i;
      if (i > startIdx && depth <= 0) {
        break;
      }
      if (i === startIdx && selfClosing && opens.length === selfClosing) {
        break;
      }
    }
  }

  const code = lines.slice(startIdx, endIdx + 1).join('\n');
  return {
    startLine: startIdx + 1,
    endLine: endIdx + 1,
    column: column || 1,
    code,
    label
  };
};

export const applySelectionToContent = (content, selection, nextCode) => {
  if (!selection?.startLine || !selection?.endLine) {
    return nextCode;
  }
  const lines = String(content || '').split('\n');
  const before = lines.slice(0, selection.startLine - 1);
  const after = lines.slice(selection.endLine);
  const mid = String(nextCode || '').replace(/\n$/, '').split('\n');
  return [...before, ...mid, ...after].join('\n');
};

export const stripCodeFence = text => {
  const raw = String(text || '').trim();
  const matched = raw.match(/^```(?:jsx|javascript|js|tsx|ts)?\s*([\s\S]*?)```$/i);
  if (matched) {
    return matched[1].trim();
  }
  return raw;
};

export const collectRemotesPayload = remotes => {
  if (!remotes || typeof remotes !== 'object') {
    return [];
  }
  return Object.entries(remotes).map(([name, cfg]) => ({
    name,
    version: cfg?.version || 'latest',
    packageName: cfg?.packageName
  }));
};

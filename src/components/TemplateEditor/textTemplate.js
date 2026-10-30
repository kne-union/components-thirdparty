const escapeHtml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 纯文本按行转为段落，供 CKEditor 加载；{{ }} / {% if %} 由模版插件从文本中识别 */
export const textToHtml = text => {
  const source = String(text ?? '');
  if (!source) {
    return '';
  }
  return source
    .split('\n')
    .map(line => `<p>${line ? escapeHtml(line) : '&nbsp;'}</p>`)
    .join('');
};

const readInlineText = node => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue;
  }
  if (node.nodeName === 'BR') {
    return '\n';
  }
  return Array.from(node.childNodes).map(readInlineText).join('');
};

/** CKEditor 输出的 HTML 转为纯文本：每个顶层块占一行，<br> 换行，丢弃所有格式 */
export const htmlToText = html => {
  const source = String(html ?? '');
  if (!source) {
    return '';
  }
  const doc = new DOMParser().parseFromString(`<body>${source}</body>`, 'text/html');
  return Array.from(doc.body.childNodes)
    .map(node => {
      const line = readInlineText(node).replace(/\u00a0/g, ' ');
      return line.trim() ? line : '';
    })
    .join('\n');
};

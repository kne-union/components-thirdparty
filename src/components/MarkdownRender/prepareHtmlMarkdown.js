/**
 * 将 Markdown 中的 HTML 代码围栏转为 HtmlBlock md-components，避免显示成代码。
 * 支持：```html ... ```；以及内容以 < 开头的 ``` ... ```
 */
export const prepareHtmlMarkdown = markdown => {
  const variables = {};
  let index = 0;

  const replaceFence = (full, lang, body) => {
    const html = String(body || '').trim();
    const langIsHtml = /^html$/i.test(String(lang || '').trim());
    const looksLikeHtml = /^<[a-zA-Z!/?]/.test(html);
    if (!html || (!langIsHtml && !looksLikeHtml)) {
      return full;
    }
    const key = `htmlBlock${index++}`;
    variables[key] = html;
    return `\n\n\`\`\`yml\nmd-components:\n  type: HtmlBlock\n  props:\n    html: $${key}\n\`\`\`\n\n`;
  };

  const text = String(markdown || '').replace(/```([^\n`]*)\n([\s\S]*?)```/g, (full, lang, body) =>
    replaceFence(full, lang, body)
  );

  return { text, variables };
};

import { EMAIL_STYLE_CSS } from './emailStyles';

/** 借浏览器自身的 CSS 解析器拆规则，避免手写正则解析选择器；@media 等无法 inline 的规则原样带出 */
const parseStyleRules = css => {
  const styleEl = document.createElement('style');

  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  try {
    const cssRules = [...(styleEl.sheet?.cssRules || [])];

    return {
      rules: cssRules
        .filter(rule => rule.selectorText && rule.style?.cssText)
        .map(rule => ({ selectorText: rule.selectorText, cssText: rule.style.cssText })),
      leftover: cssRules
        .filter(rule => !rule.selectorText)
        .map(rule => rule.cssText)
        .join('\n')
    };
  } finally {
    styleEl.remove();
  }
};

const mergeCssText = (base, extra) => (base ? `${base.replace(/;\s*$/, '')};${extra}` : extra);

/**
 * 把 class 上的邮件样式写进元素 `style` 属性，产出可直接发信的 HTML。
 *
 * 多数邮件客户端会剥离 `<style>`，但都认 inline style。`EmailStylePlugin` 已把本函数接在
 * `editor.data.get()` 出口上，`onChange` / `getData()` 拿到的内容就是 inline 化后的结果，
 * 业务侧通常无需直接调用；手上只有 class 版 HTML 时可用它补样式。
 *
 * @param {string} html 富文本内容
 * @param {object} [options]
 * @param {string} [options.css] 要 inline 的 CSS，默认 `EMAIL_STYLE_CSS`
 * @param {(html: string, css: string) => string} [options.inliner] 自定义 inline 实现（如 `require('juice/client')`）
 * @returns {string} inline 化后的 HTML
 */
export const toEmailHtml = (html, { css = EMAIL_STYLE_CSS, inliner } = {}) => {
  const content = String(html ?? '');

  // 接在 getData 出口上会被高频调用，没用到邮件样式时不做任何解析
  if (!content.includes('email-')) {
    return content;
  }

  if (typeof inliner === 'function') {
    return inliner(content, css);
  }

  // SSR / 无 DOM 环境退化为 embedded style，支持 <style> 的客户端仍可正常渲染
  if (typeof document === 'undefined' || typeof DOMParser === 'undefined') {
    return `<style>${css}</style>${content}`;
  }

  const { rules, leftover } = parseStyleRules(css);
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${content}</body>`, 'text/html');
  const body = doc.body;

  // 工具栏产生的 inline style（颜色、字号、对齐）优先级最高，先存后补回
  const ownStyles = new Map();

  body.querySelectorAll('[style]').forEach(el => ownStyles.set(el, el.getAttribute('style')));

  rules.forEach(({ selectorText, cssText }) => {
    body.querySelectorAll(selectorText).forEach(el => {
      el.style.cssText = mergeCssText(el.style.cssText, cssText);
    });
  });

  ownStyles.forEach((cssText, el) => {
    el.style.cssText = mergeCssText(el.style.cssText, cssText);
  });

  return leftover ? `<style>${leftover}</style>${body.innerHTML}` : body.innerHTML;
};

export default toEmailHtml;

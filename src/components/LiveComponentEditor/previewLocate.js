const HIGHLIGHT_DURATION_MS = 1000;

/** 自元素向上查找带 data-live-line 的最近节点 */
export const findNearestLiveSourceElement = start => {
  let el = start;
  while (el && el !== document.documentElement) {
    if (el.getAttribute && el.getAttribute('data-live-line')) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
};

const getHighlightRect = el => {
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 || rect.height > 0) {
    return rect;
  }
  const children = el.children || [];
  if (!children.length) {
    return rect;
  }
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  Array.from(children).forEach(child => {
    const childRect = child.getBoundingClientRect();
    top = Math.min(top, childRect.top);
    left = Math.min(left, childRect.left);
    right = Math.max(right, childRect.right);
    bottom = Math.max(bottom, childRect.bottom);
  });
  if (!Number.isFinite(top)) {
    return rect;
  }
  return {
    top,
    left,
    width: right - left,
    height: bottom - top,
    right,
    bottom
  };
};

/** 在页面上高亮盒子约 1s */
export const highlightElementBox = (el, className) => {
  if (!el) {
    return;
  }
  const rect = getHighlightRect(el);
  const overlay = document.createElement('div');
  if (className) {
    overlay.className = className;
  }
  Object.assign(overlay.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 2)}px`,
    height: `${Math.max(rect.height, 2)}px`,
    pointerEvents: 'none',
    zIndex: '99999',
    boxSizing: 'border-box'
  });
  document.body.appendChild(overlay);
  window.setTimeout(() => {
    overlay.remove();
  }, HIGHLIGHT_DURATION_MS);
};

/** 定位 Monaco 到指定行列 */
export const revealEditorPosition = (editorApi, line, column = 1) => {
  const editor = editorApi?.getEditor?.() || editorApi;
  if (!editor?.revealLineInCenter) {
    return;
  }
  const lineNumber = Math.max(1, Number(line) || 1);
  const columnNumber = Math.max(1, Number(column) || 1);
  editor.revealLineInCenter(lineNumber);
  editor.setPosition({ lineNumber, column: columnNumber });
  editor.focus();
};

/**
 * 混合模式双击：找最近带源码标记的元素 → 高亮 → 跳转编辑器
 * @returns {boolean} 是否成功定位
 */
export const handlePreviewLocate = (event, { codeEditorRef, highlightClassName } = {}) => {
  const target = event.target;
  if (!target || !(target instanceof Element)) {
    return false;
  }

  const sourceEl =
    findNearestLiveSourceElement(target) ||
    findNearestLiveSourceElement(document.elementFromPoint(event.clientX, event.clientY));

  if (!sourceEl) {
    return false;
  }

  const line = sourceEl.getAttribute('data-live-line');
  const column = sourceEl.getAttribute('data-live-column') || '1';
  highlightElementBox(sourceEl, highlightClassName);
  revealEditorPosition(codeEditorRef?.current, line, column);
  return true;
};

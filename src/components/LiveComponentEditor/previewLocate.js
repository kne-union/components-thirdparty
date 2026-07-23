export const HIGHLIGHT_DURATION_MS = 1000;
/** 几何就近最大距离（px） */
export const GEOMETRY_NEAREST_MAX_DISTANCE = 80;

/** 自元素向上查找带 data-live-line 的最近节点；可选限制在 root 内 */
export const findNearestLiveSourceElement = (start, root) => {
  let el = start;
  while (el && el !== document.documentElement) {
    if (root && el === root) {
      if (el.getAttribute?.('data-live-line')) {
        return el;
      }
      return null;
    }
    if (root && !root.contains(el)) {
      return null;
    }
    if (el.getAttribute && el.getAttribute('data-live-line')) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
};

/** 只读测量元素盒子；零尺寸时合并子节点包围盒 */
export const getHighlightRect = el => {
  if (!el?.getBoundingClientRect) {
    return null;
  }
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 || rect.height > 0) {
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }
  const children = el.children || [];
  if (!children.length) {
    return {
      top: rect.top,
      left: rect.left,
      width: Math.max(rect.width, 2),
      height: Math.max(rect.height, 2)
    };
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
    return {
      top: rect.top,
      left: rect.left,
      width: Math.max(rect.width, 2),
      height: Math.max(rect.height, 2)
    };
  }
  return {
    top,
    left,
    width: Math.max(right - left, 2),
    height: Math.max(bottom - top, 2)
  };
};

export const measureHighlightRects = elements => {
  if (!elements?.length) {
    return [];
  }
  return elements.map(getHighlightRect).filter(Boolean);
};

/** 视口坐标转为相对 container 的绝对定位坐标 */
export const rectsRelativeTo = (rects, containerEl) => {
  if (!containerEl || !rects?.length) {
    return rects || [];
  }
  const origin = containerEl.getBoundingClientRect();
  return rects.map(r => ({
    top: r.top - origin.top,
    left: r.left - origin.left,
    width: r.width,
    height: r.height
  }));
};

const pointToRectDistance = (x, y, rect) => {
  const dx = x < rect.left ? rect.left - x : x > rect.left + rect.width ? x - (rect.left + rect.width) : 0;
  const dy = y < rect.top ? rect.top - y : y > rect.top + rect.height ? y - (rect.top + rect.height) : 0;
  return Math.hypot(dx, dy);
};

/** 预览根内距点击点最近的带标记元素（阈值内） */
export const findNearestMarkedByGeometry = (
  previewRoot,
  clientX,
  clientY,
  maxDistance = GEOMETRY_NEAREST_MAX_DISTANCE
) => {
  if (!previewRoot) {
    return null;
  }
  const marked = previewRoot.querySelectorAll('[data-live-line]');
  let best = null;
  let bestDist = Infinity;
  marked.forEach(el => {
    const rect = getHighlightRect(el);
    if (!rect) {
      return;
    }
    const dist = pointToRectDistance(clientX, clientY, rect);
    if (dist < bestDist) {
      bestDist = dist;
      best = el;
    }
  });
  if (best && bestDist <= maxDistance) {
    return best;
  }
  return null;
};

export const getSourceFromElement = el => {
  if (!el?.getAttribute) {
    return null;
  }
  const line = Number(el.getAttribute('data-live-line'));
  if (!Number.isFinite(line) || line < 1) {
    return null;
  }
  const column = Number(el.getAttribute('data-live-column') || 1);
  return {
    element: el,
    line,
    column: Number.isFinite(column) && column > 0 ? column : 1
  };
};

export const findSameSourceElements = (previewRoot, line, column) => {
  if (!previewRoot) {
    return [];
  }
  const lineStr = String(line);
  const columnStr = String(column || 1);
  return Array.from(previewRoot.querySelectorAll('[data-live-line]')).filter(el => {
    return (
      el.getAttribute('data-live-line') === lineStr &&
      (el.getAttribute('data-live-column') || '1') === columnStr
    );
  });
};

/**
 * 从视口坐标解析源码位置：精确（祖先标记）→ 几何就近
 */
export const resolveSourceFromPoint = (clientX, clientY, previewRoot) => {
  const hit = document.elementFromPoint(clientX, clientY);
  const start = hit && previewRoot && previewRoot.contains(hit) ? hit : null;
  const exact = findNearestLiveSourceElement(start, previewRoot);
  if (exact) {
    return getSourceFromElement(exact);
  }
  const geo = findNearestMarkedByGeometry(previewRoot, clientX, clientY);
  if (geo) {
    return getSourceFromElement(geo);
  }
  return null;
};

/**
 * 编辑器光标行列 → 预览中最佳标记节点（可多个同标）
 */
export const resolveElementsFromEditorPosition = (previewRoot, lineNumber, columnNumber) => {
  if (!previewRoot) {
    return [];
  }
  const line = Math.max(1, Number(lineNumber) || 1);
  const column = Math.max(1, Number(columnNumber) || 1);
  const marked = Array.from(previewRoot.querySelectorAll('[data-live-line]'));
  if (!marked.length) {
    return [];
  }

  const parsed = marked.map(el => ({
    el,
    line: Number(el.getAttribute('data-live-line')) || 1,
    column: Number(el.getAttribute('data-live-column') || 1)
  }));

  const candidates = parsed.filter(p => p.line < line || (p.line === line && p.column <= column));
  if (!candidates.length) {
    return [];
  }

  const bestLine = Math.max(...candidates.map(p => p.line));
  const onBestLine = candidates.filter(p => p.line === bestLine);
  const bestCol = Math.max(...onBestLine.map(p => p.column));
  return onBestLine.filter(p => p.column === bestCol).map(p => p.el);
};

/** 定位 Monaco 到指定行列，并滚入编辑器视口中心 */
export const revealEditorPosition = (editorApi, line, column = 1) => {
  const editor = editorApi?.getEditor?.() || editorApi;
  if (!editor?.setPosition) {
    return;
  }
  const lineNumber = Math.max(1, Number(line) || 1);
  const columnNumber = Math.max(1, Number(column) || 1);
  const position = { lineNumber, column: columnNumber };
  if (editor.revealPositionInCenter) {
    editor.revealPositionInCenter(position);
  } else if (editor.revealLineInCenter) {
    editor.revealLineInCenter(lineNumber);
  }
  editor.setPosition(position);
  editor.focus();
};

/**
 * 将目标元素滚入最近滚动容器的可视区域（不改 DOM 结构）
 * @param {Element[]} elements
 * @param {{ block?: ScrollLogicalPosition, inline?: ScrollLogicalPosition, behavior?: ScrollBehavior }} [options]
 */
export const scrollElementsIntoView = (elements, options = {}) => {
  const el = elements?.[0];
  if (!el?.scrollIntoView) {
    return;
  }
  el.scrollIntoView({
    block: options.block || 'nearest',
    inline: options.inline || 'nearest',
    behavior: options.behavior || 'smooth'
  });
};

/**
 * 混合模式双击：解析源码位置 → 跳转编辑器，返回供外部 overlay 使用的测量结果
 * @returns {{ ok: boolean, rects?: object[], elements?: Element[], line?: number, column?: number }}
 */
export const handlePreviewLocate = (event, { codeEditorRef, previewRoot } = {}) => {
  const target = event?.target;
  if (!target || !(target instanceof Element)) {
    return { ok: false };
  }

  const resolved = resolveSourceFromPoint(event.clientX, event.clientY, previewRoot);
  if (!resolved) {
    return { ok: false };
  }

  revealEditorPosition(codeEditorRef?.current, resolved.line, resolved.column);

  let elements = findSameSourceElements(previewRoot, resolved.line, resolved.column);
  if (!elements.length) {
    elements = [resolved.element];
  }
  return {
    ok: true,
    line: resolved.line,
    column: resolved.column,
    elements,
    rects: measureHighlightRects(elements)
  };
};

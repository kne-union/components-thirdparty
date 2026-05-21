import { useEffect, useState } from 'react';

/** 将宽度转为 CSS 变量可用的值，如 800 → "800px" */
export const formatToolbarDropdownMaxWidth = width => {
  if (width == null || width === '') {
    return undefined;
  }

  return typeof width === 'number' ? `${Math.floor(width)}px` : String(width);
};

/** 生成带 --ck-toolbar-dropdown-max-width 的 style 对象，供外层容器使用 */
export const getToolbarDropdownMaxWidthStyle = width => {
  const value = formatToolbarDropdownMaxWidth(width);

  if (!value) {
    return undefined;
  }

  return { '--ck-toolbar-dropdown-max-width': value };
};

/**
 * 在外部容器 ref 上监听宽度，用于设置 --ck-toolbar-dropdown-max-width
 * @example
 * const containerRef = useRef(null);
 * const maxWidth = useToolbarDropdownMaxWidth(containerRef);
 * <div ref={containerRef} style={getToolbarDropdownMaxWidthStyle(maxWidth)}>
 *   <CKEditor.Field />
 * </div>
 */
export const useToolbarDropdownMaxWidth = containerRef => {
  const [maxWidth, setMaxWidth] = useState(undefined);

  useEffect(() => {
    const el = containerRef?.current;

    if (!el) {
      return;
    }

    const update = () => {
      const width = el.clientWidth;

      setMaxWidth(width > 0 ? formatToolbarDropdownMaxWidth(width) : undefined);
    };

    update();

    const resizeObserver = new ResizeObserver(update);

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return maxWidth;
};

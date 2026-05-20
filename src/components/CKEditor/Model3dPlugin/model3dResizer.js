import { Rect } from 'ckeditor5';

const MIN_WIDTH = 120;
const MIN_HEIGHT = 150;

const extractCoordinates = event => ({
  x: event.pageX,
  y: event.pageY
});

const getEditableContentWidth = editor => {
  const root = editor.editing.view.getDomRoot();

  return root?.clientWidth || root?.offsetWidth || 0;
};

const calcWidthPercents = (widthPx, editor) => {
  const contentWidth = getEditableContentWidth(editor) || widthPx;

  return Math.min(Math.round((widthPx / contentWidth) * 10000) / 100, 100);
};

/**
 * 按手柄与锚点计算自由宽高（不锁比例）
 */
const proposeFreeSize = (state, domEventData, isCentered) => {
  const current = extractCoordinates(domEventData);
  const ref = state._referenceCoordinates;
  const handle = state.activeHandlePosition;
  let width = state.originalWidth;
  let height = state.originalHeight;

  if (handle.endsWith('right')) {
    width = current.x - ref.x;
  } else if (handle.endsWith('left')) {
    width = ref.x - current.x;
  }

  if (handle.startsWith('bottom')) {
    height = current.y - ref.y;
  } else if (handle.startsWith('top')) {
    height = ref.y - current.y;
  }

  if (isCentered) {
    if (handle.endsWith('right')) {
      const delta = current.x - (ref.x + state.originalWidth);
      width = state.originalWidth + 2 * delta;
    } else if (handle.endsWith('left')) {
      const delta = ref.x - current.x;
      width = state.originalWidth + 2 * delta;
    }
  }

  return {
    width: Math.max(MIN_WIDTH, Math.round(width)),
    height: Math.max(MIN_HEIGHT, Math.round(height))
  };
};

const applyDomResize = (domFigure, domHandleHost, widthPx, heightPx) => {
  const width = `${widthPx}px`;
  const height = `${heightPx}px`;

  if (domFigure) {
    domFigure.style.width = width;
    domFigure.style.maxWidth = '100%';
    domFigure.style.height = height;
    domFigure.style.minHeight = 'unset';
    domFigure.style.setProperty('--model3d-height', height);
  }

  if (domHandleHost) {
    domHandleHost.style.width = width;
    domHandleHost.style.height = height;
    domHandleHost.style.minHeight = 'unset';

    const modelViewer = domHandleHost.querySelector('model-viewer');

    if (modelViewer) {
      modelViewer.style.setProperty('width', '100%', 'important');
      modelViewer.style.setProperty('height', '100%', 'important');
      modelViewer.style.setProperty('min-height', 'unset', 'important');
    }
  }
};

/**
 * 覆盖 WidgetResizer：自由宽高 + 拖拽仅改 DOM，松手再写入 model
 */
export const patchModel3dResizer = resizer => {
  resizer._proposeNewSize = function (domEventData) {
    const isCentered = this._options.isCentered?.(this) ?? false;
    const { width, height } = proposeFreeSize(this.state, domEventData, isCentered);
    const editor = this._options.editor;
    const widthPercents = calcWidthPercents(width, editor);

    return { width, height, widthPercents };
  };

  resizer.updateSize = function (domEventData) {
    const newSize = this._proposeNewSize(domEventData);
    const domFigure = this._domResizerWrapper?.parentElement;
    const domHandleHost = this._getHandleHost();

    applyDomResize(domFigure, domHandleHost, newSize.width, newSize.height);

    const rect = new Rect(domHandleHost || domFigure);

    this.redraw(rect);
    this.state.update({
      ...newSize,
      handleHostWidth: newSize.width,
      handleHostHeight: newSize.height
    });
  };
};

export const getResizeCommitPayload = (resizer, widthValue) => {
  const heightPx = resizer.state.proposedHeight ?? resizer.state.proposedHandleHostHeight;

  return {
    width: widthValue,
    height: heightPx ? `${Math.round(heightPx)}px` : undefined
  };
};

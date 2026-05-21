import { syncModelViewerLayout } from '../../../common/modelViewerMount';
import { MODEL3D_DEFAULT_HEIGHT, MODEL3D_STYLES } from './constants';

export const getStyleByName = name => MODEL3D_STYLES.find(style => style.name === name);

export const getFigureClasses = modelElement => {
  const classes = ['ck-model3d'];
  const style = getStyleByName(modelElement.getAttribute('model3dStyle'));

  if (style?.className) {
    classes.push(style.className);
  }

  if (modelElement.getAttribute('resizedWidth')) {
    classes.push('image_resized');
  }

  return classes;
};

export const resolveModel3dHeight = modelElement =>
  modelElement?.getAttribute('resizedHeight') || MODEL3D_DEFAULT_HEIGHT;

/** 清除拖拽时写入的 inline 尺寸，避免与 view / CSS 变量冲突 */
export const clearModel3dInlineResizeStyles = (editor, modelElement) => {
  const viewFigure = editor.editing.mapper.toViewElement(modelElement);

  if (!viewFigure) {
    return;
  }

  const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);

  if (!domFigure) {
    return;
  }

  domFigure.style.width = '';
  domFigure.style.height = '';
  domFigure.style.minHeight = '';

  const viewer = domFigure.querySelector('.ck-model3d-viewer');

  if (viewer) {
    delete viewer.dataset.model3dHeight;
    viewer.style.width = '';
    viewer.style.height = '';
    viewer.style.minHeight = '';
  }

  const modelViewer = domFigure.querySelector('model-viewer');

  if (modelViewer) {
    modelViewer.style.removeProperty('width');
    modelViewer.style.removeProperty('height');
    modelViewer.style.removeProperty('min-height');
  }
};

const findModel3dInModelAncestors = node => {
  let parent = node;

  while (parent) {
    if (parent.is?.('element', 'model3d')) {
      return parent;
    }
    parent = parent.parent;
  }

  return null;
};

export const getSelectedModel3d = selection => {
  const selected = selection.getSelectedElement?.();

  if (selected?.is('element', 'model3d')) {
    return selected;
  }

  for (const position of [selection.focus, selection.anchor]) {
    const fromPosition = findModel3dInModelAncestors(position?.parent);

    if (fromPosition) {
      return fromPosition;
    }
  }

  try {
    const range = selection.getFirstRange?.();

    if (range) {
      for (const item of range.getItems()) {
        if (item.is('element', 'model3d')) {
          return item;
        }

        const inAncestors = findModel3dInModelAncestors(item);

        if (inAncestors) {
          return inAncestors;
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
};

const findModel3dFigureInViewAncestors = node => {
  let parent = node;

  while (parent) {
    if (parent.is?.('element', 'figure') && parent.hasClass('ck-model3d')) {
      return parent;
    }
    parent = parent.parent;
  }

  return null;
};

export const getModel3dWidgetFromViewSelection = viewSelection => {
  const selected = viewSelection.getSelectedElement();

  if (selected?.is('element', 'figure') && selected.hasClass('ck-model3d')) {
    return selected;
  }

  for (const position of [viewSelection.focus, viewSelection.anchor]) {
    const figure = findModel3dFigureInViewAncestors(position?.parent);

    if (figure) {
      return figure;
    }
  }

  return null;
};

export const getModel3dWidgetFromEditor = editor => {
  const viewFigure = getModel3dWidgetFromViewSelection(editor.editing.view.document.selection);

  if (viewFigure) {
    return viewFigure;
  }

  const modelElement = getSelectedModel3d(editor.model.document.selection);

  if (!modelElement) {
    return null;
  }

  return editor.editing.mapper.toViewElement(modelElement);
};

export const syncFigureStyles = (writer, viewFigure, modelElement) => {
  MODEL3D_STYLES.forEach(style => {
    if (style.className) {
      writer.removeClass(style.className, viewFigure);
    }
  });

  const currentStyle = getStyleByName(modelElement.getAttribute('model3dStyle'));

  if (currentStyle?.className) {
    writer.addClass(currentStyle.className, viewFigure);
  }
};

export const syncFigureSizeStyles = (writer, viewFigure, modelElement) => {
  const width = modelElement.getAttribute('resizedWidth');
  const height = resolveModel3dHeight(modelElement);

  if (width) {
    writer.setStyle('width', width, viewFigure);
    writer.addClass('image_resized', viewFigure);
  } else {
    writer.removeStyle('width', viewFigure);
    writer.removeClass('image_resized', viewFigure);
  }

  writer.setStyle('height', height, viewFigure);
};

/**
 * RawElement 只在首次挂载时执行回调，高度变更必须直接改 DOM
 */
export const applyViewerHeightToDom = (editor, modelElement, height) => {
  const resolvedHeight = height || resolveModel3dHeight(modelElement);
  const viewFigure = editor.editing.mapper.toViewElement(modelElement);

  if (!viewFigure) {
    return;
  }

  clearModel3dInlineResizeStyles(editor, modelElement);

  editor.editing.view.change(writer => {
    writer.setStyle('height', resolvedHeight, viewFigure);
  });

  const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);

  if (!domFigure) {
    return;
  }

  const viewer = domFigure.querySelector('.ck-model3d-viewer');
  const modelViewer = domFigure.querySelector('model-viewer');

  if (viewer && modelViewer) {
    syncModelViewerLayout(viewer, modelViewer, resolvedHeight);
    return;
  }

  domFigure.style.setProperty('--model3d-height', resolvedHeight);
  domFigure.style.height = resolvedHeight;
  domFigure.style.minHeight = 'unset';

  if (modelViewer) {
    modelViewer.style.setProperty('width', '100%', 'important');
    modelViewer.style.setProperty('height', resolvedHeight, 'important');
    modelViewer.style.setProperty('min-height', '0', 'important');
    modelViewer.style.setProperty('max-height', 'none', 'important');
  }
};

export const findModelViewer = viewElement => {
  for (const child of viewElement.getChildren()) {
    if (child.is('element', 'model-viewer')) {
      return child;
    }
    if (child.is('element')) {
      const nested = findModelViewer(child);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
};

export const findCkModel3dContainer = viewElement => {
  if (viewElement.is('element', 'div') && viewElement.hasClass('ck-model3d')) {
    return viewElement;
  }

  for (const child of viewElement.getChildren()) {
    if (child.is('element')) {
      const found = findCkModel3dContainer(child);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

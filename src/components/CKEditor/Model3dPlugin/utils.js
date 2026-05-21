import { syncModelViewerLayout } from '../../../common/modelViewerMount';
import { MEDIA_DEFAULT_HEIGHT, MEDIA_STYLES } from '../shared/mediaWidget/constants';
import { createMediaSelectionUtils } from '../shared/mediaWidget/selection';
import { createMediaStyleUtils } from '../shared/mediaWidget/styleUtils';

const selection = createMediaSelectionUtils({ modelName: 'model3d', figureClass: 'ck-model3d' });

export const getSelectedModel3d = selection.getSelected;
export const getModel3dWidgetFromViewSelection = selection.getWidgetFromViewSelection;
export const getModel3dWidgetFromEditor = selection.getWidgetFromEditor;

const styleUtils = createMediaStyleUtils({
  figureClass: 'ck-model3d',
  styleAttribute: 'model3dStyle',
  styles: MEDIA_STYLES,
  defaultHeight: MEDIA_DEFAULT_HEIGHT
});

export const getStyleByName = styleUtils.getStyleByName;
export const getFigureClasses = styleUtils.getFigureClasses;
export const resolveModel3dHeight = styleUtils.resolveHeight;
export const syncFigureStyles = styleUtils.syncFigureStyles;
export const syncFigureSizeStyles = styleUtils.syncFigureSizeStyles;
export const readModel3dStyleFromFigure = styleUtils.readStyleFromViewFigure;
export const consumeModel3dStyleClasses = styleUtils.consumeStyleClasses;

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

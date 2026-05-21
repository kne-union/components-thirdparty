import { createResizePlugins } from '../shared/mediaWidget/createResizePlugins';
import { createDefaultDomResizeApplier } from '../shared/mediaWidget/widgetResizer';
import { MODEL3D_DEFAULT_HEIGHT, MODEL3D_HEIGHT_OPTIONS, MODEL3D_RESIZE_OPTIONS } from './constants';
import {
  applyViewerHeightToDom,
  clearModel3dInlineResizeStyles,
  getModel3dWidgetFromEditor,
  getSelectedModel3d,
  resolveModel3dHeight,
  syncFigureSizeStyles
} from './utils';

const baseApplyDomResize = createDefaultDomResizeApplier({ cssVarName: '--model3d-height' });

const applyModel3dDomResize = (domFigure, domHandleHost, widthPx, heightPx) => {
  baseApplyDomResize(domFigure, domHandleHost, widthPx, heightPx);

  const modelViewer = domHandleHost?.querySelector?.('model-viewer');

  if (modelViewer) {
    modelViewer.style.setProperty('width', '100%', 'important');
    modelViewer.style.setProperty('height', '100%', 'important');
    modelViewer.style.setProperty('min-height', 'unset', 'important');
  }
};

const { ResizeEditing, ResizeUI } = createResizePlugins({
  editingPluginName: 'Model3dResizeEditing',
  uiPluginName: 'Model3dResizeUI',
  requiresEditing: 'Model3dEditing',
  modelName: 'model3d',
  commandName: 'resizeModel3d',
  defaultHeight: MODEL3D_DEFAULT_HEIGHT,
  widthOptions: MODEL3D_RESIZE_OPTIONS,
  heightOptions: MODEL3D_HEIGHT_OPTIONS,
  getSelected: getSelectedModel3d,
  getWidgetFromEditor: getModel3dWidgetFromEditor,
  syncFigureSizeStyles,
  resolveHeight: resolveModel3dHeight,
  clearInlineResizeStyles: clearModel3dInlineResizeStyles,
  applyHeightToDom: applyViewerHeightToDom,
  getHandleHost(domWidgetElement) {
    return domWidgetElement.querySelector('.ck-model3d-viewer') || domWidgetElement;
  },
  getResizeHost(domWidgetElement) {
    return domWidgetElement;
  },
  isCentered(modelElement) {
    const model3dStyle = modelElement.getAttribute('model3dStyle');
    return model3dStyle === 'alignCenter' || !model3dStyle || model3dStyle === 'block';
  },
  applyDomResize: applyModel3dDomResize
});

export const Model3dResizeEditing = ResizeEditing;
export const Model3dResizeUI = ResizeUI;

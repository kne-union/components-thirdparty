import { MEDIA_STYLES } from '../shared/mediaWidget/constants';
import { createStylePlugins } from '../shared/mediaWidget/createStylePlugins';
import { getModel3dWidgetFromEditor, getSelectedModel3d, getStyleByName, syncFigureStyles } from './utils';

const { StyleEditing, StyleUI } = createStylePlugins({
  editingPluginName: 'Model3dStyleEditing',
  uiPluginName: 'Model3dStyleUI',
  requiresEditing: 'Model3dEditing',
  modelName: 'model3d',
  commandName: 'model3dStyle',
  styleAttribute: 'model3dStyle',
  componentPrefix: 'model3dStyle',
  styles: MEDIA_STYLES,
  getSelected: getSelectedModel3d,
  getWidgetFromEditor: getModel3dWidgetFromEditor,
  syncFigureStyles,
  getStyleByName
});

export const Model3dStyleEditing = StyleEditing;
export const Model3dStyleUI = StyleUI;

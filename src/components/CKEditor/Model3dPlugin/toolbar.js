import { createToolbarPlugin } from '../shared/mediaWidget/createToolbarPlugin';
import { getModel3dWidgetFromViewSelection, getSelectedModel3d } from './utils';

export const Model3dToolbar = createToolbarPlugin({
  pluginName: 'Model3dToolbar',
  toolbarConfigKey: 'model3d.toolbar',
  widgetName: 'model3d',
  ariaLabel: '3D模型工具栏',
  figureClass: 'ck-model3d',
  interactClass: 'ck-model3d-interact',
  getSelected: getSelectedModel3d,
  getWidgetFromViewSelection: getModel3dWidgetFromViewSelection
});

import { ECHART_STYLES, ECHART_STYLE_ATTR } from './constants';
import { createStylePlugins } from '../shared/mediaWidget/createStylePlugins';
import { getEchartWidgetFromEditor, getSelectedEchart, getStyleByName, syncFigureStyles } from './utils';

const { StyleEditing, StyleUI } = createStylePlugins({
  editingPluginName: 'EchartStyleEditing',
  uiPluginName: 'EchartStyleUI',
  requiresEditing: 'EchartEditing',
  modelName: 'echart',
  commandName: 'echartStyle',
  styleAttribute: ECHART_STYLE_ATTR,
  componentPrefix: 'echartStyle',
  styles: ECHART_STYLES,
  getSelected: getSelectedEchart,
  getWidgetFromEditor: getEchartWidgetFromEditor,
  syncFigureStyles,
  getStyleByName
});

export const EchartStyleEditing = StyleEditing;
export const EchartStyleUI = StyleUI;

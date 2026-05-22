import { createToolbarPlugin } from '../shared/mediaWidget/createToolbarPlugin';
import { ECHART_FIGURE_CLASS } from './constants';
import { getEchartWidgetFromViewSelection, getSelectedEchart } from './utils';

export const EchartToolbar = createToolbarPlugin({
  pluginName: 'EchartToolbar',
  toolbarConfigKey: 'echart.toolbar',
  widgetName: 'echart',
  ariaLabel: '图表工具栏',
  figureClass: ECHART_FIGURE_CLASS,
  getSelected: getSelectedEchart,
  getWidgetFromViewSelection: getEchartWidgetFromViewSelection
});

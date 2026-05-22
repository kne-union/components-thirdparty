import { createResizePlugins } from '../shared/mediaWidget/createResizePlugins';
import { createDefaultDomResizeApplier } from '../shared/mediaWidget/widgetResizer';
import {
  ECHART_DEFAULT_HEIGHT,
  ECHART_HEIGHT_OPTIONS,
  ECHART_RESIZE_OPTIONS
} from './constants';
import {
  applyEchartHeightToDom,
  clearEchartInlineResizeStyles,
  getEchartWidgetFromEditor,
  getSelectedEchart,
  resolveEchartHeight,
  syncFigureSizeStyles
} from './utils';

const baseApplyDomResize = createDefaultDomResizeApplier({ cssVarName: '--echart-height' });

const applyEchartDomResize = (domFigure, domHandleHost, widthPx, heightPx) => {
  baseApplyDomResize(domFigure, domHandleHost, widthPx, heightPx);

  const chartHost = domHandleHost?.querySelector?.('[class*="echart-container"]') || domHandleHost?.firstElementChild;

  if (chartHost) {
    chartHost.style.width = '100%';
    chartHost.style.height = '100%';
  }
};

const { ResizeEditing, ResizeUI } = createResizePlugins({
  editingPluginName: 'EchartResizeEditing',
  uiPluginName: 'EchartResizeUI',
  requiresEditing: 'EchartEditing',
  modelName: 'echart',
  commandName: 'resizeEchart',
  defaultHeight: ECHART_DEFAULT_HEIGHT,
  widthOptions: ECHART_RESIZE_OPTIONS,
  heightOptions: ECHART_HEIGHT_OPTIONS,
  getSelected: getSelectedEchart,
  getWidgetFromEditor: getEchartWidgetFromEditor,
  syncFigureSizeStyles,
  resolveHeight: resolveEchartHeight,
  clearInlineResizeStyles: clearEchartInlineResizeStyles,
  applyHeightToDom: applyEchartHeightToDom,
  getHandleHost(domWidgetElement) {
    return domWidgetElement.querySelector('.ck-echart-viewer') || domWidgetElement;
  },
  getResizeHost(domWidgetElement) {
    return domWidgetElement;
  },
  isCentered(modelElement) {
    const echartStyle = modelElement.getAttribute('echartStyle');
    return echartStyle === 'alignCenter' || !echartStyle || echartStyle === 'block';
  },
  applyDomResize: applyEchartDomResize
});

export const EchartResizeEditing = ResizeEditing;
export const EchartResizeUI = ResizeUI;

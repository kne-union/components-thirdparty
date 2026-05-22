import {
  MEDIA_STYLES,
  MEDIA_DEFAULT_HEIGHT,
  createMediaResizeOptions,
  createMediaHeightOptions
} from '../shared/mediaWidget/constants';

export const ECHART_MODEL = 'echart';
export const ECHART_FIGURE_CLASS = 'ck-echart';
export const ECHART_INNER_CLASS = 'ck-echart-inner';
export const ECHART_VIEWER_CLASS = 'ck-echart-viewer';
export const ECHART_DATA_ATTR = 'data-echart-option';
export const ECHART_STYLE_ATTR = 'echartStyle';
export const ECHART_DEFAULT_HEIGHT = MEDIA_DEFAULT_HEIGHT;

export const ECHART_STYLES = MEDIA_STYLES;
export const ECHART_RESIZE_OPTIONS = createMediaResizeOptions('resizeEchart');
export const ECHART_HEIGHT_OPTIONS = createMediaHeightOptions('resizeEchartHeight');

export const DEFAULT_ECHART_OPTION = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ]
};

export const DEFAULT_ECHART_OPTION_TEXT = JSON.stringify(DEFAULT_ECHART_OPTION, null, 2);

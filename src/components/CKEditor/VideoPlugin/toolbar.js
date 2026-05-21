import { createToolbarPlugin } from '../shared/mediaWidget/createToolbarPlugin';
import { getMediaVideoWidgetFromViewSelection, getSelectedMediaVideo } from './utils';

export const MediaVideoToolbar = createToolbarPlugin({
  pluginName: 'MediaVideoToolbar',
  toolbarConfigKey: 'mediaVideo.toolbar',
  widgetName: 'mediaVideo',
  ariaLabel: '视频工具栏',
  figureClass: 'ck-video',
  getSelected: getSelectedMediaVideo,
  getWidgetFromViewSelection: getMediaVideoWidgetFromViewSelection
});

import { MEDIA_STYLES } from '../shared/mediaWidget/constants';
import { createStylePlugins } from '../shared/mediaWidget/createStylePlugins';
import { getMediaVideoWidgetFromEditor, getSelectedMediaVideo, getStyleByName, syncFigureStyles } from './utils';

const { StyleEditing, StyleUI } = createStylePlugins({
  editingPluginName: 'MediaVideoStyleEditing',
  uiPluginName: 'MediaVideoStyleUI',
  requiresEditing: 'VideoEditing',
  modelName: 'mediaVideo',
  commandName: 'mediaVideoStyle',
  styleAttribute: 'mediaVideoStyle',
  componentPrefix: 'mediaVideoStyle',
  styles: MEDIA_STYLES,
  getSelected: getSelectedMediaVideo,
  getWidgetFromEditor: getMediaVideoWidgetFromEditor,
  syncFigureStyles,
  getStyleByName
});

export const MediaVideoStyleEditing = StyleEditing;
export const MediaVideoStyleUI = StyleUI;

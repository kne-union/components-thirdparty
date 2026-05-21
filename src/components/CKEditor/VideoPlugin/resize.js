import { createResizePlugins } from '../shared/mediaWidget/createResizePlugins';
import { createDefaultDomResizeApplier } from '../shared/mediaWidget/widgetResizer';
import { VIDEO_DEFAULT_HEIGHT, VIDEO_HEIGHT_OPTIONS, VIDEO_RESIZE_OPTIONS } from './constants';
import {
  applyVideoHeightToDom,
  clearVideoInlineResizeStyles,
  getMediaVideoWidgetFromEditor,
  getSelectedMediaVideo,
  resolveVideoHeight,
  syncFigureSizeStyles
} from './utils';

const applyVideoDomResize = createDefaultDomResizeApplier({ cssVarName: '--video-height' });

const applyVideoDomResizeWithElement = (domFigure, domHandleHost, widthPx, heightPx) => {
  applyVideoDomResize(domFigure, domHandleHost, widthPx, heightPx);

  const video = domHandleHost?.matches?.('video') ? domHandleHost : domHandleHost?.querySelector?.('video');

  if (video) {
    video.style.width = '100%';
    video.style.height = `${heightPx}px`;
    video.style.minHeight = '0';
  }
};

const { ResizeEditing, ResizeUI } = createResizePlugins({
  editingPluginName: 'MediaVideoResizeEditing',
  uiPluginName: 'MediaVideoResizeUI',
  requiresEditing: 'VideoEditing',
  modelName: 'mediaVideo',
  commandName: 'resizeMediaVideo',
  defaultHeight: VIDEO_DEFAULT_HEIGHT,
  widthOptions: VIDEO_RESIZE_OPTIONS,
  heightOptions: VIDEO_HEIGHT_OPTIONS,
  getSelected: getSelectedMediaVideo,
  getWidgetFromEditor: getMediaVideoWidgetFromEditor,
  syncFigureSizeStyles,
  resolveHeight: resolveVideoHeight,
  clearInlineResizeStyles: clearVideoInlineResizeStyles,
  applyHeightToDom: applyVideoHeightToDom,
  getHandleHost(domWidgetElement) {
    return domWidgetElement.querySelector('video') || domWidgetElement;
  },
  getResizeHost(domWidgetElement) {
    return domWidgetElement;
  },
  isCentered(modelElement) {
    const mediaVideoStyle = modelElement.getAttribute('mediaVideoStyle');
    return mediaVideoStyle === 'alignCenter' || !mediaVideoStyle || mediaVideoStyle === 'block';
  },
  applyDomResize: applyVideoDomResizeWithElement
});

export const MediaVideoResizeEditing = ResizeEditing;
export const MediaVideoResizeUI = ResizeUI;

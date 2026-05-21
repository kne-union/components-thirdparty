import { MEDIA_DEFAULT_HEIGHT, MEDIA_STYLES } from '../shared/mediaWidget/constants';
import { createMediaSelectionUtils } from '../shared/mediaWidget/selection';
import { createMediaStyleUtils } from '../shared/mediaWidget/styleUtils';

const selection = createMediaSelectionUtils({ modelName: 'mediaVideo', figureClass: 'ck-video' });

export const getSelectedMediaVideo = selection.getSelected;
export const getMediaVideoWidgetFromViewSelection = selection.getWidgetFromViewSelection;
export const getMediaVideoWidgetFromEditor = selection.getWidgetFromEditor;

const styleUtils = createMediaStyleUtils({
  figureClass: 'ck-video',
  styleAttribute: 'mediaVideoStyle',
  styles: MEDIA_STYLES,
  defaultHeight: MEDIA_DEFAULT_HEIGHT
});

export const getStyleByName = styleUtils.getStyleByName;
export const getFigureClasses = styleUtils.getFigureClasses;
export const resolveVideoHeight = styleUtils.resolveHeight;
export const syncFigureStyles = styleUtils.syncFigureStyles;
export const syncFigureSizeStyles = styleUtils.syncFigureSizeStyles;
export const readMediaVideoStyleFromFigure = styleUtils.readStyleFromViewFigure;
export const consumeMediaVideoStyleClasses = styleUtils.consumeStyleClasses;

export const clearVideoInlineResizeStyles = (editor, modelElement) => {
  const viewFigure = editor.editing.mapper.toViewElement(modelElement);

  if (!viewFigure) {
    return;
  }

  const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);

  if (!domFigure) {
    return;
  }

  domFigure.style.width = '';
  domFigure.style.height = '';
  domFigure.style.minHeight = '';

  const video = domFigure.querySelector('video');

  if (video) {
    video.style.width = '';
    video.style.height = '';
    video.style.minHeight = '';
  }
};

/** 预览区（CKEditor.Content）根据 figure 内联尺寸同步 video 布局 */
export const syncContentVideoLayout = figure => {
  const video = figure?.querySelector?.('video');

  if (!video) {
    return;
  }

  const height =
    figure.style.height ||
    figure.style.getPropertyValue('--video-height') ||
    video.style.height ||
    '400px';
  const width = figure.style.width;

  figure.style.setProperty('--video-height', height);
  figure.style.height = height;
  figure.style.minHeight = 'unset';

  if (width) {
    figure.style.width = width;
    figure.style.maxWidth = '100%';
  }

  video.style.display = 'block';
  video.style.width = '100%';
  video.style.height = height;
  video.style.minHeight = '0';
  video.style.maxHeight = 'none';
};

export const applyVideoHeightToDom = (editor, modelElement, height) => {
  const resolvedHeight = height || resolveVideoHeight(modelElement);
  const viewFigure = editor.editing.mapper.toViewElement(modelElement);

  if (!viewFigure) {
    return;
  }

  clearVideoInlineResizeStyles(editor, modelElement);

  editor.editing.view.change(writer => {
    writer.setStyle('height', resolvedHeight, viewFigure);
  });

  const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);

  if (!domFigure) {
    return;
  }

  domFigure.style.setProperty('--video-height', resolvedHeight);
  domFigure.style.height = resolvedHeight;
  domFigure.style.minHeight = 'unset';

  const video = domFigure.querySelector('video');

  if (video) {
    video.style.width = '100%';
    video.style.height = resolvedHeight;
    video.style.minHeight = '0';
    video.style.maxHeight = 'none';
  }
};

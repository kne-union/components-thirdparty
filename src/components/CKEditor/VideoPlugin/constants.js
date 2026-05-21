import {
  MEDIA_DEFAULT_HEIGHT,
  createMediaResizeOptions,
  createMediaHeightOptions
} from '../shared/mediaWidget/constants';

export {
  MEDIA_DEFAULT_HEIGHT as VIDEO_DEFAULT_HEIGHT,
  createMediaResizeOptions,
  createMediaHeightOptions
};

export const VIDEO_RESIZE_OPTIONS = createMediaResizeOptions('resizeMediaVideo');
export const VIDEO_HEIGHT_OPTIONS = createMediaHeightOptions('resizeMediaVideoHeight');

export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.m4v,.mkv';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.mkv'];

export const isVideoFile = file => {
  if (!file) {
    return false;
  }

  if (file.type?.startsWith('video/')) {
    return true;
  }

  const name = file.name?.toLowerCase() || '';

  return VIDEO_EXTENSIONS.some(ext => name.endsWith(ext));
};

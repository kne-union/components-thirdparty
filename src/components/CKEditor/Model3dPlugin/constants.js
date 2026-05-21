import {
  MEDIA_STYLES,
  MEDIA_DEFAULT_HEIGHT,
  createMediaResizeOptions,
  createMediaHeightOptions
} from '../shared/mediaWidget/constants';

export {
  MEDIA_STYLES as MODEL3D_STYLES,
  MEDIA_DEFAULT_HEIGHT as MODEL3D_DEFAULT_HEIGHT,
  createMediaResizeOptions,
  createMediaHeightOptions
};

export const MODEL3D_RESIZE_OPTIONS = createMediaResizeOptions('resizeModel3d');
export const MODEL3D_HEIGHT_OPTIONS = createMediaHeightOptions('resizeModel3dHeight');

export const MODEL3D_ACCEPT = '.glb';

export const isGlbModelFile = file => {
  if (!file) {
    return false;
  }

  const name = file.name?.toLowerCase() ?? '';

  return name.endsWith('.glb') || file.type === 'model/gltf-binary';
};

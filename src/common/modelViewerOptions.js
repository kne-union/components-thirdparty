/** 将 viewer 配置应用到 model-viewer DOM（与 ModelView 属性对齐） */
export const applyModelViewerOptions = (modelViewer, viewer = {}) => {
  if (!modelViewer || !viewer) {
    return;
  }

  const {
    alt,
    autoRotate,
    cameraControls,
    disableZoom,
    loading,
    poster,
    reveal,
    exposure,
    shadowIntensity,
    shadowSoftness,
    interactionPrompt,
    ...rest
  } = viewer;

  const setBoolAttr = (name, enabled, defaultEnabled = false) => {
    if (enabled === undefined && !defaultEnabled) {
      return;
    }

    const on = enabled === true || (enabled === undefined && defaultEnabled);

    if (on) {
      modelViewer.setAttribute(name, '');
    } else {
      modelViewer.removeAttribute(name);
    }
  };

  if (alt !== undefined) {
    modelViewer.setAttribute('alt', alt);
  }

  setBoolAttr('auto-rotate', autoRotate);
  setBoolAttr('camera-controls', cameraControls, true);
  setBoolAttr('disable-zoom', disableZoom);

  if (loading !== undefined) {
    modelViewer.setAttribute('loading', loading);
  }

  if (poster !== undefined) {
    if (poster) {
      modelViewer.setAttribute('poster', poster);
    } else {
      modelViewer.removeAttribute('poster');
    }
  }

  if (reveal !== undefined) {
    modelViewer.setAttribute('reveal', reveal);
  }

  if (exposure !== undefined) {
    modelViewer.setAttribute('exposure', String(exposure));
  }

  if (shadowIntensity !== undefined) {
    modelViewer.setAttribute('shadow-intensity', String(shadowIntensity));
  }

  if (shadowSoftness !== undefined) {
    modelViewer.setAttribute('shadow-softness', String(shadowSoftness));
  }

  if (interactionPrompt !== undefined) {
    if (interactionPrompt === 'none' || interactionPrompt === false) {
      modelViewer.setAttribute('interaction-prompt', 'none');
    } else {
      modelViewer.removeAttribute('interaction-prompt');
    }
  }

  Object.entries(rest).forEach(([key, value]) => {
    if (value == null || value === false) {
      modelViewer.removeAttribute(key);
      return;
    }

    if (value === true) {
      modelViewer.setAttribute(key, '');
      return;
    }

    modelViewer.setAttribute(key, String(value));
  });
};

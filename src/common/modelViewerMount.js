import whenModelViewerReady from './loadModelViewer';

export const getModel3dHeightFromDom = host => {
  if (!host) {
    return null;
  }

  const figure = host.closest('figure.ck-model3d');

  return (
    host.dataset.model3dHeight ||
    figure?.style.height ||
    figure?.style.getPropertyValue('--model3d-height') ||
    null
  );
};

/**
 * 同步容器与 model-viewer 尺寸，避免远程模型加载前后布局错位
 */
export const syncModelViewerLayout = (host, modelViewer, height) => {
  if (!host || !modelViewer) {
    return;
  }

  const resolvedHeight = height || getModel3dHeightFromDom(host) || '400px';

  host.dataset.model3dHeight = resolvedHeight;
  host.style.width = '100%';
  host.style.height = resolvedHeight;
  host.style.minHeight = '0';
  host.style.maxHeight = 'none';
  host.style.overflow = 'hidden';
  host.style.position = 'relative';
  host.style.lineHeight = '0';

  modelViewer.style.display = 'block';
  modelViewer.style.setProperty('width', '100%', 'important');
  modelViewer.style.setProperty('height', '100%', 'important');
  modelViewer.style.setProperty('min-height', '0', 'important');
  modelViewer.style.setProperty('max-height', 'none', 'important');
  modelViewer.style.setProperty('--poster-color', 'transparent');
  modelViewer.setAttribute('tabindex', '-1');

  const figure = host.closest('figure.ck-model3d');

  if (figure) {
    figure.style.setProperty('--model3d-height', resolvedHeight);
    figure.style.height = resolvedHeight;
    figure.style.minHeight = '0';
  }

  if (typeof modelViewer.updateFraming === 'function') {
    modelViewer.updateFraming();
  }
};

const bindModelViewerLayoutEvents = (host, modelViewer) => {
  const sync = () => syncModelViewerLayout(host, modelViewer, getModel3dHeightFromDom(host));

  modelViewer.addEventListener('load', sync);
  modelViewer.addEventListener('poster-dismissed', sync);

  if (modelViewer.loaded) {
    sync();
  }
};

/**
 * 在 CKEditor RawElement 等容器中挂载 model-viewer（仅挂载一次，等自定义元素就绪）
 */
export const mountModelViewerInHost = async (host, { src, alt, height, loading = 'eager' } = {}) => {
  if (!host || !src) {
    return null;
  }

  await whenModelViewerReady();

  const resolvedHeight = height || '400px';
  let modelViewer = host.querySelector('model-viewer');

  if (modelViewer?.getAttribute('src') === src) {
    syncModelViewerLayout(host, modelViewer, resolvedHeight);
    return modelViewer;
  }

  host.replaceChildren();
  modelViewer = document.createElement('model-viewer');
  modelViewer.setAttribute('src', src);
  modelViewer.setAttribute('alt', alt || '3D model');
  modelViewer.setAttribute('camera-controls', '');
  modelViewer.setAttribute('auto-rotate', '');
  modelViewer.setAttribute('interaction-prompt', 'none');
  modelViewer.setAttribute('loading', loading);

  modelViewer.addEventListener('focus', () => {
    modelViewer.blur();
  });

  host.appendChild(modelViewer);

  if (typeof customElements !== 'undefined' && customElements.upgrade) {
    customElements.upgrade(modelViewer);
  }

  syncModelViewerLayout(host, modelViewer, resolvedHeight);
  bindModelViewerLayoutEvents(host, modelViewer);

  return modelViewer;
};

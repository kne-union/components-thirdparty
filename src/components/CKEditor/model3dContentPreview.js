import { syncModelViewerLayout } from '../../common/modelViewerMount';
import { applyModelViewerOptions } from '../../common/modelViewerOptions';

const ENHANCED_ATTR = 'data-model3d-preview-enhanced';
const BTN_CLASS = 'ck-model3d-fullscreen-btn';
const OVERLAY_CLASS = 'ck-model3d-fullscreen-overlay';
const BODY_LOCK_CLASS = 'ck-model3d-overlay-open';

const fullscreenIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v2H5v3H3V3zm9 0h5v5h-2V5h-3V3zM3 12h2v3h3v2H3v-5zm12 0h2v5h-5v-2h3v-3z"/></svg>`;

const exitFullscreenIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M5 5h3v2H7v1H5V5zm7 0h3v3h-2V7h-1V5zM5 12h2v1h1v2H5v-3zm10 0v3h-3v-2h1v-1h2z"/></svg>`;

let activeOverlaySession = null;

const requestElementFullscreen = async element => {
  const request =
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.msRequestFullscreen;

  if (!request) {
    throw new Error('Fullscreen API is not supported');
  }

  return request.call(element);
};

const exitDocumentFullscreen = async () => {
  const exit =
    document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;

  if (exit) {
    await exit.call(document);
  }
};

const getFullscreenElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

const supportsNativeElementFullscreen = () => {
  const proto = HTMLElement.prototype;

  return Boolean(
    proto.requestFullscreen || proto.webkitRequestFullscreen || proto.msRequestFullscreen
  );
};

/** 移动端 / iOS 等对自定义元素全屏支持差，使用固定层模拟全屏 */
const shouldUseOverlayFullscreen = () => {
  if (!supportsNativeElementFullscreen()) {
    return true;
  }

  const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
  const narrowViewport = window.matchMedia?.('(max-width: 768px)')?.matches;
  const isIOS =
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return Boolean(coarsePointer || narrowViewport || isIOS);
};

const getPreviewI18n = options => options?.preview?.i18n || options?.i18n || {};

const updateFullscreenButton = (button, isFullscreen, i18n = {}) => {
  button.innerHTML = isFullscreen ? exitFullscreenIcon : fullscreenIcon;
  button.title = isFullscreen
    ? i18n.fullscreenExit || '退出全屏'
    : i18n.fullscreenEnter || '全屏查看';
  button.setAttribute('aria-label', button.title);
};

const lockBodyScroll = () => {
  document.body.classList.add(BODY_LOCK_CLASS);
  document.documentElement.classList.add(BODY_LOCK_CLASS);
};

const unlockBodyScroll = () => {
  document.body.classList.remove(BODY_LOCK_CLASS);
  document.documentElement.classList.remove(BODY_LOCK_CLASS);
};

const closeOverlayFullscreen = () => {
  const session = activeOverlaySession;

  if (!session) {
    return;
  }

  const { overlay, modelViewer, figure, placeholder, button, host } = session;

  if (placeholder.parentNode) {
    placeholder.parentNode.insertBefore(modelViewer, placeholder);
  } else {
    (host || figure).appendChild(modelViewer);
  }

  placeholder.remove();
  overlay.remove();
  unlockBodyScroll();

  if (host && figure) {
    const height =
      figure.style.height || figure.style.getPropertyValue('--model3d-height') || host.dataset.model3dHeight || '400px';

    syncModelViewerLayout(host, modelViewer, height);
  }

  modelViewer.classList.remove('ck-model3d-fullscreen-active');
  updateFullscreenButton(button, false, session.i18n);
  activeOverlaySession = null;
};

const openOverlayFullscreen = (figure, modelViewer, button, i18n = {}) => {
  if (activeOverlaySession?.modelViewer === modelViewer) {
    closeOverlayFullscreen();
    return;
  }

  if (activeOverlaySession) {
    closeOverlayFullscreen();
  }

  const host = figure.querySelector('.ck-model3d-viewer') || figure;
  const placeholder = document.createComment('ck-model3d-fullscreen-placeholder');

  modelViewer.parentNode.insertBefore(placeholder, modelViewer);

  const overlay = document.createElement('div');

  overlay.className = OVERLAY_CLASS;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', i18n.fullscreenPreviewAria || '3D 模型全屏预览');

  const viewerSlot = document.createElement('div');

  viewerSlot.className = 'ck-model3d-fullscreen-overlay-viewer';
  viewerSlot.appendChild(modelViewer);

  const closeBtn = document.createElement('button');

  closeBtn.type = 'button';
  closeBtn.className = 'ck-model3d-fullscreen-overlay-close';
  closeBtn.title = i18n.fullscreenExit || '退出全屏';
  closeBtn.setAttribute('aria-label', closeBtn.title);
  closeBtn.innerHTML = exitFullscreenIcon;

  overlay.appendChild(viewerSlot);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
  lockBodyScroll();

  const viewportHeight = `${window.innerHeight}px`;

  syncModelViewerLayout(viewerSlot, modelViewer, viewportHeight);
  modelViewer.classList.add('ck-model3d-fullscreen-active');
  updateFullscreenButton(button, true, i18n);

  const onClose = () => closeOverlayFullscreen();

  closeBtn.addEventListener('click', onClose);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      onClose();
    }
  });

  const onKeydown = event => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', onKeydown);

  activeOverlaySession = {
    overlay,
    modelViewer,
    figure,
    placeholder,
    button,
    host,
    i18n,
    cleanup: () => {
      document.removeEventListener('keydown', onKeydown);
      closeBtn.removeEventListener('click', onClose);
    }
  };
};

const toggleFullscreen = async (figure, modelViewer, button, i18n = {}) => {
  if (activeOverlaySession?.modelViewer === modelViewer) {
    closeOverlayFullscreen();
    return;
  }

  if (getFullscreenElement() === modelViewer) {
    await exitDocumentFullscreen();
    return;
  }

  if (shouldUseOverlayFullscreen()) {
    openOverlayFullscreen(figure, modelViewer, button, i18n);
    return;
  }

  try {
    await requestElementFullscreen(modelViewer);
  } catch {
    openOverlayFullscreen(figure, modelViewer, button, i18n);
  }
};

const bindFullscreenButton = (figure, button, i18n = {}) => {
  const modelViewer = figure.querySelector('model-viewer');

  if (!modelViewer) {
    return;
  }

  const onFullscreenChange = () => {
    if (activeOverlaySession) {
      return;
    }

    const active = getFullscreenElement() === modelViewer;

    modelViewer.classList.toggle('ck-model3d-fullscreen-active', active);
    updateFullscreenButton(button, active, i18n);
  };

  const onActivate = event => {
    event.preventDefault();
    event.stopPropagation();
    toggleFullscreen(figure, modelViewer, button, i18n);
  };

  button.addEventListener('click', onActivate);

  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  button._model3dFullscreenCleanup = () => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    button.removeEventListener('click', onActivate);

    if (activeOverlaySession?.button === button) {
      activeOverlaySession.cleanup?.();
      closeOverlayFullscreen();
    }
  };
};

/**
 * 为 CKEditor.Content 预览区中的 3D 模型添加全屏按钮
 */
export const enhanceModel3dContentPreview = (container, options = {}) => {
  if (!container) {
    return;
  }

  const { viewer, preview = {} } = options;
  const i18n = getPreviewI18n(options);
  const enableFullscreen = preview.enableFullscreen !== false;

  container.querySelectorAll('figure.ck-model3d').forEach(figure => {
    if (figure.getAttribute(ENHANCED_ATTR) === 'true') {
      return;
    }

    const modelViewer = figure.querySelector('model-viewer');

    if (!modelViewer) {
      return;
    }

    if (viewer && Object.keys(viewer).length > 0) {
      applyModelViewerOptions(modelViewer, viewer);
    }

    figure.setAttribute(ENHANCED_ATTR, 'true');

    if (!figure.hasAttribute('tabindex')) {
      figure.setAttribute('tabindex', '0');
    }

    if (enableFullscreen) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = BTN_CLASS;
      updateFullscreenButton(button, false, i18n);

      bindFullscreenButton(figure, button, i18n);
      figure.appendChild(button);
    }
  });
};

export const teardownModel3dContentPreview = container => {
  if (activeOverlaySession) {
    activeOverlaySession.cleanup?.();
    closeOverlayFullscreen();
  }

  if (!container) {
    return;
  }

  [...container.querySelectorAll(`.${BTN_CLASS}`)].forEach(button => {
    button._model3dFullscreenCleanup?.();

    if (button.parentNode) {
      button.remove();
    }
  });

  container.querySelectorAll(`figure.ck-model3d[${ENHANCED_ATTR}="true"]`).forEach(figure => {
    figure.removeAttribute(ENHANCED_ATTR);
  });
};

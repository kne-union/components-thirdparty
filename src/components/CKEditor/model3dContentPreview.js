const ENHANCED_ATTR = 'data-model3d-preview-enhanced';
const BTN_CLASS = 'ck-model3d-fullscreen-btn';

const fullscreenIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v2H5v3H3V3zm9 0h5v5h-2V5h-3V3zM3 12h2v3h3v2H3v-5zm12 0h2v5h-5v-2h3v-3z"/></svg>`;

const exitFullscreenIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M5 5h3v2H7v1H5V5zm7 0h3v3h-2V7h-1V5zM5 12h2v1h1v2H5v-3zm10 0v3h-3v-2h1v-1h2z"/></svg>`;

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

const updateFullscreenButton = (button, isFullscreen) => {
  button.innerHTML = isFullscreen ? exitFullscreenIcon : fullscreenIcon;
  button.title = isFullscreen ? '退出全屏' : '全屏查看';
  button.setAttribute('aria-label', button.title);
};

const bindFullscreenButton = (figure, button) => {
  const modelViewer = figure.querySelector('model-viewer');

  if (!modelViewer) {
    return;
  }

  const onFullscreenChange = () => {
    const active = getFullscreenElement() === modelViewer;

    modelViewer.classList.toggle('ck-model3d-fullscreen-active', active);
    updateFullscreenButton(button, active);
  };

  button.addEventListener('click', async event => {
    event.preventDefault();
    event.stopPropagation();

    try {
      if (getFullscreenElement() === modelViewer) {
        await exitDocumentFullscreen();
      } else {
        await requestElementFullscreen(modelViewer);
      }
    } catch (error) {
      console.warn('3D 模型全屏失败', error);
    }
  });

  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  button._model3dFullscreenCleanup = () => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
  };
};

/**
 * 为 CKEditor.Content 预览区中的 3D 模型添加全屏按钮
 */
export const enhanceModel3dContentPreview = container => {
  if (!container) {
    return;
  }

  container.querySelectorAll('figure.ck-model3d').forEach(figure => {
    if (figure.getAttribute(ENHANCED_ATTR) === 'true') {
      return;
    }

    const modelViewer = figure.querySelector('model-viewer');

    if (!modelViewer) {
      return;
    }

    figure.setAttribute(ENHANCED_ATTR, 'true');

    if (!figure.hasAttribute('tabindex')) {
      figure.setAttribute('tabindex', '0');
    }

    const button = document.createElement('button');

    button.type = 'button';
    button.className = BTN_CLASS;
    updateFullscreenButton(button, false);

    bindFullscreenButton(figure, button);
    figure.appendChild(button);
  });
};

export const teardownModel3dContentPreview = container => {
  if (!container) {
    return;
  }

  container.querySelectorAll(`.${BTN_CLASS}`).forEach(button => {
    button._model3dFullscreenCleanup?.();
    button.remove();
  });

  container.querySelectorAll(`figure.ck-model3d[${ENHANCED_ATTR}="true"]`).forEach(figure => {
    figure.removeAttribute(ENHANCED_ATTR);
  });
};

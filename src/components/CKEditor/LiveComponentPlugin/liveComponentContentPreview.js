import { mountLiveComponentInHost, unmountLiveComponentFromHost } from './mountLiveComponentView';
import {
  LIVE_COMPONENT_CLASS,
  LIVE_COMPONENT_DATA_ATTR,
  LIVE_COMPONENT_DEFAULT_HEIGHT
} from './constants';

const ENHANCED_ATTR = 'data-live-component-preview-enhanced';

export const enhanceLiveComponentContentPreview = (container, options = {}) => {
  const { height = LIVE_COMPONENT_DEFAULT_HEIGHT, libs, props } = options;
  if (!container) {
    return;
  }

  container
    .querySelectorAll(`section.${LIVE_COMPONENT_CLASS}, section[${LIVE_COMPONENT_DATA_ATTR}]`)
    .forEach(section => {
      if (section.getAttribute(ENHANCED_ATTR) === 'true') {
        return;
      }

      const content = section.getAttribute(LIVE_COMPONENT_DATA_ATTR);

      if (!content) {
        return;
      }

      section.setAttribute(ENHANCED_ATTR, 'true');
      section.innerHTML = '';

      const host = document.createElement('div');

      section.appendChild(host);
      mountLiveComponentInHost(host, { content, height, libs, props });
    });
};

export const teardownLiveComponentContentPreview = container => {
  if (!container) {
    return;
  }

  container
    .querySelectorAll(`section.${LIVE_COMPONENT_CLASS}, section[${LIVE_COMPONENT_DATA_ATTR}]`)
    .forEach(section => {
      section.querySelectorAll('.ck-live-component-viewer').forEach(host => {
        unmountLiveComponentFromHost(host);
      });
      section.removeAttribute(ENHANCED_ATTR);
    });
};

import {
  LIVE_COMPONENT_CLASS,
  LIVE_COMPONENT_DATA_ATTR,
  LIVE_COMPONENT_MODEL
} from './constants';

export const getSelectedLiveComponent = selection => {
  const selected = selection.getSelectedElement?.();

  if (selected?.is('element', LIVE_COMPONENT_MODEL)) {
    return selected;
  }

  return null;
};

export const readLiveComponentContentFromView = viewElement => {
  const content = viewElement.getAttribute(LIVE_COMPONENT_DATA_ATTR);

  if (!content) {
    return null;
  }

  return { content };
};

export const isLiveComponentSection = viewElement =>
  viewElement.is('element', 'section') &&
  (viewElement.hasClass(LIVE_COMPONENT_CLASS) || viewElement.hasAttribute(LIVE_COMPONENT_DATA_ATTR));

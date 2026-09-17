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

const findLiveComponentSectionInAncestors = node => {
  let parent = node;

  while (parent) {
    if (
      parent.is?.('element', 'section') &&
      (parent.hasClass(LIVE_COMPONENT_CLASS) || parent.hasAttribute(LIVE_COMPONENT_DATA_ATTR))
    ) {
      return parent;
    }
    parent = parent.parent;
  }

  return null;
};

export const getLiveComponentWidgetFromViewSelection = viewSelection => {
  const selected = viewSelection.getSelectedElement?.();

  if (
    selected?.is('element', 'section') &&
    (selected.hasClass(LIVE_COMPONENT_CLASS) || selected.hasAttribute(LIVE_COMPONENT_DATA_ATTR))
  ) {
    return selected;
  }

  for (const position of [viewSelection.focus, viewSelection.anchor]) {
    const section = findLiveComponentSectionInAncestors(position?.parent);

    if (section) {
      return section;
    }
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

import {
  FORM_CREATOR_CLASS,
  FORM_CREATOR_DATA_ATTR,
  FORM_CREATOR_MODEL
} from './constants';
import { decodeSchemaFromHtmlAttribute } from './schemaCodec';

export const getSelectedFormCreator = selection => {
  const selected = selection.getSelectedElement?.();

  if (selected?.is('element', FORM_CREATOR_MODEL)) {
    return selected;
  }

  return null;
};

const findFormCreatorSectionInAncestors = node => {
  let parent = node;

  while (parent) {
    if (
      parent.is?.('element', 'section') &&
      (parent.hasClass(FORM_CREATOR_CLASS) || parent.hasAttribute(FORM_CREATOR_DATA_ATTR))
    ) {
      return parent;
    }
    parent = parent.parent;
  }

  return null;
};

export const getFormCreatorWidgetFromViewSelection = viewSelection => {
  const selected = viewSelection.getSelectedElement?.();

  if (
    selected?.is('element', 'section') &&
    (selected.hasClass(FORM_CREATOR_CLASS) || selected.hasAttribute(FORM_CREATOR_DATA_ATTR))
  ) {
    return selected;
  }

  for (const position of [viewSelection.focus, viewSelection.anchor]) {
    const section = findFormCreatorSectionInAncestors(position?.parent);

    if (section) {
      return section;
    }
  }

  return null;
};

export const readFormCreatorSchemaFromView = viewElement => {
  const encoded = viewElement.getAttribute(FORM_CREATOR_DATA_ATTR);
  const schema = decodeSchemaFromHtmlAttribute(encoded);

  if (!schema) {
    return null;
  }

  return { schema };
};

export const isFormCreatorSection = viewElement =>
  viewElement.is('element', 'section') &&
  (viewElement.hasClass(FORM_CREATOR_CLASS) || viewElement.hasAttribute(FORM_CREATOR_DATA_ATTR));

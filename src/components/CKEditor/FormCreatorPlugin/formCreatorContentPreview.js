import { mountFormCreatorInHost, unmountFormCreatorFromHost } from './mountFormCreatorView';
import {
  FORM_CREATOR_CLASS,
  FORM_CREATOR_DATA_ATTR,
  FORM_CREATOR_DEFAULT_HEIGHT
} from './constants';
import { decodeSchemaFromHtmlAttribute, parseSchemaText } from './schemaCodec';

const ENHANCED_ATTR = 'data-form-creator-preview-enhanced';

export const enhanceFormCreatorContentPreview = (container, options = {}) => {
  const {
    height = FORM_CREATOR_DEFAULT_HEIGHT,
    preview = true,
    showActions = false,
    formProps,
    emptyText
  } = options;

  if (!container) {
    return;
  }

  container
    .querySelectorAll(`section.${FORM_CREATOR_CLASS}, section[${FORM_CREATOR_DATA_ATTR}]`)
    .forEach(section => {
      if (section.getAttribute(ENHANCED_ATTR) === 'true') {
        return;
      }

      const encoded = section.getAttribute(FORM_CREATOR_DATA_ATTR);
      const schemaText = decodeSchemaFromHtmlAttribute(encoded);

      if (!schemaText) {
        return;
      }

      section.setAttribute(ENHANCED_ATTR, 'true');
      section.innerHTML = '';

      const host = document.createElement('div');

      section.appendChild(host);
      mountFormCreatorInHost(host, {
        schema: parseSchemaText(schemaText, { fallbackToDefault: true }),
        height,
        preview,
        showActions,
        formProps,
        emptyText
      });
    });
};

export const teardownFormCreatorContentPreview = container => {
  if (!container) {
    return;
  }

  container
    .querySelectorAll(`section.${FORM_CREATOR_CLASS}, section[${FORM_CREATOR_DATA_ATTR}]`)
    .forEach(section => {
      [...section.querySelectorAll('.ck-form-creator-viewer')].forEach(host => {
        unmountFormCreatorFromHost(host);

        if (host.parentNode) {
          host.remove();
        }
      });
      section.removeAttribute(ENHANCED_ATTR);
    });
};

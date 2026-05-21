import { toWidget } from 'ckeditor5';

export const UPLOAD_STATUS_UPLOADING = 'uploading';

export const isMediaUploading = modelElement =>
  modelElement?.getAttribute?.('uploadStatus') === UPLOAD_STATUS_UPLOADING;

const mountPlaceholderDom = (domElement, { label, fileName }) => {
  domElement.innerHTML = '';
  domElement.className = 'ck-media-upload-placeholder';

  const inner = document.createElement('div');

  inner.className = 'ck-media-upload-placeholder-inner';

  const spinner = document.createElement('span');

  spinner.className = 'ck-media-upload-placeholder-spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');

  text.className = 'ck-media-upload-placeholder-text';
  text.textContent = label;

  inner.appendChild(spinner);
  inner.appendChild(text);

  if (fileName) {
    const name = document.createElement('span');

    name.className = 'ck-media-upload-placeholder-name';
    name.textContent = fileName;
    inner.appendChild(name);
  }

  domElement.appendChild(inner);
};

/**
 * 编辑区 / 数据区共用的上传占位 figure
 */
export const createMediaUploadPlaceholderFigure = (
  modelElement,
  writer,
  { figureClasses, widgetLabel, placeholderLabel, defaultHeight, resolveHeight, asWidget = false, showFileName = true }
) => {
  const figure = writer.createContainerElement('figure', {
    class: figureClasses.join(' ')
  });
  const height = resolveHeight(modelElement) || defaultHeight;

  writer.setStyle('height', height, figure);

  const placeholder = writer.createRawElement(
    'div',
    { class: 'ck-media-upload-placeholder-host' },
    domElement => {
      mountPlaceholderDom(domElement, {
        label: placeholderLabel,
        fileName: showFileName ? modelElement.getAttribute('alt') || '' : ''
      });
    }
  );

  writer.insert(writer.createPositionAt(figure, 0), placeholder);

  return asWidget ? toWidget(figure, writer, { label: widgetLabel }) : figure;
};

export const insertMediaUploadPlaceholder = (editor, modelName, { alt } = {}) => {
  let placeholderElement;

  editor.model.change(writer => {
    placeholderElement = writer.createElement(modelName, {
      alt: alt || '',
      uploadStatus: UPLOAD_STATUS_UPLOADING
    });
    editor.model.insertObject(placeholderElement, null, null, { setSelection: 'on' });
  });

  return placeholderElement;
};

export const finalizeMediaUploadPlaceholder = (editor, modelElement, { src, alt } = {}) => {
  let insertedElement;

  editor.model.change(writer => {
    const modelName = modelElement.name;
    const parent = modelElement.parent;
    const index = modelElement.index;
    const attrs = { src };

    if (alt) {
      attrs.alt = alt;
    }

    writer.remove(modelElement);
    insertedElement = writer.createElement(modelName, attrs);
    writer.insert(insertedElement, parent, index);
    writer.setSelection(insertedElement, 'on');
  });

  return insertedElement;
};

export const removeMediaUploadPlaceholder = (editor, modelElement) => {
  editor.model.change(writer => {
    writer.remove(modelElement);
  });
};

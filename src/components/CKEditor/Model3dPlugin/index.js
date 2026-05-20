import { Plugin, ButtonView, Command, Widget, toWidget } from 'ckeditor5';
import whenModelViewerReady from '../../../common/loadModelViewer';
import { mountModelViewerInHost } from '../../../common/modelViewerMount';
import { uploadFile } from '../uploadFile';
import { isGlbModelFile, MODEL3D_ACCEPT, MODEL3D_DEFAULT_HEIGHT, MODEL3D_STYLES } from './constants';
import {
  applyViewerHeightToDom,
  findCkModel3dContainer,
  findModelViewer,
  getFigureClasses,
  resolveModel3dHeight
} from './utils';
import { Model3dStyleEditing, Model3dStyleUI } from './style';
import { Model3dResizeEditing, Model3dResizeUI } from './resize';
import { Model3dToolbar } from './toolbar';

const model3dIcon = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L3 6.5v7L10 18l7-4.5v-7L10 2zm0 2.2l4.8 3.1-4.8 3.1-4.8-3.1L10 4.2zM5 8.3l4.2 2.7v5.4L5 13.7V8.3zm10 0v5.4l-4.2 2.7v-5.4L15 8.3z"/></svg>`;

const createModel3dFigureView = (modelElement, writer, { renderViewer }) => {
  const figure = writer.createContainerElement('figure', {
    class: getFigureClasses(modelElement).join(' ')
  });
  const resizedWidth = modelElement.getAttribute('resizedWidth');
  const viewerHeight = resolveModel3dHeight(modelElement);

  if (resizedWidth) {
    writer.setStyle('width', resizedWidth, figure);
  }

  writer.setStyle('height', viewerHeight, figure);

  if (renderViewer) {
    const src = modelElement.getAttribute('src');
    const alt = modelElement.getAttribute('alt') || '3D model';
    const viewerHost = writer.createRawElement('div', { class: 'ck-model3d-viewer' }, domElement => {
      mountModelViewerInHost(domElement, { src, alt, height: viewerHeight });
    });
    writer.insert(writer.createPositionAt(figure, 0), viewerHost);
    return toWidget(figure, writer, { label: '3D model' });
  }

  const inner = writer.createContainerElement('div', { class: 'ck-model3d' });

  writer.setStyle('height', viewerHeight, inner);

  const modelViewer = writer.createEmptyElement('model-viewer', {
    src: modelElement.getAttribute('src'),
    alt: modelElement.getAttribute('alt') || '3D model',
    'camera-controls': '',
    'auto-rotate': '',
    loading: 'lazy',
    style: `width:100%;height:${viewerHeight};`
  });

  writer.insert(writer.createPositionAt(inner, 0), modelViewer);
  writer.insert(writer.createPositionAt(figure, 0), inner);

  return figure;
};

const readModel3dAttributes = (viewContainer, viewFigure) => {
  const modelViewerElement = findModelViewer(viewContainer);
  const src = modelViewerElement?.getAttribute('src');

  if (!src) {
    return null;
  }

  const attrs = {
    src,
    alt: modelViewerElement.getAttribute('alt') || '3D model'
  };

  if (viewFigure) {
    const imageStyle = MODEL3D_STYLES.find(style => style.className && viewFigure.hasClass(style.className))?.name;

    if (imageStyle) {
      attrs.model3dStyle = imageStyle;
    }

    const width = viewFigure.getStyle('width');

    if (width) {
      attrs.resizedWidth = width;
    } else if (viewFigure.hasClass('image_resized')) {
      attrs.resizedWidth = '100%';
    }

    const height =
      viewFigure.getStyle('height') ||
      viewContainer.getStyle?.('height') ||
      modelViewerElement?.getAttribute('style')?.match(/height:\s*([^;]+)/)?.[1];

    if (height) {
      attrs.resizedHeight = height;
    }
  } else {
    const imageStyle = MODEL3D_STYLES.find(style => style.className && viewContainer.hasClass(style.className))?.name;

    if (imageStyle) {
      attrs.model3dStyle = imageStyle;
    }
  }

  return attrs;
};

const consumeModel3dStyleClasses = (viewFigure, conversionApi) => {
  if (viewFigure.hasClass('image')) {
    conversionApi.consumable.consume(viewFigure, { classes: 'image' });
  }

  MODEL3D_STYLES.forEach(style => {
    if (style.className) {
      conversionApi.consumable.consume(viewFigure, { classes: style.className });
    }
  });

  if (viewFigure.hasClass('image_resized')) {
    conversionApi.consumable.consume(viewFigure, { classes: 'image_resized' });
  }
};

class InsertModel3dCommand extends Command {
  execute({ src, alt = '3D model' }) {
    const editor = this.editor;

    editor.model.change(writer => {
      const model3d = writer.createElement('model3d', { src, alt });
      editor.model.insertObject(model3d, null, null, { setSelection: 'on' });
    });
  }

  refresh() {
    this.isEnabled = !this.editor.isReadOnly;
  }
}

class Model3dEditing extends Plugin {
  static get pluginName() {
    return 'Model3dEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;
    const schema = editor.model.schema;

    schema.register('model3d', {
      inheritAllFrom: '$blockObject',
      allowAttributes: ['src', 'alt', 'model3dStyle', 'resizedWidth', 'resizedHeight']
    });
    schema.setAttributeProperties('model3dStyle', { isFormatting: true });
    schema.setAttributeProperties('resizedWidth', { isFormatting: true });
    schema.setAttributeProperties('resizedHeight', { isFormatting: true });

    this._defineConverters();
    this._listenHeightChanges();
    whenModelViewerReady();
  }

  _listenHeightChanges() {
    const editor = this.editor;

    this.listenTo(editor.model.document, 'change', () => {
      const differ = editor.model.document.differ;

      for (const change of differ.getChanges()) {
        if (change.type !== 'attribute' || change.attributeKey !== 'resizedHeight') {
          continue;
        }

        for (const item of change.range.getItems()) {
          if (item.is('element', 'model3d')) {
            applyViewerHeightToDom(editor, item, item.getAttribute('resizedHeight') || MODEL3D_DEFAULT_HEIGHT);
          }
        }
      }
    });
  }

  _defineConverters() {
    const editor = this.editor;

    editor.conversion.for('upcast').add(dispatcher => {
      dispatcher.on(
        'element:figure',
        (evt, data, conversionApi) => {
          const viewFigure = data.viewItem;
          const modelContainer = findCkModel3dContainer(viewFigure);

          if (!modelContainer) {
            return;
          }

          const attrs = readModel3dAttributes(modelContainer, viewFigure);

          if (!attrs) {
            return;
          }

          if (!conversionApi.consumable.consume(viewFigure, { name: true })) {
            return;
          }

          consumeModel3dStyleClasses(viewFigure, conversionApi);

          const modelElement = conversionApi.writer.createElement('model3d', attrs);

          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }

          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );

      dispatcher.on(
        'element:div',
        (evt, data, conversionApi) => {
          const viewElement = data.viewItem;

          if (!viewElement.hasClass('ck-model3d')) {
            return;
          }

          const attrs = readModel3dAttributes(viewElement);

          if (!attrs) {
            return;
          }

          if (!conversionApi.consumable.consume(viewElement, { name: true, classes: 'ck-model3d' })) {
            return;
          }

          const modelElement = conversionApi.writer.createElement('model3d', attrs);

          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }

          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: 'model3d',
      view: (modelElement, { writer }) => createModel3dFigureView(modelElement, writer, { renderViewer: false })
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: 'model3d',
      view: (modelElement, { writer }) => createModel3dFigureView(modelElement, writer, { renderViewer: true })
    });
  }
}

class Model3dUI extends Plugin {
  static get pluginName() {
    return 'Model3dUI';
  }

  init() {
    const editor = this.editor;

    editor.commands.add('insertModel3d', new InsertModel3dCommand(editor));

    editor.ui.componentFactory.add('model3dUpload', locale => {
      const button = new ButtonView(locale);

      button.set({
        label: '3D模型',
        icon: model3dIcon,
        tooltip: true
      });

      button.on('execute', () => this._openFilePicker());

      return button;
    });
  }

  _getUploadOptions() {
    const editor = this.editor;
    const message = editor.config.get('message');
    return Object.assign({ message }, editor.config.get('uploadAdapter'), editor.config.get('modelUpload'));
  }

  _openFilePicker() {
    const editor = this.editor;
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = MODEL3D_ACCEPT;
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener(
      'change',
      async () => {
        const file = input.files?.[0];
        document.body.removeChild(input);

        if (!file) {
          return;
        }

        const options = this._getUploadOptions();

        if (!isGlbModelFile(file)) {
          options.message?.error?.('仅支持上传 .glb 格式的 3D 模型');
          return;
        }

        const loadingClose = options.message?.loading?.('3D模型上传中...', { duration: 0 }) ?? (() => {});

        try {
          const src = await uploadFile(file, {
            ...options,
            base64Warning: '当前 3D 模型为 base64 模式，正式环境请配置 modelUpload.upload 或 uploadAdapter.upload'
          });
          await whenModelViewerReady();
          editor.execute('insertModel3d', { src, alt: file.name });
          options.message?.success?.(`${file.name} 上传成功`);
        } catch (error) {
          console.error('3D模型上传失败', error);
        } finally {
          loadingClose();
        }
      },
      { once: true }
    );

    input.click();
  }
}

class Model3dPlugin extends Plugin {
  static get pluginName() {
    return 'Model3d';
  }

  static get requires() {
    return [Model3dEditing, Model3dStyleEditing, Model3dResizeEditing, Model3dStyleUI, Model3dResizeUI, Model3dToolbar, Model3dUI];
  }
}

export default Model3dPlugin;

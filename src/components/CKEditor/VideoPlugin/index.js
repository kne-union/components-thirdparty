import { Plugin, ButtonView, Command, Widget, toWidget } from 'ckeditor5';
import { uploadFile } from '../uploadFile';
import { isVideoFile, VIDEO_ACCEPT, VIDEO_DEFAULT_HEIGHT } from './constants';
import { MediaVideoResizeEditing, MediaVideoResizeUI } from './resize';
import { MediaVideoStyleEditing, MediaVideoStyleUI } from './style';
import { MediaVideoToolbar } from './toolbar';
import videoIcon from './icon';
import {
  applyVideoHeightToDom,
  consumeMediaVideoStyleClasses,
  getFigureClasses,
  readMediaVideoStyleFromFigure,
  resolveVideoHeight,
  syncFigureSizeStyles
} from './utils';
import {
  createMediaUploadPlaceholderFigure,
  finalizeMediaUploadPlaceholder,
  insertMediaUploadPlaceholder,
  isMediaUploading,
  removeMediaUploadPlaceholder
} from '../shared/mediaUploadPlaceholder';

const readVideoAttributes = viewVideo => {
  const src = viewVideo.getAttribute('src');

  if (!src) {
    return null;
  }

  return {
    src,
    alt: viewVideo.getAttribute('title') || viewVideo.getAttribute('alt') || ''
  };
};

const readVideoFigureAttributes = (viewFigure, viewVideo) => {
  const attrs = readVideoAttributes(viewVideo);

  if (!attrs) {
    return null;
  }

  const imageStyle = readMediaVideoStyleFromFigure(viewFigure);

  if (imageStyle) {
    attrs.mediaVideoStyle = imageStyle;
  }

  const width = viewFigure.getStyle('width');

  if (width) {
    attrs.resizedWidth = width;
  } else if (viewFigure.hasClass('image_resized')) {
    attrs.resizedWidth = '100%';
  }

  const height = viewFigure.getStyle('height') || viewVideo.getStyle?.('height');

  if (height) {
    attrs.resizedHeight = height;
  }

  return attrs;
};

const findVideoInFigure = viewFigure => {
  for (const child of viewFigure.getChildren()) {
    if (child.is('element', 'video')) {
      return child;
    }
  }

  return null;
};

const figureHasImage = viewFigure => {
  for (const child of viewFigure.getChildren()) {
    if (child.is('element', 'img') || child.is('element', 'picture')) {
      return true;
    }
  }

  return false;
};

const createVideoFigureView = (modelElement, { writer, asWidget, videoConfig = {} }) => {
  if (isMediaUploading(modelElement)) {
    const i18n = videoConfig.i18n || {};
    const placeholderLabel = i18n.videoUploading || '视频上传中...';

    return createMediaUploadPlaceholderFigure(modelElement, writer, {
      figureClasses: getFigureClasses(modelElement).concat('ck-video-uploading'),
      widgetLabel: i18n.videoWidgetLabel || '视频',
      placeholderLabel,
      defaultHeight: VIDEO_DEFAULT_HEIGHT,
      resolveHeight: resolveVideoHeight,
      asWidget,
      showFileName: false
    });
  }

  const figure = writer.createContainerElement('figure', {
    class: getFigureClasses(modelElement).join(' ')
  });
  const resizedWidth = modelElement.getAttribute('resizedWidth');
  const videoHeight = resolveVideoHeight(modelElement);

  if (resizedWidth) {
    writer.setStyle('width', resizedWidth, figure);
  }

  writer.setStyle('height', videoHeight, figure);

  const video = writer.createEmptyElement('video', {
    src: modelElement.getAttribute('src'),
    controls: 'controls',
    playsinline: 'playsinline',
    preload: 'auto'
  });

  writer.setStyle('height', videoHeight, video);
  writer.insert(writer.createPositionAt(figure, 0), video);

  return asWidget ? toWidget(figure, writer, { label: '视频' }) : figure;
};

class InsertMediaVideoCommand extends Command {
  execute({ src, alt = '' }) {
    const editor = this.editor;

    editor.model.change(writer => {
      const mediaVideo = writer.createElement('mediaVideo', { src, alt });
      editor.model.insertObject(mediaVideo, null, null, { setSelection: 'on' });
    });
  }

  refresh() {
    this.isEnabled = !this.editor.isReadOnly;
  }
}

class VideoEditing extends Plugin {
  static get pluginName() {
    return 'VideoEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;

    editor.model.schema.register('mediaVideo', {
      inheritAllFrom: '$blockObject',
      allowAttributes: ['src', 'alt', 'mediaVideoStyle', 'resizedWidth', 'resizedHeight', 'uploadStatus']
    });
    editor.model.schema.setAttributeProperties('mediaVideoStyle', { isFormatting: true });
    editor.model.schema.setAttributeProperties('resizedWidth', { isFormatting: true });
    editor.model.schema.setAttributeProperties('resizedHeight', { isFormatting: true });

    this._defineConverters();
    this._listenHeightChanges();
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
          if (item.is('element', 'mediaVideo')) {
            applyVideoHeightToDom(editor, item, item.getAttribute('resizedHeight') || VIDEO_DEFAULT_HEIGHT);
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
          const viewVideo = findVideoInFigure(viewFigure);

          if (!viewVideo || figureHasImage(viewFigure)) {
            return;
          }

          if (!viewFigure.hasClass('ck-video') && viewFigure.getChildCount() !== 1) {
            return;
          }

          const attrs = readVideoFigureAttributes(viewFigure, viewVideo);

          if (!attrs) {
            return;
          }

          if (!conversionApi.consumable.consume(viewFigure, { name: true })) {
            return;
          }

          conversionApi.consumable.consume(viewVideo, { name: true });
          consumeMediaVideoStyleClasses(viewFigure, conversionApi);

          const modelElement = conversionApi.writer.createElement('mediaVideo', attrs);

          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }

          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );

      dispatcher.on('element:video', (evt, data, conversionApi) => {
        const viewVideo = data.viewItem;
        const attrs = readVideoAttributes(viewVideo);

        if (!attrs) {
          return;
        }

        if (!conversionApi.consumable.consume(viewVideo, { name: true })) {
          return;
        }

        const modelElement = conversionApi.writer.createElement('mediaVideo', attrs);

        if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
          return;
        }

        conversionApi.updateConversionResult(modelElement, data);
      });
    });

    const getVideoConfig = () => ({
      i18n: editor.config.get('ckeditorI18n') || {}
    });

    const downcastFigure = (modelElement, conversionApi, asWidget) => {
      const viewFigure = createVideoFigureView(modelElement, {
        writer: conversionApi.writer,
        asWidget,
        videoConfig: getVideoConfig()
      });

      if (asWidget && !isMediaUploading(modelElement)) {
        syncFigureSizeStyles(conversionApi.writer, viewFigure, modelElement);
      }

      return viewFigure;
    };

    editor.conversion.for('dataDowncast').elementToElement({
      model: 'mediaVideo',
      view: (modelElement, conversionApi) => {
        const viewFigure = createVideoFigureView(modelElement, {
          writer: conversionApi.writer,
          asWidget: false,
          videoConfig: getVideoConfig()
        });

        if (!isMediaUploading(modelElement)) {
          syncFigureSizeStyles(conversionApi.writer, viewFigure, modelElement);
        }

        return viewFigure;
      }
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: 'mediaVideo',
      view: (modelElement, conversionApi) => {
        const viewFigure = downcastFigure(modelElement, conversionApi, true);

        if (!isMediaUploading(modelElement)) {
          applyVideoHeightToDom(editor, modelElement);
        }

        return viewFigure;
      }
    });
  }
}

class VideoUI extends Plugin {
  static get pluginName() {
    return 'VideoUI';
  }

  init() {
    const editor = this.editor;

    editor.commands.add('insertMediaVideo', new InsertMediaVideoCommand(editor));

    editor.ui.componentFactory.add('videoUpload', locale => {
      const button = new ButtonView(locale);
      const i18n = editor.config.get('ckeditorI18n') || {};

      button.set({
        label: i18n.videoLabel || '视频',
        icon: videoIcon,
        tooltip: true
      });

      button.on('execute', () => this._openFilePicker());

      return button;
    });
  }

  _getUploadOptions() {
    const editor = this.editor;
    const message = editor.config.get('message');

    return Object.assign({ message }, editor.config.get('uploadAdapter'), editor.config.get('videoUpload'));
  }

  _openFilePicker() {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = VIDEO_ACCEPT;
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener(
      'change',
      async () => {
        const file = input.files?.[0];
        const editor = this.editor;
        const options = this._getUploadOptions();

        document.body.removeChild(input);

        if (!file) {
          return;
        }

        const i18n = editor.config.get('ckeditorI18n') || {};

        if (!isVideoFile(file)) {
          options.message?.error?.(i18n.videoUploadFormatError || '仅支持上传常见视频格式（如 mp4、webm、mov 等）');
          return;
        }

        const placeholder = insertMediaUploadPlaceholder(editor, 'mediaVideo');

        try {
          const src = await uploadFile(file, {
            ...options,
            uploadFailedMessage: i18n.uploadFailed,
            base64Warning:
              i18n.videoBase64Warning ||
              '当前视频为 base64 模式，正式环境请配置 videoUpload.upload 或 uploadAdapter.upload'
          });

          finalizeMediaUploadPlaceholder(editor, placeholder, { src });
          options.message?.success?.(
            typeof i18n.videoUploadSuccess === 'function'
              ? i18n.videoUploadSuccess(file.name)
              : `${file.name} 上传成功`
          );
        } catch (error) {
          removeMediaUploadPlaceholder(editor, placeholder);
          options.message?.error?.(i18n.uploadFailed || '上传失败');
          console.error('视频上传失败', error);
        }
      },
      { once: true }
    );

    input.click();
  }
}

class VideoPlugin extends Plugin {
  static get pluginName() {
    return 'Video';
  }

  static get requires() {
    return [
      VideoEditing,
      MediaVideoStyleEditing,
      MediaVideoResizeEditing,
      MediaVideoStyleUI,
      MediaVideoResizeUI,
      MediaVideoToolbar,
      VideoUI
    ];
  }
}

export default VideoPlugin;

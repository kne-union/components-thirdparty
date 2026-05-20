import { Plugin, Command, ButtonView, WidgetResize } from 'ckeditor5';
import {
  IconObjectSizeFull,
  IconObjectSizeLarge,
  IconObjectSizeMedium,
  IconObjectSizeSmall
} from 'ckeditor5';
import { MODEL3D_DEFAULT_HEIGHT, MODEL3D_HEIGHT_OPTIONS, MODEL3D_RESIZE_OPTIONS } from './constants';
import { getResizeCommitPayload, patchModel3dResizer } from './model3dResizer';
import {
  applyViewerHeightToDom,
  clearModel3dInlineResizeStyles,
  getModel3dWidgetFromEditor,
  getSelectedModel3d,
  resolveModel3dHeight,
  syncFigureSizeStyles
} from './utils';

const RESIZE_ICONS = {
  original: IconObjectSizeFull,
  small: IconObjectSizeSmall,
  medium: IconObjectSizeMedium,
  large: IconObjectSizeLarge
};

class ResizeModel3dCommand extends Command {
  refresh() {
    const element = getSelectedModel3d(this.editor.model.document.selection);
    this.isEnabled = !!element;
    this.value = {
      width: element?.getAttribute('resizedWidth') || null,
      height: element?.getAttribute('resizedHeight') || null
    };
  }

  execute({ width, height } = {}) {
    const editor = this.editor;
    const element = getSelectedModel3d(editor.model.document.selection);

    if (!element) {
      return;
    }

    editor.model.change(writer => {
      if (width !== undefined) {
        if (width) {
          writer.setAttribute('resizedWidth', width, element);
        } else {
          writer.removeAttribute('resizedWidth', element);
        }
      }

      if (height !== undefined) {
        if (height) {
          writer.setAttribute('resizedHeight', height, element);
        } else {
          writer.removeAttribute('resizedHeight', element);
        }
      }
    });

    const viewFigure = getModel3dWidgetFromEditor(editor);

    if (viewFigure) {
      editor.editing.view.change(writer => {
        syncFigureSizeStyles(writer, viewFigure, element);
      });
      clearModel3dInlineResizeStyles(editor, element);
    }

    if (height !== undefined) {
      applyViewerHeightToDom(editor, element, height || MODEL3D_DEFAULT_HEIGHT);
    } else if (width !== undefined) {
      applyViewerHeightToDom(editor, element, resolveModel3dHeight(element));
    }
  }
}

const registerSizeConverters = (editor, pipeline) => {
  editor.conversion.for(pipeline).add(dispatcher => {
    dispatcher.on('attribute:resizedWidth:model3d', (evt, data, conversionApi) => {
      const viewFigure = conversionApi.mapper.toViewElement(data.item);

      if (!viewFigure) {
        return;
      }

      syncFigureSizeStyles(conversionApi.writer, viewFigure, data.item);
    });

    dispatcher.on('attribute:resizedHeight:model3d', (evt, data, conversionApi) => {
      const viewFigure = conversionApi.mapper.toViewElement(data.item);

      if (!viewFigure) {
        return;
      }

      syncFigureSizeStyles(conversionApi.writer, viewFigure, data.item);

      if (pipeline === 'editingDowncast') {
        applyViewerHeightToDom(
          editor,
          data.item,
          data.attributeNewValue || MODEL3D_DEFAULT_HEIGHT
        );
      }
    });
  });
};

export class Model3dResizeEditing extends Plugin {
  static get pluginName() {
    return 'Model3dResizeEditing';
  }

  static get requires() {
    return ['Model3dEditing', WidgetResize];
  }

  init() {
    const editor = this.editor;

    editor.commands.add('resizeModel3d', new ResizeModel3dCommand(editor));
    registerSizeConverters(editor, 'editingDowncast');
    registerSizeConverters(editor, 'dataDowncast');
  }

  afterInit() {
    const editor = this.editor;
    const widgetResize = editor.plugins.get(WidgetResize);

    const tryAttachResizer = () => {
      const modelElement = getSelectedModel3d(editor.model.document.selection);

      if (!modelElement) {
        return;
      }

      const viewFigure = editor.editing.mapper.toViewElement(modelElement);

      if (!viewFigure || widgetResize.getResizerByViewElement(viewFigure)) {
        return;
      }

      const resizer = widgetResize.attachTo({
        unit: '%',
        modelElement,
        viewElement: viewFigure,
        editor,
        getHandleHost(domWidgetElement) {
          return domWidgetElement.querySelector('.ck-model3d-viewer') || domWidgetElement;
        },
        getResizeHost(domWidgetElement) {
          return domWidgetElement;
        },
        isCentered() {
          const model3dStyle = modelElement.getAttribute('model3dStyle');
          return model3dStyle === 'alignCenter' || !model3dStyle || model3dStyle === 'block';
        },
        onCommit(newValue) {
          editor.execute('resizeModel3d', getResizeCommitPayload(resizer, newValue));
        }
      });

      patchModel3dResizer(resizer);
    };

    this.listenTo(editor.editing.view.document, 'change', tryAttachResizer);
    this.listenTo(editor.model.document.selection, 'change', tryAttachResizer);
  }
}

export class Model3dResizeUI extends Plugin {
  static get pluginName() {
    return 'Model3dResizeUI';
  }

  static get requires() {
    return [Model3dResizeEditing];
  }

  init() {
    const editor = this.editor;
    const command = editor.commands.get('resizeModel3d');

    MODEL3D_RESIZE_OPTIONS.forEach(option => {
      editor.ui.componentFactory.add(option.name, locale => {
        const button = new ButtonView(locale);
        const iconKey = option.name.split(':')[1];

        button.set({
          label: option.label,
          icon:
            RESIZE_ICONS[
              iconKey === 'original' ? 'original' : iconKey === '25' ? 'small' : iconKey === '50' ? 'medium' : 'large'
            ],
          tooltip: option.label,
          isToggleable: true
        });

        button.bind('isEnabled').to(command);
        button.bind('isOn').to(command, 'value', value => value?.width === option.value);

        button.on('execute', () => {
          editor.execute('resizeModel3d', { width: option.value });
        });

        return button;
      });
    });

    MODEL3D_HEIGHT_OPTIONS.forEach(option => {
      editor.ui.componentFactory.add(option.name, locale => {
        const button = new ButtonView(locale);

        button.set({
          label: option.label,
          icon: IconObjectSizeMedium,
          tooltip: option.label,
          isToggleable: true
        });

        button.bind('isEnabled').to(command);
        button.bind('isOn').to(command, 'value', value => value?.height === option.value);

        button.on('execute', () => {
          editor.execute('resizeModel3d', { height: option.value });
        });

        return button;
      });
    });
  }
}

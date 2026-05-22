import { Plugin, Command, ButtonView, WidgetResize } from 'ckeditor5';
import {
  IconObjectSizeFull,
  IconObjectSizeLarge,
  IconObjectSizeMedium,
  IconObjectSizeSmall
} from 'ckeditor5';
import { isMediaUploading } from '../mediaUploadPlaceholder';
import { getResizeCommitPayload, patchMediaWidgetResizer } from './widgetResizer';

const RESIZE_ICONS = {
  original: IconObjectSizeFull,
  small: IconObjectSizeSmall,
  medium: IconObjectSizeMedium,
  large: IconObjectSizeLarge
};

export const createResizePlugins = ({
  editingPluginName,
  uiPluginName,
  requiresEditing,
  modelName,
  commandName,
  defaultHeight,
  widthOptions,
  heightOptions,
  getSelected,
  getWidgetFromEditor,
  syncFigureSizeStyles,
  resolveHeight,
  clearInlineResizeStyles,
  applyHeightToDom,
  getHandleHost,
  getResizeHost,
  isCentered,
  applyDomResize
}) => {
  class ResizeCommand extends Command {
    refresh() {
      const element = getSelected(this.editor.model.document.selection);
      this.isEnabled = !!element && !isMediaUploading(element);
      this.value = {
        width: element?.getAttribute('resizedWidth') || null,
        height: element?.getAttribute('resizedHeight') || null
      };
    }

    execute({ width, height } = {}) {
      const editor = this.editor;
      const element = getSelected(editor.model.document.selection);

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

      const viewFigure = getWidgetFromEditor(editor);

      if (viewFigure) {
        editor.editing.view.change(writer => {
          syncFigureSizeStyles(writer, viewFigure, element);
        });
      }

      const resolvedHeight =
        height !== undefined ? height || defaultHeight : resolveHeight(element);

      clearInlineResizeStyles(editor, element);
      applyHeightToDom(editor, element, resolvedHeight);
    }
  }

  const registerSizeConverters = (editor, pipeline) => {
    editor.conversion.for(pipeline).add(dispatcher => {
      dispatcher.on(`attribute:resizedWidth:${modelName}`, (evt, data, conversionApi) => {
        const viewFigure = conversionApi.mapper.toViewElement(data.item);

        if (!viewFigure) {
          return;
        }

        syncFigureSizeStyles(conversionApi.writer, viewFigure, data.item);

        if (pipeline === 'editingDowncast') {
          applyHeightToDom(editor, data.item);
        }
      });

      dispatcher.on(`attribute:resizedHeight:${modelName}`, (evt, data, conversionApi) => {
        const viewFigure = conversionApi.mapper.toViewElement(data.item);

        if (!viewFigure) {
          return;
        }

        syncFigureSizeStyles(conversionApi.writer, viewFigure, data.item);

        if (pipeline === 'editingDowncast') {
          applyHeightToDom(editor, data.item, data.attributeNewValue || defaultHeight);
        }
      });
    });
  };

  class ResizeEditing extends Plugin {
    static get pluginName() {
      return editingPluginName;
    }

    static get requires() {
      return [requiresEditing, WidgetResize];
    }

    init() {
      const editor = this.editor;

      editor.commands.add(commandName, new ResizeCommand(editor));
      registerSizeConverters(editor, 'editingDowncast');
      registerSizeConverters(editor, 'dataDowncast');
    }

    afterInit() {
      const editor = this.editor;
      const widgetResize = editor.plugins.get(WidgetResize);

      const tryAttachResizer = () => {
        const modelElement = getSelected(editor.model.document.selection);

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
          getHandleHost,
          getResizeHost,
          isCentered() {
            return isCentered(modelElement);
          },
          onCommit(newValue) {
            const payload = getResizeCommitPayload(resizer, newValue);

            editor.execute(commandName, payload);
            applyHeightToDom(editor, modelElement, payload.height || resolveHeight(modelElement));
          }
        });

        patchMediaWidgetResizer(resizer, { applyDomResize });
      };

      this.listenTo(editor.editing.view.document, 'change', tryAttachResizer);
      this.listenTo(editor.model.document.selection, 'change', tryAttachResizer);
    }
  }

  class ResizeUI extends Plugin {
    static get pluginName() {
      return uiPluginName;
    }

    static get requires() {
      return [ResizeEditing];
    }

    init() {
      const editor = this.editor;
      const command = editor.commands.get(commandName);
      const i18n = editor.config.get('ckeditorI18n');
      const resolvedWidthOptions =
        commandName === 'resizeModel3d'
          ? i18n?.model3dResizeOptions ?? widthOptions
          : commandName === 'resizeMediaVideo'
            ? i18n?.videoResizeOptions ?? widthOptions
            : commandName === 'resizeEchart'
              ? i18n?.echartResizeOptions ?? widthOptions
              : widthOptions;
      const resolvedHeightOptions =
        commandName === 'resizeModel3d'
          ? i18n?.model3dHeightOptions ?? heightOptions
          : commandName === 'resizeMediaVideo'
            ? i18n?.videoHeightOptions ?? heightOptions
            : commandName === 'resizeEchart'
              ? i18n?.echartHeightOptions ?? heightOptions
              : heightOptions;

      resolvedWidthOptions.forEach(option => {
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
            editor.execute(commandName, { width: option.value });
          });

          return button;
        });
      });

      resolvedHeightOptions.forEach(option => {
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
            editor.execute(commandName, { height: option.value });
          });

          return button;
        });
      });
    }
  }

  return { ResizeEditing, ResizeUI };
};

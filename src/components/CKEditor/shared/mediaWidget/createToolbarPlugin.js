import { Plugin, WidgetToolbarRepository } from 'ckeditor5';

export const createToolbarPlugin = ({
  pluginName,
  toolbarConfigKey,
  widgetName,
  ariaLabel,
  figureClass,
  interactClass,
  getSelected,
  getWidgetFromViewSelection
}) => {
  return class MediaWidgetToolbar extends Plugin {
    static get pluginName() {
      return pluginName;
    }

    static get requires() {
      return [WidgetToolbarRepository];
    }

    afterInit() {
      const editor = this.editor;
      const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);
      const toolbarItems = editor.config.get(toolbarConfigKey);

      if (!toolbarItems?.length) {
        return;
      }

      widgetToolbarRepository.register(widgetName, {
        ariaLabel,
        items: toolbarItems,
        getRelatedElement: viewSelection => {
          const fromView = getWidgetFromViewSelection(viewSelection);

          if (fromView) {
            return fromView;
          }

          const modelElement = getSelected(editor.model.document.selection);

          if (!modelElement) {
            return null;
          }

          return editor.editing.mapper.toViewElement(modelElement);
        }
      });

      this._setupEditorInteraction();
    }

    _setupEditorInteraction() {
      const editor = this.editor;
      const viewDocument = editor.editing.view.document;

      const keepSelectionOnToolbarClick = nativeEvent => {
        const target = nativeEvent.target;

        if (target?.closest?.('.ck-sticky-panel') || target?.closest?.('.ck-toolbar-dropdown')) {
          return;
        }

        if (!target?.closest?.('.ck-balloon-panel')) {
          return;
        }

        const modelElement = getSelected(editor.model.document.selection);

        if (!modelElement) {
          return;
        }

        nativeEvent.preventDefault();

        editor.model.change(writer => {
          writer.setSelection(modelElement, 'on');
        });
      };

      document.addEventListener('mousedown', keepSelectionOnToolbarClick, true);
      this.on('destroy', () => {
        document.removeEventListener('mousedown', keepSelectionOnToolbarClick, true);
      });

      if (interactClass) {
        this.listenTo(viewDocument, 'dblclick', (evt, data) => {
          const figure = data.domTarget?.closest?.(`figure.${figureClass}`);

          if (!figure) {
            return;
          }

          figure.classList.toggle(interactClass);
        });
      }
    }
  };
};

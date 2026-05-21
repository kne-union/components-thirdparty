import { Plugin, WidgetToolbarRepository } from 'ckeditor5';
import { getModel3dWidgetFromViewSelection, getSelectedModel3d } from './utils';

export class Model3dToolbar extends Plugin {
  static get pluginName() {
    return 'Model3dToolbar';
  }

  static get requires() {
    return [WidgetToolbarRepository];
  }

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);
    const toolbarItems = editor.config.get('model3d.toolbar');

    if (!toolbarItems?.length) {
      return;
    }

    widgetToolbarRepository.register('model3d', {
      ariaLabel: '3D模型工具栏',
      items: toolbarItems,
      getRelatedElement: viewSelection => {
        const fromView = getModel3dWidgetFromViewSelection(viewSelection);

        if (fromView) {
          return fromView;
        }

        const modelElement = getSelectedModel3d(editor.model.document.selection);

        if (!modelElement) {
          return null;
        }

        return editor.editing.mapper.toViewElement(modelElement);
      }
    });

    this._setupEditorInteraction();
  }

  /**
   * model-viewer 会抢走焦点，导致 WidgetToolbar 因 focusTracker 失焦而隐藏
   */
  _setupEditorInteraction() {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;

    const keepModel3dSelectionOnToolbarClick = nativeEvent => {
      const target = nativeEvent.target;

      // 仅处理 3D widget 浮动工具栏，勿干扰顶部主工具栏（含「显示更多」）
      if (
        !target?.closest?.('.ck-balloon-panel') ||
        target.closest('.ck-sticky-panel') ||
        target.closest('.ck-toolbar-dropdown')
      ) {
        return;
      }

      const modelElement = getSelectedModel3d(editor.model.document.selection);

      if (!modelElement) {
        return;
      }

      editor.model.change(writer => {
        writer.setSelection(modelElement, 'on');
      });
      editor.editing.view.focus();
    };

    document.addEventListener('mousedown', keepModel3dSelectionOnToolbarClick, true);
    this.on('destroy', () => {
      document.removeEventListener('mousedown', keepModel3dSelectionOnToolbarClick, true);
    });

    this.listenTo(viewDocument, 'dblclick', (evt, data) => {
      const figure = data.domTarget?.closest?.('figure.ck-model3d');

      if (!figure) {
        return;
      }

      figure.classList.toggle('ck-model3d-interact');
    });
  }
}

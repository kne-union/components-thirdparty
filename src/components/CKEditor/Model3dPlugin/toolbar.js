import { Plugin, WidgetToolbarRepository } from 'ckeditor5';
import { getModel3dWidgetFromViewSelection } from './utils';

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
      getRelatedElement: viewSelection => getModel3dWidgetFromViewSelection(viewSelection)
    });
  }
}

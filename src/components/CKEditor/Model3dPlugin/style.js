import { Plugin, Command, ButtonView } from 'ckeditor5';
import {
  IconObjectCenter,
  IconObjectFullWidth,
  IconObjectLeft,
  IconObjectRight,
  IconObjectInlineLeft,
  IconObjectInlineRight
} from 'ckeditor5';
import { MODEL3D_STYLES } from './constants';
import { getModel3dWidgetFromEditor, getSelectedModel3d, getStyleByName, syncFigureStyles } from './utils';

const STYLE_ICONS = {
  block: IconObjectCenter,
  side: IconObjectFullWidth,
  alignLeft: IconObjectInlineLeft,
  alignRight: IconObjectInlineRight,
  alignCenter: IconObjectCenter,
  alignBlockLeft: IconObjectLeft,
  alignBlockRight: IconObjectRight
};

class Model3dStyleCommand extends Command {
  refresh() {
    const element = getSelectedModel3d(this.editor.model.document.selection);
    this.isEnabled = !!element;
    this.value = element?.getAttribute('model3dStyle') || 'block';
  }

  execute({ value }) {
    const editor = this.editor;
    const element = getSelectedModel3d(editor.model.document.selection);

    if (!element) {
      return;
    }

    editor.model.change(writer => {
      const style = getStyleByName(value);

      if (!style || style.isDefault) {
        writer.removeAttribute('model3dStyle', element);
      } else {
        writer.setAttribute('model3dStyle', value, element);
      }
    });

    const viewFigure = getModel3dWidgetFromEditor(editor);

    if (viewFigure) {
      editor.editing.view.change(writer => {
        syncFigureStyles(writer, viewFigure, element);
      });
    }
  }
}

const registerStyleConverter = (editor, pipeline) => {
  editor.conversion.for(pipeline).add(dispatcher => {
    dispatcher.on('attribute:model3dStyle:model3d', (evt, data, conversionApi) => {
      const viewFigure = conversionApi.mapper.toViewElement(data.item);

      if (!viewFigure) {
        return;
      }

      syncFigureStyles(conversionApi.writer, viewFigure, data.item);
    });
  });
};

export class Model3dStyleEditing extends Plugin {
  static get pluginName() {
    return 'Model3dStyleEditing';
  }

  static get requires() {
    return ['Model3dEditing'];
  }

  init() {
    const editor = this.editor;

    editor.commands.add('model3dStyle', new Model3dStyleCommand(editor));
    registerStyleConverter(editor, 'editingDowncast');
    registerStyleConverter(editor, 'dataDowncast');
  }
}

export class Model3dStyleUI extends Plugin {
  static get pluginName() {
    return 'Model3dStyleUI';
  }

  static get requires() {
    return [Model3dStyleEditing];
  }

  init() {
    const editor = this.editor;

    MODEL3D_STYLES.forEach(style => {
      editor.ui.componentFactory.add(`model3dStyle:${style.name}`, locale => {
        const button = new ButtonView(locale);
        const command = editor.commands.get('model3dStyle');

        button.set({
          label: style.title,
          icon: STYLE_ICONS[style.name] || IconObjectCenter,
          tooltip: true,
          isToggleable: true
        });

        button.bind('isEnabled').to(command);
        button.bind('isOn').to(command, 'value', value =>
          style.isDefault ? !value || value === 'block' : value === style.name
        );

        button.on('execute', () => {
          editor.execute('model3dStyle', { value: style.name });
        });

        return button;
      });
    });
  }
}

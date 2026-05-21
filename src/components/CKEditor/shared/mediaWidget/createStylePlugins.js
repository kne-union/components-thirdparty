import { Plugin, Command, ButtonView } from 'ckeditor5';
import {
  IconObjectCenter,
  IconObjectFullWidth,
  IconObjectLeft,
  IconObjectRight,
  IconObjectInlineLeft,
  IconObjectInlineRight
} from 'ckeditor5';

const STYLE_ICONS = {
  block: IconObjectCenter,
  side: IconObjectFullWidth,
  alignLeft: IconObjectInlineLeft,
  alignRight: IconObjectInlineRight,
  alignCenter: IconObjectCenter,
  alignBlockLeft: IconObjectLeft,
  alignBlockRight: IconObjectRight
};

export const createStylePlugins = ({
  editingPluginName,
  uiPluginName,
  requiresEditing,
  modelName,
  commandName,
  styleAttribute,
  componentPrefix,
  styles,
  getSelected,
  getWidgetFromEditor,
  syncFigureStyles,
  getStyleByName
}) => {
  class StyleCommand extends Command {
    refresh() {
      const element = getSelected(this.editor.model.document.selection);
      this.isEnabled = !!element;
      this.value = element?.getAttribute(styleAttribute) || 'block';
    }

    execute({ value }) {
      const editor = this.editor;
      const element = getSelected(editor.model.document.selection);

      if (!element) {
        return;
      }

      editor.model.change(writer => {
        const style = getStyleByName(value);

        if (!style || style.isDefault) {
          writer.removeAttribute(styleAttribute, element);
        } else {
          writer.setAttribute(styleAttribute, value, element);
        }
      });

      const viewFigure = getWidgetFromEditor(editor);

      if (viewFigure) {
        editor.editing.view.change(writer => {
          syncFigureStyles(writer, viewFigure, element);
        });
      }
    }
  }

  const registerStyleConverter = (editor, pipeline) => {
    editor.conversion.for(pipeline).add(dispatcher => {
      dispatcher.on(`attribute:${styleAttribute}:${modelName}`, (evt, data, conversionApi) => {
        const viewFigure = conversionApi.mapper.toViewElement(data.item);

        if (!viewFigure) {
          return;
        }

        syncFigureStyles(conversionApi.writer, viewFigure, data.item);
      });
    });
  };

  class StyleEditing extends Plugin {
    static get pluginName() {
      return editingPluginName;
    }

    static get requires() {
      return [requiresEditing];
    }

    init() {
      const editor = this.editor;

      editor.commands.add(commandName, new StyleCommand(editor));
      registerStyleConverter(editor, 'editingDowncast');
      registerStyleConverter(editor, 'dataDowncast');
    }
  }

  class StyleUI extends Plugin {
    static get pluginName() {
      return uiPluginName;
    }

    static get requires() {
      return [StyleEditing];
    }

    init() {
      const editor = this.editor;

      styles.forEach(style => {
        editor.ui.componentFactory.add(`${componentPrefix}:${style.name}`, locale => {
          const button = new ButtonView(locale);
          const command = editor.commands.get(commandName);

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
            editor.execute(commandName, { value: style.name });
          });

          return button;
        });
      });
    }
  }

  return { StyleEditing, StyleUI };
};

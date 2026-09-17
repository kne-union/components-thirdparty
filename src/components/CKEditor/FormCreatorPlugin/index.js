import { Plugin, ButtonView, Command, Widget, toWidget } from 'ckeditor5';
import {
  FORM_CREATOR_BOX_CLASS,
  FORM_CREATOR_CLASS,
  FORM_CREATOR_DATA_ATTR,
  FORM_CREATOR_DEFAULT_HEIGHT,
  FORM_CREATOR_MODEL,
  FORM_CREATOR_VIEWER_CLASS
} from './constants';
import formCreatorIcon from './icon';
import { insertCornerEditButton } from '../shared/insertCornerEditButton';
import { openFormCreatorDialog } from './openFormCreatorDialog';
import {
  mountFormCreatorInHost,
  remountFormCreatorInHost,
  unmountFormCreatorFromHost
} from './mountFormCreatorView';
import { encodeSchemaForHtmlAttribute, parseSchemaText, stringifySchema } from './schemaCodec';
import { getSelectedFormCreator, isFormCreatorSection, readFormCreatorSchemaFromView } from './utils';

const buildSectionClasses = () => [FORM_CREATOR_BOX_CLASS, FORM_CREATOR_CLASS].join(' ');

const getFormCreatorMountOptions = (editor, schemaText) => {
  const cfg = editor.config.get('formCreator') || {};
  const i18n = editor.config.get('ckeditorI18n') || {};

  return {
    schema: parseSchemaText(schemaText, { fallbackToDefault: true }),
    height: cfg.height ?? FORM_CREATOR_DEFAULT_HEIGHT,
    preview: cfg.preview !== false,
    showActions: cfg.showActions === true,
    formProps: cfg.formProps && typeof cfg.formProps === 'object' ? cfg.formProps : {},
    emptyText: i18n.formCreatorEmpty || '暂无表单内容'
  };
};

const createFormCreatorSectionView = (editor, modelElement, { writer, asWidget }) => {
  const schemaText = modelElement.getAttribute('schema') || stringifySchema();
  const section = writer.createContainerElement('section', {
    class: buildSectionClasses(),
    [FORM_CREATOR_DATA_ATTR]: encodeSchemaForHtmlAttribute(schemaText)
  });

  if (!asWidget) {
    return section;
  }

  const mountOptions = getFormCreatorMountOptions(editor, schemaText);

  const viewerHost = writer.createRawElement('div', { class: FORM_CREATOR_VIEWER_CLASS }, domElement => {
    mountFormCreatorInHost(domElement, mountOptions);

    return () => unmountFormCreatorFromHost(domElement);
  });

  writer.insert(writer.createPositionAt(section, 0), viewerHost);

  const i18n = editor.config.get('ckeditorI18n') || {};

  insertCornerEditButton(writer, section, {
    label: i18n.formCreatorEditAction || '编辑',
    onEdit: () => {
      editor.model.change(modelWriter => {
        modelWriter.setSelection(modelElement, 'on');
      });
      openFormCreatorDialogForEditor(editor, modelElement.getAttribute('schema') || '');
    }
  });

  return toWidget(section, writer, { label: i18n.formCreatorWidgetLabel || i18n.formCreatorLabel || '表单' });
};

class InsertFormCreatorCommand extends Command {
  execute({ schema } = {}) {
    const schemaText = typeof schema === 'string' ? schema : stringifySchema(schema);

    if (!schemaText) {
      return;
    }

    const editor = this.editor;

    editor.model.change(writer => {
      const formCreator = writer.createElement(FORM_CREATOR_MODEL, { schema: schemaText });
      editor.model.insertObject(formCreator, null, null, { setSelection: 'on' });
    });
  }

  refresh() {
    this.isEnabled = !this.editor.isReadOnly;
  }
}

class UpdateFormCreatorCommand extends Command {
  refresh() {
    const element = getSelectedFormCreator(this.editor.model.document.selection);
    this.isEnabled = !!element && !this.editor.isReadOnly;
  }

  execute({ schema } = {}) {
    const editor = this.editor;
    const element = getSelectedFormCreator(editor.model.document.selection);

    if (!element || schema === undefined) {
      return;
    }

    const schemaText = typeof schema === 'string' ? schema : stringifySchema(schema);

    editor.model.change(writer => {
      writer.setAttribute('schema', schemaText, element);
    });

    const viewSection = editor.editing.mapper.toViewElement(element);

    if (!viewSection) {
      return;
    }

    editor.editing.view.change(writer => {
      writer.setAttribute(FORM_CREATOR_DATA_ATTR, encodeSchemaForHtmlAttribute(schemaText), viewSection);
    });

    const domSection = editor.editing.view.domConverter.mapViewToDom(viewSection);
    const host = domSection?.querySelector?.(`.${FORM_CREATOR_VIEWER_CLASS}`);

    if (host) {
      remountFormCreatorInHost(host, getFormCreatorMountOptions(editor, schemaText));
    }
  }
}

class FormCreatorEditing extends Plugin {
  static get pluginName() {
    return 'FormCreatorEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;

    editor.model.schema.register(FORM_CREATOR_MODEL, {
      inheritAllFrom: '$blockObject',
      allowAttributes: ['schema']
    });

    this._defineConverters();
    this._setupDoubleClickEdit();
  }

  _defineConverters() {
    const editor = this.editor;

    editor.conversion.for('upcast').add(dispatcher => {
      dispatcher.on(
        'element:section',
        (evt, data, conversionApi) => {
          const viewSection = data.viewItem;

          if (!isFormCreatorSection(viewSection)) {
            return;
          }

          const attrs = readFormCreatorSchemaFromView(viewSection);

          if (!attrs) {
            return;
          }

          if (!conversionApi.consumable.consume(viewSection, { name: true })) {
            return;
          }

          if (viewSection.hasClass(FORM_CREATOR_CLASS)) {
            conversionApi.consumable.consume(viewSection, { classes: FORM_CREATOR_CLASS });
          }

          if (viewSection.hasClass(FORM_CREATOR_BOX_CLASS)) {
            conversionApi.consumable.consume(viewSection, { classes: FORM_CREATOR_BOX_CLASS });
          }

          conversionApi.consumable.consume(viewSection, { attributes: FORM_CREATOR_DATA_ATTR });

          const modelElement = conversionApi.writer.createElement(FORM_CREATOR_MODEL, attrs);

          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }

          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: FORM_CREATOR_MODEL,
      view: (modelElement, { writer }) =>
        createFormCreatorSectionView(editor, modelElement, { writer, asWidget: false })
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: FORM_CREATOR_MODEL,
      view: (modelElement, conversionApi) =>
        createFormCreatorSectionView(editor, modelElement, {
          writer: conversionApi.writer,
          asWidget: true
        })
    });

    editor.conversion.for('editingDowncast').add(dispatcher => {
      dispatcher.on(`attribute:schema:${FORM_CREATOR_MODEL}`, (evt, data, conversionApi) => {
        const viewSection = conversionApi.mapper.toViewElement(data.item);

        if (!viewSection) {
          return;
        }

        const schemaText = data.attributeNewValue || stringifySchema();

        conversionApi.writer.setAttribute(
          FORM_CREATOR_DATA_ATTR,
          encodeSchemaForHtmlAttribute(schemaText),
          viewSection
        );

        const domSection = editor.editing.view.domConverter.mapViewToDom(viewSection);
        const host = domSection?.querySelector?.(`.${FORM_CREATOR_VIEWER_CLASS}`);

        if (host) {
          remountFormCreatorInHost(host, getFormCreatorMountOptions(editor, schemaText));
        }
      });
    });
  }

  _setupDoubleClickEdit() {
    const editor = this.editor;

    this.listenTo(editor.editing.view.document, 'dblclick', (evt, data) => {
      const section = data.domTarget?.closest?.(`section.${FORM_CREATOR_CLASS}`);

      if (!section) {
        return;
      }

      const viewSection = editor.editing.view.domConverter.domToView(section);
      const modelElement = viewSection && editor.editing.mapper.toModelElement(viewSection);

      if (!modelElement?.is('element', FORM_CREATOR_MODEL)) {
        return;
      }

      editor.model.change(writer => {
        writer.setSelection(modelElement, 'on');
      });

      openFormCreatorDialogForEditor(editor, modelElement.getAttribute('schema') || '');
    });
  }
}

const openFormCreatorDialogForEditor = (editor, initialValue) => {
  const cfg = editor.config.get('formCreator') || {};
  const editorCfg = cfg.editor || {};
  const i18n = editor.config.get('ckeditorI18n') || {};
  const selected = getSelectedFormCreator(editor.model.document.selection);
  const defaultSchemaValue = parseSchemaText(initialValue, { fallbackToDefault: true });

  openFormCreatorDialog({
    title: selected
      ? i18n.formCreatorEditTitle || '编辑表单'
      : i18n.formCreatorInsertTitle || '插入表单',
    defaultValue: defaultSchemaValue,
    editorProps: editorCfg,
    onSubmit: schema => {
      if (!schema) {
        return;
      }

      if (selected) {
        editor.execute('updateFormCreator', { schema });
        return;
      }

      editor.execute('insertFormCreator', { schema });
    }
  });
};

class FormCreatorUI extends Plugin {
  static get pluginName() {
    return 'FormCreatorUI';
  }

  init() {
    const editor = this.editor;

    editor.commands.add('insertFormCreator', new InsertFormCreatorCommand(editor));
    editor.commands.add('updateFormCreator', new UpdateFormCreatorCommand(editor));

    editor.ui.componentFactory.add('insertFormCreator', locale => {
      const button = new ButtonView(locale);
      const i18n = editor.config.get('ckeditorI18n') || {};

      button.set({
        label: i18n.formCreatorLabel || '表单',
        icon: formCreatorIcon,
        tooltip: true
      });

      button.bind('isEnabled').to(editor.commands.get('insertFormCreator'), 'isEnabled');

      button.on('execute', () => {
        const selected = getSelectedFormCreator(editor.model.document.selection);

        openFormCreatorDialogForEditor(editor, selected?.getAttribute('schema') || '');
      });

      return button;
    });
  }
}

class FormCreatorPlugin extends Plugin {
  static get pluginName() {
    return 'FormCreator';
  }

  static get requires() {
    return [FormCreatorEditing, FormCreatorUI];
  }
}

export default FormCreatorPlugin;

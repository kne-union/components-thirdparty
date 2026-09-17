import { Plugin, Command, Widget, toWidget, createDropdown, addListToDropdown, Collection, ViewModel } from 'ckeditor5';
import {
  KIND_ESCAPE,
  KIND_INTERPOLATE,
  TEMPLATE_VARIABLE_CLASS,
  TEMPLATE_VARIABLE_KIND_ATTR,
  TEMPLATE_VARIABLE_LABEL_ATTR,
  TEMPLATE_VARIABLE_MODEL,
  TEMPLATE_VARIABLE_NAME_ATTR
} from './constants';
import templateVariableIcon from './icon';
import {
  findTemplateMatches,
  resolveTemplateVariableSettings,
  resolveVariableLabel,
  unwrapTemplateVariableSpans,
  wrapVariable
} from './templateSyntax';

const getSettings = editor => resolveTemplateVariableSettings(editor.config.get('templateVariable') || {});

const normalizeKind = kind => (kind === KIND_ESCAPE ? KIND_ESCAPE : KIND_INTERPOLATE);

const createEditingView = (modelElement, { writer }, i18n) => {
  const name = modelElement.getAttribute('name') || '';
  const label = modelElement.getAttribute('label') || name;
  const kind = normalizeKind(modelElement.getAttribute('kind'));
  const className = `${TEMPLATE_VARIABLE_CLASS} ${TEMPLATE_VARIABLE_CLASS}--${kind}`;

  const labelView = writer.createUIElement('span', { class: `${TEMPLATE_VARIABLE_CLASS}__label` }, function (domDocument) {
    const domElement = this.toDomElement(domDocument);
    domElement.textContent = label;
    return domElement;
  });

  const span = writer.createContainerElement(
    'span',
    {
      class: className,
      [TEMPLATE_VARIABLE_NAME_ATTR]: name,
      [TEMPLATE_VARIABLE_KIND_ATTR]: kind,
      [TEMPLATE_VARIABLE_LABEL_ATTR]: label
    },
    [labelView]
  );

  return toWidget(span, writer, {
    label: i18n.templateVariableWidgetLabel || '模版变量'
  });
};

const createDataView = (modelElement, { writer }, settings) => {
  const name = modelElement.getAttribute('name') || '';
  const label = modelElement.getAttribute('label') || name;
  const kind = normalizeKind(modelElement.getAttribute('kind'));
  const text = wrapVariable(name, kind, settings);

  const span = writer.createContainerElement('span', {
    class: `${TEMPLATE_VARIABLE_CLASS} ${TEMPLATE_VARIABLE_CLASS}--${kind}`,
    [TEMPLATE_VARIABLE_NAME_ATTR]: name,
    [TEMPLATE_VARIABLE_KIND_ATTR]: kind,
    [TEMPLATE_VARIABLE_LABEL_ATTR]: label
  });

  writer.insert(writer.createPositionAt(span, 0), writer.createText(text));
  return span;
};

const isTemplateVariableSpan = viewElement => viewElement.is('element', 'span') && viewElement.hasClass(TEMPLATE_VARIABLE_CLASS);

class InsertTemplateVariableCommand extends Command {
  execute({ name, label, kind } = {}) {
    if (!name) {
      return;
    }

    const editor = this.editor;
    const settings = getSettings(editor);
    const normalizedKind = normalizeKind(kind);
    const resolvedLabel = label || resolveVariableLabel(name, normalizedKind, settings.variables);

    editor.model.change(writer => {
      const element = writer.createElement(TEMPLATE_VARIABLE_MODEL, {
        name: String(name).trim(),
        label: resolvedLabel,
        kind: normalizedKind
      });
      editor.model.insertObject(element, null, null, { setSelection: 'after' });
    });
  }

  refresh() {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    const settings = getSettings(editor);
    const hasVariables = settings.variables.some(item => item?.name);
    this.isEnabled = hasVariables && model.schema.checkChild(selection.focus.parent, TEMPLATE_VARIABLE_MODEL) && !editor.isReadOnly;
  }
}

class TemplateVariableEditing extends Plugin {
  static get pluginName() {
    return 'TemplateVariableEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;

    editor.model.schema.register(TEMPLATE_VARIABLE_MODEL, {
      inheritAllFrom: '$inlineObject',
      allowAttributes: ['name', 'label', 'kind']
    });

    this._defineConverters();
    this._patchGetData();
    this._registerInlineObjectMatchers();
  }

  _registerInlineObjectMatchers() {
    const editor = this.editor;
    const matcher = element => {
      if (element?.classList?.contains(TEMPLATE_VARIABLE_CLASS)) {
        return { name: true };
      }
      return null;
    };

    editor.data.htmlProcessor.domConverter.registerInlineObjectMatcher(matcher);
    editor.editing.view.domConverter.registerInlineObjectMatcher(matcher);
  }

  _patchGetData() {
    const data = this.editor.data;
    const originalGet = data.get.bind(data);

    data.get = options => unwrapTemplateVariableSpans(originalGet(options));
  }

  _defineConverters() {
    const editor = this.editor;

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_VARIABLE_MODEL,
      view: (modelElement, conversionApi) => {
        const i18n = editor.config.get('ckeditorI18n') || {};
        return createEditingView(modelElement, conversionApi, i18n);
      }
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_VARIABLE_MODEL,
      view: (modelElement, conversionApi) => createDataView(modelElement, conversionApi, getSettings(editor))
    });

    editor.conversion.for('upcast').elementToElement({
      view: viewElement => {
        if (!isTemplateVariableSpan(viewElement)) {
          return null;
        }
        return { name: true };
      },
      model: (viewElement, { writer }) => {
        const settings = getSettings(editor);
        const name =
          viewElement.getAttribute(TEMPLATE_VARIABLE_NAME_ATTR) ||
          String(viewElement.getChild(0)?.data || '')
            .replace(/^<%[-=]?\s*|\s*%>$/g, '')
            .trim();
        const kind = normalizeKind(viewElement.getAttribute(TEMPLATE_VARIABLE_KIND_ATTR));
        const label = viewElement.getAttribute(TEMPLATE_VARIABLE_LABEL_ATTR) || resolveVariableLabel(name, kind, settings.variables);

        return writer.createElement(TEMPLATE_VARIABLE_MODEL, { name, label, kind });
      }
    });

    editor.conversion.for('upcast').add(dispatcher => {
      dispatcher.on(
        'text',
        (evt, data, conversionApi) => {
          const { consumable, writer, schema } = conversionApi;
          const viewItem = data.viewItem;

          if (!consumable.test(viewItem)) {
            return;
          }

          const text = viewItem.data;
          const settings = getSettings(editor);
          const matches = findTemplateMatches(text, settings);

          if (!matches.length) {
            return;
          }

          if (!consumable.consume(viewItem)) {
            return;
          }

          let modelCursor = data.modelCursor;
          let modelRangeStart = null;
          let lastRange = null;
          let offset = 0;

          const insertText = value => {
            if (!value) {
              return;
            }
            if (!schema.checkChild(modelCursor, '$text')) {
              return;
            }
            const node = writer.createText(value);
            writer.insert(node, modelCursor);
            const range = writer.createRange(modelCursor, modelCursor.getShiftedBy(node.offsetSize));
            modelCursor = range.end;
            if (!modelRangeStart) {
              modelRangeStart = range.start;
            }
            lastRange = range;
          };

          const insertVariable = match => {
            if (!schema.checkChild(modelCursor.parent, TEMPLATE_VARIABLE_MODEL)) {
              insertText(match.raw);
              return;
            }
            const label = resolveVariableLabel(match.name, match.kind, settings.variables);
            const element = writer.createElement(TEMPLATE_VARIABLE_MODEL, {
              name: match.name,
              label,
              kind: match.kind
            });
            writer.insert(element, modelCursor);
            const range = writer.createRangeOn(element);
            modelCursor = range.end;
            if (!modelRangeStart) {
              modelRangeStart = range.start;
            }
            lastRange = range;
          };

          for (const match of matches) {
            insertText(text.slice(offset, match.start));
            insertVariable(match);
            offset = match.end;
          }
          insertText(text.slice(offset));

          if (modelRangeStart && lastRange) {
            data.modelRange = writer.createRange(modelRangeStart, lastRange.end);
            data.modelCursor = lastRange.end;
          }

          evt.stop();
        },
        { priority: 'high' }
      );
    });
  }
}

class TemplateVariableUI extends Plugin {
  static get pluginName() {
    return 'TemplateVariableUI';
  }

  init() {
    const editor = this.editor;

    editor.commands.add('insertTemplateVariable', new InsertTemplateVariableCommand(editor));

    editor.ui.componentFactory.add('insertTemplateVariable', locale => {
      const i18n = editor.config.get('ckeditorI18n') || {};
      const dropdown = createDropdown(locale);
      const command = editor.commands.get('insertTemplateVariable');

      dropdown.buttonView.set({
        label: i18n.templateVariableLabel || '模版变量',
        icon: templateVariableIcon,
        tooltip: true
      });

      dropdown.bind('isEnabled').to(command, 'isEnabled');

      const items = new Collection();
      const settings = getSettings(editor);

      settings.variables.forEach((item, index) => {
        if (!item?.name) {
          return;
        }
        const kind = normalizeKind(item.kind);
        const label = item.label || item.name;
        const kindSuffix = kind === KIND_ESCAPE ? i18n.templateVariableKindEscape || '转义' : i18n.templateVariableKindInterpolate || '插值';

        items.add({
          type: 'button',
          model: new ViewModel({
            withText: true,
            label: `${label} (${kindSuffix})`,
            name: item.name,
            kind,
            variableLabel: label,
            _index: index
          })
        });
      });

      if (!items.length) {
        items.add({
          type: 'button',
          model: new ViewModel({
            withText: true,
            label: i18n.templateVariableEmpty || '未配置变量列表',
            isEnabled: false
          })
        });
      }

      addListToDropdown(dropdown, items);

      this.listenTo(dropdown, 'execute', evt => {
        const { name, kind, variableLabel, isEnabled } = evt.source;
        if (isEnabled === false || !name) {
          return;
        }
        editor.execute('insertTemplateVariable', {
          name,
          label: variableLabel,
          kind
        });
        editor.editing.view.focus();
      });

      return dropdown;
    });
  }
}

class TemplateVariablePlugin extends Plugin {
  static get pluginName() {
    return 'TemplateVariable';
  }

  static get requires() {
    return [TemplateVariableEditing, TemplateVariableUI];
  }
}

export default TemplateVariablePlugin;
export {
  InsertTemplateVariableCommand,
  TemplateVariableEditing,
  TemplateVariableUI,
  resolveTemplateVariableSettings,
  wrapVariable,
  unwrapTemplateVariableSpans
};

import { Plugin, ButtonView, Command, Widget, toWidget } from 'ckeditor5';
import { insertCornerEditButton } from '../shared/insertCornerEditButton';
import { openMarkdownComponentDialog } from './openMarkdownComponentDialog';
import { mountMarkdownComponent } from './mountMarkdownComponent';
import markdownComponentIcon from './icon';
import {
  MD_COMPONENT_BLOCK_CLASS,
  MD_COMPONENT_BLOCK_MODEL,
  MD_COMPONENT_FENCE_LANGUAGE,
  MD_COMPONENT_INLINE_CLASS,
  MD_COMPONENT_INLINE_EDIT_CLASS,
  MD_COMPONENT_INLINE_MODEL,
  MD_COMPONENT_VIEWER_CLASS,
  inlineSourceToYml,
  isBlockSource,
  isInlineSource,
  toBlockMarkdown
} from './constants';

const MODELS = [MD_COMPONENT_BLOCK_MODEL, MD_COMPONENT_INLINE_MODEL];

const readViewText = viewElement => {
  let text = '';
  for (const child of viewElement.getChildren()) {
    if (child.is('$text')) {
      text += child.data;
    } else if (child.is('element', 'br')) {
      text += '\n';
    } else if (child.is('element')) {
      text += readViewText(child);
    }
  }
  return text;
};

const getSelectedMarkdownComponent = selection => {
  const element = selection.getSelectedElement();
  return element && MODELS.includes(element.name) ? element : null;
};

/** CKEditor.Field 通过 config.markdownComponents.getOptions 传入（函数避免 lodash.merge 深拷贝组件） */
const getRenderOptions = editor => ({
  ...(editor.config.get('markdownComponents')?.getOptions?.() || {}),
  themeToken: editor.config.get('hostThemeToken'),
  locale: editor.config.get('hostLocale')
});

const openDialogForEditor = (editor, modelElement) => {
  const i18n = editor.config.get('ckeditorI18n') || {};
  const inline = modelElement?.name === MD_COMPONENT_INLINE_MODEL;
  const { components, variables, themeToken, locale } = getRenderOptions(editor);

  openMarkdownComponentDialog({
    title: modelElement ? i18n.markdownComponentEditTitle || '编辑组件' : i18n.markdownComponentInsertTitle || '插入组件',
    inline,
    isInsert: !modelElement,
    defaultValue: modelElement ? (inline ? inlineSourceToYml(modelElement.getAttribute('source')) : modelElement.getAttribute('source') || '') : '',
    components,
    variables,
    themeToken,
    locale,
    onSubmit: ({ inline: submitInline, source }) => {
      if (modelElement) {
        editor.model.change(writer => writer.setSelection(modelElement, 'on'));
        editor.execute('updateMarkdownComponent', { source });
      } else {
        editor.execute('insertMarkdownComponent', { source, inline: submitInline });
      }
      editor.editing.view.focus();
    }
  });
};

const createRendererHost = (editor, writer, tagName, content) =>
  writer.createRawElement(tagName, { class: MD_COMPONENT_VIEWER_CLASS }, domElement => {
    return mountMarkdownComponent(domElement, { ...content, ...getRenderOptions(editor) });
  });

const EDIT_ICON =
  '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path></svg>';

/** 行内组件后的编辑图标（仅编辑态，不进入 getData） */
const createInlineEditButton = (writer, { label, onEdit }) =>
  writer.createRawElement('span', { class: MD_COMPONENT_INLINE_EDIT_CLASS, title: label, role: 'button' }, domElement => {
    domElement.innerHTML = EDIT_ICON;
    const stop = event => {
      event.preventDefault();
      event.stopPropagation();
    };
    domElement.addEventListener('mousedown', stop);
    domElement.addEventListener('mouseup', stop);
    domElement.addEventListener('click', event => {
      stop(event);
      onEdit();
    });
  });

class InsertMarkdownComponentCommand extends Command {
  refresh() {
    this.isEnabled = !this.editor.isReadOnly;
  }

  execute({ source, inline = false }) {
    const model = this.editor.model;

    if (inline) {
      if (!isInlineSource(source)) {
        return;
      }
      model.change(writer => {
        const element = writer.createElement(MD_COMPONENT_INLINE_MODEL, { source });
        model.insertContent(element);
        writer.setSelection(element, 'after');
      });
      return;
    }

    if (!isBlockSource(source)) {
      return;
    }
    model.change(writer => {
      model.insertObject(writer.createElement(MD_COMPONENT_BLOCK_MODEL, { source }), null, null, { setSelection: 'on' });
    });
  }
}

class UpdateMarkdownComponentCommand extends Command {
  refresh() {
    this.isEnabled = !!getSelectedMarkdownComponent(this.editor.model.document.selection) && !this.editor.isReadOnly;
  }

  execute({ source }) {
    const element = getSelectedMarkdownComponent(this.editor.model.document.selection);
    if (!element || source === undefined) {
      return;
    }
    this.editor.model.change(writer => {
      writer.setAttribute('source', source, element);
    });
  }
}

class MarkdownComponentsEditing extends Plugin {
  static get pluginName() {
    return 'MarkdownComponentsEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;
    const schema = editor.model.schema;

    schema.register(MD_COMPONENT_BLOCK_MODEL, { inheritAllFrom: '$blockObject', allowAttributes: ['source'] });
    schema.register(MD_COMPONENT_INLINE_MODEL, { inheritAllFrom: '$inlineObject', allowAttributes: ['source'] });

    editor.commands.add('insertMarkdownComponent', new InsertMarkdownComponentCommand(editor));
    editor.commands.add('updateMarkdownComponent', new UpdateMarkdownComponentCommand(editor));

    this._defineUpcast();
    this._defineDowncast();
  }

  _defineUpcast() {
    const editor = this.editor;

    editor.conversion.for('upcast').add(dispatcher => {
      // ```yml 围栏且内容以 md-components: 开头，优先于 CodeBlock 转换
      dispatcher.on(
        'element:pre',
        (evt, data, conversionApi) => {
          const code = data.viewItem.getChild(0);
          if (!code?.is('element', 'code') || !code.hasClass(`language-${MD_COMPONENT_FENCE_LANGUAGE}`)) {
            return;
          }
          const source = readViewText(code).replace(/\n+$/, '');
          if (!isBlockSource(source) || !conversionApi.consumable.test(data.viewItem, { name: true })) {
            return;
          }
          const modelElement = conversionApi.writer.createElement(MD_COMPONENT_BLOCK_MODEL, { source });
          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }
          conversionApi.consumable.consume(data.viewItem, { name: true });
          conversionApi.consumable.consume(code, { name: true });
          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );

      // 行内 `md-components:Type{...}`
      dispatcher.on(
        'element:code',
        (evt, data, conversionApi) => {
          if (data.viewItem.parent?.is('element', 'pre')) {
            return;
          }
          const source = readViewText(data.viewItem).trim();
          if (!isInlineSource(source) || !conversionApi.consumable.test(data.viewItem, { name: true })) {
            return;
          }
          const modelElement = conversionApi.writer.createElement(MD_COMPONENT_INLINE_MODEL, { source });
          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }
          conversionApi.consumable.consume(data.viewItem, { name: true });
          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );
    });
  }

  _defineDowncast() {
    const editor = this.editor;
    const conversion = editor.conversion;
    const i18n = editor.config.get('ckeditorI18n') || {};
    const label = i18n.markdownComponentLabel || '组件';

    conversion.for('dataDowncast').elementToElement({
      model: MD_COMPONENT_BLOCK_MODEL,
      view: (modelElement, { writer }) => {
        const code = writer.createContainerElement('code', { class: `language-${MD_COMPONENT_FENCE_LANGUAGE}` }, [
          writer.createText(modelElement.getAttribute('source') || '')
        ]);
        return writer.createContainerElement('pre', null, [code]);
      }
    });

    conversion.for('dataDowncast').elementToElement({
      model: MD_COMPONENT_INLINE_MODEL,
      view: (modelElement, { writer }) => writer.createContainerElement('code', null, [writer.createText(modelElement.getAttribute('source') || '')])
    });

    conversion.for('editingDowncast').elementToElement({
      model: { name: MD_COMPONENT_BLOCK_MODEL, attributes: ['source'] },
      view: (modelElement, { writer }) => {
        const container = writer.createContainerElement('div', { class: MD_COMPONENT_BLOCK_CLASS });
        writer.insert(
          writer.createPositionAt(container, 0),
          createRendererHost(editor, writer, 'div', { markdown: toBlockMarkdown(modelElement.getAttribute('source')) })
        );
        insertCornerEditButton(writer, container, {
          label: i18n.markdownComponentEditAction || '编辑',
          onEdit: () => openDialogForEditor(editor, modelElement)
        });
        return toWidget(container, writer, { label });
      }
    });

    conversion.for('editingDowncast').elementToElement({
      model: { name: MD_COMPONENT_INLINE_MODEL, attributes: ['source'] },
      view: (modelElement, { writer }) => {
        const container = writer.createContainerElement('span', { class: MD_COMPONENT_INLINE_CLASS });
        writer.insert(
          writer.createPositionAt(container, 0),
          createRendererHost(editor, writer, 'span', { inlineSource: modelElement.getAttribute('source') || '' })
        );
        writer.insert(
          writer.createPositionAt(container, 'end'),
          createInlineEditButton(writer, {
            label: i18n.markdownComponentEditAction || '编辑',
            onEdit: () => openDialogForEditor(editor, modelElement)
          })
        );
        return toWidget(container, writer, { label });
      }
    });
  }
}

class MarkdownComponentsUI extends Plugin {
  static get pluginName() {
    return 'MarkdownComponentsUI';
  }

  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add('insertMarkdownComponent', locale => {
      const button = new ButtonView(locale);
      const i18n = editor.config.get('ckeditorI18n') || {};

      button.set({
        label: i18n.markdownComponentLabel || '组件',
        icon: markdownComponentIcon,
        tooltip: true
      });
      button.bind('isEnabled').to(editor.commands.get('insertMarkdownComponent'), 'isEnabled');

      button.on('execute', () => {
        openDialogForEditor(editor, getSelectedMarkdownComponent(editor.model.document.selection));
      });

      return button;
    });
  }
}

/** Markdown 模式：```yml md-components 围栏与行内 `md-components:Type{...}` 在编辑器内实时渲染为组件 */
export default class MarkdownComponentsPlugin extends Plugin {
  static get pluginName() {
    return 'MarkdownComponents';
  }

  static get requires() {
    return [MarkdownComponentsEditing, MarkdownComponentsUI];
  }
}

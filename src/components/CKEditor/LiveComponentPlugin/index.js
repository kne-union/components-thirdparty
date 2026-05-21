import { Plugin, ButtonView, Command, Widget, toWidget } from 'ckeditor5';
import {
  LIVE_COMPONENT_BOX_CLASS,
  LIVE_COMPONENT_CLASS,
  LIVE_COMPONENT_DATA_ATTR,
  LIVE_COMPONENT_DEFAULT_HEIGHT,
  LIVE_COMPONENT_MODEL,
  LIVE_COMPONENT_VIEWER_CLASS
} from './constants';
import liveComponentIcon from './icon';
import { openLiveComponentDialog } from './openLiveComponentDialog';
import { mountLiveComponentInHost, remountLiveComponentInHost } from './mountLiveComponentView';
import { getSelectedLiveComponent, isLiveComponentSection, readLiveComponentContentFromView } from './utils';

const buildSectionClasses = () => [LIVE_COMPONENT_BOX_CLASS, LIVE_COMPONENT_CLASS].join(' ');

const getLiveComponentMountOptions = (editor, content) => {
  const cfg = editor.config.get('liveComponent') || {};

  return {
    content,
    height: cfg.height ?? LIVE_COMPONENT_DEFAULT_HEIGHT,
    libs: cfg.libs,
    props: cfg.props
  };
};

const createLiveComponentSectionView = (editor, modelElement, { writer, asWidget }) => {
  const content = modelElement.getAttribute('content') || '';
  const section = writer.createContainerElement('section', {
    class: buildSectionClasses(),
    [LIVE_COMPONENT_DATA_ATTR]: content
  });

  if (!asWidget) {
    return section;
  }

  const mountOptions = getLiveComponentMountOptions(editor, content);

  const viewerHost = writer.createRawElement('div', { class: LIVE_COMPONENT_VIEWER_CLASS }, domElement => {
    mountLiveComponentInHost(domElement, mountOptions);
  });

  writer.insert(writer.createPositionAt(section, 0), viewerHost);

  const i18n = editor.config.get('ckeditorI18n') || {};

  return toWidget(section, writer, { label: i18n.liveComponentLabel || '交互组件' });
};

class InsertLiveComponentCommand extends Command {
  execute({ content }) {
    if (!content) {
      return;
    }

    const editor = this.editor;

    editor.model.change(writer => {
      const liveComponent = writer.createElement(LIVE_COMPONENT_MODEL, { content });
      editor.model.insertObject(liveComponent, null, null, { setSelection: 'on' });
    });
  }

  refresh() {
    this.isEnabled = !this.editor.isReadOnly;
  }
}

class UpdateLiveComponentCommand extends Command {
  refresh() {
    const element = getSelectedLiveComponent(this.editor.model.document.selection);
    this.isEnabled = !!element && !this.editor.isReadOnly;
  }

  execute({ content }) {
    const editor = this.editor;
    const element = getSelectedLiveComponent(editor.model.document.selection);

    if (!element || content === undefined) {
      return;
    }

    editor.model.change(writer => {
      writer.setAttribute('content', content, element);
    });

    const viewSection = editor.editing.mapper.toViewElement(element);

    if (!viewSection) {
      return;
    }

    for (const child of viewSection.getChildren()) {
      if (!child.is('element', 'div')) {
        continue;
      }

      const domHost = editor.editing.view.domConverter.mapViewToDom(child);

      if (domHost) {
        remountLiveComponentInHost(domHost, getLiveComponentMountOptions(editor, content));
      }

      break;
    }
  }
}

class LiveComponentEditing extends Plugin {
  static get pluginName() {
    return 'LiveComponentEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;

    editor.model.schema.register(LIVE_COMPONENT_MODEL, {
      inheritAllFrom: '$blockObject',
      allowAttributes: ['content']
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

          if (!isLiveComponentSection(viewSection)) {
            return;
          }

          const attrs = readLiveComponentContentFromView(viewSection);

          if (!attrs) {
            return;
          }

          if (!conversionApi.consumable.consume(viewSection, { name: true })) {
            return;
          }

          if (viewSection.hasClass(LIVE_COMPONENT_CLASS)) {
            conversionApi.consumable.consume(viewSection, { classes: LIVE_COMPONENT_CLASS });
          }

          if (viewSection.hasClass(LIVE_COMPONENT_BOX_CLASS)) {
            conversionApi.consumable.consume(viewSection, { classes: LIVE_COMPONENT_BOX_CLASS });
          }

          conversionApi.consumable.consume(viewSection, { attributes: LIVE_COMPONENT_DATA_ATTR });

          const modelElement = conversionApi.writer.createElement(LIVE_COMPONENT_MODEL, attrs);

          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }

          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: LIVE_COMPONENT_MODEL,
      view: (modelElement, { writer }) => createLiveComponentSectionView(editor, modelElement, { writer, asWidget: false })
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: LIVE_COMPONENT_MODEL,
      view: (modelElement, conversionApi) =>
        createLiveComponentSectionView(editor, modelElement, { writer: conversionApi.writer, asWidget: true })
    });

    editor.conversion.for('editingDowncast').add(dispatcher => {
      dispatcher.on(`attribute:content:${LIVE_COMPONENT_MODEL}`, (evt, data, conversionApi) => {
        const viewSection = conversionApi.mapper.toViewElement(data.item);

        if (!viewSection) {
          return;
        }

        conversionApi.writer.setAttribute(LIVE_COMPONENT_DATA_ATTR, data.attributeNewValue || '', viewSection);

        const domSection = editor.editing.view.domConverter.mapViewToDom(viewSection);
        const host = domSection?.querySelector?.(`.${LIVE_COMPONENT_VIEWER_CLASS}`);

        if (host) {
          remountLiveComponentInHost(host, getLiveComponentMountOptions(editor, data.attributeNewValue || ''));
        }
      });
    });
  }

  _setupDoubleClickEdit() {
    const editor = this.editor;

    this.listenTo(editor.editing.view.document, 'dblclick', (evt, data) => {
      const section = data.domTarget?.closest?.(`section.${LIVE_COMPONENT_CLASS}`);

      if (!section) {
        return;
      }

      const viewSection = editor.editing.view.domConverter.domToView(section);
      const modelElement = viewSection && editor.editing.mapper.toModelElement(viewSection);

      if (!modelElement?.is('element', LIVE_COMPONENT_MODEL)) {
        return;
      }

      editor.model.change(writer => {
        writer.setSelection(modelElement, 'on');
      });

      openLiveComponentDialogForEditor(editor, modelElement.getAttribute('content') || '');
    });
  }
}

const openLiveComponentDialogForEditor = (editor, initialValue) => {
  const cfg = editor.config.get('liveComponent') || {};

  const i18n = editor.config.get('ckeditorI18n') || {};

  openLiveComponentDialog({
    title: initialValue
      ? i18n.liveComponentEditTitle || '编辑交互组件'
      : i18n.liveComponentInsertTitle || '插入交互组件',
    defaultValue: initialValue,
    editorHeight: cfg.editor?.height,
    editorLibs: cfg.editor?.libs,
    onSubmit: content => {
      if (!content) {
        return;
      }

      const selected = getSelectedLiveComponent(editor.model.document.selection);

      if (selected) {
        editor.execute('updateLiveComponent', { content });
        return;
      }

      editor.execute('insertLiveComponent', { content });
    }
  });
};

class LiveComponentUI extends Plugin {
  static get pluginName() {
    return 'LiveComponentUI';
  }

  init() {
    const editor = this.editor;

    editor.commands.add('insertLiveComponent', new InsertLiveComponentCommand(editor));
    editor.commands.add('updateLiveComponent', new UpdateLiveComponentCommand(editor));

    editor.ui.componentFactory.add('insertLiveComponent', locale => {
      const button = new ButtonView(locale);
      const selection = editor.model.document.selection;
      const i18n = editor.config.get('ckeditorI18n') || {};

      button.set({
        label: i18n.liveComponentLabel || '交互组件',
        icon: liveComponentIcon,
        tooltip: true
      });

      button.bind('isEnabled').to(editor.commands.get('insertLiveComponent'), 'isEnabled');

      button.on('execute', () => {
        const selected = getSelectedLiveComponent(selection);

        openLiveComponentDialogForEditor(editor, selected?.getAttribute('content') || '');
      });

      return button;
    });
  }
}

class LiveComponentPlugin extends Plugin {
  static get pluginName() {
    return 'LiveComponent';
  }

  static get requires() {
    return [LiveComponentEditing, LiveComponentUI];
  }
}

export default LiveComponentPlugin;

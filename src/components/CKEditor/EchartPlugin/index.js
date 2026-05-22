import { Plugin, ButtonView, Command, Widget, toWidget } from 'ckeditor5';
import echartIcon from './icon';
import { openEchartDialog } from './openEchartDialog';
import { mountEchartInHost, remountEchartInHost, unmountEchartInHost } from './mountEchartInHost';
import {
  ECHART_DATA_ATTR,
  ECHART_DEFAULT_HEIGHT,
  ECHART_FIGURE_CLASS,
  ECHART_INNER_CLASS,
  ECHART_MODEL,
  ECHART_VIEWER_CLASS,
  ECHART_STYLE_ATTR,
  DEFAULT_ECHART_OPTION_TEXT
} from './constants';
import { encodeOptionForHtmlAttribute, stringifyEchartOption } from './optionCodec';
import { EchartStyleEditing, EchartStyleUI } from './style';
import { EchartResizeEditing, EchartResizeUI } from './resize';
import { EchartToolbar } from './toolbar';
import {
  applyEchartHeightToDom,
  consumeEchartStyleClasses,
  findCkEchartInner,
  getEchartMountOptions,
  getFigureClasses,
  getSelectedEchart,
  readEchartAttributes,
  resolveEchartHeight,
  writeOptionToInnerElement
} from './utils';

const createEchartFigureView = (modelElement, writer, { editor, renderChart, asWidget } = {}) => {
  const figure = writer.createContainerElement('figure', {
    class: getFigureClasses(modelElement).join(' ')
  });
  const resizedWidth = modelElement.getAttribute('resizedWidth');
  const viewerHeight = resolveEchartHeight(modelElement);

  if (resizedWidth) {
    writer.setStyle('width', resizedWidth, figure);
  }

  writer.setStyle('height', viewerHeight, figure);

  const optionText = modelElement.getAttribute('option') || DEFAULT_ECHART_OPTION_TEXT;
  const inner = writer.createContainerElement('div', {
    class: ECHART_INNER_CLASS,
    [ECHART_DATA_ATTR]: encodeOptionForHtmlAttribute(optionText)
  });

  writer.setStyle('height', viewerHeight, inner);

  if (renderChart) {
    const viewerHost = writer.createRawElement('div', { class: ECHART_VIEWER_CLASS }, domElement => {
      mountEchartInHost(domElement, getEchartMountOptions(editor, modelElement));

      return () => unmountEchartInHost(domElement);
    });

    writer.insert(writer.createPositionAt(inner, 0), viewerHost);
  }

  writer.insert(writer.createPositionAt(figure, 0), inner);

  if (asWidget) {
    const i18n = editor.config.get('ckeditorI18n') || {};

    return toWidget(figure, writer, { label: i18n.echartWidgetLabel || '图表' });
  }

  return figure;
};

class InsertEchartCommand extends Command {
  execute({ option }) {
    const optionText = typeof option === 'string' ? option : stringifyEchartOption(option);

    this.editor.model.change(writer => {
      const echart = writer.createElement(ECHART_MODEL, { option: optionText });
      this.editor.model.insertObject(echart, null, null, { setSelection: 'on' });
    });
  }

  refresh() {
    this.isEnabled = !this.editor.isReadOnly;
  }
}

class UpdateEchartCommand extends Command {
  refresh() {
    const element = getSelectedEchart(this.editor.model.document.selection);
    this.isEnabled = !!element && !this.editor.isReadOnly;
  }

  execute({ option }) {
    const editor = this.editor;
    const element = getSelectedEchart(editor.model.document.selection);

    if (!element || option === undefined) {
      return;
    }

    const optionText = typeof option === 'string' ? option : stringifyEchartOption(option);

    editor.model.change(writer => {
      writer.setAttribute('option', optionText, element);
    });

    const viewFigure = editor.editing.mapper.toViewElement(element);
    const viewInner = viewFigure && findCkEchartInner(viewFigure);

    if (!viewInner) {
      return;
    }

    editor.editing.view.change(writer => {
      writeOptionToInnerElement(writer, viewInner, optionText);
    });

    const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);
    const domHost = domFigure?.querySelector?.(`.${ECHART_VIEWER_CLASS}`);

    if (domHost) {
      remountEchartInHost(domHost, getEchartMountOptions(editor, element));
    }
  }
}

class EchartEditing extends Plugin {
  static get pluginName() {
    return 'EchartEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;

    editor.model.schema.register(ECHART_MODEL, {
      inheritAllFrom: '$blockObject',
      allowAttributes: ['option', ECHART_STYLE_ATTR, 'resizedWidth', 'resizedHeight']
    });
    editor.model.schema.setAttributeProperties(ECHART_STYLE_ATTR, { isFormatting: true });
    editor.model.schema.setAttributeProperties('resizedWidth', { isFormatting: true });
    editor.model.schema.setAttributeProperties('resizedHeight', { isFormatting: true });

    this._defineConverters();
    this._listenHeightChanges();
    this._setupDoubleClickEdit();
  }

  _listenHeightChanges() {
    const editor = this.editor;

    this.listenTo(editor.model.document, 'change', () => {
      const differ = editor.model.document.differ;

      for (const change of differ.getChanges()) {
        if (change.type !== 'attribute' || change.attributeKey !== 'resizedHeight') {
          continue;
        }

        for (const item of change.range.getItems()) {
          if (item.is('element', ECHART_MODEL)) {
            applyEchartHeightToDom(editor, item, item.getAttribute('resizedHeight') || ECHART_DEFAULT_HEIGHT);
          }
        }
      }
    });
  }

  _setupDoubleClickEdit() {
    const editor = this.editor;

    this.listenTo(editor.editing.view.document, 'dblclick', (evt, data) => {
      const figure = data.domTarget?.closest?.(`figure.${ECHART_FIGURE_CLASS}`);

      if (!figure) {
        return;
      }

      const viewFigure = editor.editing.view.domConverter.domToView(figure);
      const modelElement = viewFigure && editor.editing.mapper.toModelElement(viewFigure);

      if (!modelElement?.is('element', ECHART_MODEL)) {
        return;
      }

      editor.model.change(writer => {
        writer.setSelection(modelElement, 'on');
      });

      openEchartDialogForEditor(editor, modelElement.getAttribute('option') || DEFAULT_ECHART_OPTION_TEXT);
    });
  }

  _defineConverters() {
    const editor = this.editor;

    editor.conversion.for('upcast').add(dispatcher => {
      dispatcher.on(
        'element:figure',
        (evt, data, conversionApi) => {
          const viewFigure = data.viewItem;
          const viewInner = findCkEchartInner(viewFigure);

          if (!viewInner) {
            return;
          }

          const attrs = readEchartAttributes(viewInner, viewFigure);

          if (!attrs) {
            return;
          }

          if (!conversionApi.consumable.consume(viewFigure, { name: true })) {
            return;
          }

          consumeEchartStyleClasses(viewFigure, conversionApi);
          conversionApi.consumable.consume(viewInner, { name: true, classes: ECHART_INNER_CLASS });
          conversionApi.consumable.consume(viewInner, { attributes: ECHART_DATA_ATTR });

          const modelElement = conversionApi.writer.createElement(ECHART_MODEL, attrs);

          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }

          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );

      dispatcher.on(
        'element:div',
        (evt, data, conversionApi) => {
          const viewElement = data.viewItem;

          if (!viewElement.hasClass(ECHART_INNER_CLASS)) {
            return;
          }

          const attrs = readEchartAttributes(viewElement);

          if (!attrs) {
            return;
          }

          if (!conversionApi.consumable.consume(viewElement, { name: true, classes: ECHART_INNER_CLASS })) {
            return;
          }

          conversionApi.consumable.consume(viewElement, { attributes: ECHART_DATA_ATTR });

          const modelElement = conversionApi.writer.createElement(ECHART_MODEL, attrs);

          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            return;
          }

          conversionApi.updateConversionResult(modelElement, data);
        },
        { priority: 'high' }
      );
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: ECHART_MODEL,
      view: (modelElement, { writer }) =>
        createEchartFigureView(modelElement, writer, { editor, renderChart: false, asWidget: false })
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: ECHART_MODEL,
      view: (modelElement, conversionApi) =>
        createEchartFigureView(modelElement, conversionApi.writer, {
          editor,
          renderChart: true,
          asWidget: true
        })
    });

    editor.conversion.for('editingDowncast').add(dispatcher => {
      dispatcher.on(`attribute:option:${ECHART_MODEL}`, (evt, data, conversionApi) => {
        const viewFigure = conversionApi.mapper.toViewElement(data.item);
        const viewInner = viewFigure && findCkEchartInner(viewFigure);

        if (!viewInner) {
          return;
        }

        writeOptionToInnerElement(conversionApi.writer, viewInner, data.attributeNewValue || DEFAULT_ECHART_OPTION_TEXT);

        const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);
        const domHost = domFigure?.querySelector?.(`.${ECHART_VIEWER_CLASS}`);

        if (domHost) {
          remountEchartInHost(domHost, getEchartMountOptions(editor, data.item));
        }
      });
    });
  }
}

const openEchartDialogForEditor = (editor, initialValue) => {
  const i18n = editor.config.get('ckeditorI18n') || {};
  const selected = getSelectedEchart(editor.model.document.selection);

  openEchartDialog({
    title: selected
      ? i18n.echartEditTitle || '编辑图表'
      : i18n.echartInsertTitle || '插入图表',
    defaultValue: initialValue || DEFAULT_ECHART_OPTION_TEXT,
    onSubmit: optionText => {
      if (!optionText) {
        return;
      }

      if (selected) {
        editor.execute('updateEchart', { option: optionText });
        return;
      }

      editor.execute('insertEchart', { option: optionText });
    }
  });
};

class EchartUI extends Plugin {
  static get pluginName() {
    return 'EchartUI';
  }

  init() {
    const editor = this.editor;

    editor.commands.add('insertEchart', new InsertEchartCommand(editor));
    editor.commands.add('updateEchart', new UpdateEchartCommand(editor));

    editor.ui.componentFactory.add('insertEchart', locale => {
      const button = new ButtonView(locale);
      const i18n = editor.config.get('ckeditorI18n') || {};

      button.set({
        label: i18n.echartLabel || '图表',
        icon: echartIcon,
        tooltip: true
      });

      button.bind('isEnabled').to(editor.commands.get('insertEchart'), 'isEnabled');

      button.on('execute', () => {
        const selected = getSelectedEchart(editor.model.document.selection);

        openEchartDialogForEditor(editor, selected?.getAttribute('option') || DEFAULT_ECHART_OPTION_TEXT);
      });

      return button;
    });
  }
}

class EchartPlugin extends Plugin {
  static get pluginName() {
    return 'Echart';
  }

  static get requires() {
    return [EchartEditing, EchartStyleEditing, EchartResizeEditing, EchartStyleUI, EchartResizeUI, EchartToolbar, EchartUI];
  }
}

export default EchartPlugin;

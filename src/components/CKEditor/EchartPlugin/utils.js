import { MEDIA_DEFAULT_HEIGHT } from '../shared/mediaWidget/constants';
import { createMediaSelectionUtils } from '../shared/mediaWidget/selection';
import { createMediaStyleUtils } from '../shared/mediaWidget/styleUtils';
import {
  ECHART_DATA_ATTR,
  ECHART_FIGURE_CLASS,
  ECHART_INNER_CLASS,
  ECHART_MODEL,
  ECHART_STYLES,
  ECHART_STYLE_ATTR,
  ECHART_VIEWER_CLASS
} from './constants';
import { decodeOptionFromHtmlAttribute, encodeOptionForHtmlAttribute, parseStoredOption } from './optionCodec';
import { mountEchartInHost } from './mountEchartInHost';

const selection = createMediaSelectionUtils({ modelName: ECHART_MODEL, figureClass: ECHART_FIGURE_CLASS });

export const getSelectedEchart = selection.getSelected;
export const getEchartWidgetFromViewSelection = selection.getWidgetFromViewSelection;
export const getEchartWidgetFromEditor = selection.getWidgetFromEditor;

const styleUtils = createMediaStyleUtils({
  figureClass: ECHART_FIGURE_CLASS,
  styleAttribute: ECHART_STYLE_ATTR,
  styles: ECHART_STYLES,
  defaultHeight: MEDIA_DEFAULT_HEIGHT
});

export const getStyleByName = styleUtils.getStyleByName;
export const getFigureClasses = styleUtils.getFigureClasses;
export const resolveEchartHeight = styleUtils.resolveHeight;
export const syncFigureStyles = styleUtils.syncFigureStyles;
export const syncFigureSizeStyles = styleUtils.syncFigureSizeStyles;
export const readEchartStyleFromFigure = styleUtils.readStyleFromViewFigure;
export const consumeEchartStyleClasses = styleUtils.consumeStyleClasses;

export const getEchartMountOptions = (editor, modelElement) => {
  const option = parseStoredOption(modelElement.getAttribute('option'));

  return {
    option,
    height: resolveEchartHeight(modelElement)
  };
};

export const findCkEchartInner = viewElement => {
  if (viewElement.is('element', 'div') && viewElement.hasClass(ECHART_INNER_CLASS)) {
    return viewElement;
  }

  for (const child of viewElement.getChildren()) {
    if (child.is('element', 'div') && child.hasClass(ECHART_INNER_CLASS)) {
      return child;
    }
  }

  return null;
};

export const readEchartAttributes = (viewInner, viewFigure) => {
  const encoded = viewInner?.getAttribute(ECHART_DATA_ATTR);

  if (!encoded) {
    return null;
  }

  const optionText = decodeOptionFromHtmlAttribute(encoded);
  const attrs = { option: optionText };

  if (viewFigure) {
    const imageStyle = readEchartStyleFromFigure(viewFigure);

    if (imageStyle) {
      attrs[ECHART_STYLE_ATTR] = imageStyle;
    }

    const width = viewFigure.getStyle('width');

    if (width) {
      attrs.resizedWidth = width;
    } else if (viewFigure.hasClass('image_resized')) {
      attrs.resizedWidth = '100%';
    }

    const height =
      viewFigure.getStyle('height') || viewInner.getStyle?.('height') || viewFigure.getAttribute?.('style');

    if (height) {
      attrs.resizedHeight = typeof height === 'string' ? height : undefined;
    }
  }

  return attrs;
};

export const clearEchartInlineResizeStyles = (editor, modelElement) => {
  const viewFigure = editor.editing.mapper.toViewElement(modelElement);

  if (!viewFigure) {
    return;
  }

  const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);

  if (!domFigure) {
    return;
  }

  domFigure.style.width = '';
  domFigure.style.height = '';
  domFigure.style.minHeight = '';

  const viewer = domFigure.querySelector(`.${ECHART_VIEWER_CLASS}`);

  if (viewer) {
    viewer.style.width = '';
    viewer.style.height = '';
    viewer.style.minHeight = '';
  }
};

export const applyEchartHeightToDom = (editor, modelElement, height) => {
  const resolvedHeight = height || resolveEchartHeight(modelElement);
  const viewFigure = editor.editing.mapper.toViewElement(modelElement);

  if (!viewFigure) {
    return;
  }

  clearEchartInlineResizeStyles(editor, modelElement);

  editor.editing.view.change(writer => {
    writer.setStyle('height', resolvedHeight, viewFigure);
  });

  const domFigure = editor.editing.view.domConverter.mapViewToDom(viewFigure);

  if (!domFigure) {
    return;
  }

  domFigure.style.setProperty('--echart-height', resolvedHeight);
  domFigure.style.height = resolvedHeight;

  const viewer = domFigure.querySelector(`.${ECHART_VIEWER_CLASS}`);

  if (viewer) {
    viewer.style.height = resolvedHeight;
    viewer.style.minHeight = resolvedHeight;

    const mountOptions = getEchartMountOptions(editor, modelElement);

    mountEchartInHost(viewer, mountOptions);
  }
};

export const writeOptionToInnerElement = (writer, viewInner, optionText) => {
  writer.setAttribute(ECHART_DATA_ATTR, encodeOptionForHtmlAttribute(optionText), viewInner);
};

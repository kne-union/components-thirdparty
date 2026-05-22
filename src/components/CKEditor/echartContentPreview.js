import { ECHART_DATA_ATTR, ECHART_FIGURE_CLASS, ECHART_INNER_CLASS, ECHART_VIEWER_CLASS } from './EchartPlugin/constants';
import { decodeOptionFromHtmlAttribute, parseStoredOption } from './EchartPlugin/optionCodec';
import { mountEchartInHost, unmountEchartInHost } from './EchartPlugin/mountEchartInHost';

const ENHANCED_ATTR = 'data-echart-preview-enhanced';

const resolveFigureHeight = figure => {
  return (
    figure.style.height ||
    figure.style.getPropertyValue('--echart-height') ||
    figure.querySelector(`.${ECHART_INNER_CLASS}`)?.style.height ||
    '400px'
  );
};

const ensureViewerHost = inner => {
  let viewer = inner.querySelector(`.${ECHART_VIEWER_CLASS}`);

  if (!viewer) {
    viewer = document.createElement('div');
    viewer.className = ECHART_VIEWER_CLASS;
    inner.appendChild(viewer);
  }

  return viewer;
};

/**
 * 为 CKEditor.Content 预览区中的图表挂载 Echart
 */
export const enhanceEchartContentPreview = container => {
  if (!container) {
    return;
  }

  container.querySelectorAll(`figure.${ECHART_FIGURE_CLASS}`).forEach(figure => {
    if (figure.getAttribute(ENHANCED_ATTR) === 'true') {
      return;
    }

    const inner = figure.querySelector(`.${ECHART_INNER_CLASS}`);

    if (!inner) {
      return;
    }

    const encoded = inner.getAttribute(ECHART_DATA_ATTR);

    if (!encoded) {
      return;
    }

    figure.setAttribute(ENHANCED_ATTR, 'true');

    const height = resolveFigureHeight(figure);
    const option = parseStoredOption(decodeOptionFromHtmlAttribute(encoded));
    const viewer = ensureViewerHost(inner);

    figure.style.height = height;
    inner.style.height = height;
    mountEchartInHost(viewer, { option, height });
  });
};

export const teardownEchartContentPreview = container => {
  if (!container) {
    return;
  }

  container.querySelectorAll(`figure.${ECHART_FIGURE_CLASS}`).forEach(figure => {
    figure.removeAttribute(ENHANCED_ATTR);

    figure.querySelectorAll(`.${ECHART_VIEWER_CLASS}`).forEach(viewer => {
      unmountEchartInHost(viewer);
    });
  });
};

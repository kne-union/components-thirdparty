import { DEFAULT_ECHART_OPTION, DEFAULT_ECHART_OPTION_TEXT } from './constants';

export const stringifyEchartOption = option => {
  try {
    return JSON.stringify(option ?? DEFAULT_ECHART_OPTION);
  } catch {
    return JSON.stringify(DEFAULT_ECHART_OPTION);
  }
};

/** 是否具备可绘制的 series / 常用坐标系配置 */
export const hasRenderableEchartOption = option => {
  if (!option || typeof option !== 'object' || Array.isArray(option)) {
    return false;
  }

  if (Array.isArray(option.series) && option.series.length > 0) {
    return true;
  }

  // 部分图只靠 dataset + encode，仍应视为有效
  if (option.dataset && (option.xAxis || option.yAxis || option.radar || option.geo || option.angleAxis)) {
    return true;
  }

  return !!(option.radar || option.geo || option.graphic || option.calendar);
};

export const parseEchartOptionText = (text, { fallbackToDefault = true } = {}) => {
  const trimmed = String(text ?? '').trim();

  if (!trimmed) {
    if (!fallbackToDefault) {
      return null;
    }

    return { ...DEFAULT_ECHART_OPTION };
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('ECharts option must be a JSON object');
    }

    if (!hasRenderableEchartOption(parsed)) {
      if (!fallbackToDefault) {
        throw new Error('ECharts option must include series data');
      }

      return { ...DEFAULT_ECHART_OPTION };
    }

    return parsed;
  } catch (error) {
    if (fallbackToDefault) {
      return { ...DEFAULT_ECHART_OPTION };
    }

    throw error;
  }
};

export const encodeOptionForHtmlAttribute = optionText =>
  encodeURIComponent(String(optionText ?? DEFAULT_ECHART_OPTION_TEXT).trim() || DEFAULT_ECHART_OPTION_TEXT);

export const decodeOptionFromHtmlAttribute = encoded => {
  if (!encoded) {
    return DEFAULT_ECHART_OPTION_TEXT;
  }

  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

export const parseStoredOption = storedText => parseEchartOptionText(storedText, { fallbackToDefault: true });

/** 提交/挂载前归一化为可渲染 JSON 文本 */
export const normalizeEchartOptionText = text => {
  const trimmed = String(text ?? '').trim();

  if (!trimmed) {
    return DEFAULT_ECHART_OPTION_TEXT;
  }

  try {
    const parsed = parseEchartOptionText(trimmed, { fallbackToDefault: false });

    if (!hasRenderableEchartOption(parsed)) {
      return DEFAULT_ECHART_OPTION_TEXT;
    }

    return trimmed;
  } catch {
    return DEFAULT_ECHART_OPTION_TEXT;
  }
};

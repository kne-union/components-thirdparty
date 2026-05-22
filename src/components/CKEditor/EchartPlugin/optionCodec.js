import { DEFAULT_ECHART_OPTION, DEFAULT_ECHART_OPTION_TEXT } from './constants';

export const stringifyEchartOption = option => {
  try {
    return JSON.stringify(option ?? DEFAULT_ECHART_OPTION);
  } catch {
    return JSON.stringify(DEFAULT_ECHART_OPTION);
  }
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

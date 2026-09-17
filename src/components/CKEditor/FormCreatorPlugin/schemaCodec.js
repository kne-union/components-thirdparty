import { defaultSchema, normalizeSchema } from '@components/FormCreator';

export const stringifySchema = schema => {
  try {
    return JSON.stringify(normalizeSchema(schema || defaultSchema()));
  } catch {
    return JSON.stringify(defaultSchema());
  }
};

export const parseSchemaText = (text, { fallbackToDefault = true } = {}) => {
  const trimmed = String(text ?? '').trim();

  if (!trimmed) {
    if (!fallbackToDefault) {
      return null;
    }

    return defaultSchema();
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('FormCreator schema must be a JSON object');
    }

    return normalizeSchema(parsed);
  } catch (error) {
    if (fallbackToDefault) {
      return defaultSchema();
    }

    throw error;
  }
};

export const encodeSchemaForHtmlAttribute = schemaText =>
  encodeURIComponent(String(schemaText ?? '').trim() || stringifySchema(defaultSchema()));

export const decodeSchemaFromHtmlAttribute = attr => {
  if (!attr) {
    return null;
  }

  try {
    return decodeURIComponent(attr);
  } catch {
    return attr;
  }
};

import { normalizeSchema } from '@kne/form-creator';

export const serializeSchema = schema => JSON.stringify(schema, null, 2);

export const parseSchemaJson = text => {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('invalid_schema');
  }
  return normalizeSchema(parsed);
};

export const downloadSchemaFile = (schema, filename = 'form-schema.json') => {
  const blob = new Blob([serializeSchema(schema)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const copySchemaToClipboard = async schema => {
  const text = serializeSchema(schema);
  if (!navigator.clipboard?.writeText) {
    throw new Error('clipboard_unsupported');
  }
  await navigator.clipboard.writeText(text);
  return text;
};

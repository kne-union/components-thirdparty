import '@kne/form-creator/dist/index.css';
import {
  SchemaRenderer as BaseSchemaRenderer,
  SchemaRendererInner as BaseSchemaRendererInner,
  SchemaContent as BaseSchemaContent,
  SchemaContentInner as BaseSchemaContentInner
} from '@kne/form-creator';
import withFormCreatorPreset from './withFormCreatorPreset';

export {
  defaultSchema,
  defaultFormActions,
  normalizeFormActions,
  createField,
  createFieldId,
  createBlock,
  createStep,
  createChoiceOption,
  normalizeSchema,
  normalizeBlock,
  moveItem,
  isFieldNameUnique,
  collectSchemaFields,
  collectBlockFieldNames,
  updateBlocks,
  mapBlocks,
  findBlock,
  findBlockInTree,
  removeBlockInTree,
  moveBlockInTree,
  hasRenderableContent,
  MAX_BLOCK_DEPTH,
  getBlockKindOptions,
  getBlockDefinition,
  blockToFormValues,
  formValuesToBlock,
  getFieldDefinition,
  getFieldComponent,
  getFieldTypes,
  fieldToFormValues,
  formValuesToField,
  normalizeOptions,
  pickFromPropsSchema,
  applyFromPropsSchema,
  pickFieldProps,
  resolveFieldValueSchema,
  RULE_PRESET_ITEMS,
  RULE_LEN_PRESET,
  getRulePresetItems,
  parseRuleString,
  buildRuleString,
  schemaToDataSchema,
  FormCreator as BaseFormCreator
} from '@kne/form-creator';

export const SchemaRenderer = withFormCreatorPreset(BaseSchemaRenderer);
export const SchemaRendererInner = withFormCreatorPreset(BaseSchemaRendererInner);
export const SchemaContent = withFormCreatorPreset(BaseSchemaContent);
export const SchemaContentInner = withFormCreatorPreset(BaseSchemaContentInner);

export { serializeSchema, parseSchemaJson, downloadSchemaFile, copySchemaToClipboard } from './schemaIO';
export { preset, initFormCreatorPreset, ensureFormCreatorPreset, isFormCreatorPresetReady } from './preset';
export { default as buildExtendedFields, FORM_INFO_FIELD_KEYS } from './buildFields';
export { default as withLocale, createFormatMessage } from './withLocale';
export { default as TemplateListPanel } from './TemplateListPanel';
export { default as SchemaToolbarActions } from './SchemaToolbarActions';
export { default as FormCreatorField } from './FormCreatorField';
export {
  invokeApi,
  resolveGroupTreeData,
  normalizeTemplateList,
  getGroupNodeKey,
  groupTreeToDirectories,
  mergeTemplatesIntoFileSystemView,
  extractSchemaFromPayload,
  resolveTemplateParentId,
  mergeTemplateIntoSchema,
  resolveGroupApis,
  isDirectoryNode
} from './templateApi';
export { default } from './FormCreatorView';

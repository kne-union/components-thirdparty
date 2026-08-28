import '@kne/form-creator/dist/index.css';

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
  SchemaRenderer,
  SchemaRendererInner,
  FormCreator as BaseFormCreator
} from '@kne/form-creator';

export { preset, initFormCreatorPreset, getRenderModal } from './preset';
export { createRenderModal } from './renderModal';
export { default as buildExtendedFields, FORM_INFO_FIELD_KEYS } from './buildFields';
export { default } from './FormCreatorView';

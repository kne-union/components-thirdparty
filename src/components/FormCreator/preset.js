import { preset as formCreatorPreset } from '@kne/form-creator';
import { loadModule } from '@kne/remote-loader';
import buildExtendedFields from './buildFields';
import { createFormatMessage } from './withLocale';

let formInfoFieldsCache = null;
let loadPromise = null;
let appliedLocale = null;

const loadFormInfoFields = async () => {
  if (formInfoFieldsCache) {
    return formInfoFieldsCache;
  }
  if (!loadPromise) {
    loadPromise = loadModule('components-core:FormInfo')
      .then(FormInfoModule => {
        const FormInfo = FormInfoModule?.default ?? FormInfoModule;
        formInfoFieldsCache = FormInfo?.fields || {};
        return formInfoFieldsCache;
      })
      .catch(error => {
        loadPromise = null;
        throw error;
      });
  }
  return loadPromise;
};

const applyFields = ({ rules = {}, fields = {}, formatMessage, locale } = {}) => {
  const nextLocale = locale || 'zh-CN';
  const t = formatMessage || createFormatMessage(nextLocale);
  formCreatorPreset({
    rules,
    fields: {
      ...buildExtendedFields(formInfoFieldsCache || {}, t),
      ...fields
    }
  });
  appliedLocale = nextLocale;
};

/**
 * 拉取 components-core FormInfo.fields，注册扩展填写项。
 * 业务侧一般无需手动调用，FormCreator 首次挂载时会自动 ensure。
 * locale 变化时会用新文案重新 registerField。
 */
export const initFormCreatorPreset = async ({ rules = {}, fields = {}, formatMessage, locale } = {}) => {
  await loadFormInfoFields();
  applyFields({ rules, fields, formatMessage, locale });
};

/** 幂等懒初始化，供 FormCreatorView 内部使用；locale 变化时重新注册字段文案 */
export const ensureFormCreatorPreset = options => {
  const nextLocale = options?.locale || 'zh-CN';
  if (formInfoFieldsCache && appliedLocale === nextLocale) {
    return Promise.resolve();
  }
  return initFormCreatorPreset(options);
};

/**
 * 同步 preset：仅注册不依赖 components-core 的字段（JSONEditor / CKEditor / react-form-antd 兜底）。
 * 完整字段由 FormCreator 首次挂载时自动 ensure。
 */
export const preset = ({ rules = {}, fields = {}, locale = 'zh-CN', formatMessage } = {}) => {
  applyFields({
    rules,
    fields,
    locale,
    formatMessage: formatMessage || createFormatMessage(locale)
  });
};

export default preset;

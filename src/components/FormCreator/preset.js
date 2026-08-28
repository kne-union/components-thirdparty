import { preset as formCreatorPreset } from '@kne/form-creator';
import { loadModule } from '@kne/remote-loader';
import { createRenderModal } from './renderModal';
import buildExtendedFields from './buildFields';

let cachedRenderModal = null;

export const getRenderModal = () => cachedRenderModal;

/**
 * 拉取 components-core Modal / FormInfo.fields，注册扩展填写项并缓存 renderModal。
 * 在 remoteLoaderPreset 之后调用（globalInit 内已集成）。
 */
export const initFormCreatorPreset = async ({ rules = {}, fields = {}, themeToken } = {}) => {
  const [ModalModule, FormInfoModule] = await Promise.all([
    loadModule('components-core:Modal'),
    loadModule('components-core:FormInfo')
  ]);

  const Modal = ModalModule?.default ?? ModalModule;
  const FormInfo = FormInfoModule?.default ?? FormInfoModule;
  const formInfoFields = FormInfo?.fields || {};

  cachedRenderModal = createRenderModal(Modal, themeToken);

  formCreatorPreset({
    rules,
    fields: {
      ...buildExtendedFields(formInfoFields),
      ...fields
    }
  });

  return { renderModal: cachedRenderModal };
};

/**
 * 同步 preset：仅注册不依赖 components-core 的字段（JSONEditor / CKEditor / react-form-antd 兜底）。
 * 完整字段与 renderModal 请使用 initFormCreatorPreset。
 */
export const preset = ({ rules = {}, fields = {} } = {}) => {
  formCreatorPreset({
    rules,
    fields: {
      ...buildExtendedFields(),
      ...fields
    }
  });
};

export default preset;

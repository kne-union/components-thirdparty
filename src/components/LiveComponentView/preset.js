export const globalParams = {
  libs: {}
};

export const getLibs = () => globalParams.libs;

/**
 * 全局预设，用法同 @kne/react-fetch 的 preset。
 * @example
 * import { preset } from '@components/LiveComponentView';
 * import lodash from 'lodash';
 * import dayjs from 'dayjs';
 * preset({ libs: { lodash, dayjs, _: lodash } });
 */
const preset = newOptions => {
  if (newOptions && typeof newOptions.libs === 'object' && newOptions.libs) {
    globalParams.libs = Object.assign({}, globalParams.libs, newOptions.libs);
  }
  return globalParams;
};

export default preset;

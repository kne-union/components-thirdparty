import { createWithIntlProvider } from '@kne/react-intl';

/**
 * 创建国际化 HOC 的工厂函数
 * @param {string} namespace - 组件命名空间，如 'CKEditor'
 * @param {object} enUS - 英文语言包
 * @param {object} zhCN - 中文语言包
 * @returns {Function} withLocale HOC
 */
const createWithLocale = (namespace, enUS, zhCN) =>
  createWithIntlProvider({
    defaultLocale: 'zh-CN',
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS
    },
    namespace: `components-thirdparty:${namespace}`
  });

export default createWithLocale;

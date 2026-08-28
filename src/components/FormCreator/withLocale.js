import { createWithIntlProvider, createIntl } from '@kne/react-intl';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const NAMESPACE = 'components-thirdparty';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
};

const withLocale = createWithIntlProvider({
  defaultLocale: 'zh-CN',
  messages,
  namespace: NAMESPACE
});

export const createFormatMessage = (locale = 'zh-CN') => {
  const { formatMessage } = createIntl({
    locale,
    message: messages[locale] || zhCN,
    namespace: NAMESPACE
  });
  return formatMessage;
};

export default withLocale;

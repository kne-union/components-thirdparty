import createWithLocale from '../../common/createWithLocale';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const withLocale = createWithLocale('CKEditor', enUS, zhCN);

export default withLocale;

import createWithLocale from '../../common/createWithLocale';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const withLocale = createWithLocale('Calendar', enUS, zhCN);

export default withLocale;

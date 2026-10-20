import { AutoComplete } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';

const CONTENT_TYPES = [
  'application/json',
  'application/xml',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'text/html',
  'application/octet-stream'
];

const options = CONTENT_TYPES.map(value => ({ value }));

export const ContentTypeInputField = ({ value, onChange, placeholder = 'application/json' }) => (
  <AutoComplete
    style={{ width: '100%' }}
    value={value}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
    allowClear
    filterOption={(input, option) => {
      const keyword = String(input || '').toLowerCase();
      return CONTENT_TYPES.includes(keyword) || option.value.includes(keyword);
    }}
  />
);

const ContentTypeInput = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const render = hooks.useDecorator(props);
  return render(ContentTypeInputField);
});

export default ContentTypeInput;

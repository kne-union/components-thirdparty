import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { Input, Select } = FormInfo.fields;

    return (
      <FormInfo
        column={1}
        list={[
          <Input name="name" label={formatMessage({ id: 'Name' })} rule="REQ LEN-1-100" />,
          <Select
            name="defaultPermission"
            label={formatMessage({ id: 'DefaultPermission' })}
            rule="REQ"
            options={[
              { value: 'rw', label: formatMessage({ id: 'PermissionRw' }) },
              { value: 'r', label: formatMessage({ id: 'PermissionR' }) }
            ]}
          />
        ]}
      />
    );
  })
);

export default FormInner;

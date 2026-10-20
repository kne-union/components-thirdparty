import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import JSONEditor from '@components/JSONEditor';
import withLocale from './withLocale';

const { Text } = Typography;

const isValidHeaders = value => {
  if (!value || !String(value).trim()) {
    return true;
  }
  try {
    const parsed = JSON.parse(value);
    return !!parsed && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch {
    return false;
  }
};

const createId = () => `env_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const EnvForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { Input } = FormInfo.fields;
    return (
      <FormInfo
        column={1}
        list={[
          <Input name="name" label={formatMessage({ id: 'PostCatEnvName' })} rule="REQ LEN-1-50" />,
          <Input name="baseUrl" label={formatMessage({ id: 'PostCatEnvBaseUrl' })} rule="REQ" placeholder="https://api.example.com" />,
          <JSONEditor name="headers" label={formatMessage({ id: 'PostCatEnvHeaders' })} height={200} />
        ]}
      />
    );
  })
);

/** presetEnvs 来自 props，只读；userEnvs 为用户本地添加，envActionsOpen 时可增删改 */
const EnvPanel = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:ConfirmButton']
})(
  withLocale(({ remoteModules, presetEnvs = [], userEnvs = [], envActionsOpen = true, onUserEnvsChange }) => {
    const [useFormModal, ConfirmButton] = remoteModules;
    const formModal = useFormModal();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();

    const openForm = item => {
      const modalApi = formModal({
        title: formatMessage({ id: item ? 'PostCatEditEnv' : 'PostCatAddEnv' }),
        formProps: {
          data: item,
          onSubmit: async formData => {
            if (!isValidHeaders(formData.headers)) {
              message.error(formatMessage({ id: 'PostCatEnvHeadersTip' }));
              return false;
            }
            const value = { name: formData.name, baseUrl: formData.baseUrl, headers: formData.headers || '' };
            onUserEnvsChange(
              item
                ? userEnvs.map(env => (env.id === item.id ? Object.assign({}, env, value) : env))
                : [...userEnvs, Object.assign({ id: createId() }, value)]
            );
            message.success(formatMessage({ id: 'PostCatSaveSuccess' }));
            modalApi.close();
          }
        },
        children: <EnvForm />
      });
    };

    const dataSource = [...presetEnvs.map(env => Object.assign({}, env, { preset: true })), ...userEnvs];

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        {envActionsOpen && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
            {formatMessage({ id: 'PostCatAddEnv' })}
          </Button>
        )}
        <Table
          rowKey={(item, index) => item.id || `preset-${index}`}
          size="small"
          pagination={false}
          dataSource={dataSource}
          scroll={{ x: 'max-content' }}
          columns={[
            {
              title: formatMessage({ id: 'PostCatEnvName' }),
              dataIndex: 'name',
              render: (name, item) => (
                <Space size={4}>
                  <span>{name}</span>
                  {item.preset && <Tag>{formatMessage({ id: 'PostCatPresetEnv' })}</Tag>}
                </Space>
              )
            },
            { title: formatMessage({ id: 'PostCatEnvBaseUrl' }), dataIndex: 'baseUrl', render: value => <Text copyable>{value}</Text> },
            {
              title: formatMessage({ id: 'PostCatEnvHeaders' }),
              dataIndex: 'headers',
              render: value => (
                <Text type="secondary" ellipsis style={{ maxWidth: 240 }}>
                  {typeof value === 'object' && value ? JSON.stringify(value) : value}
                </Text>
              )
            },
            ...(envActionsOpen
              ? [
                  {
                    title: formatMessage({ id: 'PostCatOptions' }),
                    key: 'options',
                    fixed: 'right',
                    render: (_, item) =>
                      item.preset ? null : (
                        <Space size={0}>
                          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openForm(item)}>
                            {formatMessage({ id: 'PostCatEdit' })}
                          </Button>
                          <ConfirmButton
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onUserEnvsChange(userEnvs.filter(env => env.id !== item.id))}
                          >
                            {formatMessage({ id: 'PostCatDelete' })}
                          </ConfirmButton>
                        </Space>
                      )
                  }
                ]
              : [])
          ]}
        />
      </Space>
    );
  })
);

export default EnvPanel;

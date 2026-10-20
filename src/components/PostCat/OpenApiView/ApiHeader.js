import { Tag, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import style from '../style.module.scss';

const { Title, Paragraph, Text } = Typography;

const ApiHeader = withLocale(({ data }) => {
  const { formatMessage } = useIntl();
  const { info, servers, version } = data;
  return (
    <div className={style['doc-header']}>
      <div className={style['doc-header-title']}>
        <Title level={4} style={{ margin: 0 }}>
          {info.title}
        </Title>
        {info.version && <Tag color="blue">{`${formatMessage({ id: 'PostCatVersion' })} ${info.version}`}</Tag>}
        {version && <Tag>{`OAS ${version}`}</Tag>}
      </div>
      {info.description && (
        <Paragraph type="secondary" className={style['pre-wrap']} style={{ margin: 0 }}>
          {info.description}
        </Paragraph>
      )}
      {servers.length > 0 && (
        <div className={style['doc-header-servers']}>
          <Text type="secondary">{formatMessage({ id: 'PostCatServers' })}:</Text>
          {servers.map(server => (
            <Text key={server.url} code copyable={{ text: server.url }} title={server.description}>
              {server.url}
            </Text>
          ))}
        </div>
      )}
    </div>
  );
});

export default ApiHeader;

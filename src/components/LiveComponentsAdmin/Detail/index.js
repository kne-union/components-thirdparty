import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { App, Button, Space, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import LiveComponentEditor from '@components/LiveComponentEditor';
import style from '../style.module.scss';

const { Text, Title } = Typography;

const resolveSiteHost = host => {
  if (!host) {
    return host;
  }
  if (String(host).startsWith('localStorage:') || /^https?:\/\//i.test(String(host))) {
    return String(host);
  }
  try {
    return new URL(String(host), window.location.origin).href;
  } catch {
    return String(host);
  }
};

const Detail = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:StateTag'
  ]
})(
  withLocale(({ remoteModules, pageProps = {}, baseUrl = '' }) => {
    const [Page, usePreset, StateTag] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const siteApis = apis?.liveComponentsSite || {};
    const listUrl = baseUrl || '..';

    if (!id) {
      return (
        <Page {...pageProps} title={formatMessage({ id: 'ModuleTitle' })} backUrl={listUrl}>
          <Text type="danger">{formatMessage({ id: 'SiteNotFound' })}</Text>
        </Page>
      );
    }

    return (
      <Fetch
        {...Object.assign({}, siteApis.detail, { params: { id } })}
        render={({ data: site }) => {
          if (!site) {
            return (
              <Page {...pageProps} title={formatMessage({ id: 'ModuleTitle' })} backUrl={listUrl}>
                <Text type="danger">{formatMessage({ id: 'SiteNotFound' })}</Text>
              </Page>
            );
          }

          const host = resolveSiteHost(site.host);
          const isOpen = site.status === 'open';

          return (
            <Page
              {...pageProps}
              title={site.name || formatMessage({ id: 'ManageContent' })}
              backUrl={listUrl}
            >
              <div className={style['detail']}>
                <div className={style['detail-header']}>
                  <div className={style['detail-meta']}>
                    <Title level={5} style={{ margin: 0 }}>
                      {site.name}
                    </Title>
                    <StateTag
                      type={isOpen ? 'success' : 'danger'}
                      text={isOpen ? formatMessage({ id: 'Open' }) : formatMessage({ id: 'Close' })}
                    />
                    <Text type="secondary">{isOpen ? formatMessage({ id: 'SiteOpenTip' }) : formatMessage({ id: 'SiteClosedTip' })}</Text>
                  </div>
                  <Space wrap>
                    <Text className={style['detail-host']} copyable={{ text: host, tooltips: [formatMessage({ id: 'CopyHost' }), formatMessage({ id: 'CopySuccess' })] }}>
                      {host}
                    </Text>
                    <Button
                      size="small"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(host);
                          message.success(formatMessage({ id: 'CopySuccess' }));
                        } catch (e) {
                          message.error(e.message);
                        }
                      }}>
                      {formatMessage({ id: 'CopyHost' })}
                    </Button>
                  </Space>
                </div>
                <div className={style['detail-editor']}>
                  <LiveComponentEditor sites={[{ host, name: site.name }]} siteActionsOpen={false} height={640} />
                </div>
              </div>
            </Page>
          );
        }}
      />
    );
  })
);

export default Detail;

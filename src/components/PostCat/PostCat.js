import { useMemo, useRef, useState } from 'react';
import { App, Alert, Button, Empty, Input, Space, Spin, Tag, Typography } from 'antd';
import {
  CloudServerOutlined,
  DownloadOutlined,
  FileAddOutlined,
  LinkOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import classnames from 'classnames';
import SiteFilePanel, { SaveAsModal } from '@components/LiveComponentEditor/SiteFilePanel';
import withSiteLocale from '@components/LiveComponentEditor/withLocale';
import { createSiteApi, writeEditorSelection } from '@components/LiveComponentEditor/siteApi';
import withLocale from './withLocale';
import OpenApiView from './OpenApiView';
import { isOpenApiDoc } from './OpenApiView/parseOpenApiData';
import { ImportButton, downloadJSON, loadSampleDoc } from './importExport';
import EnvPanel from './EnvPanel';
import ScrollArea from './ScrollArea';
import Drawer from './Drawer';
import style from './style.module.scss';

const { Text } = Typography;

export const DEFAULT_USER_SITES_STORAGE_KEY = 'postcat:user-sites';
export const DEFAULT_USER_ENVS_STORAGE_KEY = 'postcat:user-envs';
export const DEFAULT_HISTORY_STORAGE_KEY = 'postcat:history';
export const CASES_FIELD = 'x-postcat-cases';
export const SUBSCRIPTION_EXTENSION = '.url';

const SitePanel = withSiteLocale(SiteFilePanel);
const SiteSaveAsModal = withSiteLocale(SaveAsModal);

export const isSubscriptionFile = name =>
  String(name || '')
    .toLowerCase()
    .endsWith(SUBSCRIPTION_EXTENSION);

const parseSubscriptionUrl = content => {
  try {
    const url = JSON.parse(content)?.url;
    return typeof url === 'string' ? url.trim() : '';
  } catch {
    return '';
  }
};

const isHttpUrl = url => /^https?:\/\/\S+$/i.test(url);

// 订阅文档里的相对 servers 以订阅地址为基准，否则调试会打到当前页面所在域名
const resolveServerUrls = (state, baseUrl) => {
  if (!Array.isArray(state.doc?.servers)) {
    return state;
  }
  const servers = state.doc.servers.map(server =>
    server?.url && !/^[a-z][a-z\d+.-]*:\/\//i.test(server.url) && !server.url.includes('{')
      ? Object.assign({}, server, { url: new URL(server.url, baseUrl).href.replace(/\/$/, '') })
      : server
  );
  return Object.assign({}, state, { doc: Object.assign({}, state.doc, { servers }) });
};

const parseDocContent = content => {
  if (!String(content || '').trim()) {
    return { doc: null, error: null };
  }
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return isOpenApiDoc(doc) ? { doc, error: null } : { doc: null, error: 'PostCatInvalidDoc' };
  } catch {
    return { doc: null, error: 'PostCatInvalidJson' };
  }
};

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[PostCat] localStorage write failed', error);
  }
};

const readStorageMap = key => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
};

const PostCatCore = withLocale(
  ({
    sites = [],
    onSitesChange,
    siteActionsOpen = true,
    userSitesStorageKey = DEFAULT_USER_SITES_STORAGE_KEY,
    envs,
    envActionsOpen = true,
    userEnvsStorageKey = DEFAULT_USER_ENVS_STORAGE_KEY,
    historyStorageKey = DEFAULT_HISTORY_STORAGE_KEY,
    maxHistory = 100,
    width = 260,
    tryIt = true
  }) => {
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const [collapsed, setCollapsed] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [docState, setDocState] = useState({ doc: null, error: null });
    const [envOpen, setEnvOpen] = useState(false);
    const [userEnvsMap, setUserEnvsMap] = useState(() => readStorageMap(userEnvsStorageKey));

    const [historyMap, setHistoryMap] = useState(() => readStorageMap(historyStorageKey));
    const [subscriptionState, setSubscriptionState] = useState({ loading: false, error: null });
    const [innerSites, setInnerSites] = useState([]);
    const [treeRefreshToken, setTreeRefreshToken] = useState(0);
    const [saveAsOpen, setSaveAsOpen] = useState(false);
    const loadSeqRef = useRef(0);

    const envEnabled = Array.isArray(envs);
    const siteHost = currentFile?.siteHost;
    const userEnvs = (siteHost && userEnvsMap[siteHost]) || [];
    const effectiveEnvs = envEnabled ? [...envs, ...userEnvs] : [];
    const isSubscription = !!currentFile && isSubscriptionFile(currentFile.name);
    const writable = currentFile?.permission === 'rw' && !isSubscription;
    const historyKey = currentFile ? `${currentFile.siteHost}:${currentFile.id}` : null;
    const history = (historyKey && historyMap[historyKey]) || [];

    const loadSubscription = useRefCallback(async url => {
      const seq = ++loadSeqRef.current;
      setDocState({ doc: null, error: null });
      if (!isHttpUrl(url)) {
        setSubscriptionState({ loading: false, error: formatMessage({ id: 'PostCatSubscriptionUrlRequired' }) });
        return;
      }
      setSubscriptionState({ loading: true, error: null });
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        if (seq !== loadSeqRef.current) {
          return;
        }
        setDocState(resolveServerUrls(parseDocContent(text), url));
        setSubscriptionState({ loading: false, error: null });
      } catch (error) {
        if (seq !== loadSeqRef.current) {
          return;
        }
        setSubscriptionState({ loading: false, error: error.message });
      }
    });

    const handleOpenFile = useRefCallback(({ siteHost, id, name, permission, content }) => {
      if (isSubscriptionFile(name)) {
        const subscriptionUrl = parseSubscriptionUrl(content);
        setCurrentFile({ siteHost, id, name, permission, subscriptionUrl });
        loadSubscription(subscriptionUrl);
        return;
      }
      loadSeqRef.current++;
      setSubscriptionState({ loading: false, error: null });
      setCurrentFile({ siteHost, id, name, permission });
      setDocState(parseDocContent(content));
    });

    const handleSitesChange = useRefCallback(list => {
      setInnerSites(list);
      onSitesChange?.(list);
    });

    const saveSubscriptionAsFile = useRefCallback(async ({ host, parentId, name }) => {
      try {
        const content = JSON.stringify(docState.doc, null, 2);
        const file = await createSiteApi(host).create({ parentId, name, content });
        const fileName = file.name || name;
        writeEditorSelection({ activeHost: host, file: { siteHost: host, id: file.id, name: fileName } }, userSitesStorageKey);
        loadSeqRef.current++;
        setSubscriptionState({ loading: false, error: null });
        setCurrentFile({ siteHost: host, id: file.id, name: fileName, permission: file.permission || 'rw' });
        setSaveAsOpen(false);
        setTreeRefreshToken(token => token + 1);
        message.success(formatMessage({ id: 'PostCatSaveSuccess' }));
      } catch (error) {
        message.error(error.message);
      }
    });

    const fileTypes = useMemo(
      () => [
        {
          key: 'file',
          label: formatMessage({ id: 'PostCatFileTypeFile' }),
          defaultName: 'untitled',
          extension: '.json'
        },
        {
          key: 'subscription',
          label: formatMessage({ id: 'PostCatSubscriptionTag' }),
          defaultName: 'untitled',
          extension: SUBSCRIPTION_EXTENSION,
          renderFields: ({ value, onChange }) => (
            <Input
              prefix={<LinkOutlined />}
              value={value.url || ''}
              placeholder={formatMessage({ id: 'PostCatSubscriptionUrl' })}
              onChange={e => onChange(Object.assign({}, value, { url: e.target.value }))}
            />
          ),
          getContent: value => {
            const url = String(value.url || '').trim();
            if (!isHttpUrl(url)) {
              throw new Error(formatMessage({ id: 'PostCatSubscriptionUrlRequired' }));
            }
            return JSON.stringify({ url }, null, 2);
          }
        }
      ],
      [formatMessage]
    );

    const handleUserEnvsChange = useRefCallback(list => {
      const next = Object.assign({}, userEnvsMap, { [siteHost]: list });
      setUserEnvsMap(next);
      writeStorage(userEnvsStorageKey, next);
    });

    const handleHistoryChange = useRefCallback(list => {
      const next = Object.assign({}, readStorageMap(historyStorageKey), { [historyKey]: list });
      list.length === 0 && delete next[historyKey];
      setHistoryMap(next);
      writeStorage(historyStorageKey, next);
    });

    const saveDoc = useRefCallback(async (doc, successMessageId = 'PostCatImportSuccess') => {
      if (!isOpenApiDoc(doc)) {
        message.error(formatMessage({ id: 'PostCatInvalidDoc' }));
        return;
      }
      if (!writable) {
        message.warning(formatMessage({ id: 'PostCatReadOnly' }));
        return;
      }
      await createSiteApi(currentFile.siteHost).save({ id: currentFile.id, content: JSON.stringify(doc, null, 2) });
      setDocState({ doc, error: null });
      message.success(formatMessage({ id: successMessageId }));
    });

    const handleCasesChange = useRefCallback(async cases => {
      const doc = Object.assign({}, docState.doc, { [CASES_FIELD]: cases });
      setDocState({ doc, error: null });
      try {
        await createSiteApi(currentFile.siteHost).save({ id: currentFile.id, content: JSON.stringify(doc, null, 2) });
      } catch (error) {
        message.error(error.message);
      }
    });

    const handleDocChange = useRefCallback(async (nextDoc, { fromKey, toKey } = {}) => {
      let doc = nextDoc;
      const cases = Array.isArray(doc[CASES_FIELD]) ? doc[CASES_FIELD] : [];
      if (fromKey && fromKey !== toKey && cases.length) {
        const nextCases = toKey
          ? cases.map(item => (item.operationKey === fromKey ? Object.assign({}, item, { operationKey: toKey }) : item))
          : cases.filter(item => item.operationKey !== fromKey);
        doc = Object.assign({}, doc, { [CASES_FIELD]: nextCases });
      }
      setDocState({ doc, error: null });
      try {
        await createSiteApi(currentFile.siteHost).save({ id: currentFile.id, content: JSON.stringify(doc, null, 2) });
        message.success(formatMessage({ id: 'PostCatSaveSuccess' }));
      } catch (error) {
        message.error(error.message);
      }
    });

    const createEmptyDoc = () =>
      saveDoc(
        {
          openapi: '3.0.3',
          info: { title: currentFile.name.replace(/\.json$/i, ''), version: '1.0.0' },
          paths: {}
        },
        'PostCatSaveSuccess'
      );

    const onError = useRefCallback(error =>
      message.error(error instanceof SyntaxError ? formatMessage({ id: 'PostCatInvalidJson' }) : error.message)
    );

    const renderMain = () => {
      if (!currentFile) {
        return <Empty className={style['main-empty']} description={formatMessage({ id: 'PostCatSelectFile' })} />;
      }
      if (isSubscription && subscriptionState.loading) {
        return (
          <div className={style['main-loading']}>
            <Spin />
          </div>
        );
      }
      if (isSubscription && subscriptionState.error) {
        return (
          <Empty className={style['main-empty']} description={formatMessage({ id: 'PostCatSubscriptionLoadFail' })}>
            <Alert type="error" showIcon message={subscriptionState.error} style={{ marginBottom: 16 }} />
            <Button icon={<ReloadOutlined />} onClick={() => loadSubscription(currentFile.subscriptionUrl)}>
              {formatMessage({ id: 'PostCatRetry' })}
            </Button>
          </Empty>
        );
      }
      if (docState.doc) {
        return (
          <OpenApiView
            key={historyKey}
            className={style['workspace-view']}
            data={docState.doc}
            envs={effectiveEnvs}
            tryIt={tryIt}
            maxHistory={maxHistory}
            history={history}
            onHistoryChange={handleHistoryChange}
            cases={docState.doc[CASES_FIELD] || []}
            onCasesChange={handleCasesChange}
            caseActionsOpen={writable}
            apiActionsOpen={writable}
            onDataChange={handleDocChange}
          />
        );
      }
      return (
        <Empty className={style['main-empty']} description={formatMessage({ id: 'PostCatEmptyDoc' })}>
          {docState.error && <Alert type="warning" showIcon message={formatMessage({ id: docState.error })} style={{ marginBottom: 16 }} />}
          {writable && (
            <Space>
              <ImportButton type="primary" onImport={saveDoc} onError={onError}>
                {formatMessage({ id: 'PostCatImportApi' })}
              </ImportButton>
              <Button icon={<FileAddOutlined />} onClick={() => loadSampleDoc().then(saveDoc).catch(onError)}>
                {formatMessage({ id: 'PostCatImportSample' })}
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => createEmptyDoc().catch(onError)}>
                {formatMessage({ id: 'PostCatCreateEmptyDoc' })}
              </Button>
            </Space>
          )}
        </Empty>
      );
    };

    return (
      <div className={style['workspace']}>
        <aside
          className={classnames(style['sites-aside'], { [style['sites-aside-collapsed']]: collapsed })}
          style={collapsed ? undefined : { width }}
        >
          {collapsed ? (
            <Button
              type="text"
              size="small"
              className={style['sites-toggle']}
              icon={<MenuUnfoldOutlined />}
              aria-label={formatMessage({ id: 'PostCatExpandSites' })}
              onClick={() => setCollapsed(false)}
            />
          ) : (
            <div className={style['sites-aside-body']}>
              <SitePanel
                sites={sites}
                onSitesChange={handleSitesChange}
                siteActionsOpen={siteActionsOpen}
                userSitesStorageKey={userSitesStorageKey}
                fileTypes={fileTypes}
                refreshToken={treeRefreshToken}
                currentFile={currentFile}
                onOpenFile={handleOpenFile}
                onCurrentFileChange={file => {
                  setCurrentFile(file);
                  !file && setDocState({ doc: null, error: null });
                }}
                onCollapse={() => setCollapsed(true)}
              />
            </div>
          )}
        </aside>
        <div className={style['workspace-main']}>
          {currentFile && (
            <div className={style['toolbar']}>
              <Space size={8} className={style['toolbar-title']}>
                <Text strong ellipsis>
                  {currentFile.name}
                </Text>
                {isSubscription ? (
                  <Tag color="blue" icon={<LinkOutlined />} title={formatMessage({ id: 'PostCatSubscriptionReadOnly' })}>
                    {formatMessage({ id: 'PostCatSubscriptionTag' })}
                  </Tag>
                ) : (
                  !writable && <Tag>{formatMessage({ id: 'PostCatReadOnlyTag' })}</Tag>
                )}
                {isSubscription && (
                  <Text type="secondary" ellipsis className={style['toolbar-url']} title={currentFile.subscriptionUrl}>
                    {currentFile.subscriptionUrl}
                  </Text>
                )}
              </Space>
              <Space wrap>
                {isSubscription && (
                  <Button icon={<ReloadOutlined />} loading={subscriptionState.loading} onClick={() => loadSubscription(currentFile.subscriptionUrl)}>
                    {formatMessage({ id: 'PostCatRefresh' })}
                  </Button>
                )}
                {isSubscription && docState.doc && (
                  <Button icon={<SaveOutlined />} onClick={() => setSaveAsOpen(true)}>
                    {formatMessage({ id: 'PostCatSaveAsFile' })}
                  </Button>
                )}
                {writable && docState.doc && (
                  <ImportButton onImport={saveDoc} onError={onError}>
                    {formatMessage({ id: 'PostCatImportApi' })}
                  </ImportButton>
                )}
                {docState.doc && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => downloadJSON(docState.doc, currentFile.name.endsWith('.json') ? currentFile.name : `${currentFile.name}.json`)}
                  >
                    {formatMessage({ id: 'PostCatExportApi' })}
                  </Button>
                )}
                {envEnabled && (
                  <Button icon={<CloudServerOutlined />} onClick={() => setEnvOpen(true)}>
                    {formatMessage({ id: 'PostCatEnvManage' })}
                  </Button>
                )}
              </Space>
            </div>
          )}
          <div className={style['workspace-content']}>
            <ScrollArea className={style['workspace-scroll']}>{renderMain()}</ScrollArea>
          </div>
        </div>
        {envEnabled && (
          <Drawer width={720} footer={null} open={envOpen} title={formatMessage({ id: 'PostCatEnvManage' })} onClose={() => setEnvOpen(false)}>
            <EnvPanel presetEnvs={envs} userEnvs={userEnvs} envActionsOpen={envActionsOpen && !!siteHost} onUserEnvsChange={handleUserEnvsChange} />
          </Drawer>
        )}
        <SiteSaveAsModal
          open={saveAsOpen}
          sites={innerSites}
          defaultHost={siteHost}
          defaultName={isSubscription ? currentFile.name.slice(0, -SUBSCRIPTION_EXTENSION.length) + '.json' : 'untitled.json'}
          onCancel={() => setSaveAsOpen(false)}
          onOk={saveSubscriptionAsFile}
        />
      </div>
    );
  }
);

const PostCat = ({ className, style: styleProp, height = 640, bordered = true, ...props }) => (
  <div className={classnames(style['postcat'], { [style['postcat-borderless']]: !bordered }, className)} style={Object.assign({ height }, styleProp)}>
    <App>
      <PostCatCore {...props} />
    </App>
  </div>
);

export default PostCat;

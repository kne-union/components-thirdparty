import { useMemo, useState } from 'react';
import { Button, Empty, Segmented, message } from 'antd';
import { ApiOutlined, HistoryOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import { createWithRemoteLoader } from '@kne/remote-loader';
import useControlValue from '@kne/use-control-value';
import classnames from 'classnames';
import withLocale from '../withLocale';
import parseOpenApiData from './parseOpenApiData';
import ApiMenu from './ApiMenu';
import HistoryList from './HistoryList';
import ApiHeader from './ApiHeader';
import ApiItem from './ApiItem';
import CaseNameModal from './CaseNameModal';
import { openOperationEditor } from './OperationEditor';
import { removeOperation, saveOperation, toOperationKey } from './operationDoc';
import Drawer from '../Drawer';
import style from '../style.module.scss';

const createId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const OpenApiView = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal']
})(
  withLocale(({ remoteModules, ...props }) => {
    const [useFormModal] = remoteModules;
    const formModal = useFormModal();
    const {
      data,
      envs = [],
      tryIt = true,
      maxHistory = 100,
      historyTotal,
      historyHasMore,
      onHistoryLoadMore,
      onHistorySearch,
      onHistoryClear,
      caseCounts,
      onCasesLoadMore,
      caseActionsOpen = true,
      apiActionsOpen = true,
      stickyTop,
      onDataChange,
      className
    } = props;
    const stickyTopValue = typeof stickyTop === 'number' ? `${stickyTop}px` : stickyTop;
    const apiEditable = apiActionsOpen && !!onDataChange;
    const { formatMessage } = useIntl();
    const [menuOpen, setMenuOpen] = useState(false);
    const [asideTab, setAsideTab] = useState('api');
    const parsed = useMemo(() => parseOpenApiData(data), [data]);
    const [currentKey, setCurrentKey] = useState(null);
    const [selection, setSelection] = useState(null);
    const [tryItVersion, setTryItVersion] = useState(0);
    const [activeTab, setActiveTab] = useState('doc');
    const [nameModal, setNameModal] = useState(null);
    const [messageApi, messageContextHolder] = message.useMessage();
    const [historyValue, setHistory] = useControlValue(props, { value: 'history', defaultValue: 'defaultHistory', onChange: 'onHistoryChange' });
    const [casesValue, setCases] = useControlValue(props, { value: 'cases', defaultValue: 'defaultCases', onChange: 'onCasesChange' });
    const history = historyValue || [];
    const cases = casesValue || [];
    const operationKeys = useMemo(() => new Set(parsed.operations.map(item => item.key)), [parsed]);
    const operation = parsed.operations.find(item => item.key === currentKey) || parsed.operations[0];

    const currentCase = selection?.type === 'case' ? cases.find(item => item.id === selection.id) : null;
    const currentHistory = selection?.type === 'history' ? history.find(item => item.id === selection.id) : null;
    const record = [currentCase, currentHistory].find(item => item && item.operationKey === operation?.key) || null;

    const select = (operationKey, nextSelection) => {
      setCurrentKey(operationKey);
      setSelection(nextSelection);
      nextSelection && setActiveTab('run');
      setTryItVersion(version => version + 1);
      setMenuOpen(false);
    };

    const saveCase = (request, { saveAs }) => {
      if (!saveAs && currentCase) {
        setCases(cases.map(item => (item.id === currentCase.id ? Object.assign({}, item, { request, updatedAt: Date.now() }) : item)));
        messageApi.success(formatMessage({ id: 'PostCatSaveSuccess' }));
        return;
      }
      const count = cases.filter(item => item.operationKey === operation.key).length;
      setNameModal({
        title: formatMessage({ id: 'PostCatSaveAsCase' }),
        defaultName: `${operation.summary || operation.path} ${formatMessage({ id: 'PostCatCase' })} ${count + 1}`,
        onOk: name => {
          const now = Date.now();
          const item = { id: createId(), name, operationKey: operation.key, request, createdAt: now, updatedAt: now };
          setCases([...cases, item]);
          setSelection({ type: 'case', id: item.id });
          setNameModal(null);
          messageApi.success(formatMessage({ id: 'PostCatSaveSuccess' }));
        }
      });
    };

    const renameCase = target =>
      setNameModal({
        title: formatMessage({ id: 'PostCatRenameCase' }),
        defaultName: target.name,
        onOk: name => {
          setCases(cases.map(item => (item.id === target.id ? Object.assign({}, item, { name, updatedAt: Date.now() }) : item)));
          setNameModal(null);
        }
      });

    const editOperation = fromKey =>
      openOperationEditor({
        formModal,
        formatMessage,
        doc: data,
        operationKey: fromKey,
        tags: parsed.tags.map(tag => tag.name),
        onOk: ({ method, path, operation: next }) => {
          const toKey = toOperationKey(method, path);
          onDataChange(saveOperation(data, fromKey, { method, path, operation: next }), { fromKey, toKey });
          select(toKey, null);
        }
      });

    const removeOperationChange = key => {
      onDataChange(removeOperation(data, key), { fromKey: key, toKey: null });
      select(null, null);
    };

    const removeCase = target => {
      setCases(cases.filter(item => item.id !== target.id));
      currentCase?.id === target.id && select(operation.key, null);
    };

    const aside = (
      <div className={style['open-api-aside-inner']}>
        {tryIt && (
          <Segmented
            block
            value={asideTab}
            onChange={setAsideTab}
            options={[
              { label: formatMessage({ id: 'PostCatApiTab' }), value: 'api', icon: <ApiOutlined /> },
              {
                label: `${formatMessage({ id: 'PostCatHistoryTab' })}${(historyTotal ?? history.length) ? ` (${historyTotal ?? history.length})` : ''}`,
                value: 'history',
                icon: <HistoryOutlined />
              }
            ]}
          />
        )}
        {tryIt && asideTab === 'history' ? (
          <HistoryList
            history={history}
            total={historyTotal}
            hasMore={historyHasMore}
            onLoadMore={onHistoryLoadMore}
            onSearch={onHistorySearch}
            operationKeys={operationKeys}
            currentId={currentHistory?.id}
            onSelect={item => select(item.operationKey, { type: 'history', id: item.id })}
            onRemove={item => {
              setHistory(history.filter(target => target.id !== item.id));
              currentHistory?.id === item.id && setSelection(null);
            }}
            onClear={() => {
              onHistoryClear && onHistoryClear();
              setHistory([]);
              currentHistory && setSelection(null);
            }}
          />
        ) : (
          <ApiMenu
            data={parsed}
            cases={tryIt ? cases : []}
            caseCounts={tryIt ? caseCounts : {}}
            currentKey={operation?.key}
            onChange={key => select(key, null)}
            onAdd={apiEditable ? () => editOperation(null) : null}
          />
        )}
      </div>
    );

    return (
      <div className={classnames(style['open-api-view'], className)}>
        {messageContextHolder}
        <div
          className={style['open-api-aside']}
          style={stickyTopValue ? { top: stickyTopValue, maxHeight: `calc(100vh - ${stickyTopValue} - 16px)` } : undefined}
        >
          {aside}
        </div>
        <Drawer open={menuOpen} footer={null} placement="left" title={formatMessage({ id: 'PostCatApiList' })} onClose={() => setMenuOpen(false)}>
          {aside}
        </Drawer>
        <div className={style['open-api-main']}>
          <ApiHeader data={parsed} />
          <Button className={style['open-api-menu-trigger']} icon={<UnorderedListOutlined />} onClick={() => setMenuOpen(true)}>
            {formatMessage({ id: 'PostCatApiList' })}
          </Button>
          {operation ? (
            <ApiItem
              operation={operation}
              servers={parsed.servers}
              envs={envs}
              tryIt={tryIt}
              tryItKey={`${operation.key}:${tryItVersion}`}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              record={record}
              cases={cases.filter(item => item.operationKey === operation.key)}
              caseTotal={caseCounts ? caseCounts[operation.key] || 0 : undefined}
              onLoadMoreCases={onCasesLoadMore ? () => onCasesLoadMore(operation.key) : undefined}
              currentCase={currentCase && currentCase.operationKey === operation.key ? currentCase : null}
              onSelectCase={id => select(operation.key, id ? { type: 'case', id } : null)}
              caseActionsOpen={caseActionsOpen}
              onSaveCase={saveCase}
              onRenameCase={renameCase}
              onRemoveCase={removeCase}
              onEditOperation={apiEditable ? () => editOperation(operation.key) : null}
              onRemoveOperation={apiEditable ? () => removeOperationChange(operation.key) : null}
              onSend={item => setHistory(list => [item, ...(list || [])].slice(0, maxHistory))}
            />
          ) : (
            <Empty description={formatMessage({ id: 'PostCatNoApi' })}>
              {apiEditable && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => editOperation(null)}>
                  {formatMessage({ id: 'PostCatAddApi' })}
                </Button>
              )}
            </Empty>
          )}
        </div>
        <CaseNameModal
          open={!!nameModal}
          title={nameModal?.title}
          defaultName={nameModal?.defaultName}
          onOk={name => nameModal.onOk(name)}
          onCancel={() => setNameModal(null)}
        />
      </div>
    );
  })
);

export default OpenApiView;

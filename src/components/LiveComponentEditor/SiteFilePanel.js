import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Flex, Input, Modal, Select, Space, Spin, Typography, Dropdown } from 'antd';
import {
  FolderAddOutlined,
  FileAddOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  PlusOutlined,
  MoreOutlined,
  MenuFoldOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  CheckCircleFilled,
  DisconnectOutlined,
  LoadingOutlined,
  LinkOutlined,
  DragOutlined
} from '@ant-design/icons';
import FileSystemView from '@kne/file-system-view';
import '@kne/file-system-view/dist/index.css';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import {
  createSiteApi,
  DEFAULT_USER_SITES_STORAGE_KEY,
  findParentId,
  flattenDirectories,
  collectNodeAndDescendantIds,
  hasDuplicateName,
  isLocalStorageHost,
  isValidFolderTree,
  mergeSites,
  normalizeSite,
  probeSiteConnection,
  readUserSites,
  toFileSystemViewData,
  writeUserSites
} from './siteApi';
import ContentShareModal from './ContentShareModal';
import style from './style.module.scss';

const { Text } = Typography;

const isDirectoryData = data => data?.type === 'directory' || Array.isArray(data?.children);

const resolveErrorMessage = (error, formatMessage, fallbackId) => {
  if (error?.message === 'DUPLICATE_NAME') {
    return formatMessage({ id: 'MsgDuplicateName' });
  }
  if (error?.message === 'Cannot remove non-empty folder') {
    return formatMessage({ id: 'MsgRemoveNonEmpty' });
  }
  if (error?.message === 'INVALID_MOVE_TARGET') {
    return formatMessage({ id: 'MsgInvalidMoveTarget' });
  }
  return error?.message || formatMessage({ id: fallbackId });
};

const SiteTypeIcon = ({ host, className, title }) => {
  if (isLocalStorageHost(host)) {
    return <DatabaseOutlined className={className} title={title} />;
  }
  return <CloudServerOutlined className={className} title={title} />;
};

/** 远程站点连通状态：绿=通，红=不通，灰转圈=检测中 */
const SiteConnectionIcon = ({ status, formatMessage }) => {
  let icon = null;
  if (status === 'checking') {
    icon = (
      <LoadingOutlined
        className={`${style['site-conn-icon']} ${style['site-conn-checking']}`}
        title={formatMessage({ id: 'SiteStatusChecking' })}
      />
    );
  } else if (status === 'ok') {
    icon = (
      <CheckCircleFilled
        className={`${style['site-conn-icon']} ${style['site-conn-ok']}`}
        title={formatMessage({ id: 'SiteStatusConnected' })}
      />
    );
  } else if (status === 'fail') {
    icon = (
      <DisconnectOutlined
        className={`${style['site-conn-icon']} ${style['site-conn-fail']}`}
        title={formatMessage({ id: 'SiteStatusDisconnected' })}
      />
    );
  }
  if (!icon) {
    return null;
  }
  return <span className={style['site-conn']}>{icon}</span>;
};

const SiteFilePanel = ({
  sites = [],
  onSitesChange,
  siteActionsOpen = true,
  userSitesStorageKey = DEFAULT_USER_SITES_STORAGE_KEY,
  currentFile,
  onOpenFile,
  onCurrentFileChange,
  onActiveHostChange,
  height = 500,
  refreshToken = 0,
  onCollapse
}) => {
  const { formatMessage } = useIntl();
  const { message, modal } = App.useApp();
  const storageKey = String(userSitesStorageKey || '').trim() || DEFAULT_USER_SITES_STORAGE_KEY;
  const [userSites, setUserSites] = useState(() => readUserSites(storageKey));
  const [activeHost, setActiveHost] = useState(() => {
    const merged = mergeSites(sites, readUserSites(storageKey));
    return merged[0]?.host;
  });
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [siteModal, setSiteModal] = useState(null);
  const [contentShareModal, setContentShareModal] = useState(null);
  // host -> 'ok' | 'fail' | 'checking'
  const [siteStatus, setSiteStatus] = useState({});

  const propSites = useMemo(
    () => (Array.isArray(sites) ? sites.map(normalizeSite).filter(item => item.host) : []),
    [sites]
  );
  const propHostSet = useMemo(() => new Set(propSites.map(item => item.host)), [propSites]);
  const innerSites = useMemo(() => mergeSites(propSites, userSites), [propSites, userSites]);
  const activeSite = innerSites.find(item => item.host === activeHost) || innerSites[0];
  const canManageActiveSite = !!(activeSite && !propHostSet.has(activeSite.host));
  const remoteHostsKey = useMemo(
    () =>
      innerSites
        .filter(item => !isLocalStorageHost(item.host))
        .map(item => item.host)
        .join('\0'),
    [innerSites]
  );

  const persistUserSites = useRefCallback(nextUserSites => {
    const normalized = writeUserSites(nextUserSites, storageKey);
    setUserSites(normalized);
    return normalized;
  });

  // storageKey 变更时从对应 key 重新加载用户站点
  useEffect(() => {
    setUserSites(readUserSites(storageKey));
  }, [storageKey]);

  const setHostStatus = useRefCallback((host, status) => {
    setSiteStatus(prev => (prev[host] === status ? prev : { ...prev, [host]: status }));
  });

  const probeSite = useRefCallback(async host => {
    if (!host || isLocalStorageHost(host)) {
      return;
    }
    setHostStatus(host, 'checking');
    const result = await probeSiteConnection(host);
    setHostStatus(host, result.ok ? 'ok' : 'fail');
    return result;
  });

  useEffect(() => {
    onSitesChange?.(innerSites);
  }, [innerSites, onSitesChange]);

  // 远程站点列表变化时探测连通性
  useEffect(() => {
    if (!remoteHostsKey) {
      return;
    }
    remoteHostsKey.split('\0').forEach(host => {
      if (host) {
        probeSite(host);
      }
    });
  }, [remoteHostsKey, probeSite]);

  const api = useMemo(() => (activeHost ? createSiteApi(activeHost) : null), [activeHost]);

  const refreshTree = useRefCallback(async () => {
    if (!api || !activeHost) {
      setTree([]);
      return;
    }
    setLoading(true);
    if (!isLocalStorageHost(activeHost)) {
      setHostStatus(activeHost, 'checking');
    }
    try {
      const data = await api.getFolderTree();
      if (!isLocalStorageHost(activeHost) && !isValidFolderTree(data)) {
        setHostStatus(activeHost, 'fail');
        setTree([]);
        message.error(formatMessage({ id: 'MsgSiteTreeInvalid' }));
        return;
      }
      if (!isLocalStorageHost(activeHost)) {
        setHostStatus(activeHost, 'ok');
      }
      setTree(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (!isLocalStorageHost(activeHost)) {
        setHostStatus(activeHost, 'fail');
      }
      message.error(error.message || formatMessage({ id: 'MsgLoadTreeFail' }));
      setTree([]);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!innerSites.length) {
      setActiveHost(undefined);
      setTree([]);
      return;
    }
    if (!innerSites.some(item => item.host === activeHost)) {
      setActiveHost(innerSites[0].host);
    }
  }, [innerSites, activeHost]);

  useEffect(() => {
    onActiveHostChange?.(activeHost || null);
  }, [activeHost, onActiveHostChange]);

  useEffect(() => {
    refreshTree();
  }, [activeHost, refreshTree, refreshToken]);

  const viewData = useMemo(() => toFileSystemViewData(tree), [tree]);

  const selectedPath = useMemo(() => {
    if (!currentFile || currentFile.siteHost !== activeHost) {
      return undefined;
    }
    const walk = (nodes, prefix = '') => {
      for (const node of nodes || []) {
        const path = prefix ? `${prefix}/${node.name}` : node.name;
        if (node.id === currentFile.id) {
          return path;
        }
        if (node.children?.length) {
          const found = walk(node.children, path);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };
    return walk(tree);
  }, [tree, currentFile, activeHost]);

  const handleFileClick = useRefCallback(async data => {
    if (!api || data.type === 'directory') {
      return;
    }
    try {
      const file = await api.get(data.id);
      const content = typeof file === 'string' ? file : file?.content ?? '';
      onOpenFile?.({
        siteHost: activeHost,
        id: data.id,
        name: data.name,
        permission: data.permission || file?.permission || 'rw',
        content
      });
    } catch (error) {
      console.error(error);
      message.error(error.message || formatMessage({ id: 'MsgLoadFileFail' }));
    }
  });

  const openCreateModal = useCallback(
    (type, parentNode) => {
      if (parentNode && parentNode.permission === 'r') {
        message.warning(formatMessage({ id: 'MsgReadOnly' }));
        return;
      }
      const underDirectory = parentNode && isDirectoryData(parentNode);
      setCreateModal({
        type,
        parentId: underDirectory ? parentNode.id : null,
        parentName: underDirectory ? parentNode.name : '',
        name: type === 'directory' ? 'new-folder' : 'untitled.live'
      });
    },
    [formatMessage, message]
  );

  const handleCreateConfirm = useRefCallback(async () => {
    if (!api || !createModal?.name?.trim()) {
      return;
    }
    const name = createModal.name.trim();
    if (hasDuplicateName(tree, createModal.parentId, name)) {
      message.error(formatMessage({ id: 'MsgDuplicateName' }));
      return;
    }
    try {
      if (createModal.type === 'directory') {
        await api.createFolder({ parentId: createModal.parentId, name });
      } else {
        await api.create({ parentId: createModal.parentId, name, content: '' });
      }
      message.success(formatMessage({ id: 'MsgCreateSuccess' }));
      setCreateModal(null);
      await refreshTree();
    } catch (error) {
      console.error(error);
      message.error(resolveErrorMessage(error, formatMessage, 'MsgCreateFail'));
    }
  });

  const openRenameModal = useCallback(
    data => {
      if (!data) {
        return;
      }
      if (data.permission === 'r') {
        message.warning(formatMessage({ id: 'MsgReadOnly' }));
        return;
      }
      setRenameModal({
        id: data.id,
        name: data.name,
        parentId: findParentId(tree, data.id)
      });
    },
    [formatMessage, message, tree]
  );

  const openMoveModal = useCallback(
    data => {
      if (!data) {
        return;
      }
      if (data.permission === 'r') {
        message.warning(formatMessage({ id: 'MsgReadOnly' }));
        return;
      }
      const currentParentId = findParentId(tree, data.id);
      const excludeIds = isDirectoryData(data) ? collectNodeAndDescendantIds(tree, data.id) : [];
      const options = flattenDirectories(tree, '', excludeIds).filter(item => {
        const optionId = item.id || null;
        return optionId !== currentParentId;
      });
      if (!options.length) {
        message.warning(formatMessage({ id: 'MsgNoMoveTarget' }));
        return;
      }
      setMoveModal({
        id: data.id,
        name: data.name,
        currentParentId,
        parentId: options[0].id,
        options
      });
    },
    [formatMessage, message, tree]
  );

  const handleRenameConfirm = useRefCallback(async () => {
    if (!api || !renameModal?.name?.trim()) {
      return;
    }
    const name = renameModal.name.trim();
    if (hasDuplicateName(tree, renameModal.parentId, name, renameModal.id)) {
      message.error(formatMessage({ id: 'MsgDuplicateName' }));
      return;
    }
    try {
      await api.rename({ id: renameModal.id, name });
      if (currentFile?.id === renameModal.id && currentFile?.siteHost === activeHost) {
        onCurrentFileChange?.({ ...currentFile, name });
      }
      message.success(formatMessage({ id: 'MsgRenameSuccess' }));
      setRenameModal(null);
      await refreshTree();
    } catch (error) {
      console.error(error);
      message.error(resolveErrorMessage(error, formatMessage, 'MsgRenameFail'));
    }
  });

  const handleMoveConfirm = useRefCallback(async () => {
    if (!api || !moveModal) {
      return;
    }
    const targetParentId = moveModal.parentId || null;
    if (targetParentId === moveModal.currentParentId) {
      message.error(formatMessage({ id: 'MsgInvalidMoveTarget' }));
      return;
    }
    const selected = moveModal.options.find(item => item.id === (moveModal.parentId || ''));
    if (selected?.permission === 'r') {
      message.warning(formatMessage({ id: 'MsgReadOnly' }));
      return;
    }
    if (hasDuplicateName(tree, targetParentId, moveModal.name, moveModal.id)) {
      message.error(formatMessage({ id: 'MsgDuplicateName' }));
      return;
    }
    try {
      await api.move({ id: moveModal.id, parentId: targetParentId });
      message.success(formatMessage({ id: 'MsgMoveSuccess' }));
      setMoveModal(null);
      await refreshTree();
    } catch (error) {
      console.error(error);
      message.error(resolveErrorMessage(error, formatMessage, 'MsgMoveFail'));
    }
  });

  const handleRemove = useRefCallback((data, key) => {
    if (!api) {
      return;
    }
    if (data.permission === 'r') {
      message.warning(formatMessage({ id: 'MsgReadOnly' }));
      return;
    }
    modal.confirm({
      title: formatMessage({ id: 'ConfirmRemoveTitle' }),
      content: formatMessage({ id: 'ConfirmRemoveContent' }, { name: data.name || key }),
      onOk: async () => {
        try {
          await api.remove({ ids: [data.id] });
          if (currentFile?.id === data.id && currentFile?.siteHost === activeHost) {
            onCurrentFileChange?.(null);
          }
          message.success(formatMessage({ id: 'MsgRemoveSuccess' }));
          await refreshTree();
        } catch (error) {
          console.error(error);
          message.error(resolveErrorMessage(error, formatMessage, 'MsgRemoveFail'));
        }
      }
    });
  });

  const menuItems = useMemo(
    () => [
      {
        label: formatMessage({ id: 'MenuNewFile' }),
        icon: <FileAddOutlined />,
        disabled: data => data.permission === 'r' || !isDirectoryData(data),
        onClick: data => openCreateModal('file', data)
      },
      {
        label: formatMessage({ id: 'MenuNewFolder' }),
        icon: <FolderAddOutlined />,
        disabled: data => data.permission === 'r' || !isDirectoryData(data),
        onClick: data => openCreateModal('directory', data)
      },
      {
        label: formatMessage({ id: 'CopyContentUrl' }),
        icon: <LinkOutlined />,
        // 仅远程站点文件可分享内容地址
        disabled: data => isDirectoryData(data) || !activeHost || isLocalStorageHost(activeHost),
        onClick: data => {
          if (!data?.id || !activeHost || isLocalStorageHost(activeHost) || isDirectoryData(data)) {
            return;
          }
          setContentShareModal({
            siteHost: activeHost,
            fileId: data.id,
            fileName: data.name
          });
        }
      },
      {
        label: formatMessage({ id: 'MenuRename' }),
        icon: <EditOutlined />,
        disabled: data => data.permission === 'r',
        onClick: data => openRenameModal(data)
      },
      {
        label: formatMessage({ id: 'MenuMoveTo' }),
        icon: <DragOutlined />,
        disabled: data => data.permission === 'r',
        onClick: data => openMoveModal(data)
      },
      {
        label: formatMessage({ id: 'MenuRemove' }),
        icon: <DeleteOutlined />,
        danger: true,
        disabled: data => data.permission === 'r',
        onClick: (data, key) => handleRemove(data, key)
      }
    ],
    [activeHost, formatMessage, handleRemove, openCreateModal, openMoveModal, openRenameModal]
  );

  const openAddSiteModal = useCallback(() => {
    setSiteModal({ mode: 'add', name: '', host: 'localStorage:' });
  }, []);

  const openEditSiteModal = useCallback(() => {
    if (!activeSite || propHostSet.has(activeSite.host)) {
      return;
    }
    setSiteModal({
      mode: 'edit',
      name: activeSite.name || '',
      host: activeSite.host || '',
      originHost: activeSite.host
    });
  }, [activeSite, propHostSet]);

  const handleSiteModalConfirm = useRefCallback(() => {
    if (!siteModal) {
      return;
    }
    const next = normalizeSite(siteModal);
    if (!next.host) {
      message.warning(formatMessage({ id: 'SiteHostPlaceholder' }));
      return;
    }
    if (!next.name) {
      message.warning(formatMessage({ id: 'SiteNamePlaceholder' }));
      return;
    }

    if (siteModal.mode === 'add') {
      if (innerSites.some(item => item.host === next.host)) {
        message.error(formatMessage({ id: 'MsgDuplicateSite' }));
        return;
      }
      persistUserSites([...userSites, next]);
      setActiveHost(next.host);
      setSiteModal(null);
      message.success(formatMessage({ id: 'MsgSiteCreateSuccess' }));
      if (!isLocalStorageHost(next.host)) {
        probeSite(next.host);
      }
      return;
    }

    const originHost = siteModal.originHost;
    if (propHostSet.has(originHost)) {
      message.warning(formatMessage({ id: 'MsgSiteReadonly' }));
      return;
    }
    if (next.host !== originHost && innerSites.some(item => item.host === next.host)) {
      message.error(formatMessage({ id: 'MsgDuplicateSite' }));
      return;
    }
    persistUserSites(userSites.map(item => (item.host === originHost ? next : item)));
    setActiveHost(next.host);
    if (currentFile?.siteHost === originHost) {
      onCurrentFileChange?.({ ...currentFile, siteHost: next.host });
    }
    setSiteModal(null);
    message.success(formatMessage({ id: 'MsgSiteUpdateSuccess' }));
    if (originHost !== next.host) {
      setSiteStatus(prev => {
        const nextStatus = { ...prev };
        delete nextStatus[originHost];
        return nextStatus;
      });
    }
    if (!isLocalStorageHost(next.host)) {
      probeSite(next.host);
    }
  });

  const handleRemoveSite = useRefCallback(() => {
    if (!activeSite || propHostSet.has(activeSite.host)) {
      message.warning(formatMessage({ id: 'MsgSiteReadonly' }));
      return;
    }
    modal.confirm({
      title: formatMessage({ id: 'ConfirmRemoveSiteTitle' }),
      content: formatMessage({ id: 'ConfirmRemoveSiteContent' }, { name: activeSite.name || activeSite.host }),
      onOk: () => {
        const removedHost = activeSite.host;
        const next = userSites.filter(item => item.host !== removedHost);
        const merged = mergeSites(propSites, persistUserSites(next));
        setSiteStatus(prev => {
          if (!(removedHost in prev)) {
            return prev;
          }
          const nextStatus = { ...prev };
          delete nextStatus[removedHost];
          return nextStatus;
        });
        if (currentFile?.siteHost === removedHost) {
          onCurrentFileChange?.(null);
        }
        if (merged[0]) {
          setActiveHost(merged[0].host);
        }
        message.success(formatMessage({ id: 'MsgSiteRemoveSuccess' }));
      }
    });
  });

  const siteActionMenu = useMemo(
    () => ({
      items: [
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: formatMessage({ id: 'MenuEditSite' }),
          disabled: !canManageActiveSite,
          onClick: openEditSiteModal
        },
        {
          key: 'remove',
          icon: <DeleteOutlined />,
          danger: true,
          label: formatMessage({ id: 'MenuRemoveSite' }),
          disabled: !canManageActiveSite,
          onClick: handleRemoveSite
        }
      ]
    }),
    [canManageActiveSite, formatMessage, handleRemoveSite, openEditSiteModal]
  );

  const siteOptions = useMemo(
    () =>
      innerSites.map(site => ({
        value: site.host,
        label: (
          <Flex align="center" gap={6} className={style['site-option']}>
            <SiteTypeIcon
              host={site.host}
              className={style['site-type-icon']}
              title={formatMessage({
                id: isLocalStorageHost(site.host) ? 'SiteTypeLocal' : 'SiteTypeRemote'
              })}
            />
            <span className={style['site-option-name']}>{site.name || site.host}</span>
            {!isLocalStorageHost(site.host) ? (
              <SiteConnectionIcon status={siteStatus[site.host]} formatMessage={formatMessage} />
            ) : null}
          </Flex>
        )
      })),
    [formatMessage, innerSites, siteStatus]
  );

  return (
    <div className={style['site-panel']} style={{ height: `${height + 120}px` }}>
      <Flex vertical gap={8} style={{ height: '100%' }}>
        <Flex justify="space-between" align="center" gap={8}>
          <Text strong ellipsis>
            {formatMessage({ id: 'SitesTitle' })}
          </Text>
          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={<FileAddOutlined />}
              title={formatMessage({ id: 'MenuNewFile' })}
              onClick={() => openCreateModal('file', null)}
            />
            <Button
              type="text"
              size="small"
              icon={<FolderAddOutlined />}
              title={formatMessage({ id: 'MenuNewFolder' })}
              onClick={() => openCreateModal('directory', null)}
            />
            <Button type="text" size="small" icon={<ReloadOutlined />} onClick={refreshTree} />
            {onCollapse ? (
              <Button
                type="text"
                size="small"
                icon={<MenuFoldOutlined />}
                title={formatMessage({ id: 'SitesCollapse' })}
                aria-label={formatMessage({ id: 'SitesCollapse' })}
                onClick={onCollapse}
              />
            ) : null}
          </Space>
        </Flex>
        <Flex gap={4} align="center">
          <Select
            value={activeHost}
            options={siteOptions}
            onChange={setActiveHost}
            style={{ flex: 1, minWidth: 0 }}
            placeholder={formatMessage({ id: 'SiteSelectPlaceholder' })}
            allowClear={false}
          />
          {siteActionsOpen ? (
            <>
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                title={formatMessage({ id: 'MenuAddSite' })}
                onClick={openAddSiteModal}
              />
              <Dropdown menu={siteActionMenu} trigger={['click']}>
                <Button type="text" size="small" icon={<MoreOutlined />} title={formatMessage({ id: 'SiteActions' })} />
              </Dropdown>
            </>
          ) : null}
        </Flex>
        {activeSite ? (
          <Flex align="center" gap={6} className={style['site-host-row']}>
            <SiteTypeIcon
              host={activeSite.host}
              className={style['site-type-icon']}
              title={formatMessage({
                id: isLocalStorageHost(activeSite.host) ? 'SiteTypeLocal' : 'SiteTypeRemote'
              })}
            />
            <Text type="secondary" ellipsis className={style['site-host']}>
              {activeSite.host}
            </Text>
            {!isLocalStorageHost(activeSite.host) ? (
              <SiteConnectionIcon status={siteStatus[activeSite.host]} formatMessage={formatMessage} />
            ) : null}
          </Flex>
        ) : null}
        <div className={style['site-tree']}>
          <Spin spinning={loading}>
            {innerSites.length ? (
              <FileSystemView data={viewData} menuItems={menuItems} defaultExpandAll selectedPath={selectedPath} onFileClick={handleFileClick} />
            ) : (
              <Text type="secondary">{formatMessage({ id: 'SitesEmpty' })}</Text>
            )}
          </Spin>
        </div>
      </Flex>

      <Modal
        title={
          createModal?.parentName
            ? formatMessage(
                { id: createModal?.type === 'directory' ? 'CreateFolderUnder' : 'CreateFileUnder' },
                { name: createModal.parentName }
              )
            : createModal?.type === 'directory'
              ? formatMessage({ id: 'MenuNewFolder' })
              : formatMessage({ id: 'MenuNewFile' })
        }
        open={!!createModal}
        onCancel={() => setCreateModal(null)}
        onOk={handleCreateConfirm}
        destroyOnClose>
        <Input
          value={createModal?.name || ''}
          onChange={e => setCreateModal(prev => (prev ? { ...prev, name: e.target.value } : prev))}
          placeholder={formatMessage({ id: 'NamePlaceholder' })}
          onPressEnter={handleCreateConfirm}
        />
      </Modal>

      <Modal
        title={formatMessage({ id: 'MenuRename' })}
        open={!!renameModal}
        onCancel={() => setRenameModal(null)}
        onOk={handleRenameConfirm}
        destroyOnClose>
        <Input
          value={renameModal?.name || ''}
          onChange={e => setRenameModal(prev => (prev ? { ...prev, name: e.target.value } : prev))}
          placeholder={formatMessage({ id: 'NamePlaceholder' })}
          onPressEnter={handleRenameConfirm}
        />
      </Modal>

      <Modal
        title={formatMessage({ id: 'MoveToTitle' }, { name: moveModal?.name || '' })}
        open={!!moveModal}
        onCancel={() => setMoveModal(null)}
        onOk={handleMoveConfirm}
        destroyOnClose>
        <Flex vertical gap={8}>
          <Text type="secondary">{formatMessage({ id: 'MoveToHint' })}</Text>
          <Select
            value={moveModal?.parentId ?? ''}
            options={(moveModal?.options || []).map(item => ({ value: item.id, label: item.label }))}
            onChange={value => setMoveModal(prev => (prev ? { ...prev, parentId: value } : prev))}
            placeholder={formatMessage({ id: 'MoveToPlaceholder' })}
            style={{ width: '100%' }}
          />
        </Flex>
      </Modal>

      <Modal
        title={formatMessage({ id: siteModal?.mode === 'edit' ? 'MenuEditSite' : 'MenuAddSite' })}
        open={!!siteModal}
        onCancel={() => setSiteModal(null)}
        onOk={handleSiteModalConfirm}
        destroyOnClose>
        <Flex vertical gap={12}>
          <Input
            value={siteModal?.name || ''}
            onChange={e => setSiteModal(prev => (prev ? { ...prev, name: e.target.value } : prev))}
            placeholder={formatMessage({ id: 'SiteNamePlaceholder' })}
          />
          <Input
            value={siteModal?.host || ''}
            onChange={e => setSiteModal(prev => (prev ? { ...prev, host: e.target.value } : prev))}
            placeholder={formatMessage({ id: 'SiteHostPlaceholder' })}
            onPressEnter={handleSiteModalConfirm}
          />
        </Flex>
      </Modal>

      <ContentShareModal
        open={!!contentShareModal}
        siteHost={contentShareModal?.siteHost}
        fileId={contentShareModal?.fileId}
        fileName={contentShareModal?.fileName}
        onCancel={() => setContentShareModal(null)}
      />
    </div>
  );
};

export const SaveAsModal = ({ open, sites, defaultHost, onCancel, onOk }) => {
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const [host, setHost] = useState(defaultHost || sites[0]?.host);
  const [parentId, setParentId] = useState('');
  const [name, setName] = useState('untitled.live');
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setHost(defaultHost || sites[0]?.host);
      setParentId('');
      setName('untitled.live');
    }
  }, [open, defaultHost, sites]);

  useEffect(() => {
    if (!open || !host) {
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const api = createSiteApi(host);
        const data = await api.getFolderTree();
        if (!cancelled) {
          setTree(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          message.error(error.message || formatMessage({ id: 'MsgLoadTreeFail' }));
          setTree([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, host, formatMessage, message]);

  const dirOptions = useMemo(() => flattenDirectories(tree), [tree]);

  const siteOptions = useMemo(
    () =>
      (sites || []).map(site => ({
        value: site.host,
        label: (
          <Flex align="center" gap={6} className={style['site-option']}>
            <SiteTypeIcon host={site.host} className={style['site-type-icon']} />
            <span className={style['site-option-name']}>{site.name || site.host}</span>
          </Flex>
        )
      })),
    [sites]
  );

  return (
    <Modal
      title={formatMessage({ id: 'SaveAs' })}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => {
        const selected = dirOptions.find(item => item.id === parentId);
        if (selected?.permission === 'r') {
          message.warning(formatMessage({ id: 'MsgReadOnly' }));
          return;
        }
        if (!name.trim()) {
          message.warning(formatMessage({ id: 'NamePlaceholder' }));
          return;
        }
        if (hasDuplicateName(tree, parentId || null, name.trim())) {
          message.error(formatMessage({ id: 'MsgDuplicateName' }));
          return;
        }
        onOk?.({ host, parentId: parentId || null, name: name.trim() });
      }}
      destroyOnClose>
      <Flex vertical gap={12}>
        <Select
          value={host}
          options={siteOptions}
          onChange={value => {
            setHost(value);
            setParentId('');
          }}
        />
        <Select
          value={parentId}
          options={dirOptions.map(item => ({ value: item.id, label: item.label }))}
          onChange={setParentId}
          loading={loading}
        />
        <Input value={name} onChange={e => setName(e.target.value)} placeholder={formatMessage({ id: 'NamePlaceholder' })} />
      </Flex>
    </Modal>
  );
};

export default SiteFilePanel;

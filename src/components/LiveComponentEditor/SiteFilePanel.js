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
  MenuFoldOutlined
} from '@ant-design/icons';
import FileSystemView from '@kne/file-system-view';
import '@kne/file-system-view/dist/index.css';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import { createSiteApi, findParentId, flattenDirectories, hasDuplicateName, toFileSystemViewData } from './siteApi';
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
  return error?.message || formatMessage({ id: fallbackId });
};

const normalizeSite = site => ({
  host: String(site?.host || '').trim(),
  name: String(site?.name || '').trim() || String(site?.host || '').trim()
});

const SiteFilePanel = ({
  sites = [],
  onSitesChange,
  siteActions = true,
  currentFile,
  onOpenFile,
  onCurrentFileChange,
  height = 500,
  refreshToken = 0,
  onCollapse
}) => {
  const { formatMessage } = useIntl();
  const { message, modal } = App.useApp();
  const [innerSites, setInnerSites] = useState(() => (Array.isArray(sites) ? sites.map(normalizeSite) : []));
  const [activeHost, setActiveHost] = useState(() => sites[0]?.host);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [siteModal, setSiteModal] = useState(null);

  useEffect(() => {
    if (!Array.isArray(sites)) {
      return;
    }
    setInnerSites(sites.map(normalizeSite));
  }, [sites]);

  const updateSites = useRefCallback(nextSites => {
    const normalized = nextSites.map(normalizeSite).filter(item => item.host);
    setInnerSites(normalized);
    onSitesChange?.(normalized);
    return normalized;
  });

  const api = useMemo(() => (activeHost ? createSiteApi(activeHost) : null), [activeHost]);
  const activeSite = innerSites.find(item => item.host === activeHost) || innerSites[0];

  const refreshTree = useRefCallback(async () => {
    if (!api) {
      setTree([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getFolderTree();
      setTree(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
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
        label: formatMessage({ id: 'MenuRename' }),
        icon: <EditOutlined />,
        disabled: data => data.permission === 'r',
        onClick: data => openRenameModal(data)
      },
      {
        label: formatMessage({ id: 'MenuRemove' }),
        icon: <DeleteOutlined />,
        danger: true,
        disabled: data => data.permission === 'r',
        onClick: (data, key) => handleRemove(data, key)
      }
    ],
    [formatMessage, handleRemove, openCreateModal, openRenameModal]
  );

  const openAddSiteModal = useCallback(() => {
    setSiteModal({ mode: 'add', name: '', host: 'localStorage:' });
  }, []);

  const openEditSiteModal = useCallback(() => {
    if (!activeSite) {
      return;
    }
    setSiteModal({
      mode: 'edit',
      name: activeSite.name || '',
      host: activeSite.host || '',
      originHost: activeSite.host
    });
  }, [activeSite]);

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
      const list = updateSites([...innerSites, next]);
      setActiveHost(next.host);
      setSiteModal(null);
      message.success(formatMessage({ id: 'MsgSiteCreateSuccess' }));
      if (!list.length) {
        return;
      }
      return;
    }

    const originHost = siteModal.originHost;
    if (next.host !== originHost && innerSites.some(item => item.host === next.host)) {
      message.error(formatMessage({ id: 'MsgDuplicateSite' }));
      return;
    }
    const list = updateSites(
      innerSites.map(item => (item.host === originHost ? next : item))
    );
    setActiveHost(next.host);
    if (currentFile?.siteHost === originHost) {
      onCurrentFileChange?.({ ...currentFile, siteHost: next.host });
    }
    setSiteModal(null);
    message.success(formatMessage({ id: 'MsgSiteUpdateSuccess' }));
    return list;
  });

  const handleRemoveSite = useRefCallback(() => {
    if (!activeSite) {
      return;
    }
    modal.confirm({
      title: formatMessage({ id: 'ConfirmRemoveSiteTitle' }),
      content: formatMessage({ id: 'ConfirmRemoveSiteContent' }, { name: activeSite.name || activeSite.host }),
      onOk: () => {
        const next = innerSites.filter(item => item.host !== activeSite.host);
        updateSites(next);
        if (currentFile?.siteHost === activeSite.host) {
          onCurrentFileChange?.(null);
        }
        if (next[0]) {
          setActiveHost(next[0].host);
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
          disabled: !activeSite,
          onClick: openEditSiteModal
        },
        {
          key: 'remove',
          icon: <DeleteOutlined />,
          danger: true,
          label: formatMessage({ id: 'MenuRemoveSite' }),
          disabled: !activeSite,
          onClick: handleRemoveSite
        }
      ]
    }),
    [activeSite, formatMessage, handleRemoveSite, openEditSiteModal]
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
            options={innerSites.map(site => ({ value: site.host, label: site.name || site.host }))}
            onChange={setActiveHost}
            style={{ flex: 1, minWidth: 0 }}
            placeholder={formatMessage({ id: 'SiteSelectPlaceholder' })}
            allowClear={false}
          />
          {siteActions ? (
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
          <Text type="secondary" ellipsis className={style['site-host']}>
            {activeSite.host}
          </Text>
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
          options={sites.map(site => ({ value: site.host, label: site.name || site.host }))}
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

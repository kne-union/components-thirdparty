import { useMemo, useState } from 'react';
import { App, Button, Empty, Flex, Modal, Space, Spin, Typography } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FolderAddOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import FileSystemView from '@kne/file-system-view';
import '@kne/file-system-view/dist/index.css';
import { SchemaRenderer, normalizeSchema } from '@kne/form-creator';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import { extractSchemaFromPayload, isDirectoryNode } from './templateApi';
import style from './style.module.scss';

const { Text } = Typography;

const TemplateListPanel = ({
  tree = [],
  loading = false,
  onReload,
  resolveSchema,
  onApply,
  canAddFolder = false,
  canEditFolder = false,
  canRemoveFolder = false,
  onAddFolder,
  onRenameFolder,
  onRemoveFolder
}) => {
  const { formatMessage } = useIntl();
  const { message, modal } = App.useApp();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSchema, setPreviewSchema] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadSchema = useRefCallback(async node => {
    if (resolveSchema) {
      return resolveSchema(node);
    }
    return extractSchemaFromPayload(node);
  });

  const handlePreview = useRefCallback(async node => {
    if (isDirectoryNode(node)) {
      return;
    }
    setActionLoading(true);
    try {
      const schema = await loadSchema(node);
      if (!schema) {
        message.error(formatMessage({ id: 'TemplateSchemaInvalid' }));
        return;
      }
      setPreviewSchema(normalizeSchema(schema));
      setPreviewTitle(node.name || formatMessage({ id: 'TemplatePreview' }));
      setPreviewOpen(true);
    } catch (error) {
      console.error(error);
      message.error(error?.message || formatMessage({ id: 'TemplateLoadFail' }));
    } finally {
      setActionLoading(false);
    }
  });

  const handleApply = useRefCallback(async node => {
    if (isDirectoryNode(node)) {
      return;
    }
    setActionLoading(true);
    try {
      const schema = await loadSchema(node);
      if (!schema) {
        message.error(formatMessage({ id: 'TemplateSchemaInvalid' }));
        return;
      }
      onApply?.(normalizeSchema(schema));
      message.success(formatMessage({ id: 'TemplateApplySuccess' }));
    } catch (error) {
      console.error(error);
      message.error(error?.message || formatMessage({ id: 'TemplateLoadFail' }));
    } finally {
      setActionLoading(false);
    }
  });

  const confirmRemove = useRefCallback(node => {
    modal.confirm({
      title: formatMessage({ id: 'FolderDeleteConfirm' }, { name: node.name }),
      okType: 'danger',
      onOk: () => onRemoveFolder?.(node)
    });
  });

  const menuItems = useMemo(() => {
    const items = [
      {
        label: formatMessage({ id: 'TemplatePreview' }),
        icon: <EyeOutlined />,
        disabled: data => isDirectoryNode(data),
        onClick: data => handlePreview(data)
      },
      {
        label: formatMessage({ id: 'TemplateApply' }),
        icon: <PlusOutlined />,
        disabled: data => isDirectoryNode(data),
        onClick: data => handleApply(data)
      }
    ];
    if (canAddFolder) {
      items.push({
        label: formatMessage({ id: 'FolderAddChild' }),
        icon: <FolderAddOutlined />,
        disabled: data => !isDirectoryNode(data),
        onClick: data => onAddFolder?.(data)
      });
    }
    if (canEditFolder) {
      items.push({
        label: formatMessage({ id: 'FolderRename' }),
        icon: <EditOutlined />,
        disabled: data => !isDirectoryNode(data),
        onClick: data => onRenameFolder?.(data)
      });
    }
    if (canRemoveFolder) {
      items.push({
        label: formatMessage({ id: 'FolderDelete' }),
        icon: <DeleteOutlined />,
        danger: true,
        disabled: data => !isDirectoryNode(data),
        onClick: data => confirmRemove(data)
      });
    }
    return items;
  }, [
    formatMessage,
    handlePreview,
    handleApply,
    canAddFolder,
    canEditFolder,
    canRemoveFolder,
    onAddFolder,
    onRenameFolder,
    confirmRemove
  ]);

  return (
    <div className={style['template-pane']}>
      <Flex justify="space-between" align="center" className={style['template-pane-header']}>
        <Text strong>{formatMessage({ id: 'TemplateListTitle' })}</Text>
        <Space size={4}>
          {canAddFolder ? (
            <Button
              type="text"
              size="small"
              icon={<FolderAddOutlined />}
              title={formatMessage({ id: 'FolderAdd' })}
              onClick={() => onAddFolder?.(null)}
            />
          ) : null}
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            title={formatMessage({ id: 'TemplateReload' })}
            onClick={() => onReload?.()}
          />
        </Space>
      </Flex>
      <div className={style['template-pane-body']}>
        <Spin spinning={loading || actionLoading}>
          {tree.length ? (
            <FileSystemView
              data={tree}
              menuItems={menuItems}
              defaultExpandAll
              onFileClick={data => handlePreview(data)}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'TemplateListEmpty' })} />
          )}
        </Spin>
      </div>
      <Modal
        title={previewTitle}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={720}
        destroyOnClose
        footer={
          <Space>
            <Button onClick={() => setPreviewOpen(false)}>{formatMessage({ id: 'Cancel' })}</Button>
            <Button
              type="primary"
              onClick={() => {
                if (previewSchema) {
                  onApply?.(previewSchema);
                  message.success(formatMessage({ id: 'TemplateApplySuccess' }));
                }
                setPreviewOpen(false);
              }}
            >
              {formatMessage({ id: 'TemplateApply' })}
            </Button>
          </Space>
        }
      >
        {previewSchema ? <SchemaRenderer schema={previewSchema} preview showActions={false} /> : null}
      </Modal>
    </div>
  );
};

export default TemplateListPanel;

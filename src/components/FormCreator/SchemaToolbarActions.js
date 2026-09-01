import { useRef, useState } from 'react';
import { App, Button, Input, Modal, Space } from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  SaveOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import {
  copySchemaToClipboard,
  downloadSchemaFile,
  parseSchemaJson
} from '@kne/form-creator';
import useRefCallback from '@kne/use-ref-callback';
import withLocale from './withLocale';
import style from './style.module.scss';

const SchemaToolbarActions = withLocale(
  createWithRemoteLoader({
    modules: ['components-core:ButtonGroup']
  })(
    ({
      remoteModules,
      schema,
      onImport,
      showCopy = true,
      showDownload = true,
      showImport = true,
      showUpload = true,
      showSave = false,
      onSave,
      size = 'small',
      downloadFileName = 'form-schema.json',
      extraList = []
    }) => {
      const [ButtonGroup] = remoteModules;
      const { formatMessage } = useIntl();
      const { message } = App.useApp();
      const [importOpen, setImportOpen] = useState(false);
      const [importText, setImportText] = useState('');
      const fileInputRef = useRef(null);

      const closeImportModal = () => {
        setImportOpen(false);
        setImportText('');
      };

      const applyImport = useRefCallback(text => {
        if (!text?.trim()) {
          message.warning(formatMessage({ id: 'schemaImportEmpty' }));
          return false;
        }
        try {
          const normalized = parseSchemaJson(text);
          onImport?.(normalized);
          closeImportModal();
          message.success(formatMessage({ id: 'schemaImportSuccess' }));
          return true;
        } catch {
          message.error(formatMessage({ id: 'schemaImportInvalid' }));
          return false;
        }
      });

      const handleCopy = useRefCallback(async () => {
        try {
          await copySchemaToClipboard(schema);
          message.success(formatMessage({ id: 'schemaExportCopySuccess' }));
        } catch {
          message.error(formatMessage({ id: 'schemaExportCopyFail' }));
        }
      });

      const handleDownload = useRefCallback(() => {
        downloadSchemaFile(schema, downloadFileName);
        message.success(formatMessage({ id: 'schemaExportDownloadSuccess' }));
      });

      const handleImportFromClipboard = useRefCallback(async () => {
        if (!navigator.clipboard?.readText) {
          message.error(formatMessage({ id: 'schemaImportClipboardUnsupported' }));
          return;
        }
        try {
          const text = await navigator.clipboard.readText();
          setImportText(text);
          applyImport(text);
        } catch {
          message.error(formatMessage({ id: 'schemaImportClipboardFail' }));
        }
      });

      const handleFileChange = event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            applyImport(reader.result);
          }
        };
        reader.onerror = () => {
          message.error(formatMessage({ id: 'schemaImportFileFail' }));
        };
        reader.readAsText(file);
      };

      const canImport = showImport || showUpload;
      const list = [];
      if (showCopy) {
        list.push({
          key: 'schema-copy',
          size,
          icon: <CopyOutlined />,
          children: formatMessage({ id: 'schemaExportCopy' }),
          onClick: handleCopy
        });
      }
      if (showDownload) {
        list.push({
          key: 'schema-download',
          size,
          icon: <DownloadOutlined />,
          children: formatMessage({ id: 'schemaExportDownload' }),
          onClick: handleDownload
        });
      }
      if (canImport) {
        list.push({
          key: 'schema-import',
          size,
          icon: <UploadOutlined />,
          children: formatMessage({ id: 'schemaImport' }),
          onClick: () => setImportOpen(true)
        });
      }
      if (showSave) {
        list.push({
          key: 'save-template',
          size,
          icon: <SaveOutlined />,
          children: formatMessage({ id: 'SaveTemplate' }),
          onClick: () => onSave?.()
        });
      }
      extraList.forEach((item, index) => {
        if (!item || item.hidden) {
          return;
        }
        list.push({ size, ...item, key: item.key || `extra-${index}` });
      });

      if (!list.length) {
        return null;
      }

      return (
        <>
          <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFileChange} />
          <ButtonGroup
            showLength={0}
            list={list}
            more={
              <Button
                type="default"
                size="small"
                shape="circle"
                icon={<EllipsisOutlined />}
                className={style['toolbar-more-btn']}
                title={formatMessage({ id: 'schemaMoreActions' })}
              />
            }
          />
          <Modal
            title={formatMessage({ id: 'schemaImportTitle' })}
            open={importOpen}
            onCancel={closeImportModal}
            onOk={() => applyImport(importText)}
            okText={formatMessage({ id: 'Confirm' })}
            cancelText={formatMessage({ id: 'Cancel' })}
            width={640}
            destroyOnClose
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Space size={8} wrap>
                {showImport ? (
                  <Button size="small" onClick={handleImportFromClipboard}>
                    {formatMessage({ id: 'schemaImportFromClipboard' })}
                  </Button>
                ) : null}
                {showUpload ? (
                  <Button size="small" icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                    {formatMessage({ id: 'schemaImportFile' })}
                  </Button>
                ) : null}
              </Space>
              {showImport ? (
                <Input.TextArea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  rows={12}
                  placeholder={formatMessage({ id: 'schemaImportPlaceholder' })}
                />
              ) : (
                <div>{formatMessage({ id: 'schemaImportFileOnlyHint' })}</div>
              )}
            </Space>
          </Modal>
        </>
      );
    }
  )
);

export default SchemaToolbarActions;

import { useRef } from 'react';
import { Modal } from 'antd';
import { useIntl } from '@kne/react-intl';
import LiveComponentEditor from '@components/LiveComponentEditor';
import withLocale from '../withLocale';

const LiveComponentDialog = withLocale(
  ({
    open,
    title,
    defaultValue,
    editorHeight = 520,
    editorLibs,
    sites,
    siteActionsOpen,
    userSitesStorageKey,
    sitePanelWidth,
    onSitesChange,
    transformContentUrl,
    enableSourceLocate,
    onOk,
    onCancel
  }) => {
    const { formatMessage } = useIntl();
    const editorRef = useRef(null);
    const latestValueRef = useRef(defaultValue || '');
    const dialogTitle = title ?? formatMessage({ id: 'LiveComponentDialogTitle' });
    const hasSites = Array.isArray(sites);
    const modalWidth = hasSites ? 'min(1400px, 98vw)' : 'min(1200px, 96vw)';

    return (
      <Modal
        open={open}
        title={dialogTitle}
        width={modalWidth}
        destroyOnClose
        centered
        okText={formatMessage({ id: 'ModalOk' })}
        cancelText={formatMessage({ id: 'ModalCancel' })}
        onCancel={onCancel}
        onOk={() => {
          const value = editorRef.current?.getValue?.() ?? latestValueRef.current;

          onOk?.(value || '');
        }}
      >
        <LiveComponentEditor
          ref={editorRef}
          defaultValue={defaultValue}
          height={editorHeight}
          libs={editorLibs}
          sites={sites}
          siteActionsOpen={siteActionsOpen}
          userSitesStorageKey={userSitesStorageKey}
          width={sitePanelWidth}
          onSitesChange={onSitesChange}
          transformContentUrl={transformContentUrl}
          enableSourceLocate={enableSourceLocate}
          onChange={value => {
            latestValueRef.current = value;
          }}
        />
      </Modal>
    );
  }
);

export default LiveComponentDialog;

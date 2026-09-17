import { useMemo, useRef, useState } from 'react';
import { App, Modal } from 'antd';
import { useIntl } from '@kne/react-intl';
import { FormCreatorField, defaultSchema, hasRenderableContent, normalizeSchema } from '@components/FormCreator';
import withLocale from '../withLocale';

const FormCreatorDialogInner = ({
  open,
  title,
  defaultValue,
  editorProps = {},
  onOk,
  onCancel
}) => {
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const initialSchema = useMemo(
    () => normalizeSchema(defaultValue || defaultSchema()),
    [defaultValue]
  );
  const [schema, setSchema] = useState(initialSchema);
  const latestSchemaRef = useRef(initialSchema);
  const dialogTitle = title ?? formatMessage({ id: 'FormCreatorDialogTitle' });

  return (
    <Modal
      open={open}
      title={dialogTitle}
      width="min(1280px, 96vw)"
      destroyOnClose
      centered
      styles={{ body: { maxHeight: 'min(78vh, 820px)', overflow: 'auto', paddingTop: 12 } }}
      okText={formatMessage({ id: 'ModalOk' })}
      cancelText={formatMessage({ id: 'ModalCancel' })}
      onCancel={onCancel}
      onOk={() => {
        const next = normalizeSchema(latestSchemaRef.current || schema);

        if (!hasRenderableContent(next)) {
          message.warning(formatMessage({ id: 'FormCreatorSchemaEmpty' }));
          return;
        }

        onOk?.(next);
      }}
    >
      <FormCreatorField
        {...editorProps}
        value={schema}
        onChange={next => {
          const normalized = normalizeSchema(next || defaultSchema());
          latestSchemaRef.current = normalized;
          setSchema(normalized);
        }}
      />
    </Modal>
  );
};

const FormCreatorDialog = withLocale(({ open, ...props }) => {
  if (!open) {
    return null;
  }

  return (
    <App>
      <FormCreatorDialogInner open={open} {...props} />
    </App>
  );
});

export default FormCreatorDialog;

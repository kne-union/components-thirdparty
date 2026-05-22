import { useMemo, useState } from 'react';
import { Modal, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import JSONEditor from '@components/JSONEditor';
// 弹窗内须用 Field：默认 JSONEditor 依赖 FormInfo.useDecorator，脱离表单会报错
import withLocale from '../withLocale';
import { DEFAULT_ECHART_OPTION_TEXT } from './constants';
import { parseEchartOptionText } from './optionCodec';

const EchartDialog = withLocale(({ open, title, defaultValue, onOk, onCancel }) => {
  const { formatMessage } = useIntl();
  const initialValue = useMemo(
    () => (defaultValue?.trim() ? defaultValue : DEFAULT_ECHART_OPTION_TEXT),
    [defaultValue]
  );
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const dialogTitle = title ?? formatMessage({ id: 'EchartDialogTitle' });

  const handleOk = () => {
    try {
      parseEchartOptionText(value, { fallbackToDefault: false });
      setError(null);
      onOk?.(value.trim());
    } catch (e) {
      setError(e.message || formatMessage({ id: 'EchartOptionInvalid' }));
    }
  };

  return (
    <Modal
      open={open}
      title={dialogTitle}
      width="min(960px, 94vw)"
      destroyOnClose
      centered
      okText={formatMessage({ id: 'ModalOk' })}
      cancelText={formatMessage({ id: 'ModalCancel' })}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <JSONEditor.Field value={value} onChange={next => setValue(next ?? '')} />
      {error && (
        <Typography.Text type="danger" style={{ display: 'block', marginTop: 8 }}>
          {error}
        </Typography.Text>
      )}
    </Modal>
  );
});

export default EchartDialog;

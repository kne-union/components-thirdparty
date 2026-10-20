import { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const CaseNameModal = withLocale(({ open, title, defaultName = '', onOk, onCancel }) => {
  const { formatMessage } = useIntl();
  const [name, setName] = useState(defaultName);
  useEffect(() => {
    open && setName(defaultName);
  }, [open, defaultName]);
  const submit = () => name.trim() && onOk(name.trim());
  return (
    <Modal open={open} title={title} onOk={submit} onCancel={onCancel} okButtonProps={{ disabled: !name.trim() }} destroyOnHidden>
      <Input
        autoFocus
        value={name}
        maxLength={100}
        placeholder={formatMessage({ id: 'PostCatCaseName' })}
        onChange={e => setName(e.target.value)}
        onPressEnter={submit}
      />
    </Modal>
  );
});

export default CaseNameModal;

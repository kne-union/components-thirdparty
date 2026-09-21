import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import FormCreatorDialog from './FormCreatorDialog';
import FormCreatorGlobalShell from './FormCreatorGlobalShell';

export const openFormCreatorDialog = ({
  title,
  defaultValue,
  editorProps,
  themeToken,
  locale,
  onSubmit,
  onCancel
} = {}) => {
  const host = document.createElement('div');

  host.className = 'ck-form-creator-dialog-root';
  document.body.appendChild(host);

  const root = createRoot(host);

  const destroy = () => {
    root.unmount();
    host.remove();
  };

  const handleCancel = () => {
    onCancel?.();
    destroy();
  };

  const handleOk = value => {
    onSubmit?.(value);
    destroy();
  };

  root.render(
    createElement(
      FormCreatorGlobalShell,
      { themeToken, locale },
      createElement(FormCreatorDialog, {
        open: true,
        title,
        defaultValue,
        editorProps,
        onOk: handleOk,
        onCancel: handleCancel
      })
    )
  );

  return { destroy };
};

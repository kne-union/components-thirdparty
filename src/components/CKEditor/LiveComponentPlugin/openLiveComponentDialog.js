import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import LiveComponentDialog from './LiveComponentDialog';

export const openLiveComponentDialog = ({ title, defaultValue, editorHeight, editorLibs, onSubmit, onCancel } = {}) => {
  const host = document.createElement('div');

  host.className = 'ck-live-component-dialog-root';
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
    createElement(LiveComponentDialog, {
      open: true,
      title,
      defaultValue,
      editorHeight,
      editorLibs,
      onOk: handleOk,
      onCancel: handleCancel
    })
  );

  return { destroy };
};

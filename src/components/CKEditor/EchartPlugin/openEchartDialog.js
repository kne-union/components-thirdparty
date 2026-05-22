import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import EchartDialog from './EchartDialog';

export const openEchartDialog = ({ title, defaultValue, onSubmit, onCancel } = {}) => {
  const host = document.createElement('div');

  host.className = 'ck-echart-dialog-root';
  document.body.appendChild(host);

  const root = createRoot(host);

  const destroy = () => {
    root.unmount();
    host.remove();
  };

  root.render(
    createElement(EchartDialog, {
      open: true,
      title,
      defaultValue,
      onOk: value => {
        onSubmit?.(value);
        destroy();
      },
      onCancel: () => {
        onCancel?.();
        destroy();
      }
    })
  );

  return { destroy };
};

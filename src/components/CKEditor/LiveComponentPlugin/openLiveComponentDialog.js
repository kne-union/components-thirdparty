import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import LiveComponentDialog from './LiveComponentDialog';
import FormCreatorGlobalShell from '../FormCreatorPlugin/FormCreatorGlobalShell';

export const openLiveComponentDialog = ({
  title,
  defaultValue,
  editorHeight,
  editorLibs,
  sites,
  siteActionsOpen,
  userSitesStorageKey,
  sitePanelWidth,
  onSitesChange,
  transformContentUrl,
  enableSourceLocate,
  themeToken,
  locale,
  onSubmit,
  onCancel
} = {}) => {
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
    createElement(
      FormCreatorGlobalShell,
      { themeToken, locale },
      createElement(LiveComponentDialog, {
        open: true,
        title,
        defaultValue,
        editorHeight,
        editorLibs,
        sites,
        siteActionsOpen,
        userSitesStorageKey,
        sitePanelWidth,
        onSitesChange,
        transformContentUrl,
        enableSourceLocate,
        onOk: handleOk,
        onCancel: handleCancel
      })
    )
  );

  return { destroy };
};

import { createRoot } from 'react-dom/client';
import FormCreatorGlobalShell from '../FormCreatorPlugin/FormCreatorGlobalShell';
import { resolveNestedOverlayZIndex } from '../dialogFloatingDropdown';
import MarkdownComponentDialog from './MarkdownComponentDialog';

export const openMarkdownComponentDialog = ({ themeToken, locale, onSubmit, ...dialogProps }) => {
  const host = document.createElement('div');
  document.body.appendChild(host);

  const root = createRoot(host);

  const destroy = () => {
    root.unmount();
    host.remove();
  };

  root.render(
    <FormCreatorGlobalShell themeToken={themeToken} locale={locale}>
      <MarkdownComponentDialog
        {...dialogProps}
        open
        zIndex={resolveNestedOverlayZIndex()}
        onCancel={destroy}
        onOk={source => {
          onSubmit?.(source);
          destroy();
        }}
      />
    </FormCreatorGlobalShell>
  );
};

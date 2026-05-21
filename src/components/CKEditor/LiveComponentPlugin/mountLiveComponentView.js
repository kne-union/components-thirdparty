import { createRoot } from 'react-dom/client';
import LiveComponentView from '@components/LiveComponentView';
import { LIVE_COMPONENT_DEFAULT_HEIGHT } from './constants';

const roots = new WeakMap();

export const mountLiveComponentInHost = (
  host,
  { content, height = LIVE_COMPONENT_DEFAULT_HEIGHT, libs, props: componentProps } = {}
) => {
  if (!host) {
    return;
  }

  const resolvedHeight = typeof height === 'number' ? `${height}px` : height || `${LIVE_COMPONENT_DEFAULT_HEIGHT}px`;

  host.classList.add('ck-live-component-viewer');
  host.style.display = 'block';
  host.style.width = '100%';
  host.style.minHeight = resolvedHeight;
  host.dataset.liveComponentContent = content || '';

  let root = roots.get(host);

  if (!root) {
    root = createRoot(host);
    roots.set(host, root);
  }

  root.render(<LiveComponentView content={content || ''} libs={libs} props={componentProps} />);
};

export const unmountLiveComponentFromHost = host => {
  if (!host) {
    return;
  }

  const root = roots.get(host);

  if (root) {
    root.unmount();
    roots.delete(host);
  }

  host.innerHTML = '';
  delete host.dataset.liveComponentContent;
};

export const remountLiveComponentInHost = (host, options) => {
  unmountLiveComponentFromHost(host);
  mountLiveComponentInHost(host, options);
};

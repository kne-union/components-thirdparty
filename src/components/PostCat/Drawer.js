import { createWithRemoteLoader } from '@kne/remote-loader';

const Drawer = createWithRemoteLoader({
  modules: ['components-core:Drawer']
})(({ remoteModules, ...props }) => {
  const [RemoteDrawer] = remoteModules;
  return <RemoteDrawer {...props} />;
});

export default Drawer;

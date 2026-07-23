const { default: Detail } = _LiveComponentsAdminDetail;
const { createWithRemoteLoader } = remoteLoader;

const mockSite = {
  id: 'demo',
  name: '本地演示站点',
  shorten: 'LOCAL',
  host: 'localStorage:live-components-admin-demo',
  status: 'open',
  defaultPermission: 'rw',
  createdAt: '2026-07-01T10:00:00.000Z'
};

const DetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  const liveComponentsSite = {
    detail: {
      loader: () => Promise.resolve(mockSite)
    }
  };

  // 文档环境用 query 注入 id
  if (typeof window !== 'undefined' && !new URLSearchParams(window.location.search).get('id')) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', mockSite.id);
    window.history.replaceState({}, '', url);
  }

  return (
    <PureGlobal
      preset={{
        apis: { liveComponentsSite },
        ajax: params => {
          if (params?.loader) {
            return Promise.resolve(params.loader(params)).then(data => ({
              data: { code: 0, data }
            }));
          }
          return Promise.resolve({ data: { code: 0, data: null } });
        }
      }}>
      <Layout navigation={{ isFixed: false }}>
        <Detail />
      </Layout>
    </PureGlobal>
  );
});

render(<DetailExample />);

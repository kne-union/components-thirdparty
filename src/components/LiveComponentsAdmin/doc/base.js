const { default: List } = _LiveComponentsAdminList;
const { createWithRemoteLoader } = remoteLoader;

const mockSites = [
  {
    id: '1',
    name: '演示站点',
    shorten: 'ABC123',
    host: '/api/v1/live-components-site/ABC123',
    status: 'open',
    defaultPermission: 'rw',
    createdAt: '2026-07-01T10:00:00.000Z'
  },
  {
    id: '2',
    name: '已关闭站点',
    shorten: 'XYZ789',
    host: '/api/v1/live-components-site/XYZ789',
    status: 'closed',
    defaultPermission: 'r',
    createdAt: '2026-07-10T08:30:00.000Z'
  }
];

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  const liveComponentsSite = {
    list: {
      loader: () => Promise.resolve({ pageData: mockSites, totalCount: mockSites.length })
    },
    create: {
      loader: ({ data }) =>
        Promise.resolve({
          id: String(Date.now()),
          shorten: 'NEW001',
          host: '/api/v1/live-components-site/NEW001',
          status: 'open',
          defaultPermission: 'rw',
          createdAt: new Date().toISOString(),
          ...data
        })
    },
    save: {
      loader: () => Promise.resolve({})
    },
    remove: {
      loader: () => Promise.resolve({})
    },
    detail: {
      loader: ({ params }) => Promise.resolve(mockSites.find(item => item.id === String(params?.id)) || mockSites[0])
    }
  };

  return (
    <PureGlobal
      preset={{
        apis: { liveComponentsSite }
      }}>
      <Layout navigation={{ isFixed: false }}>
        <List />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

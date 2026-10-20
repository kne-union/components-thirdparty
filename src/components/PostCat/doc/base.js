const { default: PostCat, createSiteApi, loadSampleDoc } = _PostCat;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useEffect, useState } = React;

const DEMO_HOST = 'localStorage:postcat-demo';

const seedDemoSite = async () => {
  const api = createSiteApi(DEMO_HOST);
  const tree = await api.getFolderTree();
  if (tree.length === 0) {
    const doc = await loadSampleDoc();
    await api.create({ name: 'petstore.json', content: JSON.stringify(doc, null, 2) });
    await api.create({
      name: 'petstore-online.url',
      content: JSON.stringify({ url: 'https://petstore3.swagger.io/api/v3/openapi.json' }, null, 2)
    });
  }
};

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDemoSite().finally(() => setReady(true));
  }, []);

  return (
    <PureGlobal preset={mockPreset}>
      {ready && (
        <PostCat
          height={720}
          sites={[{ host: DEMO_HOST, name: '本地文档' }]}
          envs={[{ id: 'petstore', name: 'Petstore', baseUrl: 'https://petstore3.swagger.io/api/v3' }]}
        />
      )}
    </PureGlobal>
  );
});

render(<BaseExample />);

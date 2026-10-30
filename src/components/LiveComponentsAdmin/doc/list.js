const { List, Detail } = _LiveComponentsAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Routes, Route } = reactRouterDom;

const ListExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route index element={<List />} />
          <Route path="detail" element={<Detail />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<ListExample />);

const { OpenApiView, loadSampleDoc } = _PostCat;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Spin } = antd;
const { useEffect, useState } = React;

const ViewExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    loadSampleDoc().then(setDoc);
  }, []);

  return (
    <PureGlobal preset={mockPreset}>
      {doc ? (
        <OpenApiView
          data={doc}
          envs={[{ id: 'mock', name: 'Petstore', baseUrl: 'https://petstore3.swagger.io/api/v3', headers: '{"Accept": "application/json"}' }]}
        />
      ) : (
        <Spin />
      )}
    </PureGlobal>
  );
});

render(<ViewExample />);

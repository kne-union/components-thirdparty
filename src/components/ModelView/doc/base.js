const { default: ModelView } = _ModelView;

const BaseExample = () => {
  return (
    <div style={{ height: '800px', width: '600px', margin: '0 auto' }}>
      <ModelView
        src={window.PUBLIC_URL + '/3d/NeilArmstrong.glb'}
        alt="3D汽车模型"
        autoRotate
        cameraControls
        shadowIntensity={1}
        shadowSoftness={0.5}
      />
    </div>
  );
};

render(<BaseExample />);

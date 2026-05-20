export const MODEL3D_STYLES = [
  { name: 'block', title: '居中块级', className: null, isDefault: true },
  { name: 'side', title: '环绕右侧', className: 'image-style-side' },
  { name: 'alignLeft', title: '左浮动', className: 'image-style-align-left' },
  { name: 'alignRight', title: '右浮动', className: 'image-style-align-right' },
  { name: 'alignCenter', title: '居中', className: 'image-style-align-center' },
  { name: 'alignBlockLeft', title: '左对齐', className: 'image-style-block-align-left' },
  { name: 'alignBlockRight', title: '右对齐', className: 'image-style-block-align-right' }
];

export const MODEL3D_RESIZE_OPTIONS = [
  { name: 'resizeModel3d:original', value: null, label: '原始大小', type: 'width' },
  { name: 'resizeModel3d:25', value: '25%', label: '宽度 25%', type: 'width' },
  { name: 'resizeModel3d:50', value: '50%', label: '宽度 50%', type: 'width' },
  { name: 'resizeModel3d:75', value: '75%', label: '宽度 75%', type: 'width' }
];

export const MODEL3D_HEIGHT_OPTIONS = [
  { name: 'resizeModel3dHeight:original', value: null, label: '原始高度' },
  { name: 'resizeModel3dHeight:300', value: '300px', label: '高度 300px' },
  { name: 'resizeModel3dHeight:400', value: '400px', label: '高度 400px' },
  { name: 'resizeModel3dHeight:500', value: '500px', label: '高度 500px' },
  { name: 'resizeModel3dHeight:600', value: '600px', label: '高度 600px' }
];

export const MODEL3D_DEFAULT_HEIGHT = '400px';

export const MODEL3D_ACCEPT = '.glb';

export const isGlbModelFile = file => {
  if (!file) {
    return false;
  }

  const name = file.name?.toLowerCase() ?? '';

  return name.endsWith('.glb') || file.type === 'model/gltf-binary';
};

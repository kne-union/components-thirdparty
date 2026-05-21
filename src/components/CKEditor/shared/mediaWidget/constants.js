export const MEDIA_STYLES = [
  { name: 'block', title: '居中块级', className: null, isDefault: true },
  { name: 'side', title: '环绕右侧', className: 'image-style-side' },
  { name: 'alignLeft', title: '左浮动', className: 'image-style-align-left' },
  { name: 'alignRight', title: '右浮动', className: 'image-style-align-right' },
  { name: 'alignCenter', title: '居中', className: 'image-style-align-center' },
  { name: 'alignBlockLeft', title: '左对齐', className: 'image-style-block-align-left' },
  { name: 'alignBlockRight', title: '右对齐', className: 'image-style-block-align-right' }
];

export const MEDIA_DEFAULT_HEIGHT = '400px';

export const createMediaResizeOptions = prefix => [
  { name: `${prefix}:original`, value: null, label: '原始大小', type: 'width' },
  { name: `${prefix}:25`, value: '25%', label: '宽度 25%', type: 'width' },
  { name: `${prefix}:50`, value: '50%', label: '宽度 50%', type: 'width' },
  { name: `${prefix}:75`, value: '75%', label: '宽度 75%', type: 'width' }
];

export const createMediaHeightOptions = prefix => [
  { name: `${prefix}:original`, value: null, label: '原始高度' },
  { name: `${prefix}:300`, value: '300px', label: '高度 300px' },
  { name: `${prefix}:400`, value: '400px', label: '高度 400px' },
  { name: `${prefix}:500`, value: '500px', label: '高度 500px' },
  { name: `${prefix}:600`, value: '600px', label: '高度 600px' }
];

export const createDefaultMediaToolbar = ({ stylePrefix, resizePrefix }) => [
  `${stylePrefix}:block`,
  `${stylePrefix}:side`,
  `${stylePrefix}:alignLeft`,
  `${stylePrefix}:alignRight`,
  `${stylePrefix}:alignCenter`,
  `${stylePrefix}:alignBlockLeft`,
  `${stylePrefix}:alignBlockRight`,
  '|',
  `${resizePrefix}:25`,
  `${resizePrefix}:50`,
  `${resizePrefix}:75`,
  `${resizePrefix}:original`,
  '|',
  `${resizePrefix}Height:300`,
  `${resizePrefix}Height:400`,
  `${resizePrefix}Height:500`,
  `${resizePrefix}Height:600`,
  `${resizePrefix}Height:original`
];

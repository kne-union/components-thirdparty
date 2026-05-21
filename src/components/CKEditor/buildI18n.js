import { MEDIA_STYLES } from './shared/mediaWidget/constants';

const buildMediaStyles = fm => [
  { name: 'block', title: fm({ id: 'MediaStyleBlock' }), className: null, isDefault: true },
  { name: 'side', title: fm({ id: 'MediaStyleSide' }), className: 'image-style-side' },
  { name: 'alignLeft', title: fm({ id: 'MediaStyleAlignLeft' }), className: 'image-style-align-left' },
  { name: 'alignRight', title: fm({ id: 'MediaStyleAlignRight' }), className: 'image-style-align-right' },
  { name: 'alignCenter', title: fm({ id: 'MediaStyleAlignCenter' }), className: 'image-style-align-center' },
  { name: 'alignBlockLeft', title: fm({ id: 'MediaStyleAlignBlockLeft' }), className: 'image-style-block-align-left' },
  { name: 'alignBlockRight', title: fm({ id: 'MediaStyleAlignBlockRight' }), className: 'image-style-block-align-right' }
];

const buildMediaResizeOptions = (fm, prefix) => [
  { name: `${prefix}:original`, value: null, label: fm({ id: 'MediaResizeOriginal' }), type: 'width' },
  { name: `${prefix}:25`, value: '25%', label: fm({ id: 'MediaResizeWidth25' }), type: 'width' },
  { name: `${prefix}:50`, value: '50%', label: fm({ id: 'MediaResizeWidth50' }), type: 'width' },
  { name: `${prefix}:75`, value: '75%', label: fm({ id: 'MediaResizeWidth75' }), type: 'width' }
];

const buildMediaHeightOptions = (fm, prefix) => [
  { name: `${prefix}Height:original`, value: null, label: fm({ id: 'MediaResizeHeightOriginal' }) },
  { name: `${prefix}Height:300`, value: '300px', label: fm({ id: 'MediaResizeHeight300' }) },
  { name: `${prefix}Height:400`, value: '400px', label: fm({ id: 'MediaResizeHeight400' }) },
  { name: `${prefix}Height:500`, value: '500px', label: fm({ id: 'MediaResizeHeight500' }) },
  { name: `${prefix}Height:600`, value: '600px', label: fm({ id: 'MediaResizeHeight600' }) }
];

/** 供 CKEditor 配置与插件读取的文案集合 */
export const buildCKEditorI18n = formatMessage => {
  const fm = formatMessage;

  return {
    model3dLabel: fm({ id: 'Model3dLabel' }),
    model3dWidgetLabel: fm({ id: 'Model3dWidgetLabel' }),
    model3dToolbarAria: fm({ id: 'Model3dToolbarAria' }),
    model3dUploadFormatError: fm({ id: 'Model3dUploadFormatError' }),
    model3dUploading: fm({ id: 'Model3dUploading' }),
    model3dBase64Warning: fm({ id: 'Model3dBase64Warning' }),
    model3dUploadSuccess: name => fm({ id: 'Model3dUploadSuccess' }, { name }),
    videoLabel: fm({ id: 'VideoLabel' }),
    videoWidgetLabel: fm({ id: 'VideoWidgetLabel' }),
    videoToolbarAria: fm({ id: 'VideoToolbarAria' }),
    videoUploadFormatError: fm({ id: 'VideoUploadFormatError' }),
    videoUploading: fm({ id: 'VideoUploading' }),
    videoBase64Warning: fm({ id: 'VideoBase64Warning' }),
    videoUploadSuccess: name => fm({ id: 'VideoUploadSuccess' }, { name }),
    liveComponentLabel: fm({ id: 'LiveComponentLabel' }),
    liveComponentInsertTitle: fm({ id: 'LiveComponentInsertTitle' }),
    liveComponentEditTitle: fm({ id: 'LiveComponentEditTitle' }),
    liveComponentDialogTitle: fm({ id: 'LiveComponentDialogTitle' }),
    modalOk: fm({ id: 'ModalOk' }),
    modalCancel: fm({ id: 'ModalCancel' }),
    pasteImageUploading: fm({ id: 'PasteImageUploading' }),
    uploadFailed: fm({ id: 'UploadFailed' }),
    uploadBase64Warning: fm({ id: 'UploadBase64Warning' }),
    fullscreenEnter: fm({ id: 'FullscreenEnter' }),
    fullscreenExit: fm({ id: 'FullscreenExit' }),
    fullscreenPreviewAria: fm({ id: 'FullscreenPreviewAria' }),
    mediaStyles: buildMediaStyles(fm),
    mediaStylesFallback: MEDIA_STYLES,
    model3dResizeOptions: buildMediaResizeOptions(fm, 'resizeModel3d'),
    model3dHeightOptions: buildMediaHeightOptions(fm, 'resizeModel3d'),
    videoResizeOptions: buildMediaResizeOptions(fm, 'resizeMediaVideo'),
    videoHeightOptions: buildMediaHeightOptions(fm, 'resizeMediaVideo')
  };
};

export default buildCKEditorI18n;

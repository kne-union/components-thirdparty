import imgFail from './img_fail.svg';
import { uploadFile, resizeBase64Image } from '../uploadFile';

class OssUploadAdapter {
  constructor(loader, options) {
    this.loader = loader;
    this.options = options;
    this.base64MaxWidth = options.base64MaxWidth || 600;
    this.base64MaxHeight = options.base64MaxHeight || 600;
  }

  async upload() {
    const file = await this.loader.file;

    try {
      let url;

      if (typeof this.options.upload !== 'function') {
        const data = await uploadFile(file, this.options);
        url = await resizeBase64Image(data, this.base64MaxWidth, this.base64MaxHeight);
      } else {
        url = await uploadFile(file, this.options);
      }

      return { default: url };
    } catch {
      return { default: imgFail };
    }
  }
}

function OssUploadAdapterPlugin(editor) {
  const message = editor.config.get('message');
  const options = Object.assign({}, { message }, editor.config.get('uploadAdapter'));
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return new OssUploadAdapter(loader, options);
  };
  editor.editing.view.document.on('clipboardInput', (evt, data) => {
    if (editor.isReadOnly) {
      return;
    }

    const dataTransfer = data.dataTransfer;
    const html = dataTransfer.getData('text/html');
    const parser = new DOMParser();
    const domDocument = parser.parseFromString(html, 'text/html');
    if (domDocument.querySelectorAll('img').length === 0) {
      return;
    }
    data.content = editor.data.htmlProcessor.toView('');
    const loadingClose = message ? message.loading('粘贴内容中含有图片，正在进行图片上传...', { duration: 0 }) : () => {};
    Promise.all(
      [].slice.call(domDocument.querySelectorAll('img'), 0).map(async img => {
        if (typeof options.uploadUrl !== 'function') {
          console.warn('图片上传失败，请在preset apis设置file.uploadUrl,或者给CKEditor组件传入 config.ossUpload.uploadUrl参数');
          return;
        }
        const { code, data, msg } = await options.uploadUrl({ url: img.src });
        if (code !== 0) {
          console.warn(`图片上传失败，${msg}`);
          img.src = imgFail;
          return;
        }
        img.src = data;
      })
    )
      .then(() => {
        editor.model.insertContent(editor.data.toModel(editor.data.htmlProcessor.toView(domDocument.documentElement.outerHTML)));
      })
      .finally(() => {
        loadingClose();
      });
  });
}

export default OssUploadAdapterPlugin;

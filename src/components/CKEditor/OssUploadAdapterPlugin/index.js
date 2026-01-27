import imgFail from './img_fail.svg';

const resizeBase64Image = (base64, width, height) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;

        img.onload = function () {
            // 创建一个 Canvas 元素
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const wRatio = img.width / width, hRatio = img.height / height;
            const ratio = Math.max(wRatio, hRatio, 1);

            // 设置 Canvas 的宽度和高度为缩放后的尺寸
            canvas.width = img.width / ratio;
            canvas.height = img.height / ratio;

            // 将图片绘制到 Canvas 上，并缩放
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 从 Canvas 中获取缩放后的图片数据，并将其转换为 Base64 格式
            const resizedBase64 = canvas.toDataURL('image/png'); // 可以根据需要更改图片格式
            // 调用回调函数，返回缩放后的 Base64 图片
            resolve(resizedBase64);
        };

        img.onerror = function (error) {
            reject(error);
        };
    });
}

class OssUploadAdapter {
    constructor(loader, options) {
        this.loader = loader;
        this.options = options;
        this.base64MaxWidth = options.base64MaxWidth || 600;
        this.base64MaxHeight = options.base64MaxHeight || 600;
    }

    async upload() {
        const file = await this.loader.file;
        if (typeof this.options.upload !== 'function') {
            console.warn('当前图片上传为base64模式，正式环境请在preset apis设置file.upload,或者给CKEditor组件传入 config.ossUpload.upload参数');
            const data = await new Promise(resolve => {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    resolve(fileReader.result);
                };
                fileReader.readAsDataURL(file);
            });

            return {
                default: await resizeBase64Image(data, this.base64MaxWidth, this.base64MaxHeight)
            };
        }
        const {data: resData} = await this.options.upload({file});
        if (resData.code !== 0) {
            this.options.message.error(resData.msg);
            return {default: imgFail};
        }
        return {
            default: resData.data
        };
    }
}

function OssUploadAdapterPlugin(editor) {
    const message = editor.config.get('message');
    const options = Object.assign({}, {message}, editor.config.get('ossUpload'));
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
        const loadingClose = message.loading('粘贴内容中含有图片，正在进行图片上传...', {duration: 0});
        Promise.all([].slice.call(domDocument.querySelectorAll('img'), 0).map(async img => {
            if (typeof options.uploadUrl !== 'function') {
                console.warn('图片上传失败，请在preset apis设置file.uploadUrl,或者给CKEditor组件传入 config.ossUpload.uploadUrl参数');
                return;
            }
            const {code, data, msg} = await options.uploadUrl({url: img.src});
            if (code !== 0) {
                console.warn(`图片上传失败，${msg}`);
                img.src = imgFail;
                return;
            }
            img.src = data;
        }))
            .then(() => {
                editor.model.insertContent(editor.data.toModel(editor.data.htmlProcessor.toView(domDocument.documentElement.outerHTML)));
            })
            .finally(() => {
                loadingClose();
            });
    });
}

export default OssUploadAdapterPlugin;

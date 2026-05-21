const readFileAsDataURL = file => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = reject;
    fileReader.readAsDataURL(file);
  });
};

/**
 * 统一文件上传：配置了 upload 则走接口，否则转为 base64 Data URL
 * @param {File} file
 * @param {{ upload?: Function, message?: object, base64Warning?: string }} options
 * @returns {Promise<string>} 文件可访问地址（URL 或 data URL）
 */
export const uploadFile = async (file, options = {}) => {
  const { upload, message, base64Warning, uploadFailedMessage, uploadBase64Warning } = options;
  if (typeof upload !== 'function') {
    console.warn(
      base64Warning ||
        uploadBase64Warning ||
        '当前为 base64 模式，正式环境请在 preset apis 设置 file.upload，或给 CKEditor 传入 uploadAdapter.upload / modelUpload.upload / videoUpload.upload'
    );
    return readFileAsDataURL(file);
  }

  const { data: resData } = await upload({ file });
  if (resData.code !== 0) {
    message?.error?.(resData.msg);
    throw new Error(resData.msg || options.uploadFailedMessage || '上传失败');
  }
  return resData.data;
};

export const resizeBase64Image = (base64, width, height) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;

    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const wRatio = img.width / width,
        hRatio = img.height / height;
      const ratio = Math.max(wRatio, hRatio, 1);

      canvas.width = img.width / ratio;
      canvas.height = img.height / ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = reject;
  });
};

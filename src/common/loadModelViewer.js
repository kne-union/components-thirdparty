/**
 * 静态引入，避免 Module Federation 下动态 import 触发 shareKey 未注册错误
 */
import '@google/model-viewer';

let readyPromise = null;

/**
 * 等待 model-viewer 自定义元素注册完成（远程加载场景下尤为重要）
 */
const whenModelViewerReady = () => {
  if (typeof customElements === 'undefined') {
    return Promise.resolve();
  }

  if (!readyPromise) {
    readyPromise = customElements.get('model-viewer')
      ? Promise.resolve()
      : customElements.whenDefined('model-viewer');
  }

  return readyPromise;
};

export default whenModelViewerReady;

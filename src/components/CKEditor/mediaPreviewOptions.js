/** 合并 Field / Content 传入的 liveComponent 配置 */
export const resolveLiveComponentOptions = (...sources) => {
  const merged = Object.assign({}, ...sources.filter(Boolean));

  return {
    height: merged.height,
    libs: merged.libs,
    props: merged.props,
    editor: Object.assign({}, merged.editor, {
      height: merged.editor?.height ?? merged.editorHeight,
      libs: merged.editor?.libs ?? merged.editorLibs
    })
  };
};

/** 合并 Field / Content 传入的 model3d 配置 */
export const resolveModel3dOptions = (...sources) => {
  const merged = Object.assign({}, ...sources.filter(Boolean));

  return {
    height: merged.height,
    viewer: merged.viewer || {},
    preview: Object.assign({ enableFullscreen: true }, merged.preview)
  };
};

export { applyModelViewerOptions } from '../../common/modelViewerOptions';

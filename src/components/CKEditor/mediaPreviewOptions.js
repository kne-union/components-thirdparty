/** 合并 Field / Content 传入的 liveComponent 配置 */
export const resolveLiveComponentOptions = (...sources) => {
  const merged = Object.assign({}, ...sources.filter(Boolean));
  const editorSource = Object.assign({}, merged.editor);

  return {
    height: merged.height,
    libs: merged.libs,
    props: merged.props,
    editor: {
      height: editorSource.height ?? merged.editorHeight,
      libs: editorSource.libs ?? merged.editorLibs,
      // LiveComponentEditor 多站点：优先 editor.*，兼容顶层简写
      sites: editorSource.sites ?? merged.sites,
      siteActionsOpen: editorSource.siteActionsOpen ?? merged.siteActionsOpen,
      userSitesStorageKey: editorSource.userSitesStorageKey ?? merged.userSitesStorageKey,
      width: editorSource.width ?? merged.width,
      onSitesChange: editorSource.onSitesChange ?? merged.onSitesChange,
      transformContentUrl: editorSource.transformContentUrl ?? merged.transformContentUrl,
      enableSourceLocate: editorSource.enableSourceLocate ?? merged.enableSourceLocate
    }
  };
};

/** 合并 Field / Content 传入的 formCreator 配置 */
export const resolveFormCreatorOptions = (...sources) => {
  const merged = Object.assign({}, ...sources.filter(Boolean));
  const editorSource = Object.assign({}, merged.editor);
  const formPropsSource = merged.formProps;

  return {
    height: merged.height,
    preview: merged.preview !== false,
    showActions: merged.showActions === true,
    // 透传给 Content / 编辑区每个 SchemaRenderer 内部 Form 的参数（如 onSubmit、data）
    formProps: formPropsSource && typeof formPropsSource === 'object' ? Object.assign({}, formPropsSource) : {},
    emptyText: merged.emptyText,
    editor: Object.assign({}, editorSource)
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

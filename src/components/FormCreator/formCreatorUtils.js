/** 模版合并时给字段/区块生成新 name */
export const createDataKey = (prefix = 'field') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

/**
 * schemaImportExport → 导入导出选项；false 关闭，返回 null。
 * 默认开启（true / null / undefined / 配置对象）。
 */
export const resolveImportExportOptions = schemaImportExport => {
  if (schemaImportExport === false) {
    return null;
  }
  const base = schemaImportExport === true || schemaImportExport == null ? {} : schemaImportExport;
  return {
    showCopy: base.showCopy !== false,
    showDownload: base.showDownload !== false,
    showImport: base.showImport !== false,
    showUpload: base.showUpload !== false,
    downloadFileName: base.downloadFileName || 'form-schema.json'
  };
};

/** extraToolbar：数组或 ({ schema }) => 数组，并入「更多」下拉 */
export const resolveExtraToolbarList = (extraToolbar, schema) => {
  const resolved = typeof extraToolbar === 'function' ? extraToolbar({ schema }) : extraToolbar;
  return Array.isArray(resolved) ? resolved.filter(Boolean) : [];
};

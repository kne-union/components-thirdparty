/** Model 元素名 */
export const TEMPLATE_VARIABLE_MODEL = 'templateVariable';

/** 编辑态 / 数据态 span class */
export const TEMPLATE_VARIABLE_CLASS = 'ck-template-variable';

export const TEMPLATE_VARIABLE_NAME_ATTR = 'data-template-variable-name';
export const TEMPLATE_VARIABLE_KIND_ATTR = 'data-template-variable-kind';
export const TEMPLATE_VARIABLE_LABEL_ATTR = 'data-template-variable-label';

/** 与 lodash.templateSettings 默认一致 */
export const DEFAULT_INTERPOLATE = /<%=([\s\S]+?)%>/g;
export const DEFAULT_ESCAPE = /<%-([\s\S]+?)%>/g;

export const KIND_INTERPOLATE = 'interpolate';
export const KIND_ESCAPE = 'escape';

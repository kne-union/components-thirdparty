/** Model 元素名 */
export const TEMPLATE_VARIABLE_MODEL = 'templateVariable';

/** 编辑态 / 数据态 span class */
export const TEMPLATE_VARIABLE_CLASS = 'ck-template-variable';

export const TEMPLATE_VARIABLE_NAME_ATTR = 'data-template-variable-name';
export const TEMPLATE_VARIABLE_KIND_ATTR = 'data-template-variable-kind';
export const TEMPLATE_VARIABLE_LABEL_ATTR = 'data-template-variable-label';

/** 变量路径：标识符，可用 . 访问属性 */
export const VARIABLE_PATH_SOURCE = '[A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*';
export const VARIABLE_PATH_RE = new RegExp(`^${VARIABLE_PATH_SOURCE}$`);

/** Liquid 输出：{{ name }} 或 {{ name | raw }}；不允许 {{- / -}} 与其它 filter */
export const LIQUID_OUTPUT_RE = new RegExp(`\\{\\{\\s*(${VARIABLE_PATH_SOURCE})\\s*(\\|\\s*raw\\s*)?\\}\\}`, 'g');

/** {{ name }}：渲染时由 liquidjs outputEscape 转义 */
export const KIND_INTERPOLATE = 'interpolate';
/** {{ name | raw }}：原样输出 HTML */
export const KIND_RAW = 'raw';
/** 旧配置值，归一为 KIND_RAW */
export const KIND_ESCAPE = 'escape';

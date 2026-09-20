/** Model 元素名 */
export const TEMPLATE_CONDITION_MODEL = 'templateCondition';
export const TEMPLATE_CONDITION_BLOCK_MODEL = 'templateConditionBlock';
export const TEMPLATE_CONDITION_THEN_MODEL = 'templateConditionThen';
export const TEMPLATE_CONDITION_ELSE_MODEL = 'templateConditionElse';
export const TEMPLATE_CONDITION_BADGE_MODEL = 'templateConditionBadge';
export const TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL = 'templateConditionBadgeClause';
export const TEMPLATE_CONDITION_BADGE_JOINER_MODEL = 'templateConditionBadgeJoiner';
export const TEMPLATE_CONDITION_ELSE_SEP_MODEL = 'templateConditionElseSep';

/** 编辑态 / 数据态 class */
export const TEMPLATE_CONDITION_CLASS = 'ck-template-condition';

export const TEMPLATE_CONDITION_SUBJECT_ATTR = 'data-template-condition-subject';
export const TEMPLATE_CONDITION_OPERATOR_ATTR = 'data-template-condition-operator';
export const TEMPLATE_CONDITION_VALUE_ATTR = 'data-template-condition-value';
export const TEMPLATE_CONDITION_CLAUSES_ATTR = 'data-template-condition-clauses';
export const TEMPLATE_CONDITION_JOINER_ATTR = 'data-template-condition-joiner';
export const TEMPLATE_CONDITION_HAS_ELSE_ATTR = 'data-template-condition-has-else';
export const TEMPLATE_CONDITION_LAYOUT_ATTR = 'data-template-condition-layout';

export const LAYOUT_INLINE = 'inline';
export const LAYOUT_BLOCK = 'block';

/** 写在 <% if %> 里的 JS 注释。lodash 执行时忽略；upcast 用来恢复块级，不会出现在邮件正文 */
export const CONDITION_LAYOUT_BLOCK_MARKER = '/*ck-layout:block*/';

/** 算子白名单 */
export const OPERATOR_TRUTHY = 'truthy';
export const OPERATOR_FALSY = 'falsy';
export const OPERATOR_FILLED = 'filled';
export const OPERATOR_EMPTY = 'empty';
export const OPERATOR_EQ = 'eq';
export const OPERATOR_NEQ = 'neq';

export const DEFAULT_OPERATORS = [
  OPERATOR_TRUTHY,
  OPERATOR_FALSY,
  OPERATOR_FILLED,
  OPERATOR_EMPTY,
  OPERATOR_EQ,
  OPERATOR_NEQ
];

/** 扁平多条件连接符 */
export const JOINER_AND = 'and';
export const JOINER_OR = 'or';
export const DEFAULT_JOINER = JOINER_AND;
export const DEFAULT_MAX_CLAUSES = 5;

export const ELSE_SEP_TEXT = '否则';

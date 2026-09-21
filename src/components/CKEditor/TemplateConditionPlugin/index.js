import {
  Plugin,
  Command,
  Widget,
  toWidget,
  toWidgetEditable,
  WidgetToolbarRepository,
  createDropdown,
  addListToDropdown,
  Collection,
  ViewModel,
  ButtonView
} from 'ckeditor5';
import bindDialogFloatingDropdown, { bindDialogBalloonToolbar } from '../dialogFloatingDropdown';
import {
  ELSE_SEP_TEXT,
  JOINER_AND,
  LAYOUT_BLOCK,
  LAYOUT_INLINE,
  OPERATOR_EMPTY,
  OPERATOR_EQ,
  OPERATOR_FALSY,
  OPERATOR_FILLED,
  OPERATOR_NEQ,
  OPERATOR_TRUTHY,
  TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL,
  TEMPLATE_CONDITION_BADGE_JOINER_MODEL,
  TEMPLATE_CONDITION_BADGE_MODEL,
  TEMPLATE_CONDITION_BLOCK_MODEL,
  TEMPLATE_CONDITION_CLASS,
  TEMPLATE_CONDITION_CLAUSES_ATTR,
  TEMPLATE_CONDITION_ELSE_MODEL,
  TEMPLATE_CONDITION_ELSE_SEP_MODEL,
  TEMPLATE_CONDITION_HAS_ELSE_ATTR,
  TEMPLATE_CONDITION_JOINER_ATTR,
  TEMPLATE_CONDITION_LAYOUT_ATTR,
  TEMPLATE_CONDITION_MODEL,
  TEMPLATE_CONDITION_OPERATOR_ATTR,
  TEMPLATE_CONDITION_SUBJECT_ATTR,
  TEMPLATE_CONDITION_THEN_MODEL,
  TEMPLATE_CONDITION_VALUE_ATTR
} from './constants';
import templateConditionIcon from './icon';
import {
  buildConditionModelAttributes,
  findConditionMatches,
  formatClauseBadge,
  formatJoinerLabel,
  normalizeJoiner,
  normalizeOperator,
  readClausesFromAttributes,
  readClausesFromModel,
  resolveTemplateConditionSettings,
  unwrapTemplateConditionSpans
} from './conditionSyntax';
import { findTemplateMatches, resolveTemplateVariableSettings, resolveVariableLabel } from '../TemplateVariablePlugin/templateSyntax';
import { KIND_ESCAPE, KIND_INTERPOLATE, TEMPLATE_VARIABLE_MODEL } from '../TemplateVariablePlugin/constants';

const getConditionSettings = editor =>
  resolveTemplateConditionSettings(editor.config.get('templateCondition') || {}, editor.config.get('templateVariable') || {});

const getVariableSettings = editor => resolveTemplateVariableSettings(editor.config.get('templateVariable') || {});

const boolAttr = value => (value === true || value === 'true' ? 'true' : 'false');

const isConditionElement = node => node?.is?.('element', TEMPLATE_CONDITION_MODEL) || node?.is?.('element', TEMPLATE_CONDITION_BLOCK_MODEL);

const conditionShellAttributes = modelElement => {
  const layout = modelElement.is('element', TEMPLATE_CONDITION_BLOCK_MODEL) || modelElement.getAttribute('layout') === LAYOUT_BLOCK ? LAYOUT_BLOCK : LAYOUT_INLINE;
  const className = layout === LAYOUT_BLOCK ? `${TEMPLATE_CONDITION_CLASS} ${TEMPLATE_CONDITION_CLASS}--block` : TEMPLATE_CONDITION_CLASS;
  const { clauses, joiner } = readClausesFromModel(modelElement);
  const first = clauses[0] || {};
  return {
    class: className,
    [TEMPLATE_CONDITION_SUBJECT_ATTR]: first.subject || '',
    [TEMPLATE_CONDITION_OPERATOR_ATTR]: first.operator || OPERATOR_FILLED,
    [TEMPLATE_CONDITION_VALUE_ATTR]: first.value || '',
    [TEMPLATE_CONDITION_CLAUSES_ATTR]: JSON.stringify(clauses),
    [TEMPLATE_CONDITION_JOINER_ATTR]: joiner || JOINER_AND,
    [TEMPLATE_CONDITION_HAS_ELSE_ATTR]: boolAttr(modelElement.getAttribute('hasElse')),
    [TEMPLATE_CONDITION_LAYOUT_ATTR]: layout
  };
};

const bindConditionLayoutAttribute = (editor, conversionType) => {
  editor.conversion.for(conversionType).add(dispatcher => {
    dispatcher.on(`attribute:layout:${TEMPLATE_CONDITION_MODEL}`, (evt, data, conversionApi) => {
      const viewElement = conversionApi.mapper.toViewElement(data.item);
      if (!viewElement) {
        return;
      }
      const writer = conversionApi.writer;
      const block = data.attributeNewValue === LAYOUT_BLOCK;
      if (block) {
        writer.addClass(`${TEMPLATE_CONDITION_CLASS}--block`, viewElement);
      } else {
        writer.removeClass(`${TEMPLATE_CONDITION_CLASS}--block`, viewElement);
      }
      writer.setAttribute(TEMPLATE_CONDITION_LAYOUT_ATTR, block ? LAYOUT_BLOCK : LAYOUT_INLINE, viewElement);
    });
  });
};

const requestCompareValue = (editor, { defaultValue, onSubmit }) => {
  const i18n = editor.config.get('ckeditorI18n') || {};
  const settings = getConditionSettings(editor);
  const open = settings.openCompareValueModal;
  if (typeof open !== 'function') {
    return;
  }

  open({
    title: i18n.templateConditionValuePrompt || '比较值',
    defaultValue: defaultValue ?? '',
    onSubmit
  });
};

const requestConditionEditor = (editor, condition) => {
  const i18n = editor.config.get('ckeditorI18n') || {};
  const settings = getConditionSettings(editor);
  const open = settings.openConditionEditorModal;
  if (typeof open !== 'function' || !condition) {
    return;
  }

  const { clauses, joiner } = readClausesFromModel(condition);
  open({
    title: i18n.templateConditionEdit || '编辑条件',
    data: { clauses, joiner },
    variables: settings.variables,
    operators: settings.operators,
    maxClauses: settings.maxClauses,
    operatorLabels: {
      [OPERATOR_TRUTHY]: i18n.templateConditionOpTruthy || '为真',
      [OPERATOR_FALSY]: i18n.templateConditionOpFalsy || '为假',
      [OPERATOR_FILLED]: i18n.templateConditionOpFilled || '有值',
      [OPERATOR_EMPTY]: i18n.templateConditionOpEmpty || '空值',
      [OPERATOR_EQ]: i18n.templateConditionOpEq || '等于',
      [OPERATOR_NEQ]: i18n.templateConditionOpNeq || '不等于'
    },
    i18n,
    onSubmit: next => {
      editor.execute('updateTemplateCondition', next);
      editor.editing.view.focus();
    }
  });
};

const syncConditionBadge = (writer, badge, clauseState, variables = []) => {
  const { clauses, joiner } = clauseState;
  const resolvedJoiner = normalizeJoiner(joiner);
  const joinerLabel = formatJoinerLabel(resolvedJoiner);

  writer.remove(writer.createRangeIn(badge));

  (clauses.length ? clauses : [{ subject: '', operator: OPERATOR_FILLED, value: '' }]).forEach((clause, index, list) => {
    const clauseEl = writer.createElement(TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL);
    writer.insert(writer.createText(formatClauseBadge(clause, variables)), clauseEl);
    writer.append(clauseEl, badge);

    if (index < list.length - 1) {
      const joinerEl = writer.createElement(TEMPLATE_CONDITION_BADGE_JOINER_MODEL, { joiner: resolvedJoiner });
      writer.insert(writer.createText(joinerLabel), joinerEl);
      writer.append(joinerEl, badge);
    }
  });
};

const readBadgeSignature = badge =>
  Array.from(badge.getChildren())
    .map(child => {
      if (child.is('element', TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL) || child.is('element', TEMPLATE_CONDITION_BADGE_JOINER_MODEL)) {
        return Array.from(child.getChildren())
          .map(node => (node.is('$text') ? node.data : ''))
          .join('');
      }
      if (child.is('$text')) {
        return child.data;
      }
      return '';
    })
    .join('\u0001');

const expectedBadgeSignature = (clauseState, variables = []) => {
  const { clauses, joiner } = clauseState;
  const joinerLabel = formatJoinerLabel(joiner);
  const list = clauses.length ? clauses : [{ subject: '', operator: OPERATOR_FILLED, value: '' }];
  return list
    .map((clause, index) => {
      const chip = formatClauseBadge(clause, variables);
      return index < list.length - 1 ? `${chip}\u0001${joinerLabel}` : chip;
    })
    .join('\u0001');
};

const createConditionElement = (writer, { subject, operator, value, clauses, joiner, hasElse, layout, thenNodes, elseNodes, elseSepText, variables }) => {
  const attrs = buildConditionModelAttributes(
    { subject, operator, value, clauses, joiner },
    { hasElse: !!hasElse }
  );
  const condition = writer.createElement(layout === LAYOUT_BLOCK ? TEMPLATE_CONDITION_BLOCK_MODEL : TEMPLATE_CONDITION_MODEL, attrs);

  const badge = writer.createElement(TEMPLATE_CONDITION_BADGE_MODEL);
  syncConditionBadge(writer, badge, attrs, variables || []);
  writer.append(badge, condition);

  const thenEl = writer.createElement(TEMPLATE_CONDITION_THEN_MODEL);
  if (layout === LAYOUT_BLOCK) {
    const paragraph = writer.createElement('paragraph');
    if (thenNodes?.length) {
      thenNodes.forEach(node => writer.append(node, paragraph));
    }
    writer.append(paragraph, thenEl);
  } else if (thenNodes?.length) {
    thenNodes.forEach(node => writer.append(node, thenEl));
  } else {
    writer.insert(writer.createText(''), thenEl);
  }
  writer.append(thenEl, condition);

  if (hasElse) {
    const sep = writer.createElement(TEMPLATE_CONDITION_ELSE_SEP_MODEL);
    writer.insert(writer.createText(elseSepText || ELSE_SEP_TEXT), sep);
    writer.append(sep, condition);

    const elseEl = writer.createElement(TEMPLATE_CONDITION_ELSE_MODEL);
    if (layout === LAYOUT_BLOCK) {
      const paragraph = writer.createElement('paragraph');
      if (elseNodes?.length) {
        elseNodes.forEach(node => writer.append(node, paragraph));
      }
      writer.append(paragraph, elseEl);
    } else if (elseNodes?.length) {
      elseNodes.forEach(node => writer.append(node, elseEl));
    }
    writer.append(elseEl, condition);
  }

  return condition;
};

const ELSE_TOKEN = '<% } else { %>';
const CLOSE_TOKEN = '<% } %>';

const collectConditionBranchNodes = viewElement => {
  const thenNodes = [];
  const elseNodes = [];
  let phase = 'pre';

  const pushText = (bucket, text) => {
    if (text && text.trim()) {
      bucket.push(text);
    }
  };

  for (const child of Array.from(viewElement.getChildren())) {
    if (child.is?.('element') && (child.hasClass(`${TEMPLATE_CONDITION_CLASS}__badge`) || child.hasClass(`${TEMPLATE_CONDITION_CLASS}__else-sep`))) {
      continue;
    }
    if (child.is?.('element') && child.hasClass(`${TEMPLATE_CONDITION_CLASS}__then`)) {
      Array.from(child.getChildren()).forEach(node => thenNodes.push(node));
      phase = 'then';
      continue;
    }
    if (child.is?.('element') && child.hasClass(`${TEMPLATE_CONDITION_CLASS}__else`)) {
      Array.from(child.getChildren()).forEach(node => elseNodes.push(node));
      phase = 'else';
      continue;
    }

    if (child.is?.('$text')) {
      let data = child.data || '';
      if (phase === 'pre') {
        const matched = data.match(/<%\s*(?:\/\*ck-layout:block\*\/\s*)?if\s*\([\s\S]*?\)\s*\{\s*%>/);
        if (!matched) {
          continue;
        }
        data = data.slice(matched.index + matched[0].length);
        phase = 'then';
      }
      if (phase === 'then' && data.includes(ELSE_TOKEN)) {
        const index = data.indexOf(ELSE_TOKEN);
        pushText(thenNodes, data.slice(0, index));
        data = data.slice(index + ELSE_TOKEN.length);
        phase = 'else';
      }
      if ((phase === 'then' || phase === 'else') && data.includes(CLOSE_TOKEN)) {
        const index = data.indexOf(CLOSE_TOKEN);
        pushText(phase === 'then' ? thenNodes : elseNodes, data.slice(0, index));
        phase = 'done';
        continue;
      }
      if (phase === 'then') {
        pushText(thenNodes, data);
      } else if (phase === 'else') {
        pushText(elseNodes, data);
      }
      continue;
    }

    if (phase === 'then') {
      thenNodes.push(child);
    } else if (phase === 'else') {
      elseNodes.push(child);
    }
  }

  return { thenNodes, elseNodes };
};

const fillBlockBranch = (editor, conversionApi, branch, nodes) => {
  if (!branch) {
    return;
  }
  const writer = conversionApi.writer;
  const variableSettings = getVariableSettings(editor);
  writer.remove(writer.createRangeIn(branch));
  let cursor = writer.createPositionAt(branch, 0);

  const insertText = (paragraph, value) => {
    const matches = findTemplateMatches(value, variableSettings);
    if (!matches.length) {
      writer.insert(writer.createText(value), paragraph, 0);
      return;
    }
    let offset = 0;
    let position = writer.createPositionAt(paragraph, 0);
    matches.forEach(match => {
      const before = value.slice(offset, match.start);
      if (before) {
        writer.insert(writer.createText(before), position);
        position = writer.createPositionAt(paragraph, 'end');
      }
      const kind = match.kind === KIND_ESCAPE ? KIND_ESCAPE : KIND_INTERPOLATE;
      const variable = writer.createElement(TEMPLATE_VARIABLE_MODEL, {
        name: match.name,
        label: resolveVariableLabel(match.name, kind, variableSettings.variables),
        kind
      });
      writer.insert(variable, position);
      position = writer.createPositionAfter(variable);
      offset = match.end;
    });
    const after = value.slice(offset);
    if (after) {
      writer.insert(writer.createText(after), position);
    }
  };

  nodes.forEach(node => {
    if (typeof node === 'string') {
      const paragraph = writer.createElement('paragraph');
      writer.insert(paragraph, cursor);
      insertText(paragraph, node);
      cursor = writer.createPositionAfter(paragraph);
      return;
    }
    const result = conversionApi.convertItem(node, cursor);
    if (result?.modelCursor) {
      cursor = result.modelCursor;
    }
  });

  if (!branch.childCount) {
    writer.append(writer.createElement('paragraph'), branch);
  }
};

const appendNodeCopy = (writer, node, parent) => {
  if (node.is('$text')) {
    writer.append(writer.createText(node.data, Object.fromEntries(node.getAttributes())), parent);
    return;
  }
  if (node.is('element')) {
    writer.append(writer.cloneElement(node, true), parent);
  }
};

const ensureBlockBranch = (writer, schema, branch) => {
  if (!branch) {
    return false;
  }
  const children = Array.from(branch.getChildren());
  if (children.some(child => schema.isBlock(child))) {
    return false;
  }
  const paragraph = writer.createElement('paragraph');
  writer.append(paragraph, branch);
  children.forEach(child => {
    writer.move(writer.createRangeOn(child), writer.createPositionAt(paragraph, 'end'));
  });
  return true;
};

const copyConditionAttributes = condition => {
  const attrs = {};
  for (const [key, value] of condition.getAttributes()) {
    if (key !== 'layout') {
      attrs[key] = value;
    }
  }
  return attrs;
};

const findNearestConditionHost = branchNames => {
  const branchAt = Math.max(branchNames.lastIndexOf(TEMPLATE_CONDITION_THEN_MODEL), branchNames.lastIndexOf(TEMPLATE_CONDITION_ELSE_MODEL));
  if (branchAt < 1) {
    return null;
  }
  return { branchAt, conditionName: branchNames[branchAt - 1] };
};

const flattenBranchToInline = (writer, source, target) => {
  const absorb = node => {
    // 块级 → 行内：丢掉段落换行 / softBreak，只留文字、变量和行内嵌套条件
    if (node.is('element') && node.name === 'softBreak') {
      return;
    }
    if (node.is('$text') || (node.is('element') && node.name === TEMPLATE_VARIABLE_MODEL)) {
      appendNodeCopy(writer, node, target);
      return;
    }
    if (!node.is('element')) {
      return;
    }
    if (node.name === TEMPLATE_CONDITION_MODEL) {
      appendNodeCopy(writer, node, target);
      return;
    }
    if (node.name === TEMPLATE_CONDITION_BLOCK_MODEL) {
      const thenEl = Array.from(node.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_THEN_MODEL));
      const elseEl = Array.from(node.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_ELSE_MODEL));
      if (thenEl) {
        Array.from(thenEl.getChildren()).forEach(absorb);
      }
      if (elseEl) {
        Array.from(elseEl.getChildren()).forEach(absorb);
      }
      return;
    }
    Array.from(node.getChildren()).forEach(absorb);
  };

  Array.from(source.getChildren()).forEach(absorb);
};

const replaceConditionElement = (writer, editor, schema, condition, next) => {
  const parent = condition.parent;
  const nextName = next.name;

  if (parent && !schema.checkChild(parent, nextName)) {
    if (nextName === TEMPLATE_CONDITION_BLOCK_MODEL) {
      const liftFrom = parent;
      const insertPos = writer.createPositionBefore(liftFrom);
      editor.model.insertContent(next, insertPos);
      writer.remove(condition);
      if (liftFrom.is('element') && liftFrom.childCount === 0) {
        writer.remove(liftFrom);
      }
      return;
    }
    if (nextName === TEMPLATE_CONDITION_MODEL) {
      const paragraph = writer.createElement('paragraph');
      writer.append(next, paragraph);
      const insertPos = writer.createPositionBefore(condition);
      editor.model.insertContent(paragraph, insertPos);
      writer.remove(condition);
      return;
    }
  }

  const position = writer.createPositionBefore(condition);
  editor.model.insertContent(next, position);
  writer.remove(condition);
};

const wrapBranchAsBlock = (writer, source, target) => {
  const paragraph = writer.createElement('paragraph');
  Array.from(source.getChildren()).forEach(child => appendNodeCopy(writer, child, paragraph));
  writer.append(paragraph, target);
};

const findSelectedCondition = selection => {
  const selected = selection.getSelectedElement();
  if (isConditionElement(selected)) {
    return selected;
  }

  const position = selection.getFirstPosition();
  if (!position) {
    return null;
  }

  let node = position.parent;
  while (node) {
    if (isConditionElement(node)) {
      return node;
    }
    node = node.parent;
  }
  return null;
};

class InsertTemplateConditionCommand extends Command {
  execute({ subject, operator, value, hasElse } = {}) {
    const editor = this.editor;
    const settings = getConditionSettings(editor);
    const variables = settings.variables;
    const i18n = editor.config.get('ckeditorI18n') || {};

    const resolvedSubject = subject || variables.find(item => item?.name)?.name;
    if (!resolvedSubject) {
      return;
    }

    const resolvedOperator = normalizeOperator(operator || OPERATOR_FILLED, settings.operators);
    const resolvedHasElse = settings.allowElse ? !!hasElse : false;
    const resolvedValue = value == null ? '' : String(value);
    const placeholder = i18n.templateConditionPlaceholder || '条件内容';

    editor.model.change(writer => {
      const selection = editor.model.document.selection;
      let thenNodes = null;

      if (!selection.isCollapsed) {
        const content = editor.model.getSelectedContent(selection);
        editor.model.deleteContent(selection, { leaveUnmerged: true });
        thenNodes = Array.from(content.getChildren());
      }

      if (!thenNodes?.length) {
        thenNodes = [writer.createText(placeholder)];
      }

      const condition = createConditionElement(writer, {
        subject: resolvedSubject,
        operator: resolvedOperator,
        value: resolvedValue,
        clauses: [{ subject: resolvedSubject, operator: resolvedOperator, value: resolvedValue }],
        joiner: JOINER_AND,
        hasElse: resolvedHasElse,
        thenNodes,
        variables,
        elseSepText: i18n.templateConditionElseSep || ELSE_SEP_TEXT
      });

      editor.model.insertObject(condition, null, null, { setSelection: 'on' });
    });
  }

  refresh() {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    const settings = getConditionSettings(editor);
    const hasVariables = settings.variables.some(item => item?.name);
    const parent = selection.focus?.parent;

    let nestingBlocked = false;
    let node = parent;
    while (node) {
      if (node.is?.('element', TEMPLATE_CONDITION_BADGE_MODEL) || node.is?.('element', TEMPLATE_CONDITION_ELSE_SEP_MODEL)) {
        nestingBlocked = true;
        break;
      }
      if (node.is?.('element', TEMPLATE_CONDITION_THEN_MODEL) || node.is?.('element', TEMPLATE_CONDITION_ELSE_MODEL)) {
        const host = node.parent;
        if (host?.is?.('element', TEMPLATE_CONDITION_MODEL)) {
          nestingBlocked = true;
          break;
        }
        if (host?.is?.('element', TEMPLATE_CONDITION_BLOCK_MODEL)) {
          nestingBlocked = !settings.allowNesting;
          break;
        }
      }
      if (isConditionElement(node)) {
        nestingBlocked = true;
        break;
      }
      node = node.parent;
    }

    this.isEnabled =
      hasVariables && !editor.isReadOnly && !nestingBlocked && !!parent && model.schema.checkChild(parent, TEMPLATE_CONDITION_MODEL);
  }
}

class ToggleTemplateConditionElseCommand extends Command {
  execute() {
    const editor = this.editor;
    const settings = getConditionSettings(editor);
    if (!settings.allowElse) {
      return;
    }

    const i18n = editor.config.get('ckeditorI18n') || {};

    editor.model.change(writer => {
      const condition = findSelectedCondition(editor.model.document.selection);
      if (!condition) {
        return;
      }

      const nextHasElse = !condition.getAttribute('hasElse');
      writer.setAttribute('hasElse', nextHasElse, condition);

      const elseSep = Array.from(condition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_ELSE_SEP_MODEL));
      const elseEl = Array.from(condition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_ELSE_MODEL));

      if (nextHasElse) {
        if (!elseSep) {
          const sep = writer.createElement(TEMPLATE_CONDITION_ELSE_SEP_MODEL);
          writer.insert(writer.createText(i18n.templateConditionElseSep || ELSE_SEP_TEXT), sep);
          writer.append(sep, condition);
        }
        if (!elseEl) {
          const next = writer.createElement(TEMPLATE_CONDITION_ELSE_MODEL);
          writer.append(next, condition);
        }
      } else {
        if (elseSep) {
          writer.remove(elseSep);
        }
        if (elseEl) {
          writer.remove(elseEl);
        }
      }
    });
  }

  refresh() {
    const editor = this.editor;
    const settings = getConditionSettings(editor);
    const condition = findSelectedCondition(editor.model.document.selection);
    this.isEnabled = !!condition && settings.allowElse && !editor.isReadOnly;
    this.value = !!condition?.getAttribute('hasElse');
  }
}

class UpdateTemplateConditionCommand extends Command {
  execute({ subject, operator, value, clauses, joiner } = {}) {
    const editor = this.editor;
    const settings = getConditionSettings(editor);

    editor.model.change(writer => {
      const condition = findSelectedCondition(editor.model.document.selection);
      if (!condition) {
        return;
      }

      const current = readClausesFromModel(condition);
      const nextAttrs = buildConditionModelAttributes(
        {
          subject: subject !== undefined ? subject : current.subject,
          operator: operator !== undefined ? operator : current.operator,
          value: value !== undefined ? value : current.value,
          clauses: clauses !== undefined ? clauses : current.clauses,
          joiner: joiner !== undefined ? joiner : current.joiner
        },
        { operators: settings.operators }
      );

      writer.setAttribute('subject', nextAttrs.subject, condition);
      writer.setAttribute('operator', nextAttrs.operator, condition);
      writer.setAttribute('value', nextAttrs.value, condition);
      writer.setAttribute('clauses', nextAttrs.clauses, condition);
      writer.setAttribute('joiner', nextAttrs.joiner, condition);

      const badge = Array.from(condition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_BADGE_MODEL));
      if (badge) {
        syncConditionBadge(writer, badge, nextAttrs, settings.variables);
      }
    });
  }

  refresh() {
    const condition = findSelectedCondition(this.editor.model.document.selection);
    this.isEnabled = !!condition && !this.editor.isReadOnly;
  }
}

class ToggleTemplateConditionLayoutCommand extends Command {
  execute() {
    const editor = this.editor;
    const schema = editor.model.schema;

    editor.model.change(writer => {
      const condition = findSelectedCondition(editor.model.document.selection);
      if (!condition) {
        return;
      }

      const toInline = condition.is('element', TEMPLATE_CONDITION_BLOCK_MODEL);
      const next = writer.createElement(toInline ? TEMPLATE_CONDITION_MODEL : TEMPLATE_CONDITION_BLOCK_MODEL, copyConditionAttributes(condition));

      for (const child of Array.from(condition.getChildren())) {
        if (child.is('element', TEMPLATE_CONDITION_THEN_MODEL) || child.is('element', TEMPLATE_CONDITION_ELSE_MODEL)) {
          const branch = writer.createElement(child.name);
          if (toInline) {
            flattenBranchToInline(writer, child, branch);
          } else {
            wrapBranchAsBlock(writer, child, branch);
          }
          writer.append(branch, next);
          continue;
        }
        writer.append(writer.cloneElement(child, true), next);
      }

      replaceConditionElement(writer, editor, schema, condition, next);

      const thenEl = Array.from(next.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_THEN_MODEL));
      const anchor = toInline ? thenEl : thenEl?.getChild(0);
      if (anchor) {
        writer.setSelection(anchor, 0);
      }
    });
  }

  refresh() {
    const condition = findSelectedCondition(this.editor.model.document.selection);
    this.isEnabled = !!condition && !this.editor.isReadOnly;
    this.value = !!condition?.is('element', TEMPLATE_CONDITION_BLOCK_MODEL);
  }
}

class TemplateConditionEditing extends Plugin {
  static get pluginName() {
    return 'TemplateConditionEditing';
  }

  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this._patchGetData();
    this._registerPostFixer();
    this._registerInlineObjectMatchers();
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
    const parents = [TEMPLATE_CONDITION_MODEL, TEMPLATE_CONDITION_BLOCK_MODEL];

    schema.register(TEMPLATE_CONDITION_MODEL, {
      allowWhere: '$text',
      isInline: true,
      isObject: true,
      isSelectable: true,
      allowAttributes: ['subject', 'operator', 'value', 'clauses', 'joiner', 'hasElse', 'layout']
    });

    schema.register(TEMPLATE_CONDITION_BLOCK_MODEL, {
      allowWhere: '$block',
      isBlock: true,
      isObject: true,
      isSelectable: true,
      allowAttributes: ['subject', 'operator', 'value', 'clauses', 'joiner', 'hasElse']
    });

    schema.register(TEMPLATE_CONDITION_BADGE_MODEL, {
      allowIn: parents,
      isLimit: true,
      allowChildren: [TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL, TEMPLATE_CONDITION_BADGE_JOINER_MODEL]
    });

    schema.register(TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL, {
      allowIn: TEMPLATE_CONDITION_BADGE_MODEL,
      isLimit: true,
      allowChildren: ['$text']
    });

    schema.register(TEMPLATE_CONDITION_BADGE_JOINER_MODEL, {
      allowIn: TEMPLATE_CONDITION_BADGE_MODEL,
      isLimit: true,
      allowChildren: ['$text'],
      allowAttributes: ['joiner']
    });

    schema.register(TEMPLATE_CONDITION_THEN_MODEL, {
      allowIn: parents,
      isLimit: true,
      allowContentOf: '$root',
      allowChildren: ['$text', TEMPLATE_VARIABLE_MODEL]
    });

    schema.register(TEMPLATE_CONDITION_ELSE_SEP_MODEL, {
      allowIn: parents,
      isLimit: true,
      allowChildren: ['$text']
    });

    schema.register(TEMPLATE_CONDITION_ELSE_MODEL, {
      allowIn: parents,
      isLimit: true,
      allowContentOf: '$root',
      allowChildren: ['$text', TEMPLATE_VARIABLE_MODEL]
    });

    schema.extend('$text', {
      allowIn: [
        TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL,
        TEMPLATE_CONDITION_BADGE_JOINER_MODEL,
        TEMPLATE_CONDITION_THEN_MODEL,
        TEMPLATE_CONDITION_ELSE_SEP_MODEL,
        TEMPLATE_CONDITION_ELSE_MODEL
      ]
    });

    if (schema.isRegistered(TEMPLATE_VARIABLE_MODEL)) {
      schema.extend(TEMPLATE_VARIABLE_MODEL, {
        allowIn: [TEMPLATE_CONDITION_THEN_MODEL, TEMPLATE_CONDITION_ELSE_MODEL]
      });
    }

    const inlineBranchChildren = new Set(['$text', TEMPLATE_VARIABLE_MODEL, 'softBreak']);
    schema.addChildCheck((context, childDefinition) => {
      const names = Array.from(context.getNames());
      const childName = childDefinition.name;
      const host = findNearestConditionHost(names);
      const isConditionChild = childName === TEMPLATE_CONDITION_MODEL || childName === TEMPLATE_CONDITION_BLOCK_MODEL;

      // 行内条件分支禁止再套条件；块级分支在 allowNesting 时允许（含嵌套块级 / 段落内行内）
      if (host && isConditionChild) {
        if (host.conditionName === TEMPLATE_CONDITION_MODEL) {
          return false;
        }
        if (host.conditionName === TEMPLATE_CONDITION_BLOCK_MODEL && !getConditionSettings(this.editor).allowNesting) {
          return false;
        }
      }

      if (!host || host.branchAt !== names.length - 1) {
        return;
      }
      if (host.conditionName === TEMPLATE_CONDITION_MODEL && !inlineBranchChildren.has(childName)) {
        return false;
      }
      if (host.conditionName === TEMPLATE_CONDITION_BLOCK_MODEL && inlineBranchChildren.has(childName)) {
        return false;
      }
    });
  }

  afterInit() {
    const schema = this.editor.model.schema;
    if (schema.isRegistered('softBreak')) {
      schema.extend('softBreak', {
        allowIn: [TEMPLATE_CONDITION_THEN_MODEL, TEMPLATE_CONDITION_ELSE_MODEL]
      });
    }
  }

  _registerPostFixer() {
    const editor = this.editor;
    const i18n = () => editor.config.get('ckeditorI18n') || {};

    editor.model.document.registerPostFixer(writer => {
      let changed = false;
      const settings = getConditionSettings(editor);

      for (const root of editor.model.document.getRoots()) {
        for (const item of writer.createRangeIn(root).getItems()) {
          if (!isConditionElement(item)) {
            continue;
          }

          const blockLayout = item.is('element', TEMPLATE_CONDITION_BLOCK_MODEL);
          const clauseState = readClausesFromModel(item);
          const hasElse = !!item.getAttribute('hasElse');
          const children = Array.from(item.getChildren());

          if (!Array.isArray(item.getAttribute('clauses')) || !item.getAttribute('clauses')?.length) {
            writer.setAttribute('clauses', clauseState.clauses, item);
            writer.setAttribute('joiner', clauseState.joiner, item);
            writer.setAttribute('subject', clauseState.clauses[0]?.subject || '', item);
            writer.setAttribute('operator', clauseState.clauses[0]?.operator || OPERATOR_FILLED, item);
            writer.setAttribute('value', clauseState.clauses[0]?.value || '', item);
            changed = true;
          }

          let badge = children.find(child => child.is('element', TEMPLATE_CONDITION_BADGE_MODEL));
          let thenEl = children.find(child => child.is('element', TEMPLATE_CONDITION_THEN_MODEL));
          let elseSep = children.find(child => child.is('element', TEMPLATE_CONDITION_ELSE_SEP_MODEL));
          let elseEl = children.find(child => child.is('element', TEMPLATE_CONDITION_ELSE_MODEL));

          if (!badge) {
            badge = writer.createElement(TEMPLATE_CONDITION_BADGE_MODEL);
            syncConditionBadge(writer, badge, clauseState, settings.variables);
            writer.insert(badge, item, 0);
            changed = true;
          } else if (readBadgeSignature(badge) !== expectedBadgeSignature(clauseState, settings.variables)) {
            syncConditionBadge(writer, badge, clauseState, settings.variables);
            changed = true;
          }

          if (!thenEl) {
            thenEl = writer.createElement(TEMPLATE_CONDITION_THEN_MODEL);
            if (!blockLayout) {
              writer.insert(writer.createText(''), thenEl);
            }
            writer.append(thenEl, item);
            changed = true;
          }

          if (hasElse && settings.allowElse) {
            if (!elseSep) {
              elseSep = writer.createElement(TEMPLATE_CONDITION_ELSE_SEP_MODEL);
              writer.insert(writer.createText(i18n().templateConditionElseSep || ELSE_SEP_TEXT), elseSep);
              writer.append(elseSep, item);
              changed = true;
            }
            if (!elseEl) {
              elseEl = writer.createElement(TEMPLATE_CONDITION_ELSE_MODEL);
              writer.append(elseEl, item);
              changed = true;
            }
          } else {
            if (elseSep) {
              writer.remove(elseSep);
              changed = true;
            }
            if (elseEl) {
              writer.remove(elseEl);
              changed = true;
            }
            if (item.getAttribute('hasElse')) {
              writer.setAttribute('hasElse', false, item);
              changed = true;
            }
          }

          if (blockLayout) {
            if (ensureBlockBranch(writer, editor.model.schema, thenEl)) {
              changed = true;
            }
            if (hasElse && settings.allowElse && ensureBlockBranch(writer, editor.model.schema, elseEl)) {
              changed = true;
            }
          }
        }
      }

      return changed;
    });
  }

  _registerInlineObjectMatchers() {
    const editor = this.editor;
    const matcher = element => {
      if (element?.tagName === 'SPAN' && element.classList?.contains(TEMPLATE_CONDITION_CLASS)) {
        return { name: true };
      }
      return null;
    };

    editor.data.htmlProcessor.domConverter.registerInlineObjectMatcher(matcher);
    editor.editing.view.domConverter.registerInlineObjectMatcher(matcher);
  }

  _patchGetData() {
    const data = this.editor.data;
    const originalGet = data.get.bind(data);

    data.get = options => unwrapTemplateConditionSpans(originalGet(options));
  }

  _defineConverters() {
    const editor = this.editor;

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_MODEL,
      view: (modelElement, { writer }) => {
        const i18n = editor.config.get('ckeditorI18n') || {};
        const span = writer.createContainerElement('span', conditionShellAttributes(modelElement));
        return toWidget(span, writer, {
          label: i18n.templateConditionWidgetLabel || '模版条件',
          hasSelectionHandle: false
        });
      }
    });

    const downcastConditionShell = (modelElement, writer, tagName) => writer.createContainerElement(tagName, conditionShellAttributes(modelElement));

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BLOCK_MODEL,
      view: (modelElement, { writer }) => {
        const i18n = editor.config.get('ckeditorI18n') || {};
        const div = downcastConditionShell(modelElement, writer, 'div');
        return toWidget(div, writer, {
          label: i18n.templateConditionWidgetLabel || '模版条件',
          hasSelectionHandle: false
        });
      }
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BADGE_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__badge`,
          contenteditable: 'false'
        })
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__badge-clause`,
          contenteditable: 'false'
        })
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BADGE_JOINER_MODEL,
      view: (modelElement, { writer }) => {
        const joiner = normalizeJoiner(modelElement.getAttribute('joiner'));
        return writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__badge-joiner ${TEMPLATE_CONDITION_CLASS}__badge-joiner--${joiner}`,
          contenteditable: 'false'
        });
      }
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_THEN_MODEL,
      view: (modelElement, { writer }) => {
        const block = modelElement.parent?.is?.('element', TEMPLATE_CONDITION_BLOCK_MODEL);
        const editable = writer.createEditableElement(block ? 'div' : 'span', {
          class: `${TEMPLATE_CONDITION_CLASS}__then`
        });
        return toWidgetEditable(editable, writer);
      }
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_ELSE_SEP_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__else-sep`,
          contenteditable: 'false'
        })
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: TEMPLATE_CONDITION_ELSE_MODEL,
      view: (modelElement, { writer }) => {
        const i18n = editor.config.get('ckeditorI18n') || {};
        const block = modelElement.parent?.is?.('element', TEMPLATE_CONDITION_BLOCK_MODEL);
        const editable = writer.createEditableElement(block ? 'div' : 'span', {
          class: `${TEMPLATE_CONDITION_CLASS}__else`
        });
        editable.placeholder = i18n.templateConditionElsePlaceholder || '输入否则内容';
        return toWidgetEditable(editable, writer);
      }
    });

    bindConditionLayoutAttribute(editor, 'editingDowncast');

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_MODEL,
      view: (modelElement, { writer }) => writer.createContainerElement('span', conditionShellAttributes(modelElement))
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BLOCK_MODEL,
      view: (modelElement, { writer }) => writer.createContainerElement('div', conditionShellAttributes(modelElement))
    });

    bindConditionLayoutAttribute(editor, 'dataDowncast');

    const branchTag = modelElement => (modelElement.parent?.is?.('element', TEMPLATE_CONDITION_BLOCK_MODEL) ? 'div' : 'span');

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_THEN_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement(branchTag(modelElement), {
          class: `${TEMPLATE_CONDITION_CLASS}__then`,
          'data-branch': 'then'
        })
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_ELSE_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement(branchTag(modelElement), {
          class: `${TEMPLATE_CONDITION_CLASS}__else`,
          'data-branch': 'else'
        })
    });

    // badge / 否则必须在数据 view 里占位，否则 mapper 按模型 offset 找不到视图位置。
    // getData 出口的 unwrapTemplateConditionSpans 会丢掉这两段，不进入存库文本。
    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BADGE_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__badge`
        })
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BADGE_CLAUSE_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__badge-clause`
        })
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_BADGE_JOINER_MODEL,
      view: (modelElement, { writer }) => {
        const joiner = normalizeJoiner(modelElement.getAttribute('joiner'));
        return writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__badge-joiner ${TEMPLATE_CONDITION_CLASS}__badge-joiner--${joiner}`
        });
      }
    });

    editor.conversion.for('dataDowncast').elementToElement({
      model: TEMPLATE_CONDITION_ELSE_SEP_MODEL,
      view: (modelElement, { writer }) =>
        writer.createContainerElement('span', {
          class: `${TEMPLATE_CONDITION_CLASS}__else-sep`
        })
    });

    // 数据态 span 回填（中间态）；规范 lodash 文本见下方 text upcast
    editor.conversion.for('upcast').elementToElement({
      view: viewElement => {
        if (!(viewElement.is('element', 'span') && viewElement.hasClass(TEMPLATE_CONDITION_CLASS))) {
          return null;
        }
        return { name: true };
      },
      model: (viewElement, { writer }) => {
        const { clauses, joiner } = readClausesFromAttributes(name => viewElement.getAttribute(name) || '');
        const hasElse = viewElement.getAttribute(TEMPLATE_CONDITION_HAS_ELSE_ATTR) === 'true';
        const settings = getConditionSettings(editor);
        const first = clauses[0] || {};

        return createConditionElement(writer, {
          subject: first.subject,
          operator: first.operator,
          value: first.value,
          clauses,
          joiner,
          hasElse,
          thenNodes: [],
          variables: settings.variables
        });
      }
    });

    editor.conversion.for('upcast').add(dispatcher => {
      dispatcher.on(
        'element:div',
        (evt, data, conversionApi) => {
          const viewElement = data.viewItem;
          if (!viewElement.hasClass?.(TEMPLATE_CONDITION_CLASS)) {
            return;
          }
          if (!conversionApi.consumable.test(viewElement, { name: true })) {
            return;
          }

          const { clauses, joiner } = readClausesFromAttributes(name => viewElement.getAttribute(name) || '');
          const hasElse = viewElement.getAttribute(TEMPLATE_CONDITION_HAS_ELSE_ATTR) === 'true';
          const settings = getConditionSettings(editor);
          const writer = conversionApi.writer;
          const first = clauses[0] || {};
          const condition = createConditionElement(writer, {
            subject: first.subject,
            operator: first.operator,
            value: first.value,
            clauses,
            joiner,
            hasElse,
            layout: LAYOUT_BLOCK,
            thenNodes: [],
            variables: settings.variables
          });

          if (!conversionApi.safeInsert(condition, data.modelCursor)) {
            return;
          }
          conversionApi.consumable.consume(viewElement, { name: true });

          const { thenNodes, elseNodes } = collectConditionBranchNodes(viewElement);
          const thenEl = Array.from(condition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_THEN_MODEL));
          const elseEl = Array.from(condition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_ELSE_MODEL));
          fillBlockBranch(editor, conversionApi, thenEl, thenNodes);
          if (elseEl) {
            fillBlockBranch(editor, conversionApi, elseEl, elseNodes);
          }

          conversionApi.updateConversionResult(condition, data);
          evt.stop();
        },
        { priority: 'high' }
      );
    });

    // 规范 lodash if/else 文本 → widget（任意 JS 不解析）
    editor.conversion.for('upcast').add(dispatcher => {
      dispatcher.on(
        'text',
        (evt, data, conversionApi) => {
          const { consumable, writer, schema } = conversionApi;
          const viewItem = data.viewItem;

          if (!consumable.test(viewItem)) {
            return;
          }

          const text = viewItem.data;
          const matches = findConditionMatches(text);
          if (!matches.length) {
            return;
          }

          if (!consumable.consume(viewItem)) {
            return;
          }

          const settings = getConditionSettings(editor);
          const variableSettings = getVariableSettings(editor);
          let modelCursor = data.modelCursor;
          const hostCondition = modelCursor.parent?.is?.('element', TEMPLATE_CONDITION_MODEL) ? modelCursor.parent : null;
          let modelRangeStart = null;
          let lastRange = null;
          let offset = 0;

          const insertFragmentAt = (targetParentOrCursor, value, asCursor) => {
            if (!value) {
              return asCursor ? targetParentOrCursor : null;
            }
            if (/<br\s*\/?>/i.test(value)) {
              const parts = value.split(/<br\s*\/?>/i);
              let cursor = asCursor ? targetParentOrCursor : writer.createPositionAt(targetParentOrCursor, 'end');
              parts.forEach((part, index) => {
                if (index > 0 && schema.checkChild(cursor.parent, 'softBreak')) {
                  const lineBreak = writer.createElement('softBreak');
                  writer.insert(lineBreak, cursor);
                  cursor = writer.createPositionAfter(lineBreak);
                }
                cursor = insertFragmentAt(cursor, part, true) || cursor;
              });
              return cursor;
            }
            let cursor = asCursor ? targetParentOrCursor : writer.createPositionAt(targetParentOrCursor, 'end');
            const varMatches = findTemplateMatches(value, variableSettings);

            const writeText = chunk => {
              if (!chunk) {
                return;
              }
              if (!schema.checkChild(cursor, '$text') && !schema.checkChild(cursor.parent, '$text')) {
                return;
              }
              const node = writer.createText(chunk);
              writer.insert(node, cursor);
              const range = writer.createRange(cursor, cursor.getShiftedBy(node.offsetSize));
              cursor = range.end;
              if (!modelRangeStart) {
                modelRangeStart = range.start;
              }
              lastRange = range;
            };

            if (!varMatches.length) {
              writeText(value);
              return cursor;
            }

            let localOffset = 0;
            for (const match of varMatches) {
              writeText(value.slice(localOffset, match.start));
              if (schema.checkChild(cursor.parent, TEMPLATE_VARIABLE_MODEL)) {
                const kind = match.kind === KIND_ESCAPE ? KIND_ESCAPE : KIND_INTERPOLATE;
                const element = writer.createElement(TEMPLATE_VARIABLE_MODEL, {
                  name: match.name,
                  label: resolveVariableLabel(match.name, kind, variableSettings.variables),
                  kind
                });
                writer.insert(element, cursor);
                const range = writer.createRangeOn(element);
                cursor = range.end;
                if (!modelRangeStart) {
                  modelRangeStart = range.start;
                }
                lastRange = range;
              } else {
                writeText(match.raw);
              }
              localOffset = match.end;
            }
            writeText(value.slice(localOffset));
            return cursor;
          };

          if (hostCondition) {
            const match = matches[0];
            const thenEl = Array.from(hostCondition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_THEN_MODEL));
            const elseEl = Array.from(hostCondition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_ELSE_MODEL));
            if (thenEl) {
              writer.remove(writer.createRangeIn(thenEl));
              insertFragmentAt(thenEl, match.thenHtml, false);
            }
            if (elseEl) {
              writer.remove(writer.createRangeIn(elseEl));
              insertFragmentAt(elseEl, match.elseHtml, false);
            }
            if (match.layout === LAYOUT_BLOCK && hostCondition.getAttribute('layout') !== LAYOUT_BLOCK) {
              writer.setAttribute('layout', LAYOUT_BLOCK, hostCondition);
            }
            evt.stop();
            return;
          }

          for (const match of matches) {
            modelCursor = insertFragmentAt(modelCursor, text.slice(offset, match.start), true) || modelCursor;

            if (!schema.checkChild(modelCursor.parent, TEMPLATE_CONDITION_MODEL)) {
              modelCursor = insertFragmentAt(modelCursor, match.raw, true) || modelCursor;
              offset = match.end;
              continue;
            }

            const condition = createConditionElement(writer, {
              subject: match.subject,
              operator: match.operator,
              value: match.value,
              clauses: match.clauses,
              joiner: match.joiner,
              hasElse: match.hasElse,
              layout: match.layout,
              thenNodes: [],
              variables: settings.variables
            });
            writer.insert(condition, modelCursor);

            const thenEl = Array.from(condition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_THEN_MODEL));
            const elseEl = Array.from(condition.getChildren()).find(child => child.is('element', TEMPLATE_CONDITION_ELSE_MODEL));
            if (thenEl) {
              writer.remove(writer.createRangeIn(thenEl));
              insertFragmentAt(thenEl, match.thenHtml, false);
            }
            if (elseEl) {
              writer.remove(writer.createRangeIn(elseEl));
              insertFragmentAt(elseEl, match.elseHtml, false);
            }

            const range = writer.createRangeOn(condition);
            modelCursor = range.end;
            if (!modelRangeStart) {
              modelRangeStart = range.start;
            }
            lastRange = range;
            offset = match.end;
          }

          modelCursor = insertFragmentAt(modelCursor, text.slice(offset), true) || modelCursor;

          if (modelRangeStart && lastRange) {
            data.modelRange = writer.createRange(modelRangeStart, lastRange.end);
            data.modelCursor = lastRange.end;
          }

          evt.stop();
        },
        { priority: 'highest' }
      );
    });
  }
}

class TemplateConditionUI extends Plugin {
  static get pluginName() {
    return 'TemplateConditionUI';
  }

  static get requires() {
    return [WidgetToolbarRepository];
  }

  init() {
    const editor = this.editor;

    editor.commands.add('insertTemplateCondition', new InsertTemplateConditionCommand(editor));
    editor.commands.add('toggleTemplateConditionElse', new ToggleTemplateConditionElseCommand(editor));
    editor.commands.add('toggleTemplateConditionLayout', new ToggleTemplateConditionLayoutCommand(editor));
    editor.commands.add('updateTemplateCondition', new UpdateTemplateConditionCommand(editor));

    this._registerInsertDropdown();
    this._registerToolbarButtons();
    this._registerWidgetToolbar();

    // 弹窗内：抬高气球层级，并避免点工具栏时被焦点锁拆掉导致命令不执行
    bindDialogBalloonToolbar(editor);
  }

  _registerInsertDropdown() {
    const editor = this.editor;

    editor.ui.componentFactory.add('insertTemplateCondition', locale => {
      const i18n = editor.config.get('ckeditorI18n') || {};
      const dropdown = createDropdown(locale);
      const command = editor.commands.get('insertTemplateCondition');

      dropdown.buttonView.set({
        label: i18n.templateConditionLabel || '条件',
        icon: templateConditionIcon,
        withText: true,
        tooltip: true,
        class: 'ck-template-insert-button'
      });
      dropdown.bind('isEnabled').to(command, 'isEnabled');

      const items = new Collection();
      const settings = getConditionSettings(editor);
      const operatorLabels = {
        [OPERATOR_TRUTHY]: i18n.templateConditionOpTruthy || '为真',
        [OPERATOR_FALSY]: i18n.templateConditionOpFalsy || '为假',
        [OPERATOR_FILLED]: i18n.templateConditionOpFilled || '有值',
        [OPERATOR_EMPTY]: i18n.templateConditionOpEmpty || '空值',
        [OPERATOR_EQ]: i18n.templateConditionOpEq || '等于',
        [OPERATOR_NEQ]: i18n.templateConditionOpNeq || '不等于'
      };

      settings.variables.forEach(item => {
        if (!item?.name) {
          return;
        }
        settings.operators.forEach(op => {
          if (!operatorLabels[op]) {
            return;
          }
          const needsValue = op === OPERATOR_EQ || op === OPERATOR_NEQ;
          items.add({
            type: 'button',
            model: new ViewModel({
              withText: true,
              label: `${item.label || item.name} · ${operatorLabels[op]}${needsValue ? '…' : ''}`,
              subject: item.name,
              operator: op,
              needsValue
            })
          });
        });
      });

      if (!items.length) {
        items.add({
          type: 'button',
          model: new ViewModel({
            withText: true,
            label: i18n.templateConditionEmpty || '未配置变量列表',
            isEnabled: false
          })
        });
      }

      addListToDropdown(dropdown, items);
      bindDialogFloatingDropdown(dropdown, editor, 'ck-template-condition-panel');

      this.listenTo(dropdown, 'execute', evt => {
        const { subject, operator, needsValue, isEnabled } = evt.source;
        if (isEnabled === false || !subject) {
          return;
        }
        let value = '';
        if (needsValue) {
          requestCompareValue(editor, {
            onSubmit: nextValue => {
              editor.execute('insertTemplateCondition', { subject, operator, value: nextValue, hasElse: false });
              editor.editing.view.focus();
            }
          });
          return;
        }
        editor.execute('insertTemplateCondition', { subject, operator, value, hasElse: false });
        editor.editing.view.focus();
      });

      return dropdown;
    });
  }

  _registerToolbarButtons() {
    const editor = this.editor;

    editor.ui.componentFactory.add('toggleTemplateConditionElse', locale => {
      const i18n = editor.config.get('ckeditorI18n') || {};
      const button = new ButtonView(locale);
      const command = editor.commands.get('toggleTemplateConditionElse');

      button.set({
        label: i18n.templateConditionToggleElse || '否则',
        tooltip: true,
        withText: true
      });
      button.bind('isEnabled').to(command, 'isEnabled');
      button.bind('isOn').to(command, 'value');

      this.listenTo(button, 'execute', () => {
        editor.execute('toggleTemplateConditionElse');
        editor.editing.view.focus();
      });

      return button;
    });

    editor.ui.componentFactory.add('toggleTemplateConditionLayout', locale => {
      const i18n = editor.config.get('ckeditorI18n') || {};
      const button = new ButtonView(locale);
      const command = editor.commands.get('toggleTemplateConditionLayout');

      button.set({
        label: i18n.templateConditionLayoutBlock || '块级',
        tooltip: i18n.templateConditionLayoutTooltip || 'if / else 内容在行内和块级之间切换',
        withText: true
      });
      button.bind('isEnabled').to(command, 'isEnabled');
      button.bind('isOn').to(command, 'value');

      this.listenTo(button, 'execute', () => {
        editor.execute('toggleTemplateConditionLayout');
        editor.editing.view.focus();
      });

      return button;
    });

    editor.ui.componentFactory.add('editTemplateConditionOperator', locale => {
      const i18n = editor.config.get('ckeditorI18n') || {};
      const button = new ButtonView(locale);
      const command = editor.commands.get('updateTemplateCondition');

      button.set({
        label: i18n.templateConditionEdit || '编辑条件',
        withText: true,
        tooltip: true
      });
      button.bind('isEnabled').to(command, 'isEnabled');

      this.listenTo(button, 'execute', () => {
        const condition = findSelectedCondition(editor.model.document.selection);
        requestConditionEditor(editor, condition);
      });

      return button;
    });
  }

  _registerWidgetToolbar() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);
    const i18n = editor.config.get('ckeditorI18n') || {};

    widgetToolbarRepository.register('templateCondition', {
      ariaLabel: i18n.templateConditionToolbarAria || '模版条件工具栏',
      items: ['editTemplateConditionOperator', 'toggleTemplateConditionElse', 'toggleTemplateConditionLayout'],
      getRelatedElement: viewSelection => {
        const selection = editor.model.document.selection;
        const modelElement = findSelectedCondition(selection);
        if (!modelElement) {
          return null;
        }
        return editor.editing.mapper.toViewElement(modelElement);
      }
    });
  }
}

class TemplateConditionPlugin extends Plugin {
  static get pluginName() {
    return 'TemplateCondition';
  }

  static get requires() {
    // TemplateVariable 需先注册 schema，条件槽内才能放变量 chip
    return ['TemplateVariable', TemplateConditionEditing, TemplateConditionUI];
  }
}

export default TemplateConditionPlugin;
export {
  InsertTemplateConditionCommand,
  ToggleTemplateConditionElseCommand,
  UpdateTemplateConditionCommand,
  TemplateConditionEditing,
  TemplateConditionUI
};
export {
  resolveTemplateConditionSettings,
  unwrapTemplateConditionSpans,
  findUnbalancedTemplateTags,
  validateTemplateHtml,
  buildConditionExpression,
  formatConditionBadge,
  findConditionMatches
} from './conditionSyntax';

import yaml from 'js-yaml';

export const MD_COMPONENT_BLOCK_MODEL = 'mdComponentBlock';
export const MD_COMPONENT_INLINE_MODEL = 'mdComponentInline';
export const MD_COMPONENT_BLOCK_CLASS = 'ck-md-component';
export const MD_COMPONENT_INLINE_CLASS = 'ck-md-component-inline';
export const MD_COMPONENT_INLINE_EDIT_CLASS = 'ck-md-component-inline-edit';
export const MD_COMPONENT_VIEWER_CLASS = 'ck-md-component-viewer';

/** markdown-components-render 只识别 info 恰为 yml 的围栏 */
export const MD_COMPONENT_FENCE_LANGUAGE = 'yml';

const INLINE_PATTERN = /^md-components:(\w+)\{([^}]*)\}$/;

/** 插入时的快速模板，弹窗内统一用 YML 编辑 */
export const TEMPLATES = {
  block: [
    {
      label: 'Alert',
      value: `md-components:
  type: Alert
  props:
    type: info
    showIcon: true
    message: 提示内容`
    },
    {
      label: 'Card',
      value: `md-components:
  type: Card
  props:
    title: 卡片标题
    size: small
    children: 卡片内容`
    },
    {
      label: 'Descriptions',
      value: `md-components:
  type: Descriptions
  props:
    column: 2
    items:
      - label: 姓名
        children: 张三
      - label: 职位
        children: 前端工程师`
    },
    {
      label: 'Steps',
      value: `md-components:
  type: Steps
  props:
    current: 1
    items:
      - title: 提交
      - title: 审核
      - title: 完成`
    },
    {
      label: 'Space',
      value: `md-components:
  type: Space
  props:
    size: middle
    wrap: true
    children:
      - type: Tag
        props:
          color: blue
          children: 标签一
      - type: Tag
        props:
          color: green
          children: 标签二
      - type: Button
        props:
          type: primary
          size: small
          children: 操作`
    },
    {
      label: 'Flex',
      value: `md-components:
  type: Flex
  props:
    gap: middle
    wrap: wrap
    align: center
    children:
      - type: Tag
        props:
          color: blue
          children: 标签一
      - type: Tag
        props:
          color: green
          children: 标签二
      - type: Button
        props:
          type: primary
          size: small
          children: 操作`
    },
    {
      label: 'RemoteLoader',
      value: `md-components:
  type: RemoteLoader
  props:
    module: components-core:Content
    list:
      - label: 标题
        content: 内容`
    }
  ],
  inline: [
    {
      label: 'Tag',
      value: `md-components:
  type: Tag
  props:
    color: blue
    children: 标签`
    },
    {
      label: 'Button',
      value: `md-components:
  type: Button
  props:
    type: link
    size: small
    children: 链接按钮`
    },
    {
      label: 'Badge',
      value: `md-components:
  type: Badge
  props:
    status: success
    text: 已完成`
    },
    {
      label: 'Text',
      value: `md-components:
  type: Text
  props:
    type: secondary
    children: 辅助文字`
    }
  ]
};

export const isBlockSource = source => /^\s*md-components\s*:/.test(source || '');

/** 行内语法：md-components:Type{...}，Type 仅支持 \w，props 内不能再含 } */
export const isInlineSource = source => INLINE_PATTERN.test((source || '').trim());

export const toBlockMarkdown = source => `\`\`\`${MD_COMPONENT_FENCE_LANGUAGE}\n${source || ''}\n\`\`\``;

export const toInlineMarkdown = source => `\`${(source || '').trim()}\``;

/** 解析 YML，返回 { type, props }；不合法时抛出带说明的错误 */
export const parseYmlSource = text => {
  const data = yaml.load(text || '');
  const config = data?.['md-components'];
  if (!config || typeof config.type !== 'string' || !config.type) {
    throw new Error('缺少 md-components.type');
  }
  if (!config.props || typeof config.props !== 'object' || Array.isArray(config.props)) {
    throw new Error('md-components.props 必须是对象');
  }
  return config;
};

/** 行内语法 → { type, props } */
export const parseInlineSource = source => {
  const match = (source || '').trim().match(INLINE_PATTERN);
  if (!match) {
    throw new Error('行内组件格式应为 md-components:Type{...}');
  }
  return { type: match[1], props: JSON.parse(`{${match[2]}}`) };
};

/** YML → 行内语法；行内语法限制：type 仅 \w，props 非空且不能含对象（序列化后不能出现 }） */
export const ymlToInlineSource = text => {
  const { type, props } = parseYmlSource(text);
  if (!/^\w+$/.test(type)) {
    throw new Error('行内组件 type 只能包含字母、数字、下划线');
  }
  const inner = JSON.stringify(props).slice(1, -1);
  if (!inner) {
    throw new Error('行内组件 props 不能为空');
  }
  if (inner.includes('}')) {
    throw new Error('行内组件 props 不能包含对象或花括号');
  }
  return `md-components:${type}{${inner}}`;
};

/** 行内语法 → YML（弹窗编辑用） */
export const inlineSourceToYml = source => {
  try {
    const { type, props } = parseInlineSource(source);
    return yaml.dump({ 'md-components': { type, props } }, { lineWidth: -1 }).trimEnd();
  } catch {
    return source || '';
  }
};

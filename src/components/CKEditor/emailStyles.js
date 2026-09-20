/**
 * 邮件模版样式：单一数据源。
 *
 * 只在 EMAIL_STYLE_PRESETS 里声明一次，下面三者全部由它派生，不存在需要人工同步的副本：
 *   - EMAIL_STYLE_DEFINITIONS  给 Style 插件，决定「样式」下拉里有哪些项
 *   - EMAIL_STYLE_CSS          无前缀 CSS，供出口 inline 化解析，也可注入邮件模版外壳
 *   - EMAIL_STYLE_CSS_SCOPED   带编辑器前缀，EmailStylePlugin 运行时注入，用于编辑态显示
 *
 * targets 按「段落」下拉里可选的块元素划分：默认 heading 配置为
 * paragraph→p、heading1→h2、heading2→h3、heading3→h4（没有 h1），
 * Style 插件只列出与当前块元素匹配的样式，所以定义在 h1 上的样式永远选不到。
 *
 * 兼容约束（Outlook/Word 引擎、Gmail，且发信前会 inline 化）：
 * 不用伪元素、nth-child、border-radius、box-shadow、渐变、flex/grid；
 * 颜色用实体值，字号行高用 px，分割线用 height + background-color 并带 color。
 */
export const EMAIL_STYLE_PRESETS = [
  // ── 正文段落（p）──
  {
    className: 'email-text',
    targets: [{ element: 'p', name: '正文' }],
    styles: { margin: '0 0 14px', color: '#434343', fontSize: '15px', lineHeight: '24px' }
  },
  {
    className: 'email-lead',
    targets: [{ element: 'p', name: '导语' }],
    styles: { margin: '0 0 16px', color: '#262626', fontSize: '17px', lineHeight: '28px', fontWeight: 'bold' }
  },
  {
    className: 'email-note',
    targets: [{ element: 'p', name: '补充说明' }],
    styles: { margin: '0 0 12px', color: '#8c8c8c', fontSize: '13px', lineHeight: '20px' }
  },
  {
    className: 'email-quote',
    targets: [{ element: 'p', name: '引用段' }],
    styles: { margin: '12px 0', padding: '0 0 0 14px', borderLeft: '3px solid #d9d9d9', color: '#595959', fontSize: '15px', lineHeight: '24px' }
  },
  {
    className: 'email-tip',
    targets: [{ element: 'p', name: '提示条' }],
    styles: {
      margin: '16px 0',
      padding: '12px 16px',
      backgroundColor: '#e6f4ff',
      border: '1px solid #91caff',
      color: '#0958d9',
      fontSize: '14px',
      lineHeight: '22px'
    }
  },
  {
    className: 'email-alert',
    targets: [{ element: 'p', name: '警示条' }],
    styles: {
      margin: '16px 0',
      padding: '12px 16px',
      backgroundColor: '#fff7e6',
      border: '1px solid #ffd591',
      color: '#ad4e00',
      fontSize: '14px',
      lineHeight: '22px'
    }
  },
  {
    className: 'email-success',
    targets: [{ element: 'p', name: '成功条' }],
    styles: {
      margin: '16px 0',
      padding: '12px 16px',
      backgroundColor: '#f6ffed',
      border: '1px solid #b7eb8f',
      color: '#237804',
      fontSize: '14px',
      lineHeight: '22px'
    }
  },
  {
    className: 'email-btn',
    targets: [{ element: 'p', name: '主按钮' }],
    styles: { margin: '24px 0', textAlign: 'center', fontSize: '15px', lineHeight: '22px' },
    // 按钮本体挂在内部链接上：写一行文字 → 加链接 → 套样式
    descendants: [
      {
        selector: 'a',
        styles: {
          display: 'inline-block',
          padding: '12px 28px',
          backgroundColor: '#1677ff',
          border: '1px solid #1677ff',
          color: '#ffffff',
          fontWeight: 'bold',
          textDecoration: 'none'
        }
      }
    ]
  },
  {
    className: 'email-btn-ghost',
    targets: [{ element: 'p', name: '次按钮' }],
    styles: { margin: '24px 0', textAlign: 'center', fontSize: '15px', lineHeight: '22px' },
    descendants: [
      {
        selector: 'a',
        styles: {
          display: 'inline-block',
          padding: '12px 28px',
          backgroundColor: '#ffffff',
          border: '1px solid #1677ff',
          color: '#1677ff',
          fontWeight: 'bold',
          textDecoration: 'none'
        }
      }
    ]
  },
  {
    className: 'email-footer',
    targets: [{ element: 'p', name: '页脚' }],
    styles: { margin: '24px 0 0', padding: '16px 0 0', borderTop: '1px solid #e8e8e8', color: '#8c8c8c', fontSize: '12px', lineHeight: '20px' }
  },

  // ── 标题 1（h2）──
  {
    className: 'email-title',
    targets: [{ element: 'h2', name: '邮件主标题' }],
    styles: { margin: '0 0 16px', color: '#1f1f1f', fontSize: '26px', lineHeight: '34px', fontWeight: 'bold' }
  },
  {
    className: 'email-heading',
    targets: [{ element: 'h2', name: '章节标题（色条）' }],
    styles: {
      margin: '24px 0 12px',
      padding: '0 0 0 12px',
      borderLeft: '4px solid #1677ff',
      color: '#1f1f1f',
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 'bold'
    }
  },
  {
    className: 'email-banner',
    targets: [{ element: 'h2', name: '横幅标题（深底）' }],
    styles: {
      margin: '24px 0 16px',
      padding: '18px 22px',
      backgroundColor: '#1677ff',
      color: '#ffffff',
      fontSize: '24px',
      lineHeight: '34px',
      fontWeight: 'bold'
    }
  },

  // ── 标题 2（h3）──
  {
    className: 'email-subheading',
    targets: [{ element: 'h3', name: '小节标题' }],
    styles: { margin: '20px 0 10px', color: '#262626', fontSize: '17px', lineHeight: '26px', fontWeight: 'bold' }
  },
  {
    className: 'email-subheading-line',
    targets: [{ element: 'h3', name: '小节标题（底线）' }],
    styles: {
      margin: '20px 0 10px',
      padding: '0 0 8px',
      borderBottom: '2px solid #1677ff',
      color: '#262626',
      fontSize: '17px',
      lineHeight: '26px',
      fontWeight: 'bold'
    }
  },
  {
    className: 'email-subheading-brand',
    targets: [{ element: 'h3', name: '小节标题（品牌色）' }],
    styles: { margin: '20px 0 10px', color: '#1677ff', fontSize: '17px', lineHeight: '26px', fontWeight: 'bold' }
  },

  // ── 标题 3（h4）──
  {
    className: 'email-caption',
    targets: [{ element: 'h4', name: '小标题' }],
    styles: { margin: '16px 0 8px', color: '#595959', fontSize: '15px', lineHeight: '22px', fontWeight: 'bold' }
  },
  {
    className: 'email-label',
    targets: [{ element: 'h4', name: '标签标题' }],
    styles: {
      margin: '16px 0 8px',
      color: '#8c8c8c',
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 'bold',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    }
  },

  // ── 引用块（blockquote）──
  {
    className: 'email-blockquote',
    targets: [{ element: 'blockquote', name: '邮件引用块' }],
    styles: {
      margin: '16px 0',
      padding: '12px 16px',
      backgroundColor: '#fafafa',
      borderLeft: '4px solid #d9d9d9',
      color: '#595959',
      fontSize: '15px',
      lineHeight: '24px'
    }
  },

  // ── 列表（ul / ol）──
  {
    className: 'email-list-compact',
    targets: [
      { element: 'ul', name: '紧凑列表' },
      { element: 'ol', name: '紧凑编号列表' }
    ],
    styles: { margin: '0 0 12px', paddingLeft: '22px', color: '#434343', fontSize: '14px', lineHeight: '20px' }
  },
  {
    className: 'email-list-loose',
    targets: [
      { element: 'ul', name: '宽松列表' },
      { element: 'ol', name: '宽松编号列表' }
    ],
    styles: { margin: '0 0 16px', paddingLeft: '22px', color: '#434343', fontSize: '15px', lineHeight: '28px' }
  },

  // ── 分割线（hr）：Word 引擎按 color 绘制，border 归零避免 Outlook 双线 ──
  {
    className: 'email-divider',
    targets: [{ element: 'hr', name: '细分割线' }],
    styles: { height: '1px', margin: '24px 0', padding: '0', border: '0', backgroundColor: '#d9d9d9', color: '#d9d9d9' }
  },
  {
    className: 'email-divider-bold',
    targets: [{ element: 'hr', name: '粗分割线' }],
    styles: { height: '3px', margin: '28px 0', padding: '0', border: '0', backgroundColor: '#1677ff', color: '#1677ff' }
  },
  {
    className: 'email-divider-dashed',
    targets: [{ element: 'hr', name: '虚线分割线' }],
    styles: {
      height: '0',
      margin: '24px 0',
      padding: '0',
      border: '0',
      borderTop: '1px dashed #bfbfbf',
      backgroundColor: 'transparent',
      color: '#bfbfbf'
    }
  },
  {
    className: 'email-spacer',
    targets: [{ element: 'hr', name: '空白间距' }],
    styles: { height: '24px', margin: '0', padding: '0', border: '0', backgroundColor: 'transparent', color: 'transparent' }
  },

  // ── 表格（figure）：不用 nth-child 斑马纹，整表边框 ──
  {
    className: 'email-table',
    targets: [{ element: 'figure', name: '邮件表格' }],
    styles: { margin: '16px 0' },
    descendants: [
      { selector: 'table', styles: { width: '100%', borderCollapse: 'collapse' } },
      {
        selector: 'th',
        styles: {
          padding: '10px 12px',
          backgroundColor: '#fafafa',
          border: '1px solid #d9d9d9',
          color: '#262626',
          fontSize: '14px',
          lineHeight: '20px',
          textAlign: 'left'
        }
      },
      { selector: 'td', styles: { padding: '10px 12px', border: '1px solid #d9d9d9', color: '#434343', fontSize: '14px', lineHeight: '20px' } }
    ]
  }
];

const toKebabCase = key => key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);

const toDeclarations = styles =>
  Object.entries(styles)
    .map(([key, value]) => `${toKebabCase(key)}: ${value};`)
    .join(' ');

const buildRule = (selectors, styles) => `${selectors.join(',\n')} {\n  ${toDeclarations(styles)}\n}`;

const buildCss = (prefixes = ['']) =>
  EMAIL_STYLE_PRESETS.flatMap(({ className, targets, styles, descendants = [] }) => {
    const base = targets.flatMap(({ element }) => prefixes.map(prefix => `${prefix}${element}.${className}`));

    return [
      buildRule(base, styles),
      ...descendants.map(({ selector, styles: descendantStyles }) =>
        buildRule(
          base.map(item => `${item} ${selector}`),
          descendantStyles
        )
      )
    ];
  }).join('\n\n');

/** Style 插件的 `style.definitions`；同一 class 落在多个元素上时各自取名，避免重名 */
export const EMAIL_STYLE_DEFINITIONS = EMAIL_STYLE_PRESETS.flatMap(({ className, targets }) =>
  targets.map(({ element, name }) => ({ name, element, classes: [className] }))
);

/** 无前缀 CSS：出口 inline 化按它解析，也可直接注入邮件模版外壳 */
export const EMAIL_STYLE_CSS = buildCss();

/** 编辑态显示用：作用域限定在编辑器与内容预览容器内 */
export const EMAIL_STYLE_CSS_SCOPED = buildCss(['.ck-editor__editable ', '.ck.ck-content ']);

/** 邮件模版推荐工具栏：撤销置顶，含模版变量、模版条件与样式 */
export const EMAIL_TOOLBAR_ITEMS = [
  'undo',
  'redo',
  '|',
  'insertTemplateVariable',
  'insertTemplateCondition',
  '|',
  'heading',
  'style',
  '|',
  'bold',
  'italic',
  'underline',
  'fontColor',
  'fontSize',
  '|',
  'bulletedList',
  'numberedList',
  'alignment',
  '|',
  'link',
  'insertTable',
  'imageUpload',
  'horizontalLine',
  '|',
  'removeFormat',
  'sourceEditing'
];

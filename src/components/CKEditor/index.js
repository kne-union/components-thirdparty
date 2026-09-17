import { useLayoutEffect, useMemo, useRef } from 'react';
import { CKEditor as CKEditor5 } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';
import { createWithRemoteLoader } from '@kne/remote-loader';
import {
  Alignment,
  Autoformat,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  BlockQuote,
  CodeBlock,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  AutoImage,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  AutoLink,
  Link,
  LinkImage,
  List,
  ListProperties,
  TodoList,
  MediaEmbed,
  PageBreak,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersText,
  Table,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  WordCount,
  Style,
  GeneralHtmlSupport,
  SelectAll,
  Markdown
} from 'ckeditor5';
import coreTranslationsZh from 'ckeditor5/translations/zh-cn';
import coreTranslationsEn from 'ckeditor5/translations/en';
import { useGlobalValue, usePreset } from '@kne/global-context';
import 'ckeditor5/ckeditor5.css';
import classnames from 'classnames';
import OssUploadAdapterPlugin from './OssUploadAdapterPlugin';
import Model3dPlugin from './Model3dPlugin';
import VideoPlugin from './VideoPlugin';
import LiveComponentPlugin from './LiveComponentPlugin';
import EchartPlugin from './EchartPlugin';
import TemplateVariablePlugin from './TemplateVariablePlugin';
import FormCreatorPlugin from './FormCreatorPlugin';
import EmailStylePlugin from './emailStylePlugin';
import { syncContentVideoLayout } from './VideoPlugin/utils';
import { createDefaultMediaToolbar } from './shared/mediaWidget/constants';
import whenModelViewerReady from '../../common/loadModelViewer';
import { useToolbarDropdownMaxWidth } from './toolbarDropdownMaxWidth';
import { syncModelViewerLayout } from '../../common/modelViewerMount';
import { enhanceModel3dContentPreview, teardownModel3dContentPreview } from './model3dContentPreview';
import { enhanceLiveComponentContentPreview, teardownLiveComponentContentPreview } from './LiveComponentPlugin/liveComponentContentPreview';
import { enhanceEchartContentPreview, teardownEchartContentPreview } from './echartContentPreview';
import {
  enhanceFormCreatorContentPreview,
  teardownFormCreatorContentPreview
} from './FormCreatorPlugin/formCreatorContentPreview';
import { resolveLiveComponentOptions, resolveModel3dOptions, resolveFormCreatorOptions } from './mediaPreviewOptions';
import { applyModelViewerOptions } from '../../common/modelViewerOptions';
import useControlValue from '@kne/use-control-value';
import { useIntl } from '@kne/react-intl';
import merge from 'lodash/merge';
import withLocale from './withLocale';
import buildCKEditorI18n from './buildI18n';
import style from './style.module.scss';
import './ckeditor5-content.css';
import './ckeditor.scss';

const defaultPlugins = [
  Alignment,
  AutoImage,
  AutoLink,
  Autoformat,
  BlockQuote,
  Bold,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  LinkImage,
  Indent,
  IndentBlock,
  Italic,
  Strikethrough,
  Link,
  List,
  ListProperties,
  MediaEmbed,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersText,
  Subscript,
  Superscript,
  Table,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
  GeneralHtmlSupport,
  Style,
  SelectAll,
  OssUploadAdapterPlugin
];

const richTextPlugins = [
  ...defaultPlugins,
  Model3dPlugin,
  VideoPlugin,
  LiveComponentPlugin,
  EchartPlugin,
  TemplateVariablePlugin,
  FormCreatorPlugin,
  EmailStylePlugin
];

const defaultConfig = {
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'heading',
      'style',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'link',
      'bulletedList',
      'numberedList',
      'todoList',
      'fontBackgroundColor',
      'fontColor',
      'fontSize',
      '|',
      'alignment',
      'pageBreak',
      'outdent',
      'indent',
      '|',
      'specialCharacters',
      'subscript',
      'superscript',
      '|',
      'imageUpload',
      'model3dUpload',
      'videoUpload',
      'insertLiveComponent',
      'insertEchart',
      'insertFormCreator',
      'blockQuote',
      'insertTable',
      'codeBlock',
      'htmlEmbed',
      'highlight',
      'horizontalLine',
      '|',
      'selectAll',
      'removeFormat',
      'sourceEditing'
    ]
  },
  list: {
    properties: {
      styles: true,
      startIndex: true,
      reversed: true
    }
  },
  style: {
    definitions: [
      // ── 标题类 ──
      {
        name: 'Headings',
        element: 'h2',
        classes: ['primary-part-title']
      },
      {
        name: 'Subheadings',
        element: 'h3',
        classes: ['part-title']
      },
      {
        name: 'Section Title',
        element: 'h2',
        classes: ['section-title']
      },
      {
        name: 'Underline Title',
        element: 'h3',
        classes: ['underline-title']
      },
      // ── 段落类 ──
      {
        name: 'Paragraph',
        element: 'p',
        classes: ['part-content']
      },
      {
        name: 'Lead Paragraph',
        element: 'p',
        classes: ['lead-paragraph']
      },
      {
        name: 'Small Text',
        element: 'p',
        classes: ['small-text']
      },
      {
        name: 'Centered Text',
        element: 'p',
        classes: ['centered-text']
      },
      {
        name: 'Right Aligned',
        element: 'p',
        classes: ['right-text']
      },
      {
        name: 'Indented Paragraph',
        element: 'p',
        classes: ['indented-paragraph']
      },
      {
        name: 'Drop Cap',
        element: 'p',
        classes: ['drop-cap']
      },
      // ── 卡片类 ──
      {
        name: 'Card',
        element: 'p',
        classes: ['card']
      },
      {
        name: 'Primary Card',
        element: 'p',
        classes: ['primary-card']
      },
      {
        name: 'Info Card',
        element: 'p',
        classes: ['info-card']
      },
      {
        name: 'Warning Card',
        element: 'p',
        classes: ['warning-card']
      },
      {
        name: 'Success Card',
        element: 'p',
        classes: ['success-card']
      },
      {
        name: 'Danger Card',
        element: 'p',
        classes: ['danger-card']
      },
      // ── 行内类 ──
      {
        name: 'Keywords',
        element: 'span',
        classes: ['key-word']
      },
      {
        name: 'Highlight Mark',
        element: 'span',
        classes: ['highlight-mark']
      },
      {
        name: 'Code Inline',
        element: 'span',
        classes: ['code-inline']
      },
      {
        name: 'Tag Label',
        element: 'span',
        classes: ['tag-label']
      },
      {
        name: 'Underline Accent',
        element: 'span',
        classes: ['underline-accent']
      },
      {
        name: 'Strikethrough Dim',
        element: 'span',
        classes: ['strikethrough-dim']
      },
      // ── 引用类 ──
      {
        name: 'Block Quote Styled',
        element: 'blockquote',
        classes: ['styled-quote']
      },
      {
        name: 'Large Quote',
        element: 'blockquote',
        classes: ['large-quote']
      },
      // ── 列表类 ──
      {
        name: 'Checklist Styled',
        element: 'ul',
        classes: ['checklist-styled']
      },
      {
        name: 'Inline List',
        element: 'ul',
        classes: ['inline-list']
      },
      // ── 分隔线 ──
      {
        name: 'Thick Divider',
        element: 'hr',
        classes: ['thick-divider']
      },
      {
        name: 'Dotted Divider',
        element: 'hr',
        classes: ['dotted-divider']
      },
      // ── 图片 ──
      {
        name: 'Image Frame',
        element: 'figure',
        classes: ['image-frame']
      },
      // ── 表格 ──
      {
        name: 'Striped Table',
        element: 'figure',
        classes: ['striped-table']
      }
    ]
  },
  image: {
    toolbar: [
      'imageTextAlternative',
      'toggleImageCaption',
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side',
      '|',
      'resizeImage:25',
      'resizeImage:50',
      'resizeImage:75',
      'resizeImage:original',
      '|',
      'linkImage'
    ]
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableCellProperties', 'tableProperties']
  },
  htmlSupport: {
    allow: [
      { name: 'div', classes: true, styles: true },
      {
        name: 'div',
        classes: ['ck-model3d'],
        styles: true,
        attributes: true
      },
      {
        name: 'figure',
        classes: ['ck-echart'],
        styles: true,
        attributes: true
      },
      {
        name: 'div',
        classes: ['ck-echart-inner', 'ck-echart-viewer'],
        styles: true,
        attributes: ['data-echart-option']
      },
      {
        name: 'model-viewer',
        attributes: true,
        styles: true,
        classes: true
      },
      {
        name: 'figure',
        classes: ['ck-video'],
        styles: true,
        attributes: true
      },
      {
        name: 'video',
        attributes: ['src', 'controls', 'playsinline', 'preload', 'title', 'width', 'height'],
        styles: true,
        classes: true
      },
      {
        name: 'section',
        classes: ['component-box', 'ck-live-component'],
        styles: true,
        attributes: ['data-live-component']
      },
      {
        name: 'section',
        classes: ['component-box', 'ck-form-creator'],
        styles: true,
        attributes: ['data-form-creator-schema']
      }
    ]
  },
  modelUpload: {},
  videoUpload: {},
  liveComponent: {},
  formCreator: {},
  model3d: {
    toolbar: createDefaultMediaToolbar({
      stylePrefix: 'model3dStyle',
      resizePrefix: 'resizeModel3d'
    }),
    viewer: {
      cameraControls: true,
      autoRotate: true,
      loading: 'lazy'
    },
    preview: {
      enableFullscreen: true
    }
  },
  mediaVideo: {
    toolbar: createDefaultMediaToolbar({
      stylePrefix: 'mediaVideoStyle',
      resizePrefix: 'resizeMediaVideo'
    })
  },
  echart: {
    toolbar: createDefaultMediaToolbar({
      stylePrefix: 'echartStyle',
      resizePrefix: 'resizeEchart'
    })
  }
};

const CKEditorField = withLocale(
  ({
    className,
    style: customStyle,
    isMarkdown,
    config,
    plugins: customPlugins = [],
    locale: customLocale,
    uploadAdapter,
    liveComponent: liveComponentProp,
    formCreator: formCreatorProp,
    model3d: model3dProp,
    ...props
  }) => {
    const { formatMessage } = useIntl();
    const ckeditorI18n = useMemo(() => buildCKEditorI18n(formatMessage), [formatMessage]);
    const [value, onChange] = useControlValue(props);
    const wrapperRef = useRef(null);
    const measuredToolbarDropdownMaxWidth = useToolbarDropdownMaxWidth(wrapperRef);
    const contextLocale = useGlobalValue('locale');
    const { apis } = usePreset();
    const locale = customLocale || contextLocale;
    const plugins = useMemo(() => {
      const basePlugins = isMarkdown ? defaultPlugins : richTextPlugins;
      const list = [
        ...basePlugins,
        ...customPlugins.filter(
          plugin =>
            !isMarkdown ||
            (plugin !== Model3dPlugin &&
              plugin !== VideoPlugin &&
              plugin !== LiveComponentPlugin &&
              plugin !== EchartPlugin &&
              plugin !== FormCreatorPlugin)
        )
      ];

      if (isMarkdown) {
        list.push(Markdown);
      }

      return list;
    }, [isMarkdown, customPlugins]);

    const liveComponentConfig = useMemo(
      () => resolveLiveComponentOptions(defaultConfig.liveComponent, config?.liveComponent, liveComponentProp),
      [config?.liveComponent, liveComponentProp]
    );

    const formCreatorConfig = useMemo(
      () => resolveFormCreatorOptions(defaultConfig.formCreator, config?.formCreator, formCreatorProp),
      [config?.formCreator, formCreatorProp]
    );

    const model3dConfig = useMemo(
      () =>
        resolveModel3dOptions(defaultConfig.model3d, config?.model3d, {
          ...model3dProp,
          preview: {
            ...(model3dProp?.preview || {}),
            i18n: ckeditorI18n
          }
        }),
      [config?.model3d, model3dProp, ckeditorI18n]
    );

    const editorConfig = useMemo(() => {
      const merged = merge({}, defaultConfig, config, {
        liveComponent: liveComponentConfig,
        formCreator: formCreatorConfig,
        model3d: { ...model3dConfig, i18n: ckeditorI18n },
        ckeditorI18n
      });

      // lodash.merge 会按索引合并数组，导致自定义 toolbar.items 无法整体替换默认项
      if (Array.isArray(config?.toolbar?.items)) {
        merged.toolbar = {
          ...merged.toolbar,
          items: config.toolbar.items
        };
      }

      // 同上：自定义 style.definitions 需整体替换（邮件模版等场景）
      if (Array.isArray(config?.style?.definitions)) {
        merged.style = {
          ...merged.style,
          definitions: config.style.definitions
        };
      }

      if (!isMarkdown) {
        return merged;
      }

      const toolbarItems = (merged.toolbar?.items ?? defaultConfig.toolbar.items).filter(
        item =>
          item !== 'model3dUpload' &&
          item !== 'videoUpload' &&
          item !== 'insertLiveComponent' &&
          item !== 'insertEchart' &&
          item !== 'insertFormCreator'
      );
      const {
        model3d: _model3d,
        modelUpload: _modelUpload,
        videoUpload: _videoUpload,
        mediaVideo: _mediaVideo,
        liveComponent: _liveComponent,
        formCreator: _formCreator,
        ...rest
      } = merged;

      return {
        ...rest,
        toolbar: {
          ...merged.toolbar,
          items: toolbarItems
        }
      };
    }, [isMarkdown, config, liveComponentConfig, formCreatorConfig, model3dConfig, ckeditorI18n]);

    const wrapperStyle = useMemo(() => {
      if (!measuredToolbarDropdownMaxWidth) {
        return customStyle || undefined;
      }

      return {
        ...(customStyle || {}),
        '--ck-toolbar-dropdown-max-width': measuredToolbarDropdownMaxWidth
      };
    }, [customStyle, measuredToolbarDropdownMaxWidth]);

    return (
      <div ref={wrapperRef} className={classnames(className, style['editor'])} style={wrapperStyle}>
        <CKEditor5
          editor={ClassicEditor}
          data={value}
          config={merge({}, editorConfig, {
            licenseKey: 'GPL',
            plugins,
            ckeditorI18n,
            translations: [locale === 'zh-CN' ? coreTranslationsZh : coreTranslationsEn],
            uploadAdapter: Object.assign(
              {},
              {
                upload: apis?.file?.upload,
                uploadUrl: apis?.file?.uploadUrl
              },
              uploadAdapter
            ),
            ...(isMarkdown
              ? {}
              : {
                  modelUpload: Object.assign(
                    {},
                    {
                      upload: apis?.file?.upload
                    },
                    uploadAdapter,
                    config?.modelUpload
                  ),
                  videoUpload: Object.assign(
                    {},
                    {
                      upload: apis?.file?.upload
                    },
                    uploadAdapter,
                    config?.videoUpload
                  )
                })
          })}
          onChange={(event, editor) => {
            const data = editor.getData();
            onChange(data);
          }}
        />
      </div>
    );
  }
);

const CKEditor = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const { useDecorator } = hooks;
  const render = useDecorator(Object.assign({}, props));
  return render(CKEditorField);
});

CKEditor.Field = CKEditorField;

const CKContent = ({
  className,
  children,
  liveComponent: liveComponentProp,
  formCreator: formCreatorProp,
  model3d: model3dProp
}) => {
  const ref = useRef(null);
  const liveComponentOptions = useMemo(() => resolveLiveComponentOptions(liveComponentProp), [liveComponentProp]);
  const formCreatorOptions = useMemo(() => resolveFormCreatorOptions(formCreatorProp), [formCreatorProp]);
  const model3dOptions = useMemo(() => resolveModel3dOptions(model3dProp), [model3dProp]);

  useLayoutEffect(() => {
    const container = ref.current;

    if (!container) {
      return;
    }

    let cancelled = false;

    container.querySelectorAll('figure.ck-video').forEach(syncContentVideoLayout);
    enhanceLiveComponentContentPreview(container, liveComponentOptions);
    enhanceEchartContentPreview(container);
    enhanceFormCreatorContentPreview(container, formCreatorOptions);

    const setupModel3dPreview = () => {
      if (cancelled) {
        return;
      }

      const liveContainer = ref.current;

      if (!liveContainer) {
        return;
      }

      liveContainer.querySelectorAll('figure.ck-model3d, .ck-model3d').forEach(figure => {
        const modelViewer = figure.querySelector('model-viewer');

        if (!modelViewer) {
          return;
        }

        const height =
          model3dOptions.height ||
          figure.style.height ||
          figure.querySelector('.ck-model3d-viewer')?.style.height ||
          figure.querySelector('.ck-model3d')?.style.height ||
          modelViewer.style.height ||
          '400px';

        const host = figure.querySelector('.ck-model3d-viewer') || figure.querySelector('.ck-model3d') || figure;

        if (typeof customElements !== 'undefined' && customElements.upgrade) {
          customElements.upgrade(modelViewer);
        }

        if (model3dOptions.viewer && Object.keys(model3dOptions.viewer).length > 0) {
          applyModelViewerOptions(modelViewer, model3dOptions.viewer);
        }

        syncModelViewerLayout(host, modelViewer, height);
      });

      enhanceModel3dContentPreview(liveContainer, model3dOptions);
    };

    if (container.querySelector('model-viewer')) {
      whenModelViewerReady().then(setupModel3dPreview);
    }

    return () => {
      cancelled = true;
      teardownModel3dContentPreview(container);
      teardownLiveComponentContentPreview(container);
      teardownEchartContentPreview(container);
      teardownFormCreatorContentPreview(container);
    };
  }, [children, liveComponentOptions, formCreatorOptions, model3dOptions]);

  return <div ref={ref} className={classnames('ck ck-content', className)} dangerouslySetInnerHTML={{ __html: children }} />;
};

CKEditor.Content = CKContent;

export { formatToolbarDropdownMaxWidth, getToolbarDropdownMaxWidthStyle, useToolbarDropdownMaxWidth } from './toolbarDropdownMaxWidth';
export { EMAIL_STYLE_DEFINITIONS, EMAIL_TOOLBAR_ITEMS, EMAIL_STYLE_CSS } from './emailStyles';
export { toEmailHtml } from './emailExport';

export default CKEditor;

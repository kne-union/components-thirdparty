import { useEffect, useMemo, useRef } from 'react';
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
import whenModelViewerReady from '../../common/loadModelViewer';
import { useToolbarDropdownMaxWidth } from './toolbarDropdownMaxWidth';
import { syncModelViewerLayout } from '../../common/modelViewerMount';
import useControlValue from '@kne/use-control-value';
import merge from 'lodash/merge';
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

const richTextPlugins = [...defaultPlugins, Model3dPlugin];

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
        name: 'Paragraph',
        element: 'p',
        classes: ['part-content']
      },
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
        name: 'Keywords',
        element: 'span',
        classes: ['key-word']
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
        name: 'model-viewer',
        attributes: true,
        styles: true,
        classes: true
      },
      {
        name: 'section',
        classes: ['component-box'],
        styles: true,
        attributes: true
      }
    ]
  },
  modelUpload: {},
  model3d: {
    toolbar: [
      'model3dStyle:block',
      'model3dStyle:side',
      'model3dStyle:alignLeft',
      'model3dStyle:alignRight',
      'model3dStyle:alignCenter',
      'model3dStyle:alignBlockLeft',
      'model3dStyle:alignBlockRight',
      '|',
      'resizeModel3d:25',
      'resizeModel3d:50',
      'resizeModel3d:75',
      'resizeModel3d:original',
      '|',
      'resizeModel3dHeight:300',
      'resizeModel3dHeight:400',
      'resizeModel3dHeight:500',
      'resizeModel3dHeight:600',
      'resizeModel3dHeight:original'
    ]
  }
};

const CKEditorField = ({
  className,
  style: customStyle,
  isMarkdown,
  config,
  plugins: customPlugins = [],
  locale: customLocale,
  uploadAdapter,
  ...props
}) => {
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
      ...customPlugins.filter(plugin => !isMarkdown || plugin !== Model3dPlugin)
    ];

    if (isMarkdown) {
      list.push(Markdown);
    }

    return list;
  }, [isMarkdown, customPlugins]);

  const editorConfig = useMemo(() => {
    const merged = merge({}, defaultConfig, config);

    if (!isMarkdown) {
      return merged;
    }

    const toolbarItems = (merged.toolbar?.items ?? defaultConfig.toolbar.items).filter(
      item => item !== 'model3dUpload'
    );
    const { model3d: _model3d, modelUpload: _modelUpload, ...rest } = merged;

    return {
      ...rest,
      toolbar: {
        ...merged.toolbar,
        items: toolbarItems
      }
    };
  }, [isMarkdown, config]);

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
};

const CKEditor = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const { useDecorator } = hooks;
  const render = useDecorator(Object.assign({}, props));
  return render(CKEditorField);
});

CKEditor.Field = CKEditorField;

const CKContent = ({ className, children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container?.querySelector('model-viewer')) {
      return;
    }

    whenModelViewerReady().then(() => {
      container.querySelectorAll('figure.ck-model3d, .ck-model3d').forEach(figure => {
        const modelViewer = figure.querySelector('model-viewer');

        if (!modelViewer) {
          return;
        }

        const height =
          figure.style.height ||
          figure.querySelector('.ck-model3d-viewer')?.style.height ||
          figure.querySelector('.ck-model3d')?.style.height ||
          modelViewer.style.height ||
          '400px';

        const host = figure.querySelector('.ck-model3d-viewer') || figure.querySelector('.ck-model3d') || figure;

        if (typeof customElements !== 'undefined' && customElements.upgrade) {
          customElements.upgrade(modelViewer);
        }

        syncModelViewerLayout(host, modelViewer, height);
      });
    });
  }, [children]);

  return <div ref={ref} className={classnames('ck ck-content', className)} dangerouslySetInnerHTML={{ __html: children }} />;
};

CKEditor.Content = CKContent;

export { formatToolbarDropdownMaxWidth, getToolbarDropdownMaxWidthStyle, useToolbarDropdownMaxWidth } from './toolbarDropdownMaxWidth';

export default CKEditor;

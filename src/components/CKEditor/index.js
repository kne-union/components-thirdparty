import { useMemo } from 'react';
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
import { useGlobalValue } from '@kne/global-context';
import 'ckeditor5/ckeditor5.css';
import classnames from 'classnames';
import OssUploadAdapterPlugin from './OssUploadAdapterPlugin';
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
        name: 'section',
        classes: ['component-box'],
        styles: true,
        attributes: true
      }
    ]
  }
};

const CKEditorField = ({ className, isMarkdown, config, plugins: customPlugins = [], locale: customLocale, ...props }) => {
  const [value, onChange] = useControlValue(props);
  const contextLocale = useGlobalValue('locale');
  const locale = customLocale || contextLocale;
  const plugins = useMemo(() => {
    const plugins = [...defaultPlugins, ...customPlugins];
    if (isMarkdown) {
      plugins.push(Markdown);
    }
    return plugins;
  }, [isMarkdown, customPlugins]);
  return (
    <div className={classnames(className, style['editor'])}>
      <CKEditor5
        editor={ClassicEditor}
        data={value}
        config={merge({}, defaultConfig, config, {
          licenseKey: 'GPL',
          plugins,
          translations: [locale === 'zh-CN' ? coreTranslationsZh : coreTranslationsEn]
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
  return <div className={classnames('ck ck-content', className)} dangerouslySetInnerHTML={{ __html: children }} />;
};

CKEditor.Content = CKContent;

export default CKEditor;

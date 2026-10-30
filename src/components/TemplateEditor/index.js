import { Segmented, Alert } from 'antd';
import { DesktopOutlined, EditOutlined, EyeOutlined, MobileOutlined } from '@ant-design/icons';
import { useMemo, useRef, useState } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import { htmlToText, renderTemplate, textToHtml, validateTemplateHtml } from '@kne/message-template';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import classnames from 'classnames';
import CKEditor, { EMAIL_STYLE_DEFINITIONS, EMAIL_TOOLBAR_ITEMS, toEmailHtml } from '@components/CKEditor';
import withLocale from './withLocale';
import style from './style.module.scss';

export { renderTemplate, htmlToText, textToHtml };

const TEXT_TOOLBAR_ITEMS = ['undo', 'redo', '|', 'insertTemplateVariable', 'insertTemplateCondition'];

const PREVIEW_BASE_CSS = `
body{margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;font-size:14px;line-height:1.7;color:#262626;word-break:break-word}
img{max-width:100%;height:auto}
table{border-collapse:collapse;max-width:100%}
`;

const toPreviewDocument = html =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${PREVIEW_BASE_CSS}</style></head><body>${html}</body></html>`;

/** 未提供示例值的变量用 [标签] 占位，避免预览出现大片空白 */
const buildPreviewData = (variables, previewData) => {
  const data = cloneDeep(previewData || {});
  variables.forEach(({ name, label }) => {
    if (name && get(data, name) == null) {
      set(data, name, `[${label || name}]`);
    }
  });
  return data;
};

/**
 * 文本模式下 value 是纯文本，编辑器内是 HTML。
 * 父组件回传的正是上次输出的文本时，交还编辑器当前 HTML，避免 ckeditor5-react 判定数据变化而 setData 导致光标重置
 */
const useTextBridge = (isText, value, onChange) => {
  const lastRef = useRef({ text: null, html: '' });
  const editorValue = useMemo(() => {
    if (!isText) {
      return value;
    }
    return value === lastRef.current.text ? lastRef.current.html : textToHtml(value);
  }, [isText, value]);
  const handleChange = html => {
    if (!isText) {
      onChange?.(html);
      return;
    }
    const text = htmlToText(html);
    lastRef.current = { text, html };
    onChange?.(text);
  };
  return { editorValue, handleChange };
};

const EMPTY_VARIABLES = [];

const TemplateEditorField = withLocale(
  ({ type = 'html', value, onChange, onFocus, onBlur, className, height, variables = EMPTY_VARIABLES, previewData, subject, condition = true, config }) => {
    const { formatMessage } = useIntl();
    const isMobile = useIsMobile();
    const isText = type === 'text';
    const [mode, setMode] = useState('edit');
    const [device, setDevice] = useState('desktop');
    const { editorValue, handleChange } = useTextBridge(isText, value, onChange);

    const editorConfig = useMemo(() => {
      const toolbarItems = (isText ? TEXT_TOOLBAR_ITEMS : EMAIL_TOOLBAR_ITEMS).filter(
        item => (item !== 'insertTemplateVariable' || variables.length > 0) && (item !== 'insertTemplateCondition' || condition !== false)
      );
      return Object.assign(
        { toolbar: { items: toolbarItems }, templateVariable: { variables } },
        !isText && { style: { definitions: EMAIL_STYLE_DEFINITIONS } },
        condition !== false && {
          templateCondition: Object.assign(
            { allowElse: true, allowNesting: true },
            typeof condition === 'object' ? condition : null,
            // 块级条件会跨段落，转成纯文本后无法再识别回条件块
            isText && { allowBlock: false }
          )
        },
        config
      );
    }, [isText, variables, condition, config]);

    const preview = useMemo(() => {
      if (mode !== 'preview') {
        return null;
      }
      const data = buildPreviewData(variables, previewData);
      const source = value ?? '';
      const checked = validateTemplateHtml(source);
      if (!checked.ok) {
        return { error: checked.error };
      }
      try {
        if (isText) {
          return { text: renderTemplate(source, data, { type: 'text' }) };
        }
        return {
          html: toPreviewDocument(renderTemplate(toEmailHtml(source), data)),
          subject: subject ? renderTemplate(subject, data) : null
        };
      } catch (e) {
        return { error: e?.message || String(e) };
      }
    }, [mode, isText, value, subject, variables, previewData]);

    const renderPreview = () => {
      if (preview.error) {
        return <Alert type="error" showIcon message={formatMessage({ id: 'TemplateEditorInvalid' })} description={preview.error} />;
      }
      if (isText) {
        return (
          <div className={style['sms']}>
            <div className={style['sms-bubble']}>{preview.text}</div>
            <div className={style['sms-meta']}>{formatMessage({ id: 'TemplateEditorTextCount' }, { count: preview.text.length })}</div>
          </div>
        );
      }
      return (
        <div className={classnames(style['paper'], { [style['is-mobile']]: device === 'mobile' && !isMobile })}>
          {subject != null && (
            <div className={style['envelope']}>
              <div className={style['envelope-subject']}>{preview.subject || formatMessage({ id: 'TemplateEditorSubjectEmpty' })}</div>
              <div className={style['envelope-meta']}>{formatMessage({ id: 'TemplateEditorPreviewTip' })}</div>
            </div>
          )}
          <iframe title="template-preview" className={style['preview']} sandbox="" srcDoc={preview.html} />
        </div>
      );
    };

    return (
      <div
        className={classnames(className, style['template-editor'], { [style['is-text']]: isText })}
        style={{ '--template-editor-height': `${height ?? (isText ? 160 : 480)}px` }}>
        <div className={style['toolbar']}>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'edit', icon: <EditOutlined />, label: formatMessage({ id: 'TemplateEditorEdit' }) },
              { value: 'preview', icon: <EyeOutlined />, label: formatMessage({ id: 'TemplateEditorPreview' }) }
            ]}
          />
          {mode === 'preview' && !isText && !isMobile && (
            <Segmented
              value={device}
              onChange={setDevice}
              options={[
                { value: 'desktop', icon: <DesktopOutlined />, label: formatMessage({ id: 'TemplateEditorDesktop' }) },
                { value: 'mobile', icon: <MobileOutlined />, label: formatMessage({ id: 'TemplateEditorMobile' }) }
              ]}
            />
          )}
        </div>
        <div className={style['canvas']}>
          <div hidden={mode !== 'edit'} className={style['paper']}>
            <CKEditor.Field value={editorValue} onChange={handleChange} onFocus={onFocus} onBlur={onBlur} config={editorConfig} />
          </div>
          {preview && renderPreview()}
        </div>
      </div>
    );
  }
);

const TemplateEditor = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const { useDecorator } = hooks;
  const render = useDecorator(props);
  return render(TemplateEditorField);
});

TemplateEditor.Field = TemplateEditorField;

export default TemplateEditor;

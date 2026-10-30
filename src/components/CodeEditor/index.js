import MonacoEditor, { loader } from '@monaco-editor/react';
import ensureSlash from '@kne/ensure-slash';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CheckOutlined, FormatPainterOutlined, LoadingOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import classnames from 'classnames';
import withLocale from './withLocale';
import style from './style.module.scss';

if (window.MONACO_EDITOR_DIR) {
  loader.config({ paths: { vs: `${ensureSlash(window.MONACO_EDITOR_DIR)}/min/vs` } });
}

const FORMAT_ACTION_ID = 'editor.action.formatDocument';

/** 返回是否已执行格式化；当前语言没有格式化器时返回 false */
const formatDocument = async editor => {
  const action = editor?.getAction(FORMAT_ACTION_ID);
  if (!action || !action.isSupported()) {
    return false;
  }
  await action.run();
  return true;
};

const isFormatSupported = editor => !!editor?.getAction(FORMAT_ACTION_ID)?.isSupported();

/** 格式化器在语言首次加载时异步注册，只读等上下文也滞后于事件更新，变化后需要延迟复查 */
const useFormatSupported = editor => {
  const [supported, setSupported] = useState(() => isFormatSupported(editor));
  useEffect(() => {
    if (!editor) {
      setSupported(false);
      return;
    }
    let timers = [];
    const check = () => setSupported(isFormatSupported(editor));
    const recheck = () => {
      timers.forEach(clearTimeout);
      check();
      timers = [100, 500, 1500, 3000].map(delay => setTimeout(check, delay));
    };
    recheck();
    const disposables = [editor.onDidChangeModel(recheck), editor.onDidChangeModelLanguage(recheck), editor.onDidChangeConfiguration(recheck), editor.onDidFocusEditorText(check)];
    return () => {
      timers.forEach(clearTimeout);
      disposables.forEach(item => item.dispose());
    };
  }, [editor]);
  return supported;
};

const isDarkEditor = editor => /\b(vs-dark|hc-black)\b/.test(editor?.getDomNode()?.className || '');

/** Monaco 主题是全局的，按编辑器 DOM 上实际生效的主题类判断明暗 */
const useEditorDark = editor => {
  const [dark, setDark] = useState(() => isDarkEditor(editor));
  useEffect(() => {
    const node = editor?.getDomNode();
    if (!node) {
      return;
    }
    const check = () => setDark(isDarkEditor(editor));
    check();
    const observer = new MutationObserver(check);
    observer.observe(node, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [editor]);
  return dark;
};

const FORMAT_SHORTCUT = /Mac|iPhone|iPad/.test(navigator.platform) ? '⇧⌥F' : 'Shift+Alt+F';

const statusIcons = {
  idle: <FormatPainterOutlined />,
  loading: <LoadingOutlined />,
  done: <CheckOutlined />
};

const FormatAction = withLocale(({ editor }) => {
  const { formatMessage } = useIntl();
  const [status, setStatus] = useState('idle');
  const doneTimerRef = useRef(null);
  const supported = useFormatSupported(editor);
  const dark = useEditorDark(editor);
  useEffect(() => () => clearTimeout(doneTimerRef.current), []);
  if (!supported) {
    return null;
  }
  const label = formatMessage({ id: status === 'done' ? 'CodeEditorFormatted' : 'CodeEditorFormat' });
  return (
    <button
      type="button"
      aria-label={formatMessage({ id: 'CodeEditorFormat' })}
      className={classnames(style['format-action'], {
        [style['is-dark']]: dark,
        [style['is-done']]: status === 'done'
      })}
      disabled={status === 'loading'}
      onClick={async () => {
        clearTimeout(doneTimerRef.current);
        setStatus('loading');
        try {
          await formatDocument(editor);
          editor.focus();
          setStatus('done');
          doneTimerRef.current = setTimeout(() => setStatus('idle'), 1500);
        } catch (e) {
          setStatus('idle');
        }
      }}>
      <span className={style['format-action-icon']}>{statusIcons[status]}</span>
      <span className={style['format-action-label']}>
        <span>{label}</span>
        {status !== 'done' && <kbd className={style['format-action-kbd']}>{FORMAT_SHORTCUT}</kbd>}
      </span>
    </button>
  );
});

const CodeEditor = forwardRef(({ height = 500, formatActionOpen = true, ...props }, ref) => {
  const apiRef = useRef({});
  const [editor, setEditor] = useState(null);
  useImperativeHandle(
    ref,
    () => ({
      getValue: () => {
        return apiRef.current.editor && apiRef.current.editor.getValue();
      },
      setValue: value => {
        apiRef.current.editor && apiRef.current.editor.setValue(value);
      },
      format: () => formatDocument(apiRef.current.editor),
      getEditor: () => apiRef.current.editor,
      getMonaco: () => apiRef.current.monaco
    }),
    []
  );
  return (
    <div className={classnames(style['code-editor-container'])} style={{ height }}>
      <MonacoEditor
        {...props}
        height="100%"
        onMount={(editor, monaco) => {
          apiRef.current = { editor, monaco };
          setEditor(editor);
          props.onMount?.({ editor, monaco });
        }}
      />
      {formatActionOpen && editor && <FormatAction editor={editor} />}
    </div>
  );
});

export default CodeEditor;

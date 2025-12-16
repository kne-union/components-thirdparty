import MonacoEditor, { loader } from '@monaco-editor/react';
import ensureSlash from '@kne/ensure-slash';
import { forwardRef, useImperativeHandle, useRef } from 'react';

if (window.MONACO_EDITOR_DIR) {
  loader.config({ paths: { vs: `${ensureSlash(window.MONACO_EDITOR_DIR)}/min/vs` } });
}

const CodeEditor = forwardRef((props, ref) => {
  const apiRef = useRef({});
  useImperativeHandle(
    ref,
    () => ({
      getValue: () => {
        return apiRef.current.editor.getValue();
      },
      setValue: value => {
        apiRef.current.editor.setValue(value);
      },
      getEditor: () => apiRef.current.editor,
      getMonaco: () => apiRef.current.monaco
    }),
    []
  );
  return (
    <MonacoEditor
      {...Object.assign({}, { height: 500 }, props)}
      onMount={(editor, monaco) => {
        apiRef.current = { editor, monaco };
      }}
    />
  );
});

export default CodeEditor;

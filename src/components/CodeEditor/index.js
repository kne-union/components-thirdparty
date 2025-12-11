import MonacoEditor, { loader } from '@monaco-editor/react';
import ensureSlash from '@kne/ensure-slash';

if (window.MONACO_EDITOR_DIR) {
  loader.config({ paths: { vs: `${ensureSlash(window.MONACO_EDITOR_DIR)}/monaco-editor/min/vs` } });
}

const CodeEditor = props => {
  return <MonacoEditor {...Object.assign({}, { height: 500 }, props)} />;
};

export default CodeEditor;

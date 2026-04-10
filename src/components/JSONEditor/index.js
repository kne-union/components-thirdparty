import { Segmented, Flex } from 'antd';
import { useState, useRef, useMemo, useEffect } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import CodeEditor from '@components/CodeEditor';
import JSONView from '@kne/json-view';
import style from './style.module.scss';
import '@kne/json-view/dist/index.css';

const JSONEditorField = ({ value, onChange }) => {
  const [type, setType] = useState('code');
  const ref = useRef();
  const [editor, setEditor] = useState();
  const data = useMemo(() => {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }, [value]);

  useEffect(() => {
    if (editor && value !== editor.getValue()) {
      editor.setValue(value);
    }
  }, [value, editor]);

  return (
    <Flex vertical gap={8}>
      <Segmented
        value={type}
        options={[
          { value: 'code', label: '代码' },
          { value: 'preview', label: '预览' }
        ]}
        onChange={setType}
      />
      {type === 'code' && (
        <CodeEditor className={style['code-editor']}
          defaultValue={value}
          onChange={onChange}
          language="json"
          onMount={({ editor }) => {
            setEditor(editor);
          }}
        />
      )}
      {type === 'preview' && <JSONView data={data} theme="light"/>}
    </Flex>
  );
};

const JSONEditor = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const { useDecorator } = hooks;
  const render = useDecorator(props);
  return render(JSONEditorField);
});

JSONEditor.Field = JSONEditorField;

export default JSONEditor;

import { Segmented, Flex, Typography } from 'antd';
import { useState, useMemo, useEffect } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import CodeEditor from '@components/CodeEditor';
import classnames from 'classnames';
import JSONView from '@kne/json-view';
import style from './style.module.scss';
import '@kne/json-view/dist/index.css';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';

const JSONEditorField = withLocale(({ value, onChange, className }) => {
  const { formatMessage } = useIntl();
  const [type, setType] = useState('code');
  const [editor, setEditor] = useState();
  const { previewData, parseError } = useMemo(() => {
    const text = value ?? '';
    const trimmed = String(text).trim();

    if (!trimmed) {
      return { previewData: {}, parseError: false };
    }

    try {
      return { previewData: JSON.parse(trimmed), parseError: false };
    } catch {
      return { previewData: null, parseError: true };
    }
  }, [value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const next = value ?? '';

    if (next !== editor.getValue()) {
      editor.setValue(next);
    }
  }, [value, editor]);

  return (
    <Flex vertical gap={8} className={classnames(className, style['json-editor'])}>
      <Segmented
        value={type}
        options={[
          { value: 'code', label: formatMessage({ id: 'ModeCode' }) },
          { value: 'preview', label: formatMessage({ id: 'ModePreview' }) }
        ]}
        onChange={setType}
      />
      {type === 'code' && (
        <CodeEditor
          className={style['code-editor']}
          defaultValue={value ?? ''}
          onChange={onChange}
          language="json"
          onMount={({ editor }) => {
            setEditor(editor);
          }}
        />
      )}
      {type === 'preview' &&
        (parseError ? (
          <Typography.Text type="danger">{formatMessage({ id: 'InvalidJson' })}</Typography.Text>
        ) : (
          <JSONView data={previewData} theme="light" />
        ))}
    </Flex>
  );
});

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

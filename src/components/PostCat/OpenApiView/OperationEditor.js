import { useMemo, useState } from 'react';
import { Flex, Segmented, message } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import JSONEditor from '@components/JSONEditor';
import withLocale from '../withLocale';
import { HTTP_METHODS } from './parseOpenApiData';
import { getRawOperation, splitOperationKey, toOperationKey } from './operationDoc';
import { fromFormData, fromJsonText, toFormData, toJsonText } from './operationForm';
import SchemaEditor from './SchemaEditor';
import ContentTypeInput from './ContentTypeInput';

const PATH_PATTERN = /^\/\S*$/;

const NEW_OPERATION = { method: 'get', path: '/', operation: { responses: { 200: { description: 'OK' } } } };

const getSchemaRefs = doc => {
  const isOpenApi3 = typeof doc?.openapi === 'string';
  const schemas = (isOpenApi3 ? doc?.components?.schemas : doc?.definitions) || {};
  return Object.keys(schemas).map(name => `${isOpenApi3 ? '#/components/schemas/' : '#/definitions/'}${name}`);
};

const toOptions = list => list.map(value => ({ value, label: value }));

const parseCurrent = (state, data, isOpenApi3) => (state.mode === 'form' ? fromFormData(data, state.draft, isOpenApi3) : fromJsonText(data.json));

/** state 为本次弹窗共享的 { mode, draft }：formModal 的 children 只在打开时生成，模式须由子组件自己持有 */
const OperationFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:FormInfo@useFormContext']
})(
  withLocale(({ remoteModules, state, doc, tags }) => {
    const [FormInfo, useFormContext] = remoteModules;
    const { List, fields } = FormInfo;
    const { Input, TextArea, Select, Switch } = fields;
    const { openApi } = useFormContext();
    const { formatMessage } = useIntl();
    const [messageApi, contextHolder] = message.useMessage();
    const [mode, setMode] = useState(state.mode);
    const isOpenApi3 = typeof doc?.openapi === 'string';
    const schemaRefs = useMemo(() => getSchemaRefs(doc), [doc]);

    const switchMode = next => {
      let draft;
      try {
        draft = parseCurrent(state, openApi.getFormData(), isOpenApi3);
      } catch {
        messageApi.error(formatMessage({ id: 'PostCatInvalidJson' }));
        return;
      }
      const nextData = next === 'form' ? toFormData(draft, isOpenApi3) : { json: toJsonText(draft) };
      Object.assign(state, { mode: next, draft });
      openApi.setFormData(nextData);
      // 卸载字段的暂存值会被裁成稀疏数组，须清掉，让新挂载的字段读 setFormData 写入的初值
      openApi.forgetFields(Object.keys(nextData));
      setMode(next);
    };

    const schemaEditor = name => <SchemaEditor name={name} label={formatMessage({ id: 'PostCatSchema' })} refs={schemaRefs} block />;

    return (
      <Flex vertical gap={16}>
        {contextHolder}
        <Segmented
          value={mode}
          onChange={switchMode}
          options={[
            { value: 'form', label: formatMessage({ id: 'PostCatEditModeForm' }) },
            { value: 'json', label: 'JSON' }
          ]}
        />
        {mode === 'form' ? (
          <>
            <FormInfo
              column={2}
              list={[
                <Select
                  name="method"
                  label={formatMessage({ id: 'PostCatApiMethod' })}
                  rule="REQ"
                  options={HTTP_METHODS.map(method => ({ value: method, label: method.toUpperCase() }))}
                />,
                <Input name="path" label={formatMessage({ id: 'PostCatApiPath' })} rule="REQ API_PATH" placeholder="/pet/{petId}" />,
                <Input name="summary" label={formatMessage({ id: 'PostCatApiSummary' })} />,
                <Select name="tags" label={formatMessage({ id: 'PostCatApiTags' })} mode="tags" options={toOptions(tags)} />,
                <Switch name="deprecated" label={formatMessage({ id: 'PostCatDeprecated' })} />,
                <TextArea name="description" label={formatMessage({ id: 'PostCatApiDescription' })} block />
              ]}
            />
            <List
              name="parameters"
              title={formatMessage({ id: 'PostCatParameters' })}
              addText={formatMessage({ id: 'PostCatAddParameter' })}
              list={[
                <Input name="name" label={formatMessage({ id: 'PostCatParamName' })} rule="REQ" />,
                <Select
                  name="in"
                  label={formatMessage({ id: 'PostCatParamIn' })}
                  rule="REQ"
                  options={toOptions(isOpenApi3 ? ['path', 'query', 'header', 'cookie'] : ['path', 'query', 'header', 'formData', 'body'])}
                />,
                <Switch name="required" label={formatMessage({ id: 'PostCatRequired' })} />,
                <Input name="description" label={formatMessage({ id: 'PostCatFieldDescription' })} />,
                schemaEditor('schema')
              ]}
            />
            {isOpenApi3 && (
              <FormInfo
                title={formatMessage({ id: 'PostCatRequestBody' })}
                column={2}
                list={[
                  <ContentTypeInput name="requestBodyContentType" label="Content-Type" />,
                  <Switch name="requestBodyRequired" label={formatMessage({ id: 'PostCatRequired' })} />,
                  <Input name="requestBodyDescription" label={formatMessage({ id: 'PostCatFieldDescription' })} block />,
                  schemaEditor('requestBodySchema')
                ]}
              />
            )}
            <List
              name="responses"
              title={formatMessage({ id: 'PostCatResponses' })}
              addText={formatMessage({ id: 'PostCatAddResponse' })}
              list={[
                <Input name="status" label={formatMessage({ id: 'PostCatStatusCode' })} rule="REQ" placeholder="200" />,
                isOpenApi3 ? <ContentTypeInput name="contentType" label="Content-Type" /> : null,
                <Input name="description" label={formatMessage({ id: 'PostCatFieldDescription' })} rule="REQ" block />,
                schemaEditor('schema')
              ].filter(Boolean)}
            />
          </>
        ) : (
          <FormInfo
            column={1}
            list={[<JSONEditor name="json" label={formatMessage({ id: 'PostCatOperationJson' })} rule="REQ OPERATION_JSON" height={460} />]}
          />
        )}
      </Flex>
    );
  })
);

/** operationKey 为空表示新增接口；onOk({ method, path, operation }) 返回 false 时不关闭弹窗 */
export const openOperationEditor = ({ formModal, formatMessage, doc, operationKey, tags = [], onOk }) => {
  const isOpenApi3 = typeof doc?.openapi === 'string';
  const state = {
    mode: 'form',
    draft: operationKey ? Object.assign(splitOperationKey(operationKey), { operation: getRawOperation(doc, operationKey) || {} }) : NEW_OPERATION
  };

  const checkPath = (method, path) => {
    if (!PATH_PATTERN.test(path || '')) {
      return formatMessage({ id: 'PostCatApiPathRule' });
    }
    const key = toOperationKey(method, path);
    return key !== operationKey && getRawOperation(doc, key) ? formatMessage({ id: 'PostCatApiExists' }) : '';
  };

  const rules = {
    API_PATH: (value, { data }) => {
      const errMsg = checkPath(data?.method, String(value || '').trim());
      return { result: !errMsg, errMsg };
    },
    OPERATION_JSON: value => {
      let parsed;
      try {
        parsed = fromJsonText(value);
      } catch {
        return { result: false, errMsg: formatMessage({ id: 'PostCatJsonObjectRequired' }) };
      }
      if (!HTTP_METHODS.includes(parsed.method)) {
        return { result: false, errMsg: formatMessage({ id: 'PostCatApiMethodRule' }, { methods: HTTP_METHODS.join(', ') }) };
      }
      const errMsg = checkPath(parsed.method, parsed.path);
      return { result: !errMsg, errMsg };
    }
  };

  return formModal({
    title: formatMessage({ id: operationKey ? 'PostCatEditApi' : 'PostCatAddApi' }),
    width: 880,
    autoClose: true,
    formProps: {
      data: toFormData(state.draft, isOpenApi3),
      rules,
      onSubmit: data => onOk(parseCurrent(state, data, isOpenApi3))
    },
    children: <OperationFormInner state={state} doc={doc} tags={tags} />
  });
};

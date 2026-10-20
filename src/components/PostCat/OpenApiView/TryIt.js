import { useMemo, useState } from 'react';
import { Button, Descriptions, Input, Select, Space, Tag, Typography } from 'antd';
import { FileAddOutlined, SaveOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import JSONView from '@kne/json-view';
import '@kne/json-view/dist/index.css';
import withLocale from '../withLocale';
import { buildExample } from './parseOpenApiData';
import ScrollArea from '../ScrollArea';
import RequestBodyEditor from './RequestBodyEditor';
import style from '../style.module.scss';

const { Text } = Typography;
const { TextArea } = Input;

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const TextResponse = withLocale(({ text }) => {
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState('');
  const parts = keyword ? text.split(new RegExp(`(${escapeRegExp(keyword)})`, 'gi')) : [text];
  const count = keyword ? (parts.length - 1) / 2 : 0;
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        allowClear
        size="small"
        prefix={<SearchOutlined />}
        placeholder={formatMessage({ id: 'PostCatSearchResponse' })}
        suffix={keyword ? <Text type="secondary">{count}</Text> : null}
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      <ScrollArea className={style['code-scroll']}>
        <pre className={style['code-block']}>{parts.map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part))}</pre>
      </ScrollArea>
    </Space>
  );
});

const parseHeaders = headers => {
  if (!headers) {
    return {};
  }
  if (typeof headers === 'object') {
    return headers;
  }
  try {
    const value = JSON.parse(headers);
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
};

const initValues = (parameters = []) =>
  parameters.reduce((output, item) => {
    const example = item.example !== undefined ? item.example : buildExample(item.schema);
    output[item.name] = example === null || example === undefined || typeof example === 'object' ? '' : String(example);
    return output;
  }, {});

const ParameterInputs = ({ label, parameters, values, onChange }) => {
  if (!parameters.length) {
    return null;
  }
  return (
    <div className={style['try-group']}>
      <Text strong>{label}</Text>
      {parameters.map(item => (
        <div className={style['try-field']} key={item.name}>
          <div className={style['try-field-label']}>
            <Text code>{item.name}</Text>
            {item.required && <span className={style['schema-required']}>*</span>}
          </div>
          <Input
            value={values[item.name]}
            placeholder={item.description || item.schema?.type}
            onChange={e => onChange(Object.assign({}, values, { [item.name]: e.target.value }))}
          />
        </div>
      ))}
    </div>
  );
};

const MAX_STORED_BODY_LENGTH = 100000;

const toStorableData = data => {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  return text && text.length > MAX_STORED_BODY_LENGTH ? `${text.slice(0, MAX_STORED_BODY_LENGTH)}\n...` : data;
};

const createRecordId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** record 为调用记录或接口用例，用于还原请求（及响应）；每次发送完成后通过 onSend 回传新的调用记录 */
const TryIt = withLocale(({ operation, servers = [], envs = [], record, currentCase, caseActionsOpen = true, onSend, onSaveCase }) => {
  const { formatMessage } = useIntl();
  const targets = useMemo(
    () => [
      ...envs.map(env => ({ value: `env:${env.id}`, label: env.name, baseUrl: env.baseUrl, headers: parseHeaders(env.headers) })),
      ...servers.map((server, index) => ({ value: `server:${index}`, label: server.url, baseUrl: server.url, headers: {} })),
      { value: 'custom', label: formatMessage({ id: 'PostCatCustomBaseUrl' }), baseUrl: '', headers: {} }
    ],
    [envs, servers, formatMessage]
  );
  const request = record?.request;
  const restoredTarget = request && targets.find(item => item.value === request.target);
  const [target, setTarget] = useState(request ? (restoredTarget ? request.target : 'custom') : targets[0].value);
  const [customBaseUrl, setCustomBaseUrl] = useState(request ? (restoredTarget ? request.customBaseUrl || '' : request.baseUrl) : '');
  const [pathValues, setPathValues] = useState(() => Object.assign(initValues(operation.parameters.path), request?.path));
  const [queryValues, setQueryValues] = useState(() => Object.assign(initValues(operation.parameters.query), request?.query));
  const [headerValues, setHeaderValues] = useState(() => Object.assign(initValues(operation.parameters.header), request?.header));
  const bodyContent = operation.requestBody.content[0];
  const [body, setBody] = useState(() => {
    if (request) {
      return request.body || '';
    }
    if (!bodyContent) {
      return '';
    }
    const example = bodyContent.example !== undefined ? bodyContent.example : buildExample(bodyContent.schema);
    return example === null ? '' : JSON.stringify(example, null, 2);
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(record ? record.response : null);

  const bodyTitle = bodyContent && (
    <Space size={8}>
      <Text strong>{formatMessage({ id: 'PostCatRequestBody' })}</Text>
      <Tag bordered={false}>{bodyContent.contentType}</Tag>
    </Space>
  );
  const currentTarget = targets.find(item => item.value === target) || targets[0];
  const baseUrl = target === 'custom' ? customBaseUrl : currentTarget.baseUrl;

  const buildUrl = () => {
    const path = operation.path.replace(/\{([^}]+)\}/g, (match, name) => encodeURIComponent(pathValues[name] ?? ''));
    const query = new URLSearchParams();
    Object.keys(queryValues).forEach(name => {
      if (queryValues[name] !== '') {
        query.append(name, queryValues[name]);
      }
    });
    const queryString = query.toString();
    return `${String(baseUrl || '').replace(/\/$/, '')}${path}${queryString ? `?${queryString}` : ''}`;
  };

  const getRequest = () => ({
    target,
    baseUrl,
    customBaseUrl,
    path: pathValues,
    query: queryValues,
    header: headerValues,
    body
  });

  const send = async () => {
    const headers = Object.assign({}, currentTarget.headers);
    Object.keys(headerValues).forEach(name => {
      if (headerValues[name] !== '') {
        headers[name] = headerValues[name];
      }
    });
    const init = { method: operation.method.toUpperCase(), headers };
    if (bodyContent && body.trim() && !['GET', 'HEAD'].includes(init.method)) {
      if (/json/i.test(bodyContent.contentType)) {
        try {
          JSON.parse(body);
        } catch {
          setResult({ error: formatMessage({ id: 'PostCatBodyInvalid' }) });
          return;
        }
      }
      headers['Content-Type'] = bodyContent.contentType;
      init.body = body;
    }
    setLoading(true);
    const start = Date.now();
    const url = buildUrl();
    const finish = response => {
      setResult(response);
      onSend &&
        onSend({
          id: createRecordId(),
          time: start,
          operationKey: operation.key,
          method: operation.method,
          path: operation.path,
          summary: operation.summary,
          url,
          request: getRequest(),
          response: Object.assign({}, response, response.data !== undefined ? { data: toStorableData(response.data) } : null)
        });
    };
    try {
      const response = await fetch(url, init);
      const text = await response.text();
      let data = text;
      try {
        data = JSON.parse(text);
      } catch {
        // 非 JSON 响应按文本展示
      }
      const responseHeaders = {};
      response.headers.forEach((value, name) => {
        responseHeaders[name] = value;
      });
      finish({ status: response.status, statusText: response.statusText, duration: Date.now() - start, headers: responseHeaders, data });
    } catch (error) {
      finish({ error: error.message, duration: Date.now() - start });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style['try-it']}>
      <div className={style['try-url']}>
        <Select
          className={style['try-target']}
          value={target}
          onChange={setTarget}
          options={targets.map(({ value, label }) => ({ value, label }))}
          popupMatchSelectWidth={false}
        />
        {target === 'custom' && (
          <Input className={style['try-custom']} value={customBaseUrl} placeholder="https://" onChange={e => setCustomBaseUrl(e.target.value)} />
        )}
        <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={send}>
          {formatMessage({ id: 'PostCatSend' })}
        </Button>
        {caseActionsOpen && onSaveCase && currentCase && (
          <Button icon={<SaveOutlined />} onClick={() => onSaveCase(getRequest(), { saveAs: false })}>
            {formatMessage({ id: 'PostCatSaveCase' })}
          </Button>
        )}
        {caseActionsOpen && onSaveCase && (
          <Button icon={currentCase ? <FileAddOutlined /> : <SaveOutlined />} onClick={() => onSaveCase(getRequest(), { saveAs: true })}>
            {formatMessage({ id: currentCase ? 'PostCatSaveAsNewCase' : 'PostCatSaveAsCase' })}
          </Button>
        )}
      </div>
      <Text type="secondary" className={style['try-preview']} copyable={{ text: buildUrl() }}>
        {`${operation.method.toUpperCase()} ${buildUrl()}`}
      </Text>
      <ParameterInputs
        label={formatMessage({ id: 'PostCatPathParameters' })}
        parameters={operation.parameters.path}
        values={pathValues}
        onChange={setPathValues}
      />
      <ParameterInputs
        label={formatMessage({ id: 'PostCatQueryParameters' })}
        parameters={operation.parameters.query}
        values={queryValues}
        onChange={setQueryValues}
      />
      <ParameterInputs
        label={formatMessage({ id: 'PostCatHeaderParameters' })}
        parameters={operation.parameters.header}
        values={headerValues}
        onChange={setHeaderValues}
      />
      {bodyContent && (
        <div className={style['try-group']}>
          {/json/i.test(bodyContent.contentType) ? (
            <RequestBodyEditor title={bodyTitle} schema={bodyContent.schema} value={body} onChange={setBody} />
          ) : (
            <>
              {bodyTitle}
              <TextArea className={style['code-text']} value={body} autoSize={{ minRows: 4, maxRows: 16 }} onChange={e => setBody(e.target.value)} />
            </>
          )}
        </div>
      )}
      {result && (
        <div className={style['try-group']}>
          <Text strong>{formatMessage({ id: 'PostCatResponse' })}</Text>
          {result.error ? (
            <Text type="danger">{`${formatMessage({ id: 'PostCatRequestError' })}: ${result.error}`}</Text>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Tag color={result.status < 300 ? 'success' : result.status < 400 ? 'warning' : 'error'}>
                  {`${formatMessage({ id: 'PostCatStatus' })} ${result.status} ${result.statusText || ''}`}
                </Tag>
                <Tag>{`${formatMessage({ id: 'PostCatDuration' })} ${result.duration}ms`}</Tag>
              </Space>
              {Object.keys(result.headers).length > 0 && (
                <Descriptions size="small" column={1} bordered title={formatMessage({ id: 'PostCatResponseHeaders' })}>
                  {Object.keys(result.headers).map(name => (
                    <Descriptions.Item key={name} label={name}>
                      {result.headers[name]}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              )}
              <Text strong>{formatMessage({ id: 'PostCatResponseBody' })}</Text>
              {result.data !== null && typeof result.data === 'object' ? (
                <JSONView data={result.data} theme="light" collapsedFrom={3} />
              ) : (
                <TextResponse text={String(result.data)} />
              )}
            </Space>
          )}
        </div>
      )}
    </div>
  );
});

export default TryIt;

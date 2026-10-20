import { useMemo, useState } from 'react';
import { Button, Popconfirm, Segmented, Space, Tabs, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, FileTextOutlined, SendOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import useResize from '@kne/use-resize';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { MethodTag } from './ApiMenu';
import SchemaTable from './SchemaTable';
import TryIt from './TryIt';
import CaseSelect from './CaseSelect';
import { buildExample, schemaToRows } from './parseOpenApiData';
import ScrollArea from '../ScrollArea';
import style from '../style.module.scss';

const { Title, Paragraph, Text } = Typography;

const DRAFT_KEY = '__draft__';
const NARROW_WIDTH = 640;

const toParameterRows = parameters =>
  parameters.map(item => {
    const row = schemaToRows(item.schema || {}, { name: item.name, required: item.required })[0];
    return Object.assign({}, row, {
      description: item.description || row.description,
      example: item.example !== undefined ? item.example : row.example,
      deprecated: !!item.deprecated
    });
  });

const statusColor = statusCode => (/^2/.test(statusCode) ? 'success' : /^[45]/.test(statusCode) ? 'error' : 'default');

const Section = ({ title, extra, children }) => (
  <section className={style['api-section']}>
    <div className={style['api-section-title']}>
      <Text strong>{title}</Text>
      {extra}
    </div>
    {children}
  </section>
);

const ContentItem = withLocale(({ item }) => {
  const { formatMessage } = useIntl();
  const example = item.example !== undefined ? item.example : buildExample(item.schema);
  const hasExample = example !== null && example !== undefined;
  const [view, setView] = useState(item.schema ? 'schema' : 'example');
  return (
    <div className={style['content-item']}>
      <div className={style['content-item-bar']}>
        <Text type="secondary" className={style['code-text']}>
          {item.contentType}
        </Text>
        {item.schema && hasExample && (
          <Segmented
            size="small"
            value={view}
            onChange={setView}
            options={[
              { label: formatMessage({ id: 'PostCatFieldName' }), value: 'schema' },
              { label: formatMessage({ id: 'PostCatExample' }), value: 'example' }
            ]}
          />
        )}
      </div>
      {view === 'schema' && item.schema && <SchemaTable rows={schemaToRows(item.schema)} />}
      {view === 'example' && hasExample && (
        <ScrollArea className={style['code-scroll']}>
          <pre className={style['code-block']}>{JSON.stringify(example, null, 2)}</pre>
        </ScrollArea>
      )}
    </div>
  );
});

const ContentList = ({ content }) => content.map(item => <ContentItem key={item.contentType} item={item} />);

const ApiItem = withLocale(
  ({
    operation,
    servers,
    envs,
    tryIt = true,
    tryItKey,
    activeTab = 'doc',
    onTabChange,
    record,
    cases = [],
    currentCase,
    caseActionsOpen = true,
    onSelectCase,
    onSend,
    onSaveCase,
    onRenameCase,
    onRemoveCase,
    onEditOperation,
    onRemoveOperation
  }) => {
    const { formatMessage } = useIntl();
    const [narrow, setNarrow] = useState(false);
    const rootRef = useResize(el => setNarrow(el.clientWidth < NARROW_WIDTH));
    const parameterGroups = useMemo(
      () =>
        [
          { name: 'path', label: formatMessage({ id: 'PostCatPathParameters' }) },
          { name: 'query', label: formatMessage({ id: 'PostCatQueryParameters' }) },
          { name: 'header', label: formatMessage({ id: 'PostCatHeaderParameters' }) },
          { name: 'cookie', label: formatMessage({ id: 'PostCatCookieParameters' }) }
        ].filter(group => operation.parameters[group.name].length > 0),
      [operation, formatMessage]
    );

    const docContent = (
      <>
        <Section title={formatMessage({ id: 'PostCatParameters' })}>
          {parameterGroups.length > 0 ? (
            parameterGroups.map(group => (
              <div key={group.name} className={style['content-item']}>
                <Text type="secondary">{group.label}</Text>
                <SchemaTable rows={toParameterRows(operation.parameters[group.name])} />
              </div>
            ))
          ) : (
            <Text type="secondary">{formatMessage({ id: 'PostCatNoParameters' })}</Text>
          )}
        </Section>
        {operation.requestBody.content.length > 0 && (
          <Section
            title={
              <span>
                {formatMessage({ id: 'PostCatRequestBody' })}
                {operation.requestBody.required && <span className={style['schema-required']}>*</span>}
              </span>
            }
          >
            {operation.requestBody.description && <Text type="secondary">{operation.requestBody.description}</Text>}
            <ContentList content={operation.requestBody.content} />
          </Section>
        )}
        {operation.responses.length > 0 && (
          <Section title={formatMessage({ id: 'PostCatResponses' })}>
            <Tabs
              size="small"
              className={style['response-tabs']}
              items={operation.responses.map(response => ({
                key: response.statusCode,
                label: (
                  <span className={style['response-tab-label']}>
                    <Tag color={statusColor(response.statusCode)}>{response.statusCode}</Tag>
                    <span>{response.description}</span>
                  </span>
                ),
                children: response.content.length ? (
                  <ContentList content={response.content} />
                ) : (
                  <Text type="secondary">{response.description || '-'}</Text>
                )
              }))}
            />
          </Section>
        )}
      </>
    );

    const tryItNode = (
      <TryIt
        key={tryItKey || operation.key}
        operation={operation}
        servers={servers}
        envs={envs}
        record={record}
        currentCase={currentCase}
        caseActionsOpen={caseActionsOpen}
        onSend={onSend}
        onSaveCase={onSaveCase}
      />
    );

    const runContent =
      cases.length > 0 && narrow ? (
        <>
          <CaseSelect
            cases={cases}
            currentCase={currentCase}
            caseActionsOpen={caseActionsOpen}
            onSelectCase={onSelectCase}
            onRenameCase={onRenameCase}
            onRemoveCase={onRemoveCase}
          />
          {tryItNode}
        </>
      ) : cases.length > 0 ? (
        <div className={style['run-layout']}>
          <div className={style['case-list']}>
            <ScrollArea className={style['case-list-scroll']}>
              <div className={style['case-list-inner']}>
                {[{ id: null, name: formatMessage({ id: 'PostCatDraftRequest' }) }, ...cases].map(item => (
                  <div
                    key={item.id || DRAFT_KEY}
                    className={classnames(style['case-list-item'], { [style['is-active']]: (currentCase?.id || null) === item.id })}
                    title={item.name}
                    onClick={() => onSelectCase(item.id)}
                  >
                    {item.id ? <FileTextOutlined /> : <SendOutlined />}
                    <span className={style['menu-item-text']}>{item.name}</span>
                    {item.id && caseActionsOpen && (
                      <span className={style['case-list-actions']} onClick={e => e.stopPropagation()}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          aria-label={formatMessage({ id: 'PostCatRenameCase' })}
                          onClick={() => onRenameCase(item)}
                        />
                        <Popconfirm title={formatMessage({ id: 'PostCatRemoveCaseConfirm' })} onConfirm={() => onRemoveCase(item)}>
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={formatMessage({ id: 'PostCatRemoveCase' })} />
                        </Popconfirm>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className={style['run-main']}>{tryItNode}</div>
        </div>
      ) : (
        tryItNode
      );

    return (
      <div ref={rootRef} className={style['api-item']}>
        <div className={style['api-item-header']}>
          <div className={style['api-item-title']}>
            <Title level={5} style={{ margin: 0 }}>
              {operation.summary || operation.path}
            </Title>
            {(onEditOperation || onRemoveOperation) && (
              <Space size={4}>
                {onEditOperation && (
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={onEditOperation}>
                    {formatMessage({ id: 'PostCatEdit' })}
                  </Button>
                )}
                {onRemoveOperation && (
                  <Popconfirm title={formatMessage({ id: 'PostCatRemoveApiConfirm' })} onConfirm={onRemoveOperation}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                      {formatMessage({ id: 'PostCatDelete' })}
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            )}
          </div>
          <div className={style['api-item-path']}>
            <MethodTag method={operation.method} />
            <Text code copyable={{ text: operation.path }} delete={operation.deprecated}>
              {operation.path}
            </Text>
            {operation.deprecated && <Tag color="error">{formatMessage({ id: 'PostCatDeprecated' })}</Tag>}
            {operation.operationId && <Text type="secondary">{operation.operationId}</Text>}
          </div>
          {operation.description && (
            <Paragraph type="secondary" className={style['pre-wrap']} style={{ margin: 0 }}>
              {operation.description}
            </Paragraph>
          )}
        </div>
        {tryIt ? (
          <Tabs
            className={style['api-tabs']}
            activeKey={activeTab}
            onChange={onTabChange}
            items={[
              {
                key: 'doc',
                label: formatMessage({ id: 'PostCatDocTab' }),
                children: <div className={style['api-tab-body']}>{docContent}</div>
              },
              {
                key: 'run',
                label: formatMessage({ id: 'PostCatTryIt' }),
                children: <div className={style['run-tab-body']}>{runContent}</div>
              }
            ]}
          />
        ) : (
          <div className={style['api-tab-body']}>{docContent}</div>
        )}
      </div>
    );
  }
);

export default ApiItem;

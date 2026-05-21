import { createWithRemoteLoader } from '@kne/remote-loader';
import { encode, decode } from 'plantuml-encoder';
import { App, Tabs, Flex, Alert, Segmented, Splitter, Collapse, Button, Space } from 'antd';
import { MenuOutlined, SplitCellsOutlined, EyeOutlined, CopyOutlined, SnippetsOutlined } from '@ant-design/icons';
import CodeEditor from '@components/CodeEditor';
import LiveComponentView from '@components/LiveComponentView';
import useRefCallback from '@kne/use-ref-callback';
import lodash from 'lodash';
import dayjs from 'dayjs';
import transform from 'lodash/transform';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import style from './style.module.scss';

/** 解析 PlantUML 编码或 JSON 字符串为组件配置对象 */
export const decodeLiveComponentValue = value => {
  if (!value?.trim()) {
    return null;
  }

  const trimmed = value.trim();

  try {
    return JSON.parse(decode(trimmed));
  } catch {
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
};

const SafeRender = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalContext', 'components-core:Global@PureGlobal']
})(({ remoteModules, children }) => {
  const [useGlobalContext, PureGlobal] = remoteModules;
  const { global } = useGlobalContext();
  const containerRef = useRef(null);
  const rootRef = useRef(null);

  const renderComponent = useMemo(
    () =>
      debounce((nextChildren, locale, themeToken) => {
        const container = containerRef.current;
        if (!container) {
          return;
        }

        if (rootRef.current) {
          rootRef.current.unmount();
          rootRef.current = null;
        }

        container.innerHTML = '';
        const dom = document.createElement('div');
        container.appendChild(dom);
        const root = createRoot(dom);
        rootRef.current = root;
        root.render(
          <PureGlobal preset={{ locale }} themeToken={themeToken}>
            {nextChildren}
          </PureGlobal>
        );
      }, 1000),
    [PureGlobal]
  );

  useEffect(() => {
    renderComponent(children, global.locale, global.themeToken);
    return () => {
      renderComponent.cancel();
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, [children, global.locale, global.themeToken, renderComponent]);

  return <div ref={containerRef} />;
});

const LiveComponentEditorCore = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:InfoPage', 'components-core:InfoPage@CentralContent', 'components-core:Common@SimpleBar']
})(
  withLocale(
    forwardRef(({ remoteModules, defaultValue, defaultMod = 'mix', height = 500, libs = { lodash, dayjs }, onChange }, ref) => {
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const [FormInfo, InfoPage, CentralContent, SimpleBar] = remoteModules;
    const { Form, TableList } = FormInfo;
    const { Input, Select } = FormInfo.fields;
    const codeEditorRef = useRef(null);
    const [params, setParams] = useState(() => decodeLiveComponentValue(defaultValue) || {});

    const applyParams = useRefCallback(nextParams => {
      const merged = Object.assign({}, { content: '', props: {}, scope: {} }, nextParams);

      setParams(merged);
      codeEditorRef.current?.setValue(merged.content || '');
    });
    const defaultValueRef = useRef(defaultValue);
    const outputContent = useMemo(() => {
      if (isEmpty(params)) {
        return '';
      }
      return encode(JSON.stringify(params));
    }, [params]);

    const [activeKey, setActiveKey] = useState('content');

    const handleChange = useRefCallback(onChange);

    // 创建稳定的 setValue debounced 函数
    const setValueDebouncedRef = useRef(null);

    if (!setValueDebouncedRef.current) {
      setValueDebouncedRef.current = debounce(
        (value, codeEditorRef) => {
          const newParams = decodeLiveComponentValue(value) || {};

          setParams(newParams);
          codeEditorRef.current && codeEditorRef.current.setValue(newParams.content || '');
        },
        500,
        { leading: true, trailing: true }
      );
    }

    // 创建稳定的 content update debounced 函数，避免频繁更新
    const updateContentDebouncedRef = useRef(null);

    if (!updateContentDebouncedRef.current) {
      updateContentDebouncedRef.current = debounce((newContent, setParams, prevParams) => {
        setParams(prev => ({ ...prev, content: newContent }));
      }, 300);
    }

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => outputContent,
        setValue: value => setValueDebouncedRef.current(value, codeEditorRef)
      }),
      [outputContent]
    );
    useEffect(() => {
      if (defaultValueRef.current !== outputContent) {
        defaultValueRef.current = outputContent;
        handleChange && handleChange(outputContent);
      }
    }, [outputContent, handleChange]);
    const [mod, setMod] = useState(defaultMod);
    const { content, props, scope } = Object.assign({}, { content: '', props: {}, scope: {} }, params);
    const propsFormRef = useRef(null);
    const scopeFormRef = useRef(null);

    const handleCopy = useRefCallback(async () => {
      if (!outputContent) {
        message.warning(formatMessage({ id: 'MsgNoCopyContent' }));
        return;
      }

      try {
        await navigator.clipboard.writeText(outputContent);
        message.success(formatMessage({ id: 'MsgCopySuccess' }));
      } catch (error) {
        console.error(error);
        message.error(formatMessage({ id: 'MsgCopyFail' }));
      }
    });

    const handleImportFromClipboard = useRefCallback(async () => {
      if (!navigator.clipboard?.readText) {
        message.error(formatMessage({ id: 'MsgClipboardUnsupported' }));
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        const parsed = decodeLiveComponentValue(text);

        if (!parsed) {
          message.error(formatMessage({ id: 'MsgInvalidConfig' }));
          return;
        }

        applyParams(parsed);
        message.success(formatMessage({ id: 'MsgImportSuccess' }));
      } catch (error) {
        console.error(error);
        message.error(formatMessage({ id: 'MsgClipboardReadFail' }));
      }
    });

    const editor = (
      <div className={style['code-editor']}>
        <CodeEditor
          ref={codeEditorRef}
          height={height}
          defaultValue={content}
          defaultLanguage="javascript"
          onChange={value => updateContentDebouncedRef.current(value, setParams, params)}
        />
      </div>
    );

    const preview = (
      <SimpleBar
        style={{
          maxHeight: `${height}px`
        }}>
        <div className={style['preview']}>
          <SafeRender>
            <Form>
              <LiveComponentView content={outputContent} libs={libs} />
            </Form>
          </SafeRender>
        </div>
      </SimpleBar>
    );
    return (
      <Tabs
        activeKey={activeKey}
        onChange={activeKey => {
          setActiveKey(activeKey);
          propsFormRef.current && propsFormRef.current.submit();
          scopeFormRef.current && scopeFormRef.current.submit();
        }}
        tabBarExtraContent={
          <div className={style['toolbar-extra']}>
            <Space size={8} align="center">
              <Space.Compact>
                <Button icon={<CopyOutlined />} onClick={handleCopy}>
                  {formatMessage({ id: 'Copy' })}
                </Button>
                <Button icon={<SnippetsOutlined />} onClick={handleImportFromClipboard}>
                  {formatMessage({ id: 'ImportFromClipboard' })}
                </Button>
              </Space.Compact>
              {activeKey === 'content' && (
                <Segmented
                  className={style['view-mode-segmented']}
                  value={mod}
                  onChange={setMod}
                  options={[
                    {
                      label: formatMessage({ id: 'ModeEditor' }),
                      value: 'editor',
                      icon: <MenuOutlined />
                    },
                    {
                      label: formatMessage({ id: 'ModeMix' }),
                      value: 'mix',
                      icon: <SplitCellsOutlined />
                    },
                    {
                      label: formatMessage({ id: 'ModePreview' }),
                      value: 'preview',
                      icon: <EyeOutlined />
                    }
                  ]}
                />
              )}
            </Space>
          </div>
        }
        items={[
          {
            key: 'props',
            label: formatMessage({ id: 'TabProps' }),
            children: (
              <Form
                ref={propsFormRef}
                data={{
                  props: Object.keys(props).map(name => {
                    const item = Object.assign({}, props[name]);
                    return {
                      name,
                      type: item.type,
                      defaultValue: item.defaultValue
                    };
                  })
                }}
                onSubmit={formData => {
                  setParams(params => {
                    return Object.assign({}, params, {
                      props: transform(
                        formData.props,
                        (result, value) => {
                          result[value.name] = {
                            defaultValue: (() => {
                              if (['array', 'object', 'boolean', 'number'].indexOf(value.type) > -1) {
                                return value.defaultValue;
                              }
                              if (value.type === 'string') {
                                return value.defaultValue;
                              }
                              if (value.type === 'function') {
                                return '()=>null';
                              }
                            })(),
                            type: value.type
                          };
                        },
                        {}
                      )
                    });
                  });
                }}>
                <TableList
                  title={formatMessage({ id: 'ParamListTitle' })}
                  name="props"
                  list={[
                    <Input name="name" label={formatMessage({ id: 'VarName' })} rule="REQ LEN-0-100" />,
                    <Select
                      name="type"
                      label={formatMessage({ id: 'Type' })}
                      rule="REQ"
                      defaultValue="string"
                      options={[
                        { label: formatMessage({ id: 'TypeString' }), value: 'string' },
                        { label: formatMessage({ id: 'TypeNumber' }), value: 'number' },
                        { label: formatMessage({ id: 'TypeBoolean' }), value: 'boolean' },
                        { label: formatMessage({ id: 'TypeArray' }), value: 'array' },
                        { label: formatMessage({ id: 'TypeObject' }), value: 'object' },
                        { label: formatMessage({ id: 'TypeFunction' }), value: 'function' }
                      ]}
                      onChange={(value, item, { openApi, groupArgs }) => {
                        setTimeout(() => {
                          openApi.setField({
                            name: 'defaultValue',
                            groupName: 'props',
                            groupIndex: groupArgs[0].index,
                            value: ''
                          });
                        }, 100);
                      }}
                    />,
                    <Input
                      name="defaultValue"
                      label={formatMessage({ id: 'DefaultValue' })}
                      rule="REQ LEN-0-500"
                      display={({ formData, groupArgs }) => {
                        return get(formData.props, `${groupArgs[0].index}.type`) !== 'function';
                      }}
                    />,
                    <div
                      className={style['function-default-value']}
                      name="defaultValue"
                      label={formatMessage({ id: 'DefaultValue' })}
                      display={({ formData, groupArgs }) => {
                        return get(formData.props, `${groupArgs[0].index}.type`) === 'function';
                      }}>
                      {'()=>null'}
                    </div>
                  ]}
                />
              </Form>
            )
          },
          {
            key: 'scope',
            label: formatMessage({ id: 'TabScope' }),
            children: (
              <Form
                ref={scopeFormRef}
                data={{
                  scope: Object.keys(scope).map(name => {
                    const item = scope[name];
                    return {
                      name,
                      token: item
                    };
                  })
                }}
                onSubmit={formData => {
                  setParams(params => {
                    return Object.assign({}, params, {
                      scope: transform(
                        formData.scope,
                        (result, value) => {
                          result[value.name] = value.token;
                        },
                        {}
                      )
                    });
                  });
                }}>
                <TableList
                  title={formatMessage({ id: 'ScopeListTitle' })}
                  name="scope"
                  list={[
                    <Input name="name" label={formatMessage({ id: 'VarName' })} rule="REQ LEN-0-100" />,
                    <Input name="token" label={formatMessage({ id: 'Token' })} rule="REQ LEN-0-100" />
                  ]}
                />
              </Form>
            )
          },
          {
            key: 'content',
            label: formatMessage({ id: 'TabContent' }),
            children: (
              <Flex vertical gap={12}>
                <Collapse
                  size="small"
                  items={[
                    {
                      key: 'refer',
                      label: formatMessage({ id: 'RefLabel' }),
                      children: (
                        <Alert
                          message={
                            <InfoPage>
                              <CentralContent
                                dataSource={{ props, scope }}
                                col={1}
                                columns={[
                                  {
                                    name: 'props',
                                    title: formatMessage({ id: 'RefAvailableProps' }),
                                    getValueOf: item => {
                                      return Object.keys(item.props)
                                        .map(str => `props.${str}`)
                                        .join(',');
                                    }
                                  },
                                  {
                                    name: 'scope',
                                    title: formatMessage({ id: 'RefAvailableComponents' }),
                                    getValueOf: item => {
                                      return ['Antd', ...Object.keys(item.scope)].join(',');
                                    }
                                  },
                                  {
                                    name: 'lib',
                                    title: formatMessage({ id: 'RefAvailableLibs' }),
                                    getValueOf: () => {
                                      return Object.keys(libs).join(',');
                                    }
                                  }
                                ]}
                              />
                            </InfoPage>
                          }
                        />
                      )
                    }
                  ]}
                />
                {mod === 'editor' && editor}
                {mod === 'mix' && (
                  <Splitter>
                    <Splitter.Panel>{editor}</Splitter.Panel>
                    <Splitter.Panel>{preview}</Splitter.Panel>
                  </Splitter>
                )}
                {mod === 'preview' && preview}
              </Flex>
            )
          }
        ]}
      />
    );
  })
  )
);

const LiveComponentEditor = forwardRef((props, ref) => (
  <App>
    <LiveComponentEditorCore ref={ref} {...props} />
  </App>
));

export default LiveComponentEditor;

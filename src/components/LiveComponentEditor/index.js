import { createWithRemoteLoader } from '@kne/remote-loader';
import { encode } from 'plantuml-encoder';
import { decodeLiveComponentConfig } from '@components/LiveComponentView/decodeConfig';
import { App, Tabs, Flex, Alert, Segmented, Splitter, Collapse, Button, Space, Empty } from 'antd';
import { MenuOutlined, SplitCellsOutlined, EyeOutlined, CopyOutlined, SnippetsOutlined } from '@ant-design/icons';
import CodeEditor from '@components/CodeEditor';
import LiveComponentView from '@components/LiveComponentView';
import useRefCallback from '@kne/use-ref-callback';
import lodash from 'lodash';
import { transform, debounce, get, isEqual } from 'lodash';
import dayjs from 'dayjs';
import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import style from './style.module.scss';

/** @deprecated 使用 decodeLiveComponentConfig */
export const decodeLiveComponentValue = decodeLiveComponentConfig;

const mergeParams = value =>
  Object.assign({ content: '', props: {}, scope: {} }, decodeLiveComponentConfig(value) || {});

const buildPropsFormData = props => ({
  props: Object.keys(props).map(name => {
    const item = Object.assign({}, props[name]);
    return {
      name,
      type: item.type,
      defaultValue: item.defaultValue
    };
  })
});

const buildScopeFormData = scope => ({
  scope: Object.keys(scope).map(name => {
    const item = scope[name];
    return {
      name,
      token: item
    };
  })
});

const normalizePropsFormData = formData =>
  transform(
    formData.props,
    (result, value) => {
      result[value.name] = {
        defaultValue: value.type === 'function' ? '()=>null' : value.defaultValue ?? '',
        type: value.type
      };
    },
    {}
  );

const normalizeScopeFormData = formData =>
  transform(
    formData.scope,
    (result, value) => {
      result[value.name] = value.token;
    },
    {}
  );

const createFormAutoSaver = useFormContext => {
  return function FormAutoSaver({ onSave }) {
    const { formData } = useFormContext();
    const initializedRef = useRef(false);
    const snapshotRef = useRef('');

    useEffect(() => {
      const snapshot = JSON.stringify(formData);
      if (!initializedRef.current) {
        initializedRef.current = true;
        snapshotRef.current = snapshot;
        return;
      }
      if (snapshot === snapshotRef.current) {
        return;
      }
      snapshotRef.current = snapshot;
      onSave();
    }, [formData, onSave]);

    return null;
  };
};

const SafeRender = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalContext', 'components-core:Global@PureGlobal', 'components-core:Global@usePreset']
})(({ remoteModules, children }) => {
  const [useGlobalContext, PureGlobal, usePreset] = remoteModules;
  const { global } = useGlobalContext();
  const preset = usePreset();
  const containerRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!rootRef.current) {
      const dom = document.createElement('div');
      container.appendChild(dom);
      rootRef.current = createRoot(dom);
    }

    rootRef.current.render(
      <PureGlobal preset={Object.assign({}, preset, { locale: global.locale })} themeToken={global.themeToken}>
        {children}
      </PureGlobal>
    );
  }, [children, global.locale, global.themeToken, PureGlobal]);

  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} />;
});

const LiveComponentEditorCore = createWithRemoteLoader({
  modules: [
    'components-core:FormInfo',
    'components-core:FormInfo@useFormContext',
    'components-core:InfoPage',
    'components-core:InfoPage@CentralContent',
    'components-core:Common@SimpleBar'
  ]
})(
  withLocale(
    forwardRef(({ remoteModules, defaultValue, defaultMod = 'mix', height = 500, libs = { lodash, dayjs }, onChange }, ref) => {
      const { formatMessage } = useIntl();
      const { message } = App.useApp();
      const [FormInfo, useFormContext, InfoPage, CentralContent, SimpleBar] = remoteModules;
      const FormAutoSaver = useMemo(() => createFormAutoSaver(useFormContext), [useFormContext]);
      const { Form, TableList } = FormInfo;
      const { Input, Select } = FormInfo.fields;
      const codeEditorRef = useRef(null);
      const [params, setParams] = useState(() => mergeParams(defaultValue));

      const applyParams = useRefCallback(nextParams => {
        const merged = Object.assign({}, { content: '', props: {}, scope: {} }, nextParams);

        setParams(merged);
        setPropsFormData(buildPropsFormData(merged.props));
        setScopeFormData(buildScopeFormData(merged.scope));
        codeEditorRef.current?.setValue(merged.content || '');
      });
      const defaultValueRef = useRef(defaultValue);
      const outputContent = useMemo(() => {
        if (!String(params.content || '').trim()) {
          return '';
        }
        return encode(JSON.stringify(params));
      }, [params]);

      const [activeKey, setActiveKey] = useState('content');

      const handleChange = useRefCallback(onChange);

      // 创建稳定的 content update debounced 函数，避免频繁更新
      const updateContentDebouncedRef = useRef(null);

      if (!updateContentDebouncedRef.current) {
        updateContentDebouncedRef.current = debounce((newContent, setParams) => {
          setParams(prev => ({ ...prev, content: newContent }));
        }, 300);
      }

      useImperativeHandle(
        ref,
        () => ({
          getValue: () => outputContent,
          setValue: value => {
            const newParams = mergeParams(value);
            setParams(newParams);
            codeEditorRef.current?.setValue(newParams.content || '');
          }
        }),
        [outputContent]
      );

      useEffect(() => {
        if (!String(defaultValue || '').trim()) {
          return;
        }
        const merged = mergeParams(defaultValue);
        setParams(merged);
        setPropsFormData(buildPropsFormData(merged.props));
        setScopeFormData(buildScopeFormData(merged.scope));
        codeEditorRef.current?.setValue(merged.content || '');
      }, [defaultValue]);
      useEffect(() => {
        if (defaultValueRef.current !== outputContent) {
          defaultValueRef.current = outputContent;
          handleChange && handleChange(outputContent);
        }
      }, [outputContent, handleChange]);
      const [mod, setMod] = useState(defaultMod);
      const { content, props, scope } = Object.assign({}, { content: '', props: {}, scope: {} }, params);
      const [propsFormData, setPropsFormData] = useState(() => buildPropsFormData(props));
      const [scopeFormData, setScopeFormData] = useState(() => buildScopeFormData(scope));
      const propsFormRef = useRef(null);
      const scopeFormRef = useRef(null);

      const submitPropsDebouncedRef = useRef(null);
      const submitScopeDebouncedRef = useRef(null);

      if (!submitPropsDebouncedRef.current) {
        submitPropsDebouncedRef.current = debounce(() => {
          propsFormRef.current?.submit();
        }, 300);
      }

      if (!submitScopeDebouncedRef.current) {
        submitScopeDebouncedRef.current = debounce(() => {
          scopeFormRef.current?.submit();
        }, 300);
      }

      const handlePropsFormSave = useRefCallback(() => {
        submitPropsDebouncedRef.current?.();
      });

      const handleScopeFormSave = useRefCallback(() => {
        submitScopeDebouncedRef.current?.();
      });

      const flushFormSaves = useRefCallback(() => {
        submitPropsDebouncedRef.current?.flush();
        submitScopeDebouncedRef.current?.flush();
        propsFormRef.current?.submit();
        scopeFormRef.current?.submit();
      });

      useEffect(() => {
        return () => {
          submitPropsDebouncedRef.current?.cancel();
          submitScopeDebouncedRef.current?.cancel();
          updateContentDebouncedRef.current?.cancel();
        };
      }, []);

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
            onChange={value => updateContentDebouncedRef.current(value, setParams)}
          />
        </div>
      );

      const preview = (
        <SimpleBar
          style={{
            maxHeight: `${height}px`
          }}>
          <div className={style['preview']} style={{ minHeight: `${height}px` }}>
            {!content ? (
              <Empty description={formatMessage({ id: 'EmptyContent' })} />
            ) : (
              <SafeRender>
                <Form>
                  <LiveComponentView content={outputContent} libs={libs} />
                </Form>
              </SafeRender>
            )}
          </div>
        </SimpleBar>
      );
      return (
        <Tabs
          activeKey={activeKey}
          onChange={nextKey => {
            flushFormSaves();
            if (nextKey === 'props') {
              setPropsFormData(buildPropsFormData(props));
            }
            if (nextKey === 'scope') {
              setScopeFormData(buildScopeFormData(scope));
            }
            setActiveKey(nextKey);
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
                  data={propsFormData}
                  onSubmit={formData => {
                    const nextProps = normalizePropsFormData(formData);
                    setParams(currentParams => {
                      if (isEqual(currentParams.props, nextProps)) {
                        return currentParams;
                      }
                      return Object.assign({}, currentParams, { props: nextProps });
                    });
                  }}>
                  <FormAutoSaver onSave={handlePropsFormSave} />
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
                        rule="LEN-0-500"
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
                  data={scopeFormData}
                  onSubmit={formData => {
                    const nextScope = normalizeScopeFormData(formData);
                    setParams(currentParams => {
                      if (isEqual(currentParams.scope, nextScope)) {
                        return currentParams;
                      }
                      return Object.assign({}, currentParams, { scope: nextScope });
                    });
                  }}>
                  <FormAutoSaver onSave={handleScopeFormSave} />
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

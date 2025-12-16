import { createWithRemoteLoader } from '@kne/remote-loader';
import { encode, decode } from 'plantuml-encoder';
import { Tabs, Flex, Alert, Segmented, Splitter, Collapse } from 'antd';
import { MenuOutlined, SplitCellsOutlined, EyeOutlined } from '@ant-design/icons';
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
import style from './style.module.scss';

const SafeRender = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalContext', 'components-core:Global@PureGlobal']
})(({ remoteModules, children }) => {
  const [useGlobalContext, PureGlobal] = remoteModules;
  const { global } = useGlobalContext();
  const ref = useRef(null);
  useEffect(() => {
    ref.current.innerHTML = '';
    const dom = document.createElement('div');
    ref.current.appendChild(dom);
    const app = createRoot(dom);
    app.render(
      <PureGlobal preset={{ locale: global.locale }} themeToken={global.themeToken}>
        {children}
      </PureGlobal>
    );
  }, [children, global.locale, global.themeToken]);
  return <div ref={ref} />;
});

const LiveComponentEditor = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:InfoPage', 'components-core:InfoPage@CentralContent', 'components-core:Common@SimpleBar']
})(
  forwardRef(({ remoteModules, defaultValue, defaultMod = 'mix', height = 500, libs = { lodash, dayjs }, onChange }, ref) => {
    const [FormInfo, InfoPage, CentralContent, SimpleBar] = remoteModules;
    const { Form, TableList } = FormInfo;
    const { Input, Select } = FormInfo.fields;
    const codeEditorRef = useRef(null);
    const [params, setParams] = useState(() => {
      if (!defaultValue) {
        return {};
      }
      try {
        return JSON.parse(decode(defaultValue));
      } catch (e) {
        console.error(e);
        return {};
      }
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

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => outputContent,
        setValue: debounce(
          value => {
            const newParams = (() => {
              try {
                return JSON.parse(decode(value));
              } catch (e) {
                console.error(e);
                return {};
              }
            })();
            setParams(newParams);
            codeEditorRef.current && codeEditorRef.current.setValue(newParams.content || '');
          },
          500,
          { leading: true, trailing: true }
        )
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

    const editor = (
      <div className={style['code-editor']}>
        <CodeEditor
          ref={codeEditorRef}
          height={height}
          defaultValue={content}
          defaultLanguage="javascript"
          onChange={value => setParams({ ...params, content: value })}
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
          activeKey === 'content' && (
            <Segmented
              value={mod}
              onChange={setMod}
              options={[
                {
                  label: '编辑器',
                  value: 'editor',
                  icon: <MenuOutlined />
                },
                {
                  label: '混合',
                  value: 'mix',
                  icon: <SplitCellsOutlined />
                },
                {
                  label: '预览',
                  value: 'preview',
                  icon: <EyeOutlined />
                }
              ]}
            />
          )
        }
        items={[
          {
            key: 'props',
            label: '组件参数',
            children: (
              <Form
                ref={propsFormRef}
                data={{
                  props: Object.keys(props).map(name => {
                    const item = Object.assign({}, props[name]);
                    return {
                      name,
                      type: item.type,
                      defaultValue:
                        ['array', 'object', 'boolean', 'number'].indexOf(item.type) > -1 ? JSON.stringify(item.defaultValue) : item.defaultValue
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
                                return JSON.parse(value.defaultValue);
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
                  title="参数列表"
                  name="props"
                  list={[
                    <Input name="name" label="变量名" rule="REQ LEN-0-100" />,
                    <Select
                      name="type"
                      label="类型"
                      rule="REQ"
                      defaultValue="string"
                      options={[
                        { label: '字符串', value: 'string' },
                        { label: '数字', value: 'number' },
                        { label: '布尔值', value: 'boolean' },
                        { label: '数组', value: 'array' },
                        { label: '对象', value: 'object' },
                        { label: '函数', value: 'function' }
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
                      label="默认值"
                      rule="REQ LEN-0-500"
                      display={({ formData, groupArgs }) => {
                        return get(formData.props, `${groupArgs[0].index}.type`) !== 'function';
                      }}
                    />,
                    <div
                      className={style['function-default-value']}
                      name="defaultValue"
                      label="默认值"
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
            label: '组件域',
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
                  title="域列表"
                  name="scope"
                  list={[<Input name="name" label="变量名" rule="REQ LEN-0-100" />, <Input name="token" label="Token" rule="REQ LEN-0-100" />]}
                />
              </Form>
            )
          },
          {
            key: 'content',
            label: '组件内容',
            children: (
              <Flex vertical gap={12}>
                <Collapse
                  size="small"
                  items={[
                    {
                      key: 'refer',
                      label: '引用参考',
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
                                    title: '可使用参数',
                                    getValueOf: item => {
                                      return Object.keys(item.props)
                                        .map(str => `props.${str}`)
                                        .join(',');
                                    }
                                  },
                                  {
                                    name: 'scope',
                                    title: '可使用组件',
                                    getValueOf: item => {
                                      return ['Antd', ...Object.keys(item.scope)].join(',');
                                    }
                                  },
                                  {
                                    name: 'lib',
                                    title: '可使用库',
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
);

export default LiveComponentEditor;

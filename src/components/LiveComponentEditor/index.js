import { createWithRemoteLoader } from '@kne/remote-loader';
import { encode, decode } from 'plantuml-encoder';
import { Tabs, Flex, Alert, Segmented, Splitter } from 'antd';
import { MenuOutlined, SplitCellsOutlined, EyeOutlined } from '@ant-design/icons';
import CodeEditor from '@components/CodeEditor';
import LiveComponentView from '@components/LiveComponentView';
import transform from 'lodash/transform';
import get from 'lodash/get';
import { useState, useRef, useEffect, useMemo } from 'react';
import style from './style.module.scss';

const ExampleContainer = createWithRemoteLoader({
  modules: ['components-core:FormInfo@Form']
})(({ remoteModules, children }) => {
  const [Form] = remoteModules;
  return <Form>{children}</Form>;
});

const LiveComponentEditor = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:InfoPage', 'components-core:InfoPage@CentralContent']
})(({ remoteModules, defaultValue, defaultMod = 'mix', onChange }) => {
  const [FormInfo, InfoPage, CentralContent] = remoteModules;
  const { Form, TableList } = FormInfo;
  const { Input, Select } = FormInfo.fields;
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
    return encode(JSON.stringify(params));
  }, [params]);
  useEffect(() => {
    if (defaultValueRef.current !== outputContent) {
      defaultValueRef.current = outputContent;
      onChange && onChange(outputContent);
    }
  }, [outputContent]);
  const [mod, setMod] = useState(defaultMod);
  const { content, props, scope } = Object.assign({}, { content: '', props: {}, scope: {} }, params);
  const propsFormRef = useRef(null);
  const scopeFormRef = useRef(null);

  const editor = (
    <div className={style['code-editor']}>
      <CodeEditor defaultValue={content} defaultLanguage="javascript" onChange={value => setParams({ ...params, content: value })} />
    </div>
  );

  const preview = (
    <div className={style['preview']}>
      <LiveComponentView content={outputContent} container={ExampleContainer} />
    </div>
  );

  return (
    <Tabs
      defaultActiveKey="content"
      onChange={() => {
        propsFormRef.current && propsFormRef.current.submit();
        scopeFormRef.current && scopeFormRef.current.submit();
      }}
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
                    defaultValue: ['array', 'object', 'boolean', 'number'].indexOf(item.type) ? JSON.stringify(item.defaultValue) : item.defaultValue
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
                  />,
                  <Input
                    name="defaultValue"
                    label="默认值"
                    rule="LEN-0-500"
                    display={({ formData, groupArgs }) => {
                      return get(formData.props, `${groupArgs[0].index}.type`) !== 'function';
                    }}
                  />,
                  <Input
                    name="defaultValue"
                    label="默认值"
                    rule="LEN-0-500"
                    disabled
                    display={({ formData, groupArgs }) => {
                      return get(formData.props, `${groupArgs[0].index}.type`) === 'function';
                    }}
                  />
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
                    token: item.token
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
                            return ['lodash', 'dayjs'].join(',');
                          }
                        }
                      ]}
                    />
                  </InfoPage>
                }
              />
              <Flex justify="flex-end">
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
              </Flex>
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
});

export default LiveComponentEditor;

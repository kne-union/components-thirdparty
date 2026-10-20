import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, Select, Tooltip, Typography } from 'antd';
import { CaretDownOutlined, CaretRightOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import style from '../style.module.scss';

const BASIC_TYPES = ['string', 'integer', 'number', 'boolean', 'object', 'array'];
const COMPOSITE_KEYS = ['allOf', 'oneOf', 'anyOf', 'not'];
const REF_PREFIX = '$ref:';

const SchemaEditorContext = createContext({ typeOptions: [] });

const getTypeValue = schema => {
  if (!schema) {
    return undefined;
  }
  if (schema.$ref) {
    return REF_PREFIX + schema.$ref;
  }
  if (schema.type) {
    return Array.isArray(schema.type) ? schema.type.find(type => type !== 'null') : schema.type;
  }
  if (schema.properties) {
    return 'object';
  }
  return schema.items ? 'array' : undefined;
};

/** 切换类型只保留说明；$ref 节点不带其它字段 */
const createSchema = (typeValue, prev = {}) => {
  if (typeValue.startsWith(REF_PREFIX)) {
    return { $ref: typeValue.slice(REF_PREFIX.length) };
  }
  const schema = prev.description ? { description: prev.description } : {};
  if (typeValue === 'object') {
    return Object.assign(schema, { type: 'object', properties: {} });
  }
  if (typeValue === 'array') {
    return Object.assign(schema, { type: 'array', items: { type: 'string' } });
  }
  return Object.assign(schema, { type: typeValue });
};

const createFieldName = properties => {
  let index = 1;
  while (properties[`field${index}`]) {
    index += 1;
  }
  return `field${index}`;
};

/** 失焦时提交；为空或与同级重名则还原 */
const NameInput = ({ value, siblingNames, onCommit }) => {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const commit = () => {
    const next = text.trim();
    if (!next || (next !== value && siblingNames.includes(next))) {
      setText(value);
      return;
    }
    next !== value && onCommit(next);
  };
  return <Input size="small" value={text} onChange={e => setText(e.target.value)} onBlur={commit} onPressEnter={commit} />;
};

const SchemaRow = ({ schema, depth, name, siblingNames, required, clearable, onRename, onRequiredChange, onChange, onRemove }) => {
  const { formatMessage } = useIntl();
  const { typeOptions } = useContext(SchemaEditorContext);
  const [open, setOpen] = useState(true);
  const typeValue = getTypeValue(schema);
  const isObject = typeValue === 'object';
  const isArray = typeValue === 'array';
  const properties = (isObject && schema.properties) || {};
  const propertyNames = Object.keys(properties);
  const requiredList = schema?.required || [];
  const hasChildren = isObject ? propertyNames.length > 0 : isArray;

  const options = useMemo(() => {
    if (!typeValue?.startsWith(REF_PREFIX) || typeOptions.some(group => group.options?.some(item => item.value === typeValue))) {
      return typeOptions;
    }
    return [...typeOptions, { value: typeValue, label: schema.$ref }];
  }, [typeOptions, typeValue, schema]);

  const updateProperties = (nextProperties, nextRequired = requiredList) => {
    const next = Object.assign({}, schema, { properties: nextProperties });
    nextRequired.length ? (next.required = nextRequired) : delete next.required;
    onChange(next);
  };

  const renameProperty = (from, to) =>
    updateProperties(
      Object.fromEntries(propertyNames.map(key => [key === from ? to : key, properties[key]])),
      requiredList.map(item => (item === from ? to : item))
    );

  const removeProperty = key => {
    const next = Object.assign({}, properties);
    delete next[key];
    updateProperties(
      next,
      requiredList.filter(item => item !== key)
    );
  };

  const setDescription = text => {
    const next = Object.assign({}, schema);
    text ? (next.description = text) : delete next.description;
    onChange(next);
  };

  return (
    <>
      <div className={style['schema-editor-row']}>
        <div className={style['schema-editor-name']} style={{ paddingLeft: depth * 20 }}>
          <span className={style['schema-editor-toggle']}>
            {hasChildren && (
              <Button type="text" size="small" icon={open ? <CaretDownOutlined /> : <CaretRightOutlined />} onClick={() => setOpen(!open)} />
            )}
          </span>
          {onRename ? (
            <NameInput value={name} siblingNames={siblingNames} onCommit={onRename} />
          ) : (
            <Typography.Text type="secondary">{name}</Typography.Text>
          )}
        </div>
        <Select
          size="small"
          value={typeValue}
          options={options}
          placeholder={COMPOSITE_KEYS.find(key => schema?.[key]) || formatMessage({ id: 'PostCatSchemaNone' })}
          allowClear={clearable}
          showSearch
          popupMatchSelectWidth={false}
          onChange={value => onChange(value ? createSchema(value, schema) : undefined)}
        />
        <span className={style['schema-editor-required']}>
          {onRequiredChange && <Checkbox checked={required} onChange={e => onRequiredChange(e.target.checked)} />}
        </span>
        <Input
          size="small"
          value={schema?.description || ''}
          disabled={!schema || !!schema.$ref}
          placeholder={formatMessage({ id: 'PostCatFieldDescription' })}
          onChange={e => setDescription(e.target.value)}
        />
        <span className={style['schema-editor-actions']}>
          {isObject && (
            <Tooltip title={formatMessage({ id: 'PostCatAddChildField' })}>
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  setOpen(true);
                  updateProperties(Object.assign({}, properties, { [createFieldName(properties)]: { type: 'string' } }));
                }}
              />
            </Tooltip>
          )}
          {onRemove && <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onRemove} />}
        </span>
      </div>
      {open &&
        isObject &&
        propertyNames.map((key, index) => (
          <SchemaRow
            key={index}
            schema={properties[key]}
            depth={depth + 1}
            name={key}
            siblingNames={propertyNames}
            required={requiredList.includes(key)}
            onRename={next => renameProperty(key, next)}
            onRequiredChange={checked => updateProperties(properties, checked ? [...requiredList, key] : requiredList.filter(item => item !== key))}
            onChange={child => updateProperties(Object.assign({}, properties, { [key]: child }))}
            onRemove={() => removeProperty(key)}
          />
        ))}
      {open && isArray && (
        <SchemaRow schema={schema.items} depth={depth + 1} name="items" onChange={items => onChange(Object.assign({}, schema, { items }))} />
      )}
    </>
  );
};

/** 可视化编辑 JSON Schema；refs 为可引用的模型路径，如 #/components/schemas/Pet */
export const SchemaEditorField = withLocale(({ value, onChange, refs = [] }) => {
  const { formatMessage } = useIntl();
  const context = useMemo(
    () => ({
      typeOptions: [
        ...BASIC_TYPES.map(type => ({ value: type, label: type })),
        ...(refs.length
          ? [
              {
                label: formatMessage({ id: 'PostCatSchemaRef' }),
                options: refs.map(ref => ({ value: REF_PREFIX + ref, label: ref.split('/').pop() }))
              }
            ]
          : [])
      ]
    }),
    [refs, formatMessage]
  );

  return (
    <SchemaEditorContext.Provider value={context}>
      <div className={style['schema-editor']}>
        <div className={style['schema-editor-body']}>
          <div className={`${style['schema-editor-row']} ${style['schema-editor-head']}`}>
            <span>{formatMessage({ id: 'PostCatFieldName' })}</span>
            <span>{formatMessage({ id: 'PostCatFieldType' })}</span>
            <span>{formatMessage({ id: 'PostCatRequired' })}</span>
            <span>{formatMessage({ id: 'PostCatFieldDescription' })}</span>
            <span />
          </div>
          <SchemaRow schema={value} depth={0} name={formatMessage({ id: 'PostCatSchemaRoot' })} clearable onChange={onChange} />
        </div>
      </div>
    </SchemaEditorContext.Provider>
  );
});

const SchemaEditor = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const render = hooks.useDecorator(props);
  return render(SchemaEditorField);
});

export default SchemaEditor;

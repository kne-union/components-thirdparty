import { useState } from 'react';
import { Button, Input, InputNumber, Select, Switch, Typography } from 'antd';
import { CaretDownOutlined, CaretRightOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import classnames from 'classnames';
import JSONEditor from '@components/JSONEditor';
import style from './style.module.scss';

const IDENTIFIER_REG = /^[A-Za-z_$][\w$]*$/;
const COMPONENT_NAME_REG = /^[A-Z][\w$]*$/;
const REMOTE_TOKEN_REG = /^[^\s:]+:[^\s:@]+(@[A-Za-z_$][\w$]*)?$/;

const PROP_TYPES = [
  { value: 'string', icon: 'Aa', labelId: 'TypeString' },
  { value: 'number', icon: '123', labelId: 'TypeNumber' },
  { value: 'boolean', icon: 'T/F', labelId: 'TypeBoolean' },
  { value: 'array', icon: '[ ]', labelId: 'TypeArray' },
  { value: 'object', icon: '{ }', labelId: 'TypeObject' },
  { value: 'function', icon: 'ƒ', labelId: 'TypeFunction' }
];

const JSON_TYPES = ['array', 'object'];

let rowSeed = 0;
export const createRowId = () => `row-${(rowSeed += 1)}`;

export const getEmptyDefaultValue = type => (type === 'boolean' ? false : type === 'number' ? null : '');

export const getScopeNameFromToken = token => {
  if (!REMOTE_TOKEN_REG.test(token || '')) {
    return '';
  }
  const [modulePath, exportName] = token.split(':')[1].split('@');
  const name = (exportName || modulePath.split('/').pop()).replace(/[^\w$]/g, '');
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
};

const parseJson = text => {
  try {
    return { value: JSON.parse(text) };
  } catch (e) {
    return { error: true };
  }
};

const isJsonTypeMatched = (type, value) => (type === 'array' ? Array.isArray(value) : !!value && typeof value === 'object' && !Array.isArray(value));

const countNames = rows =>
  rows.reduce((result, row) => {
    if (row.name) {
      result[row.name] = (result[row.name] || 0) + 1;
    }
    return result;
  }, {});

/** 变量名为空的行视为草稿，不报错、保存时跳过 */
export const validatePropsRows = rows => {
  const counts = countNames(rows);
  return rows.reduce((errors, row) => {
    const error = {};
    if (row.name && !IDENTIFIER_REG.test(row.name)) {
      error.name = 'VarNameInvalid';
    } else if (counts[row.name] > 1) {
      error.name = 'VarNameDuplicate';
    }
    const text = String(row.defaultValue ?? '').trim();
    if (JSON_TYPES.includes(row.type) && text) {
      const { value, error: parseError } = parseJson(text);
      if (parseError || !isJsonTypeMatched(row.type, value)) {
        error.defaultValue = row.type === 'array' ? 'JsonArrayInvalid' : 'JsonObjectInvalid';
      }
    }
    if (Object.keys(error).length) {
      errors[row.id] = error;
    }
    return errors;
  }, {});
};

export const validateScopeRows = rows => {
  const counts = countNames(rows);
  return rows.reduce((errors, row) => {
    const error = {};
    if (row.name && !COMPONENT_NAME_REG.test(row.name)) {
      error.name = 'ScopeNameUpper';
    } else if (counts[row.name] > 1) {
      error.name = 'VarNameDuplicate';
    }
    if (row.token && !REMOTE_TOKEN_REG.test(row.token)) {
      error.token = 'TokenInvalid';
    }
    if (Object.keys(error).length) {
      errors[row.id] = error;
    }
    return errors;
  }, {});
};

const RowError = ({ error }) => {
  const { formatMessage } = useIntl();
  const messages = Object.values(error || {});
  if (!messages.length) {
    return null;
  }
  return <div className={style['param-error']}>{messages.map(id => formatMessage({ id })).join('；')}</div>;
};

const JsonSummary = ({ type, value, open, error, onToggle }) => {
  const { formatMessage } = useIntl();
  const text = String(value ?? '').trim();
  const { value: parsed } = text && !error ? parseJson(text) : {};
  const count = parsed ? (Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length) : 0;
  return (
    <button type="button" className={classnames(style['param-json'], { [style['is-error']]: error })} onClick={onToggle}>
      {open ? <CaretDownOutlined /> : <CaretRightOutlined />}
      <code className={style['param-json-text']}>{text ? text.replace(/\s+/g, ' ') : type === 'array' ? '[]' : '{}'}</code>
      {parsed && (
        <span className={style['param-json-count']}>{formatMessage({ id: type === 'array' ? 'JsonItems' : 'JsonFields' }, { count })}</span>
      )}
    </button>
  );
};

const PropValueInput = ({ row, error, open, onToggle, onChange }) => {
  const { formatMessage } = useIntl();
  const type = row.type || 'string';
  if (type === 'number') {
    return (
      <InputNumber
        className={style['param-control']}
        value={row.defaultValue}
        placeholder={formatMessage({ id: 'DefaultValue' })}
        onChange={value => onChange(value)}
      />
    );
  }
  if (type === 'boolean') {
    return (
      <span className={style['param-switch']}>
        <Switch size="small" checked={!!row.defaultValue} onChange={onChange} />
        <code>{String(!!row.defaultValue)}</code>
      </span>
    );
  }
  if (JSON_TYPES.includes(type)) {
    return <JsonSummary type={type} value={row.defaultValue} open={open} error={!!error?.defaultValue} onToggle={onToggle} />;
  }
  if (type === 'function') {
    return (
      <span className={style['param-function']}>
        <code>{'() => null'}</code>
        <Typography.Text type="secondary">{formatMessage({ id: 'FunctionPlaceholder' })}</Typography.Text>
      </span>
    );
  }
  return (
    <Input
      className={style['param-control']}
      value={row.defaultValue}
      placeholder={formatMessage({ id: 'DefaultValue' })}
      onChange={e => onChange(e.target.value)}
    />
  );
};

export const PropsEditor = ({ rows, errors, onChange }) => {
  const { formatMessage } = useIntl();
  const [expanded, setExpanded] = useState({});
  const updateRow = (id, patch) => onChange(rows.map(row => (row.id === id ? Object.assign({}, row, patch) : row)));
  const typeOptions = PROP_TYPES.map(item => ({
    value: item.value,
    label: (
      <span className={style['type-option']}>
        <span className={style['type-icon']}>{item.icon}</span>
        {formatMessage({ id: item.labelId })}
      </span>
    )
  }));

  return (
    <div className={style['param-editor']}>
      <div className={style['tab-hint']}>
        {formatMessage({ id: 'ParamsUsageHint' })}
        <code className={style['ref-token']}>props.title</code>
      </div>
      {rows.length > 0 ? (
        <div className={classnames(style['param-table'], style['is-props'])}>
          <div className={classnames(style['param-row'], style['param-head'])}>
            <span>{formatMessage({ id: 'VarName' })}</span>
            <span>{formatMessage({ id: 'Type' })}</span>
            <span>{formatMessage({ id: 'DefaultValue' })}</span>
            <span />
          </div>
          {rows.map(row => {
            const error = errors[row.id];
            const open = JSON_TYPES.includes(row.type) && !!expanded[row.id];
            return (
              <div key={row.id} className={style['param-item']}>
                <div className={style['param-row']}>
                  <Input
                    className={classnames(style['param-control'], style['param-name'])}
                    value={row.name}
                    status={error?.name ? 'error' : undefined}
                    prefix={<span className={style['param-prefix']}>props.</span>}
                    placeholder={formatMessage({ id: 'VarName' })}
                    onChange={e => updateRow(row.id, { name: e.target.value.trim() })}
                  />
                  <Select
                    className={style['param-control']}
                    value={row.type || 'string'}
                    options={typeOptions}
                    popupMatchSelectWidth={false}
                    onChange={type => {
                      updateRow(row.id, { type, defaultValue: getEmptyDefaultValue(type) });
                      setExpanded(current => Object.assign({}, current, { [row.id]: JSON_TYPES.includes(type) }));
                    }}
                  />
                  <PropValueInput
                    row={row}
                    error={error}
                    open={open}
                    onToggle={() => setExpanded(current => Object.assign({}, current, { [row.id]: !current[row.id] }))}
                    onChange={defaultValue => updateRow(row.id, { defaultValue })}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={formatMessage({ id: 'Delete' })}
                    onClick={() => onChange(rows.filter(item => item.id !== row.id))}
                  />
                </div>
                {open && (
                  <div className={style['param-json-editor']}>
                    <JSONEditor.Field value={row.defaultValue} height={160} onChange={value => updateRow(row.id, { defaultValue: value ?? '' })} />
                  </div>
                )}
                <RowError error={error} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={style['param-empty']}>{formatMessage({ id: 'ParamsEmpty' })}</div>
      )}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => onChange([...rows, { id: createRowId(), name: '', type: 'string', defaultValue: '' }])}>
        {formatMessage({ id: 'AddParam' })}
      </Button>
    </div>
  );
};

export const ScopeEditor = ({ rows, errors, builtins, onChange }) => {
  const { formatMessage } = useIntl();
  const updateRow = (id, patch) => onChange(rows.map(row => (row.id === id ? Object.assign({}, row, patch) : row)));

  return (
    <div className={style['param-editor']}>
      <div>
        <div className={style['tab-hint']}>
          {formatMessage({ id: 'ScopeUsageHint' })}
          <code className={style['ref-token']}>{'<InfoPage />'}</code>
        </div>
        <div className={style['tab-hint']}>
          {formatMessage({ id: 'ScopeBuiltinHint' })}
          {builtins.map(name => (
            <code key={name} className={style['ref-token']}>
              {name}
            </code>
          ))}
        </div>
      </div>
      {rows.length > 0 ? (
        <div className={classnames(style['param-table'], style['is-scope'])}>
          <div className={classnames(style['param-row'], style['param-head'])}>
            <span>{formatMessage({ id: 'VarName' })}</span>
            <span>{formatMessage({ id: 'Token' })}</span>
            <span />
          </div>
          {rows.map(row => {
            const error = errors[row.id];
            return (
              <div key={row.id} className={style['param-item']}>
                <div className={style['param-row']}>
                  <Input
                    className={classnames(style['param-control'], style['param-name'])}
                    value={row.name}
                    status={error?.name ? 'error' : undefined}
                    prefix={<span className={style['param-prefix']}>{'<'}</span>}
                    suffix={<span className={style['param-prefix']}>{'/>'}</span>}
                    placeholder="InfoPage"
                    onChange={e => updateRow(row.id, { name: e.target.value.trim() })}
                  />
                  <Input
                    className={classnames(style['param-control'], style['param-token'])}
                    value={row.token}
                    status={error?.token ? 'error' : undefined}
                    placeholder="components-core:InfoPage@CentralContent"
                    onChange={e => {
                      const token = e.target.value.trim();
                      const autoName = getScopeNameFromToken(token);
                      const patch = { token };
                      if (autoName && (!row.name || row.name === row.autoName)) {
                        Object.assign(patch, { name: autoName, autoName });
                      }
                      updateRow(row.id, patch);
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={formatMessage({ id: 'Delete' })}
                    onClick={() => onChange(rows.filter(item => item.id !== row.id))}
                  />
                </div>
                <RowError error={error} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={style['param-empty']}>{formatMessage({ id: 'ScopeEmpty' })}</div>
      )}
      <Button type="dashed" block icon={<PlusOutlined />} onClick={() => onChange([...rows, { id: createRowId(), name: '', token: '' }])}>
        {formatMessage({ id: 'AddScope' })}
      </Button>
    </div>
  );
};

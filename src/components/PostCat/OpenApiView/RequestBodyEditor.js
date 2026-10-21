import { useMemo, useRef, useState } from 'react';
import { Flex, Segmented, Space, Typography, message } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import JSONSchemaForm from '@components/JSONSchemaForm';
import JSONEditor from '@components/JSONEditor';
import withLocale from '../withLocale';
import style from '../style.module.scss';

const { Text } = Typography;

const parseObject = text => {
  if (!String(text || '').trim()) {
    return {};
  }
  const value = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('not an object');
  }
  return value;
};

export const canUseSchemaForm = schema => schema?.type === 'object' && Object.keys(schema.properties || {}).length > 0;

const formatExample = value => (value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value));

const getTypeLabel = schema => [].concat(schema.type || []).join(' | ') || undefined;

/** 叶子字段的类型作为 placeholder；说明、示例改由 labelRender 显示，并去掉 description 以免与 label 旁的 tooltip 重复 */
const withFieldLabel = (schema, exampleLabel) => {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return schema;
  }
  const output = { ...schema };
  if (output.properties) {
    output.properties = Object.fromEntries(Object.entries(output.properties).map(([key, item]) => [key, withFieldLabel(item, exampleLabel)]));
  }
  if (output.items) {
    output.items = withFieldLabel(output.items, exampleLabel);
  }
  ['oneOf', 'anyOf'].forEach(key => {
    if (Array.isArray(output[key])) {
      output[key] = output[key].map(item => withFieldLabel(item, exampleLabel));
    }
  });
  const isLeaf = !output.properties && !output.items?.properties && !output.oneOf && !output.anyOf;
  if (!isLeaf) {
    return output;
  }
  const typeLabel = getTypeLabel(output);
  if (typeLabel && output['x-props']?.placeholder === undefined) {
    output['x-props'] = { ...output['x-props'], placeholder: typeLabel };
  }
  const { description } = output;
  const hasExample = output.example !== undefined;
  if (!description && !hasExample) {
    return output;
  }
  delete output.description;
  output['x-props'] = {
    ...output['x-props'],
    labelRender: ({ label }) => (
      <Space size={[8, 0]} wrap className={style['field-label']}>
        <span>{label}</span>
        {description && <Text type="secondary">{description}</Text>}
        {hasExample && (
          <Text type="secondary">
            {exampleLabel}: <Text code>{formatExample(output.example)}</Text>
          </Text>
        )}
      </Space>
    )
  };
  return output;
};

/** formProps 只在挂载时生成：data 变化会让 react-form 重置初值；onChange 回传表单对象 */
export const SchemaForm = withLocale(({ schema: originSchema, defaultData, onChange }) => {
  const { formatMessage } = useIntl();
  const exampleLabel = formatMessage({ id: 'PostCatFieldExample' });
  const schema = useMemo(() => withFieldLabel(originSchema, exampleLabel), [originSchema, exampleLabel]);
  const isMobile = useIsMobile();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [formProps] = useState(() => ({
    data: defaultData,
    onFormDataChange: data => onChangeRef.current(data)
  }));
  return <JSONSchemaForm schema={schema} column={isMobile ? 1 : 2} gap={16} footer={false} formProps={formProps} />;
});

/** application/json 请求体：schema 为 object 时可在表单与 JSON 之间切换，value 始终为 JSON 文本 */
const RequestBodyEditor = withLocale(({ title, schema, value, onChange }) => {
  const { formatMessage } = useIntl();
  const [messageApi, contextHolder] = message.useMessage();
  const formEnabled = canUseSchemaForm(schema);
  const [mode, setMode] = useState(() => {
    if (!formEnabled) {
      return 'json';
    }
    try {
      parseObject(value);
      return 'form';
    } catch {
      return 'json';
    }
  });
  const [formData, setFormData] = useState(() => (mode === 'form' ? parseObject(value) : {}));

  const switchMode = next => {
    if (next === 'form') {
      try {
        setFormData(parseObject(value));
      } catch {
        messageApi.error(formatMessage({ id: 'PostCatBodyInvalid' }));
        return;
      }
    }
    setMode(next);
  };

  return (
    <Flex vertical gap={8}>
      {contextHolder}
      <Flex align="center" justify="space-between" gap={8} wrap>
        {title}
        {formEnabled && (
          <Segmented
            size="small"
            value={mode}
            onChange={switchMode}
            options={[
              { value: 'form', label: formatMessage({ id: 'PostCatEditModeForm' }) },
              { value: 'json', label: 'JSON' }
            ]}
          />
        )}
      </Flex>
      <div className={style['try-body']}>
        {mode === 'form' ? (
          <SchemaForm schema={schema} defaultData={formData} onChange={data => onChange(JSON.stringify(data, null, 2))} />
        ) : (
          <JSONEditor.Field value={value} onChange={onChange} height={280} />
        )}
      </div>
    </Flex>
  );
});

export default RequestBodyEditor;

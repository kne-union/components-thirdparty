import { Space, Table, Tag, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import classnames from 'classnames';
import withLocale from '../withLocale';
import style from '../style.module.scss';

const { Text } = Typography;

const formatExample = value => {
  if (value === undefined || value === null) {
    return '';
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

const SchemaTable = withLocale(({ rows }) => {
  const { formatMessage } = useIntl();
  return (
    <Table
      className={style['schema-table']}
      size="small"
      rowKey="key"
      pagination={false}
      dataSource={rows}
      scroll={{ x: 'max-content' }}
      expandable={{ defaultExpandAllRows: true }}
      columns={[
        {
          title: formatMessage({ id: 'PostCatFieldName' }),
          dataIndex: 'name',
          render: (name, item) => (
            <span className={style['schema-name']}>
              <Text code delete={item.deprecated}>
                {name}
              </Text>
              {item.required && <span className={style['schema-required']}>*</span>}
            </span>
          )
        },
        {
          title: formatMessage({ id: 'PostCatFieldType' }),
          dataIndex: 'type',
          render: (type, item) => (
            <span>
              <Text type="secondary">{type}</Text>
              {item.format && <Text type="secondary">{` (${item.format})`}</Text>}
            </span>
          )
        },
        {
          title: formatMessage({ id: 'PostCatFieldDescription' }),
          dataIndex: 'description',
          render: (description, item) => (
            <div className={style['schema-description']}>
              {description}
              {Array.isArray(item.enum) && item.enum.length > 0 && (
                <Space size={4} wrap className={classnames(style['schema-enum'], { [style['schema-enum-spaced']]: !!description })}>
                  {item.enum.map(value => (
                    <Tag key={String(value)} style={{ marginInlineEnd: 0 }}>
                      {String(value)}
                    </Tag>
                  ))}
                </Space>
              )}
            </div>
          )
        },
        {
          title: formatMessage({ id: 'PostCatFieldExample' }),
          dataIndex: 'example',
          render: value => <Text type="secondary">{formatExample(value)}</Text>
        }
      ]}
    />
  );
});

export default SchemaTable;

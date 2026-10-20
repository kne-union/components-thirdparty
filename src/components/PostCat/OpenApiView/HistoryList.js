import { useMemo, useState } from 'react';
import { Button, Empty, Input, Popconfirm, Tag, Typography } from 'antd';
import { ClearOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import dayjs from 'dayjs';
import classnames from 'classnames';
import Fuse from 'fuse.js';
import withLocale from '../withLocale';
import { MethodTag } from './ApiMenu';
import ScrollArea from '../ScrollArea';
import style from '../style.module.scss';

const { Text } = Typography;

export const statusTagColor = status => (!status ? 'error' : status < 300 ? 'success' : status < 400 ? 'warning' : 'error');

const HistoryList = withLocale(({ history = [], operationKeys, currentId, onSelect, onRemove, onClear }) => {
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState('');

  const fuse = useMemo(() => new Fuse(history, { keys: ['summary', 'url', 'method'], threshold: 0.3, ignoreLocation: true }), [history]);

  const groups = useMemo(() => {
    const search = keyword.trim();
    const matched = search ? new Set(fuse.search(search).map(({ item }) => item)) : null;
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const output = [];
    history
      .filter(item => !matched || matched.has(item))
      .forEach(item => {
        const date = dayjs(item.time).format('YYYY-MM-DD');
        const label = date === today ? formatMessage({ id: 'PostCatToday' }) : date === yesterday ? formatMessage({ id: 'PostCatYesterday' }) : date;
        const group = output[output.length - 1];
        group && group.label === label ? group.list.push(item) : output.push({ label, list: [item] });
      });
    return output;
  }, [history, fuse, keyword, formatMessage]);

  return (
    <div className={style['menu']}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={formatMessage({ id: 'PostCatSearchHistory' })}
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      {history.length > 0 && (
        <div className={style['history-bar']}>
          <Text type="secondary">{formatMessage({ id: 'PostCatHistoryCount' }, { count: history.length })}</Text>
          <Popconfirm title={formatMessage({ id: 'PostCatClearHistoryConfirm' })} onConfirm={onClear}>
            <Button type="link" size="small" danger icon={<ClearOutlined />}>
              {formatMessage({ id: 'PostCatClearHistory' })}
            </Button>
          </Popconfirm>
        </div>
      )}
      <ScrollArea className={style['menu-body']}>
        <div className={style['menu-body-inner']}>
          {groups.length > 0 ? (
            groups.map(group => (
              <div key={group.label} className={style['history-group']}>
                <Text type="secondary" className={style['history-group-label']}>
                  {group.label}
                </Text>
                {group.list.map(item => {
                  const missing = operationKeys && !operationKeys.has(item.operationKey);
                  return (
                    <div
                      key={item.id}
                      className={classnames(style['history-item'], { [style['is-active']]: item.id === currentId, [style['is-disabled']]: missing })}
                      title={missing ? formatMessage({ id: 'PostCatHistoryMissing' }) : item.url}
                      onClick={() => !missing && onSelect(item)}
                    >
                      <MethodTag method={item.method} />
                      <div className={style['history-item-main']}>
                        <span className={style['menu-item-text']}>{item.summary || item.path}</span>
                        <Text type="secondary" className={style['history-item-meta']}>
                          {dayjs(item.time).format('HH:mm:ss')}
                          {item.response.duration !== undefined && ` · ${item.response.duration}ms`}
                        </Text>
                      </div>
                      <Tag color={statusTagColor(item.response.status)} className={style['history-item-status']}>
                        {item.response.status || 'ERR'}
                      </Tag>
                      <span className={style['history-item-remove']} onClick={e => e.stopPropagation()}>
                        <Popconfirm title={formatMessage({ id: 'PostCatRemoveHistoryConfirm' })} onConfirm={() => onRemove(item)}>
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={formatMessage({ id: 'PostCatDelete' })} />
                        </Popconfirm>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'PostCatNoHistory' })} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default HistoryList;

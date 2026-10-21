import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Empty, Tree } from 'antd';
import { DownOutlined, FolderOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import classnames from 'classnames';
import withLocale from '../withLocale';
import ScrollArea from '../ScrollArea';
import style from '../style.module.scss';

export const MethodTag = ({ method, className }) => (
  <span className={classnames(style['method'], style[`method-${method}`], className)}>{method.toUpperCase()}</span>
);

const operationNodeKey = (group, key) => `api:${group}|${key}`;

/** currentKey 为接口 key（`${method}:${path}`），cases 仅用于显示接口下已保存用例的数量；传 caseCounts（服务端分页）时以其为准 */
const ApiMenu = withLocale(({ data, cases = [], caseCounts, currentKey, onChange, onAdd }) => {
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState('');
  const [expandedKeys, setExpandedKeys] = useState(null);

  const { treeData, allKeys, nodeMap } = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const casesMap = cases.reduce((output, item) => {
      (output[item.operationKey] = output[item.operationKey] || []).push(item);
      return output;
    }, {});
    const match = (...values) => !search || values.join(' ').toLowerCase().includes(search);
    const defaultTag = formatMessage({ id: 'PostCatDefaultTag' });
    const allKeys = [];
    const nodeMap = {};
    const treeData = [...data.tags.map(tag => tag.name), defaultTag]
      .map(group => {
        const children = data.operations
          .filter(item => (item.tags.length ? item.tags.includes(group) : group === defaultTag))
          .map(item => {
            const caseCount = caseCounts ? caseCounts[item.key] || 0 : (casesMap[item.key] || []).length;
            if (!match(item.path, item.summary, item.operationId, item.method)) {
              return null;
            }
            const key = operationNodeKey(group, item.key);
            nodeMap[key] = item.key;
            return {
              key,
              isLeaf: true,
              title: (
                <span className={classnames(style['menu-item'], { [style['is-deprecated']]: item.deprecated })} title={item.path}>
                  <MethodTag method={item.method} />
                  <span className={style['menu-item-text']}>{item.summary || item.path}</span>
                  {caseCount > 0 && (
                    <span className={style['menu-case-count']} title={formatMessage({ id: 'PostCatCaseCount' }, { count: caseCount })}>
                      {caseCount}
                    </span>
                  )}
                </span>
              )
            };
          })
          .filter(Boolean);
        const key = `tag:${group}`;
        allKeys.push(key);
        return {
          key,
          selectable: false,
          className: style['tree-tag-node'],
          title: (
            <span className={style['menu-tag']}>
              <FolderOutlined />
              <span className={style['menu-item-text']}>{group}</span>
            </span>
          ),
          children
        };
      })
      .filter(group => group.children.length > 0);
    return { treeData, allKeys, nodeMap };
  }, [data, cases, caseCounts, keyword, formatMessage]);

  const selectedKeys = useMemo(() => Object.keys(nodeMap).filter(key => nodeMap[key] === currentKey), [nodeMap, currentKey]);

  const seenKeysRef = useRef(new Set());
  useEffect(() => {
    const newKeys = allKeys.filter(key => !seenKeysRef.current.has(key));
    newKeys.forEach(key => seenKeysRef.current.add(key));
    newKeys.length && setExpandedKeys(keys => [...(keys || []), ...newKeys]);
    // 新出现的分组 / 带用例的接口默认展开，用户手动收起的保持收起
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allKeys.join(',')]);

  return (
    <div className={style['menu']}>
      <div className={style['menu-search']}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={formatMessage({ id: 'PostCatSearchApi' })}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        {onAdd && (
          <Button
            icon={<PlusOutlined />}
            title={formatMessage({ id: 'PostCatAddApi' })}
            aria-label={formatMessage({ id: 'PostCatAddApi' })}
            onClick={onAdd}
          />
        )}
      </div>
      <ScrollArea className={style['menu-body']}>
        {treeData.length > 0 ? (
          <Tree
            blockNode
            className={style['api-tree']}
            treeData={treeData}
            switcherIcon={<DownOutlined />}
            expandedKeys={keyword.trim() ? allKeys : expandedKeys || allKeys}
            onExpand={keys => setExpandedKeys(keys)}
            selectedKeys={selectedKeys}
            onSelect={(keys, { node }) => {
              if (node.key.startsWith('tag:')) {
                return;
              }
              onChange && onChange(nodeMap[node.key]);
            }}
            onClick={(e, node) => {
              if (node.key.startsWith('tag:')) {
                const keys = expandedKeys || allKeys;
                setExpandedKeys(keys.includes(node.key) ? keys.filter(key => key !== node.key) : [...keys, node.key]);
              }
            }}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'PostCatNoApi' })} />
        )}
      </ScrollArea>
    </div>
  );
});

export default ApiMenu;

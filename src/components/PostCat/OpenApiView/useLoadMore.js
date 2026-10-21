import { useRef, useState } from 'react';
import { Button, Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import style from '../style.module.scss';

const LOAD_MORE_THRESHOLD = 48;

/** 下拉加载：scrollableNodeProps 交给 ScrollArea，滚动接近底部时自动加载；footer 为加载中 / 「加载更多」，内容不足一屏时可点击 */
const useLoadMore = ({ hasMore, onLoadMore }) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const enabled = !!hasMore && !!onLoadMore;

  const loadMore = async () => {
    if (loadingRef.current || !enabled) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    try {
      await onLoadMore();
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const scrollableNodeProps = enabled
    ? {
        onScroll: e => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD && loadMore();
        }
      }
    : undefined;

  const footer = enabled ? (
    <div className={style['load-more']}>
      {loading ? (
        <Spin size="small" />
      ) : (
        <Button type="link" size="small" onClick={loadMore}>
          {formatMessage({ id: 'PostCatLoadMore' })}
        </Button>
      )}
    </div>
  ) : null;

  return { enabled, loading, loadMore, scrollableNodeProps, footer };
};

export default useLoadMore;

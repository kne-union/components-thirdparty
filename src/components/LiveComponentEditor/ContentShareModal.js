import { useEffect, useState } from 'react';
import { App, Button, Empty, Flex, Input, Modal, Segmented, Space, Spin, Tag, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import { createSiteApi, getRemoteContentUrl, toAbsoluteUrl } from './siteApi';
import style from './style.module.scss';

const { Text, Paragraph } = Typography;

const EXPIRE_OPTIONS = [
  { value: 3600, labelId: 'ContentShareExpire1h' },
  { value: 86400, labelId: 'ContentShareExpire1d' },
  { value: 604800, labelId: 'ContentShareExpire7d' },
  { value: 2592000, labelId: 'ContentShareExpire30d' },
  { value: 0, labelId: 'ContentShareExpireNever' }
];

const formatExpires = (expires, formatMessage) => {
  if (!expires) {
    return formatMessage({ id: 'ContentShareExpireNever' });
  }
  try {
    return new Date(expires).toLocaleString();
  } catch {
    return String(expires);
  }
};

/**
 * 远程站点内容短链管理：创建（可选有效期）+ 复制 / 删除已有链接
 */
const ContentShareModal = ({ open, siteHost, fileId, fileName, onCancel }) => {
  const { formatMessage } = useIntl();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [shares, setShares] = useState([]);
  const [expiresIn, setExpiresIn] = useState(86400);

  const loadShares = useRefCallback(async () => {
    if (!siteHost || !fileId) {
      setShares([]);
      return;
    }
    setLoading(true);
    try {
      const api = createSiteApi(siteHost);
      const list = await api.listContentShare(fileId);
      setShares(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      message.error(error.message || formatMessage({ id: 'MsgContentShareLoadFail' }));
      setShares([]);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    setExpiresIn(86400);
    loadShares();
  }, [open, siteHost, fileId, loadShares]);

  const resolveShareUrl = share => {
    const fromApi = toAbsoluteUrl(share?.url);
    if (fromApi) {
      return fromApi;
    }
    return getRemoteContentUrl(siteHost, share?.shorten);
  };

  const handleCopy = useRefCallback(async share => {
    const url = resolveShareUrl(share);
    if (!url) {
      message.warning(formatMessage({ id: 'MsgNoContentUrl' }));
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      message.success(formatMessage({ id: 'MsgCopyContentUrlSuccess' }));
    } catch (error) {
      console.error(error);
      message.error(formatMessage({ id: 'MsgCopyFail' }));
    }
  });

  const handleCreate = useRefCallback(async () => {
    if (!siteHost || !fileId) {
      return;
    }
    setCreating(true);
    try {
      const api = createSiteApi(siteHost);
      const share = await api.createContentShare({
        id: fileId,
        expiresIn: expiresIn > 0 ? Number(expiresIn) : null
      });
      message.success(formatMessage({ id: 'MsgContentShareCreateSuccess' }));
      await handleCopy(share);
      await loadShares();
    } catch (error) {
      console.error(error);
      message.error(error.message || formatMessage({ id: 'MsgContentShareCreateFail' }));
    } finally {
      setCreating(false);
    }
  });

  const handleRemove = useRefCallback(share => {
    if (!siteHost || !share?.shorten) {
      return;
    }
    modal.confirm({
      title: formatMessage({ id: 'ConfirmRemoveContentShareTitle' }),
      content: formatMessage({ id: 'ConfirmRemoveContentShareContent' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const api = createSiteApi(siteHost);
          await api.removeContentShare({ shorten: share.shorten });
          message.success(formatMessage({ id: 'MsgContentShareRemoveSuccess' }));
          await loadShares();
        } catch (error) {
          console.error(error);
          message.error(error.message || formatMessage({ id: 'MsgContentShareRemoveFail' }));
        }
      }
    });
  });

  return (
    <Modal
      title={
        <Flex vertical gap={2}>
          <span>{formatMessage({ id: 'CopyContentUrl' })}</span>
          {fileName ? (
            <Text type="secondary" className={style['content-share-subtitle']}>
              {formatMessage({ id: 'ContentShareFile' }, { name: fileName })}
            </Text>
          ) : null}
        </Flex>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={560}
      className={style['content-share-modal']}
    >
      <Flex vertical gap={16}>
        <div className={style['content-share-create']}>
          <Text strong className={style['content-share-section-title']}>
            {formatMessage({ id: 'ContentShareCreateSection' })}
          </Text>
          <Paragraph type="secondary" className={style['content-share-hint']}>
            {formatMessage({ id: 'ContentShareCreateHint' })}
          </Paragraph>
          <Flex gap={8} align="center" wrap="wrap">
            <Segmented
              className={style['content-share-expire']}
              value={expiresIn}
              onChange={setExpiresIn}
              options={EXPIRE_OPTIONS.map(item => ({
                value: item.value,
                label: formatMessage({ id: item.labelId })
              }))}
            />
            <Button type="primary" icon={<PlusOutlined />} loading={creating} onClick={handleCreate}>
              {formatMessage({ id: 'ContentShareCreate' })}
            </Button>
          </Flex>
        </div>

        <div className={style['content-share-list-wrap']}>
          <Flex justify="space-between" align="center" className={style['content-share-list-head']}>
            <Text strong className={style['content-share-section-title']}>
              {formatMessage({ id: 'ContentShareListSection' })}
            </Text>
            <Text type="secondary" className={style['content-share-count']}>
              {formatMessage({ id: 'ContentShareCount' }, { count: shares.length })}
            </Text>
          </Flex>

          <Spin spinning={loading}>
            {!loading && shares.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={formatMessage({ id: 'ContentShareEmpty' })}
                className={style['content-share-empty']}
              />
            ) : (
              <Flex vertical gap={8} className={style['content-share-list']}>
                {shares.map(item => {
                  const url = resolveShareUrl(item);
                  const forever = !item.expires;
                  return (
                    <div key={item.shorten || item.id} className={style['content-share-item']}>
                      <Flex justify="space-between" align="center" gap={8} className={style['content-share-item-meta']}>
                        <Space size={6} wrap>
                          <Tag icon={<LinkOutlined />} className={style['content-share-code']}>
                            {item.shorten}
                          </Tag>
                          <Tag color={forever ? 'default' : 'blue'}>
                            {forever
                              ? formatMessage({ id: 'ContentShareExpireNever' })
                              : formatMessage(
                                  { id: 'ContentShareExpiresAt' },
                                  { time: formatExpires(item.expires, formatMessage) }
                                )}
                          </Tag>
                        </Space>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          aria-label={formatMessage({ id: 'MenuRemove' })}
                          onClick={() => handleRemove(item)}
                        />
                      </Flex>
                      <Space.Compact className={style['content-share-url']}>
                        <Input value={url || ''} readOnly />
                        <Button icon={<CopyOutlined />} onClick={() => handleCopy(item)}>
                          {formatMessage({ id: 'Copy' })}
                        </Button>
                      </Space.Compact>
                    </div>
                  );
                })}
              </Flex>
            )}
          </Spin>
        </div>
      </Flex>
    </Modal>
  );
};

export default ContentShareModal;

const getColumns = ({ formatMessage, navigate } = {}) => {
  const t = (id, fallback) => (formatMessage ? formatMessage({ id }) : fallback);

  const goDetail = colItem => {
    const id = colItem?.id;
    if (!id || !navigate) {
      return;
    }
    navigate(`detail?id=${encodeURIComponent(String(id))}`);
  };

  return [
    {
      name: 'name',
      title: t('Name', '名称'),
      renderType: 'main',
      onClick: ({ colItem }) => goDetail(colItem)
    },
    {
      name: 'host',
      title: t('Host', '访问地址'),
      ellipsis: true
    },
    {
      name: 'shorten',
      title: t('Shorten', '短码')
    },
    {
      name: 'status',
      title: t('Status', '状态'),
      renderType: 'tag',
      getValueOf: item =>
        item.status === 'open'
          ? { type: 'success', text: t('Open', '开启') }
          : { type: 'danger', text: t('Close', '关闭') }
    },
    {
      name: 'defaultPermission',
      title: t('DefaultPermission', '默认权限'),
      getValueOf: item =>
        item.defaultPermission === 'r' ? t('PermissionR', '只读') : t('PermissionRw', '可读写')
    },
    {
      name: 'createdAt',
      title: t('CreatedAt', '创建时间'),
      format: 'datetime'
    }
  ];
};

export default getColumns;

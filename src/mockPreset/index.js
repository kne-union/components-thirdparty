import liveComponentsSiteData from './live-components-site-list.json';

export { liveComponentsSiteData };

const loadSiteList = ({ params } = {}) => {
  return import('./live-components-site-list.json').then(({ default: data }) => {
    const filter = params?.filter || {};
    let pageData = [...(data.siteList?.pageData || [])];

    if (filter.status) {
      const status = typeof filter.status === 'object' ? filter.status?.value : filter.status;
      if (status) {
        pageData = pageData.filter(item => item.status === status);
      }
    }

    if (filter.keyword) {
      const keyword = String(filter.keyword).toLowerCase();
      pageData = pageData.filter(item =>
        [item.name, item.shorten, item.host].filter(Boolean).join(' ').toLowerCase().includes(keyword)
      );
    }

    const totalCount = pageData.length;
    const perPage = Number(params?.perPage) || pageData.length || 20;
    const currentPage = Number(params?.currentPage) || 1;
    const start = (currentPage - 1) * perPage;

    return {
      pageData: pageData.slice(start, start + perPage),
      totalCount
    };
  });
};

const loadSiteDetail = ({ params } = {}) => {
  return import('./live-components-site-list.json').then(({ default: data }) => {
    const id = params?.id != null ? String(params.id) : '';
    const pageData = data.siteList?.pageData || [];
    return pageData.find(item => String(item.id) === id) || data.siteDetail || pageData[0] || null;
  });
};

const apis = {
  liveComponentsSite: {
    list: {
      loader: loadSiteList
    },
    detail: {
      loader: loadSiteDetail
    },
    create: {
      loader: ({ data } = {}) =>
        Promise.resolve({
          id: `site-${Date.now()}`,
          shorten: `NEW${String(Date.now()).slice(-4)}`,
          host: `localStorage:live-components-site-${Date.now()}`,
          status: 'open',
          defaultPermission: 'rw',
          createdAt: new Date().toISOString(),
          ...(data || {})
        })
    },
    save: {
      loader: () => Promise.resolve({ code: 0 })
    },
    remove: {
      loader: () => Promise.resolve({ code: 0 })
    }
  }
};

const preset = {
  ajax: async ({ loader, ...props }) => {
    if (typeof loader === 'function') {
      return Promise.resolve(loader(props))
        .then(data => ({
          data: {
            code: 0,
            data
          }
        }))
        .catch(err => ({
          data: {
            code: 500,
            msg: err?.message || '请求发生错误'
          }
        }));
    }
    return Promise.resolve({ data: { code: 0, data: {} } });
  },
  apis
};

export default preset;

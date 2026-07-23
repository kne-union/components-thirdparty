const getApis = (options = {}) => {
  const { prefix } = Object.assign(
    {
      prefix: '/api/v1/live-components-site'
    },
    options
  );

  return {
    list: {
      url: `${prefix}/site/list`,
      method: 'GET'
    },
    detail: {
      url: `${prefix}/site/detail`,
      method: 'GET'
    },
    create: {
      url: `${prefix}/site/create`,
      method: 'POST'
    },
    save: {
      url: `${prefix}/site/save`,
      method: 'POST'
    },
    remove: {
      url: `${prefix}/site/remove`,
      method: 'POST'
    }
  };
};

export default getApis;

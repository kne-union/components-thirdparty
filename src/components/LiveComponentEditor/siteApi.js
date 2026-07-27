const LOCAL_STORAGE_PREFIX = 'localStorage:';

export const isLocalStorageHost = host => typeof host === 'string' && host.startsWith(LOCAL_STORAGE_PREFIX);

export const getLocalStorageKey = host => host.slice(LOCAL_STORAGE_PREFIX.length);

const unwrap = payload => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
};

const joinUrl = (host, path) => `${String(host).replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

/** 将站点相对路径补成可访问的绝对 URL */
export const toAbsoluteUrl = pathOrUrl => {
  if (!pathOrUrl) {
    return null;
  }
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const origin = typeof window !== 'undefined' ? window.location?.origin : '';
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return origin ? `${origin}${path}` : path;
};

/** 从站点 host 推导内容短链基址（去掉末尾站点 shorten） */
export const getContentShareBase = host => {
  if (!host || isLocalStorageHost(host)) {
    return null;
  }
  const cleaned = String(host).replace(/\/$/, '');
  const parts = cleaned.split('/');
  if (parts.length < 2) {
    return cleaned;
  }
  parts.pop();
  return parts.join('/');
};

/** 远程站点内容短链地址：{origin}{prefix}/content/{shorten}（不含站点 shorten） */
export const getRemoteContentUrl = (host, contentShorten) => {
  if (!host || isLocalStorageHost(host) || !contentShorten) {
    return null;
  }
  const base = getContentShareBase(host);
  if (!base) {
    return null;
  }
  return toAbsoluteUrl(joinUrl(base, `content/${encodeURIComponent(String(contentShorten).toUpperCase())}`));
};

const createId = () => `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const defaultStore = () => ({
  tree: [],
  files: {}
});

const readLocalStore = key => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return defaultStore();
    }
    const parsed = JSON.parse(raw);
    return {
      tree: Array.isArray(parsed?.tree) ? parsed.tree : [],
      files: parsed?.files && typeof parsed.files === 'object' ? parsed.files : {}
    };
  } catch {
    return defaultStore();
  }
};

const writeLocalStore = (key, store) => {
  localStorage.setItem(key, JSON.stringify(store));
};

const findNode = (nodes, id, parent = null) => {
  if (!Array.isArray(nodes)) {
    return null;
  }
  for (const node of nodes) {
    if (node.id === id) {
      return { node, parent, list: nodes };
    }
    if (node.children?.length) {
      const found = findNode(node.children, id, node);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const collectDescendantIds = node => {
  const ids = [node.id];
  if (node.children?.length) {
    node.children.forEach(child => {
      ids.push(...collectDescendantIds(child));
    });
  }
  return ids;
};

/** 收集节点自身及其所有子孙 id（用于移动时排除非法目标） */
export const collectNodeAndDescendantIds = (nodes, id) => {
  const found = findNode(nodes, id);
  if (!found) {
    return [];
  }
  return collectDescendantIds(found.node);
};

const assertWritable = node => {
  if (!node) {
    throw new Error('Node not found');
  }
  if (node.permission !== 'rw') {
    throw new Error('Read-only permission');
  }
};

const isDirectoryNode = node => node?.type === 'directory' || Array.isArray(node?.children);

/** 取某父目录下的兄弟节点列表（parentId 为空表示根） */
export const getSiblingList = (nodes = [], parentId = null) => {
  if (!parentId) {
    return nodes || [];
  }
  const found = findNode(nodes, parentId);
  if (!found || !isDirectoryNode(found.node)) {
    return [];
  }
  return found.node.children || [];
};

/** 同一目录下名称是否已存在（文件与文件夹共用命名空间） */
export const hasDuplicateName = (nodes = [], parentId, name, excludeId) => {
  const target = String(name || '').trim();
  if (!target) {
    return false;
  }
  return getSiblingList(nodes, parentId || null).some(
    item => item.id !== excludeId && String(item.name || '').trim() === target
  );
};

const assertUniqueSiblingName = (nodes, parentId, name, excludeId) => {
  if (hasDuplicateName(nodes, parentId, name, excludeId)) {
    throw new Error('DUPLICATE_NAME');
  }
};

/** 查找节点的父目录 id，根级返回 null */
export const findParentId = (nodes, id) => {
  const found = findNode(nodes, id);
  if (!found) {
    return null;
  }
  return found.parent?.id || null;
};

const localApi = host => {
  const key = getLocalStorageKey(host);

  return {
    async getFolderTree() {
      return readLocalStore(key).tree;
    },

    async get(id) {
      const store = readLocalStore(key);
      const found = findNode(store.tree, id);
      if (!found) {
        throw new Error('File not found');
      }
      const { node } = found;
      if (node.type !== 'file') {
        throw new Error('Not a file');
      }
      return {
        id: node.id,
        name: node.name,
        permission: node.permission || 'rw',
        content: store.files[id] ?? ''
      };
    },

    async createFolder({ parentId, name }) {
      const store = readLocalStore(key);
      const trimmedName = String(name || '').trim();
      if (!trimmedName) {
        throw new Error('Name is required');
      }
      assertUniqueSiblingName(store.tree, parentId || null, trimmedName);

      const folder = {
        id: createId(),
        name: trimmedName,
        type: 'directory',
        permission: 'rw',
        children: []
      };

      if (!parentId) {
        store.tree.push(folder);
      } else {
        const found = findNode(store.tree, parentId);
        if (!found) {
          throw new Error('Parent not found');
        }
        assertWritable(found.node);
        if (!isDirectoryNode(found.node)) {
          throw new Error('Parent is not a directory');
        }
        found.node.type = 'directory';
        found.node.children = found.node.children || [];
        found.node.children.push(folder);
      }

      writeLocalStore(key, store);
      return folder;
    },

    async create({ parentId, name, content = '' }) {
      const store = readLocalStore(key);
      const trimmedName = String(name || '').trim();
      if (!trimmedName) {
        throw new Error('Name is required');
      }
      assertUniqueSiblingName(store.tree, parentId || null, trimmedName);

      const file = {
        id: createId(),
        name: trimmedName,
        type: 'file',
        permission: 'rw'
      };

      if (!parentId) {
        store.tree.push(file);
      } else {
        const found = findNode(store.tree, parentId);
        if (!found) {
          throw new Error('Parent not found');
        }
        assertWritable(found.node);
        if (!isDirectoryNode(found.node)) {
          throw new Error('Parent is not a directory');
        }
        found.node.type = 'directory';
        found.node.children = found.node.children || [];
        found.node.children.push(file);
      }

      store.files[file.id] = content;
      writeLocalStore(key, store);
      return file;
    },

    async save({ id, content }) {
      const store = readLocalStore(key);
      const found = findNode(store.tree, id);
      if (!found) {
        throw new Error('File not found');
      }
      assertWritable(found.node);
      if (found.node.type !== 'file') {
        throw new Error('Not a file');
      }
      store.files[id] = content;
      writeLocalStore(key, store);
      return { id, content };
    },

    async rename({ id, name }) {
      const store = readLocalStore(key);
      const trimmedName = String(name || '').trim();
      if (!trimmedName) {
        throw new Error('Name is required');
      }
      const found = findNode(store.tree, id);
      if (!found) {
        throw new Error('Node not found');
      }
      assertWritable(found.node);
      const parentId = found.parent?.id || null;
      assertUniqueSiblingName(store.tree, parentId, trimmedName, id);
      found.node.name = trimmedName;
      writeLocalStore(key, store);
      return { id: found.node.id, name: found.node.name, type: found.node.type, permission: found.node.permission };
    },

    async move({ id, parentId }) {
      const store = readLocalStore(key);
      const found = findNode(store.tree, id);
      if (!found) {
        throw new Error('Node not found');
      }
      assertWritable(found.node);

      const targetParentId = parentId || null;
      const currentParentId = found.parent?.id || null;
      if (targetParentId === currentParentId) {
        throw new Error('INVALID_MOVE_TARGET');
      }
      if (targetParentId === id) {
        throw new Error('INVALID_MOVE_TARGET');
      }
      if (isDirectoryNode(found.node) && targetParentId) {
        const blocked = new Set(collectDescendantIds(found.node));
        if (blocked.has(targetParentId)) {
          throw new Error('INVALID_MOVE_TARGET');
        }
      }

      let targetList = store.tree;
      if (targetParentId) {
        const target = findNode(store.tree, targetParentId);
        if (!target) {
          throw new Error('Parent not found');
        }
        assertWritable(target.node);
        if (!isDirectoryNode(target.node)) {
          throw new Error('Parent is not a directory');
        }
        target.node.type = 'directory';
        target.node.children = target.node.children || [];
        targetList = target.node.children;
      }

      assertUniqueSiblingName(store.tree, targetParentId, found.node.name, id);
      found.list.splice(found.list.indexOf(found.node), 1);
      targetList.push(found.node);
      writeLocalStore(key, store);
      return {
        id: found.node.id,
        name: found.node.name,
        type: found.node.type,
        permission: found.node.permission,
        parentId: targetParentId
      };
    },

    async remove({ ids }) {
      const idList = Array.isArray(ids) ? ids : [ids];
      const store = readLocalStore(key);

      idList.forEach(id => {
        const found = findNode(store.tree, id);
        if (!found) {
          throw new Error(`Node not found: ${id}`);
        }
        assertWritable(found.node);
        if (found.node.type === 'directory' && found.node.children?.length) {
          throw new Error('Cannot remove non-empty folder');
        }
        const removeIds = collectDescendantIds(found.node);
        found.list.splice(found.list.indexOf(found.node), 1);
        removeIds.forEach(removeId => {
          delete store.files[removeId];
        });
      });

      writeLocalStore(key, store);
      return { ids: idList };
    }
  };
};

const httpApi = host => {
  const request = async (method, path, { query, body } = {}) => {
    let url = joinUrl(host, path);
    if (query) {
      const search = new URLSearchParams(query).toString();
      if (search) {
        url = `${url}?${search}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      let message = `Request failed: ${response.status}`;
      try {
        const errBody = await response.json();
        message = errBody.message || errBody.msg || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    if (!text) {
      return null;
    }

    try {
      return unwrap(JSON.parse(text));
    } catch {
      return text;
    }
  };

  return {
    getFolderTree: () => request('GET', 'getFolderTree'),
    get: id => request('GET', 'get', { query: { id } }),
    createFolder: body => request('POST', 'createFolder', { body }),
    create: body => request('POST', 'create', { body }),
    save: body => request('POST', 'save', { body }),
    rename: body => request('POST', 'rename', { body }),
    move: body => request('POST', 'move', { body }),
    remove: body => request('POST', 'remove', { body }),
    createContentShare: body => request('POST', 'content-share/create', { body }),
    listContentShare: id => request('GET', 'content-share/list', { query: { id } }),
    removeContentShare: body => request('POST', 'content-share/remove', { body }),
    getInfo: () => request('GET', 'info'),
    aiStart: body => request('POST', 'ai/start', { body })
  };
};

/** 按 host 创建站点 API（支持 localStorage:KEY） */
export const createSiteApi = host => {
  if (isLocalStorageHost(host)) {
    return localApi(host);
  }
  return httpApi(host);
};

const isValidTreeNode = node => {
  if (!node || typeof node !== 'object') {
    return false;
  }
  if (node.id == null || node.id === '' || !String(node.name || '').trim()) {
    return false;
  }
  if (node.type != null && node.type !== 'file' && node.type !== 'directory') {
    return false;
  }
  if (node.permission != null && node.permission !== 'r' && node.permission !== 'rw') {
    return false;
  }
  if (node.children != null) {
    if (!Array.isArray(node.children)) {
      return false;
    }
    return node.children.every(isValidTreeNode);
  }
  return true;
};

/** 校验 getFolderTree 返回是否为合法树数组 */
export const isValidFolderTree = data => Array.isArray(data) && data.every(isValidTreeNode);

/** 探测站点连通性（请求 getFolderTree 并校验格式） */
export const probeSiteConnection = async host => {
  if (isLocalStorageHost(host)) {
    return { ok: true, data: await createSiteApi(host).getFolderTree() };
  }
  try {
    const data = await createSiteApi(host).getFolderTree();
    if (!isValidFolderTree(data)) {
      return { ok: false, reason: 'invalid' };
    }
    return { ok: true, data };
  } catch (error) {
    return { ok: false, reason: 'error', error };
  }
};

/** 用户自行添加的站点列表（与 props.sites 分离，存 localStorage） */
export const DEFAULT_USER_SITES_STORAGE_KEY = 'live-component-editor:user-sites';

export const normalizeSite = site => ({
  host: String(site?.host || '').trim(),
  name: String(site?.name || '').trim() || String(site?.host || '').trim()
});

export const readUserSites = (storageKey = DEFAULT_USER_SITES_STORAGE_KEY) => {
  const key = String(storageKey || '').trim() || DEFAULT_USER_SITES_STORAGE_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeSite).filter(item => item.host);
  } catch {
    return [];
  }
};

export const writeUserSites = (sites, storageKey = DEFAULT_USER_SITES_STORAGE_KEY) => {
  const key = String(storageKey || '').trim() || DEFAULT_USER_SITES_STORAGE_KEY;
  const normalized = (Array.isArray(sites) ? sites : []).map(normalizeSite).filter(item => item.host);
  localStorage.setItem(key, JSON.stringify(normalized));
  return normalized;
};

/** props 站点在前，用户本地站点在后（同 host 以 props 为准） */
export const mergeSites = (propSites = [], userSites = []) => {
  const props = (Array.isArray(propSites) ? propSites : []).map(normalizeSite).filter(item => item.host);
  const propHosts = new Set(props.map(item => item.host));
  const locals = (Array.isArray(userSites) ? userSites : [])
    .map(normalizeSite)
    .filter(item => item.host && !propHosts.has(item.host));
  return [...props, ...locals];
};

/** 将站点树转为 FileSystemView 可用的 data（保留 id/permission） */
export const toFileSystemViewData = (nodes = []) =>
  (nodes || []).map(node => {
    const isDirectory = isDirectoryNode(node);
    const item = {
      id: node.id,
      name: node.name,
      type: isDirectory ? 'directory' : 'file',
      permission: node.permission || 'rw'
    };
    if (isDirectory) {
      // 始终带 children，保证空文件夹也可展开并在其下新建
      item.children = toFileSystemViewData(node.children || []);
    }
    return item;
  });

/** 收集目录选项（另存为/移动到选父目录）；excludeIds 排除自身及子树 */
export const flattenDirectories = (nodes = [], pathLabel = '', excludeIds = []) => {
  const blocked = new Set((excludeIds || []).filter(Boolean).map(String));
  const result = [{ id: '', label: pathLabel || '/', permission: 'rw' }];
  const walk = (list, prefix) => {
    (list || []).forEach(node => {
      if (node.type !== 'directory') {
        return;
      }
      const nodeId = String(node.id);
      if (blocked.has(nodeId)) {
        // 跳过该目录及其子树
        return;
      }
      const label = prefix ? `${prefix}/${node.name}` : node.name;
      result.push({ id: node.id, label, permission: node.permission });
      walk(node.children, label);
    });
  };
  walk(nodes, '');
  return result;
};

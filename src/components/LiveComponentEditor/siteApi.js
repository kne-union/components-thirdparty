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
    remove: body => request('POST', 'remove', { body })
  };
};

/** 按 host 创建站点 API（支持 localStorage:KEY） */
export const createSiteApi = host => {
  if (isLocalStorageHost(host)) {
    return localApi(host);
  }
  return httpApi(host);
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

/** 收集目录选项（另存为选父目录） */
export const flattenDirectories = (nodes = [], pathLabel = '') => {
  const result = [{ id: '', label: pathLabel || '/', permission: 'rw' }];
  const walk = (list, prefix) => {
    (list || []).forEach(node => {
      if (node.type !== 'directory') {
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

/**
 * FormCreator 模版侧栏：UI 为 FileSystemView，文件夹数据/操作为 GroupFolder API。
 *
 * apis（与 components-admin GroupFolder 一致）:
 * - groupList / create / save / remove → 文件夹
 * - list / get / saveTemplate → 模版文件
 */

/** 调用 apis 项：function | { loader } | ajax 配置（{ code: 0, data }） */
export const invokeApi = async (api, options = {}, ajax) => {
  if (!api) {
    throw new Error('api_missing');
  }
  if (typeof api === 'function') {
    return api(options);
  }
  if (typeof api.loader === 'function') {
    return api.loader(options);
  }
  if (!ajax) {
    throw new Error('ajax_missing');
  }
  const request = { ...api };
  if (options.params) {
    request.params = { ...(api.params || {}), ...options.params };
  }
  if (options.data !== undefined) {
    request.data =
      api.data && typeof api.data === 'object' && !Array.isArray(api.data)
        ? { ...api.data, ...options.data }
        : options.data;
  }
  const { data: resData } = await ajax(request);
  if (resData && typeof resData === 'object' && 'code' in resData) {
    if (resData.code !== 0) {
      const err = new Error(resData.msg || resData.message || 'request_failed');
      err.code = resData.code;
      err.response = resData;
      throw err;
    }
    return resData.data;
  }
  return resData;
};

/** 与 Group resolveGroupTreeData 对齐 */
export const resolveGroupTreeData = data => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(data?.results)) {
    return data.results;
  }
  if (Array.isArray(data?.pageData)) {
    return data.pageData;
  }
  if (Array.isArray(data?.list)) {
    return data.list;
  }
  return [];
};

export const normalizeTemplateList = data => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.list)) {
    return data.list;
  }
  if (Array.isArray(data?.pageData)) {
    return data.pageData;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  return [];
};

export const getGroupNodeKey = (node, valueKey = 'code') => {
  if (!node) {
    return null;
  }
  const key = node[valueKey] ?? node.code ?? node.id;
  return key == null || key === '' ? null : key;
};

/** Group 树 → FileSystemView 目录节点 */
export const groupTreeToDirectories = (nodes = [], valueKey = 'code', labelKey = 'name') =>
  (nodes || []).map(node => {
    const key = getGroupNodeKey(node, valueKey);
    return {
      id: key,
      name: node[labelKey] || node.name,
      type: 'directory',
      code: node.code,
      groupId: node.id,
      parentId: node.parentId ?? null,
      raw: node,
      children: groupTreeToDirectories(node.children || [], valueKey, labelKey)
    };
  });

const templateParentKey = (tpl, valueKey = 'code') => {
  if (tpl == null) {
    return null;
  }
  const raw = tpl.parentId ?? tpl.group ?? tpl.groupId ?? tpl[valueKey];
  if (raw == null || raw === '') {
    return null;
  }
  if (typeof raw === 'object') {
    return getGroupNodeKey(raw, valueKey);
  }
  return raw;
};

/** 将模版挂到对应目录下（根级模版放在树顶层）；parentId 兼容 id / code */
export const mergeTemplatesIntoFileSystemView = (directories = [], templates = [], valueKey = 'code') => {
  const filesByParent = new Map();
  (templates || []).forEach(tpl => {
    const parentKey = templateParentKey(tpl, valueKey);
    const key = parentKey == null ? '' : String(parentKey);
    if (!filesByParent.has(key)) {
      filesByParent.set(key, []);
    }
    filesByParent.get(key).push({
      id: tpl.id ?? tpl.code,
      name: tpl.name || tpl.title || String(tpl.id ?? tpl.code),
      type: 'file',
      schema: tpl.schema,
      content: tpl.content,
      raw: tpl
    });
  });

  const takeFilesForDir = node => {
    const keys = [node.id, node.groupId, node.code, node.raw?.id, node.raw?.code].filter(
      k => k != null && k !== ''
    );
    const files = [];
    const seen = new Set();
    keys.forEach(k => {
      const mapKey = String(k);
      if (!filesByParent.has(mapKey)) {
        return;
      }
      filesByParent.get(mapKey).forEach(file => {
        const fileId = String(file.id);
        if (seen.has(fileId)) {
          return;
        }
        seen.add(fileId);
        files.push(file);
      });
      filesByParent.delete(mapKey);
    });
    return files;
  };

  const walk = nodes =>
    (nodes || []).map(node => {
      const childDirs = walk(node.children || []);
      const files = takeFilesForDir(node);
      return {
        ...node,
        children: [...childDirs, ...files]
      };
    });

  const tree = walk(directories);
  const rootFiles = filesByParent.get('') || [];
  filesByParent.delete('');
  filesByParent.forEach(files => {
    rootFiles.push(...files);
  });
  return [...tree, ...rootFiles];
};

const pickSchema = payload => {
  if (!payload) {
    return null;
  }
  if (payload.schema && typeof payload.schema === 'object') {
    return payload.schema;
  }
  if (payload.content && typeof payload.content === 'object' && !Array.isArray(payload.content)) {
    return payload.content;
  }
  if (typeof payload.content === 'string') {
    try {
      const parsed = JSON.parse(payload.content);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }
  if (Array.isArray(payload.blocks) || payload.actions) {
    return payload;
  }
  return null;
};

export const extractSchemaFromPayload = payload => pickSchema(payload);

/**
 * GroupFolderField 选中值 → saveTemplate.parentId（根为 null）
 * 优先 valueKey（与 FileSystemView 目录键、分组 code 一致），再兼容 id
 */
export const resolveTemplateParentId = (value, valueKey = 'code') => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === '') {
    return null;
  }
  if (typeof raw === 'object') {
    if (raw.isAll) {
      return null;
    }
    const id = raw[valueKey] ?? raw.code ?? raw.id ?? raw.value;
    return id == null || id === '' ? null : id;
  }
  return raw;
};

const cloneWithNewIds = (node, createFieldId, createDataKey) => {
  if (!node || typeof node !== 'object') {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(item => cloneWithNewIds(item, createFieldId, createDataKey));
  }

  const next = { ...node };
  if (next.id != null) {
    next.id = createFieldId();
  }
  if (next.type && next.kind == null && next.name != null) {
    next.name = createDataKey('field');
  }
  if (['list', 'tableList', 'multiField', 'object'].includes(next.kind) && next.name) {
    next.name = createDataKey(next.kind === 'object' ? 'obj' : 'block');
  }
  if (next.kind === 'choice' && next.selectorName) {
    next.selectorName = createDataKey('choice');
  }
  if (Array.isArray(next.list)) {
    next.list = next.list.map(item => cloneWithNewIds(item, createFieldId, createDataKey));
  }
  if (Array.isArray(next.blocks)) {
    next.blocks = next.blocks.map(item => cloneWithNewIds(item, createFieldId, createDataKey));
  }
  if (Array.isArray(next.itemBlocks)) {
    next.itemBlocks = next.itemBlocks.map(item => cloneWithNewIds(item, createFieldId, createDataKey));
  }
  if (Array.isArray(next.options)) {
    next.options = next.options.map(item => cloneWithNewIds(item, createFieldId, createDataKey));
  }
  if (Array.isArray(next.items)) {
    next.items = next.items.map(item => cloneWithNewIds(item, createFieldId, createDataKey));
  }
  return next;
};

export const mergeTemplateIntoSchema = (currentSchema, templateSchema, { createFieldId, createDataKey, normalizeSchema }) => {
  const current = normalizeSchema(currentSchema || {});
  const template = normalizeSchema(templateSchema || {});
  const appended = (template.blocks || []).map(block => cloneWithNewIds(block, createFieldId, createDataKey));
  return normalizeSchema({
    ...current,
    blocks: [...(current.blocks || []), ...appended]
  });
};

/** Group 文件夹 API 子集 */
export const resolveGroupApis = apis => {
  if (!apis) {
    return null;
  }
  if (apis.groupList || apis.create || apis.save || apis.remove) {
    return {
      groupList: apis.groupList,
      create: apis.create,
      save: apis.save,
      remove: apis.remove
    };
  }
  return null;
};

export const isDirectoryNode = data => data?.type === 'directory';

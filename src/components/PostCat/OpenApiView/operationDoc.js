export const toOperationKey = (method, path) => `${method}:${path}`;

export const splitOperationKey = key => {
  const index = key.indexOf(':');
  return { method: key.slice(0, index), path: key.slice(index + 1) };
};

/** 取文档中未解析 $ref 的原始接口定义 */
export const getRawOperation = (doc, key) => {
  const { method, path } = splitOperationKey(key);
  return doc?.paths?.[path]?.[method] || null;
};

const removeFromPaths = (paths, key) => {
  const { method, path } = splitOperationKey(key);
  if (!paths[path]) {
    return paths;
  }
  const pathItem = Object.assign({}, paths[path]);
  delete pathItem[method];
  const next = Object.assign({}, paths);
  if (Object.keys(pathItem).filter(name => name !== 'parameters').length === 0) {
    delete next[path];
  } else {
    next[path] = pathItem;
  }
  return next;
};

/** 新增（fromKey 为空）或修改接口，返回新文档 */
export const saveOperation = (doc, fromKey, { method, path, operation }) => {
  let paths = Object.assign({}, doc.paths);
  if (fromKey) {
    paths = removeFromPaths(paths, fromKey);
  }
  paths[path] = Object.assign({}, paths[path], { [method]: operation });
  return Object.assign({}, doc, { paths });
};

export const removeOperation = (doc, key) => Object.assign({}, doc, { paths: removeFromPaths(Object.assign({}, doc.paths), key) });

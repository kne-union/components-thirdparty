export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

const isPlainObject = value => Object.prototype.toString.call(value) === '[object Object]';

const getByRef = (root, ref) => {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) {
    return undefined;
  }
  return ref
    .slice(2)
    .split('/')
    .map(part => decodeURIComponent(part.replace(/~1/g, '/').replace(/~0/g, '~')))
    .reduce((target, key) => (target == null ? undefined : target[key]), root);
};

const mergeAllOf = list => {
  return list.reduce(
    (output, item) => {
      if (!isPlainObject(item)) {
        return output;
      }
      const { properties, required, ...rest } = item;
      Object.assign(output, rest);
      output.properties = Object.assign({}, output.properties, properties);
      output.required = Array.from(new Set([...(output.required || []), ...(required || [])]));
      return output;
    },
    { type: 'object' }
  );
};

/** 递归展开 $ref 与 allOf；循环引用处保留 { $circular: refName } */
export const resolveRefs = (target, root, seen = []) => {
  if (Array.isArray(target)) {
    return target.map(item => resolveRefs(item, root, seen));
  }
  if (!isPlainObject(target)) {
    return target;
  }
  if (typeof target.$ref === 'string') {
    const ref = target.$ref;
    const name = ref.split('/').pop();
    if (seen.includes(ref)) {
      return { type: 'object', $circular: name };
    }
    const resolved = getByRef(root, ref);
    if (resolved === undefined) {
      return { $unresolved: ref };
    }
    const { $ref, ...siblings } = target;
    const output = resolveRefs(Object.assign({}, resolved, siblings), root, [...seen, ref]);
    if (isPlainObject(output) && !output.title) {
      output.title = name;
    }
    return output;
  }
  const output = {};
  Object.keys(target).forEach(key => {
    output[key] = resolveRefs(target[key], root, seen);
  });
  if (Array.isArray(output.allOf)) {
    const { allOf, ...rest } = output;
    return Object.assign(mergeAllOf(allOf), rest);
  }
  return output;
};

const getSchemaType = schema => {
  if (!isPlainObject(schema)) {
    return '';
  }
  if (schema.$circular) {
    return `${schema.$circular} (circular)`;
  }
  const type = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type;
  if (type === 'array') {
    const itemType = getSchemaType(schema.items);
    return `array<${itemType || 'any'}>`;
  }
  if (schema.oneOf) return 'oneOf';
  if (schema.anyOf) return 'anyOf';
  if (!type && schema.properties) return 'object';
  return type || '';
};

let rowId = 0;

/** 把 schema 展平成树形表格行 */
export const schemaToRows = (schema, { name, required } = {}) => {
  if (!isPlainObject(schema)) {
    return [];
  }
  const buildChildren = target => {
    if (!isPlainObject(target)) {
      return undefined;
    }
    if (target.type === 'array' || target.items) {
      return buildChildren(target.items);
    }
    const variants = target.oneOf || target.anyOf;
    if (Array.isArray(variants)) {
      return variants.map((item, index) => {
        const row = schemaToRows(item, { name: item.title || `option ${index + 1}` })[0];
        return row;
      });
    }
    if (isPlainObject(target.properties)) {
      const requiredList = target.required || [];
      return Object.keys(target.properties).flatMap(key => schemaToRows(target.properties[key], { name: key, required: requiredList.includes(key) }));
    }
    return undefined;
  };

  const children = buildChildren(schema);
  const row = {
    key: `row-${(rowId += 1)}`,
    name: name || schema.title || '',
    type: getSchemaType(schema),
    required: !!required,
    description: schema.description || '',
    format: schema.format,
    enum: schema.enum,
    example: schema.example !== undefined ? schema.example : schema.default,
    deprecated: !!schema.deprecated
  };
  if (children && children.length > 0) {
    row.children = children;
  }
  if (name === undefined) {
    return row.children || [row];
  }
  return [row];
};

/** 根据 schema 生成示例值 */
export const buildExample = (schema, depth = 0) => {
  if (!isPlainObject(schema) || depth > 8) {
    return null;
  }
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  const variants = schema.oneOf || schema.anyOf;
  if (Array.isArray(variants) && variants.length) return buildExample(variants[0], depth + 1);
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === 'array' || schema.items) {
    const item = buildExample(schema.items, depth + 1);
    return item === null ? [] : [item];
  }
  if (type === 'object' || schema.properties) {
    if (schema.$circular) return {};
    return Object.keys(schema.properties || {}).reduce((output, key) => {
      output[key] = buildExample(schema.properties[key], depth + 1);
      return output;
    }, {});
  }
  switch (type) {
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'string':
      if (schema.format === 'date-time') return new Date(0).toISOString();
      if (schema.format === 'date') return '1970-01-01';
      return 'string';
    default:
      return null;
  }
};

const toContentList = (content, fallback) => {
  if (isPlainObject(content)) {
    return Object.keys(content).map(contentType => ({
      contentType,
      schema: content[contentType]?.schema,
      example: content[contentType]?.example
    }));
  }
  return fallback ? [{ contentType: 'application/json', schema: fallback }] : [];
};

const groupParameters = parameters => {
  const output = { path: [], query: [], header: [], cookie: [], body: null, formData: [] };
  parameters.forEach(item => {
    if (!isPlainObject(item) || !item.in) {
      return;
    }
    if (item.in === 'body') {
      output.body = item;
      return;
    }
    const schema = item.schema || { type: item.type, format: item.format, enum: item.enum, items: item.items, default: item.default };
    const value = Object.assign({}, item, { schema });
    if (output[item.in]) {
      output[item.in].push(value);
    }
  });
  return output;
};

const mergeParameters = (pathLevel = [], operationLevel = []) => {
  const map = new Map();
  [...pathLevel, ...operationLevel].forEach(item => {
    if (isPlainObject(item)) {
      map.set(`${item.in}:${item.name}`, item);
    }
  });
  return Array.from(map.values());
};

/** 解析 OpenAPI 3.x / Swagger 2.0 文档为展示用结构 */
const parseOpenApiData = (input = {}) => {
  const root = isPlainObject(input) ? input : {};
  const isSwagger2 = typeof root.swagger === 'string';
  const paths = isPlainObject(root.paths) ? root.paths : {};
  const operations = [];
  const tagNames = [];

  Object.keys(paths).forEach(path => {
    const pathItem = resolveRefs(paths[path], root);
    if (!isPlainObject(pathItem)) {
      return;
    }
    HTTP_METHODS.forEach(method => {
      const operation = pathItem[method];
      if (!isPlainObject(operation)) {
        return;
      }
      const parameters = groupParameters(mergeParameters(pathItem.parameters, operation.parameters));
      let requestBody = toContentList(operation.requestBody?.content);
      if (isSwagger2 && parameters.body) {
        requestBody = (operation.consumes || root.consumes || ['application/json']).map(contentType => ({
          contentType,
          schema: parameters.body.schema
        }));
      }
      if (isSwagger2 && parameters.formData.length) {
        requestBody = [
          {
            contentType: (operation.consumes || root.consumes || ['multipart/form-data'])[0],
            schema: {
              type: 'object',
              required: parameters.formData.filter(item => item.required).map(item => item.name),
              properties: parameters.formData.reduce((output, item) => {
                output[item.name] = Object.assign({}, item.schema, { description: item.description });
                return output;
              }, {})
            }
          }
        ];
      }
      const responses = Object.keys(operation.responses || {}).map(statusCode => {
        const response = operation.responses[statusCode] || {};
        return {
          statusCode,
          description: response.description || '',
          headers: response.headers,
          content: toContentList(response.content, isSwagger2 ? response.schema : null)
        };
      });
      const tags = Array.isArray(operation.tags) && operation.tags.length ? operation.tags : [];
      tags.forEach(tag => tagNames.includes(tag) || tagNames.push(tag));
      operations.push({
        key: `${method}:${path}`,
        path,
        method,
        tags,
        summary: operation.summary || '',
        description: operation.description || '',
        deprecated: !!operation.deprecated,
        parameters: {
          path: parameters.path,
          query: parameters.query,
          header: parameters.header,
          cookie: parameters.cookie
        },
        requestBody: {
          required: !!operation.requestBody?.required,
          description: operation.requestBody?.description || '',
          content: requestBody
        },
        responses
      });
    });
  });

  const tagDefinitions = (Array.isArray(root.tags) ? root.tags : []).filter(item => isPlainObject(item));
  const orderedTags = [
    ...tagDefinitions.map(item => item.name).filter(name => tagNames.includes(name)),
    ...tagNames.filter(name => !tagDefinitions.some(item => item.name === name))
  ];

  let servers = Array.isArray(root.servers) ? root.servers : [];
  if (isSwagger2 && root.host) {
    const schemes = root.schemes && root.schemes.length ? root.schemes : ['https'];
    servers = schemes.map(scheme => ({ url: `${scheme}://${root.host}${root.basePath || ''}` }));
  }

  return {
    version: root.openapi || root.swagger || '',
    info: isPlainObject(root.info) ? root.info : {},
    servers,
    tags: orderedTags.map(name =>
      Object.assign(
        { name },
        tagDefinitions.find(item => item.name === name)
      )
    ),
    operations
  };
};

export const isOpenApiDoc = data =>
  isPlainObject(data) && (typeof data.openapi === 'string' || typeof data.swagger === 'string') && isPlainObject(data.paths);

export default parseOpenApiData;

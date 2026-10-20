const DEFAULT_CONTENT_TYPE = 'application/json';

const SWAGGER2_PARAM_SCHEMA_KEYS = ['type', 'format', 'items', 'enum', 'default', 'collectionFormat'];

const isPlainObject = value => !!value && typeof value === 'object' && !Array.isArray(value);

const isEmptySchema = schema => !isPlainObject(schema) || Object.keys(schema).length === 0;

const trim = value => String(value ?? '').trim();

const firstContentType = content => (isPlainObject(content) ? Object.keys(content)[0] : undefined);

const pick = (source, keys) => keys.reduce((result, key) => (source[key] === undefined ? result : Object.assign(result, { [key]: source[key] })), {});

/** Swagger 2.0 非 body 参数的类型信息平铺在参数上 */
const usesParamSchema = (param, isOpenApi3) => isOpenApi3 || param.in === 'body';

/** 原始接口定义 → 表单数据；$ref 参数不进表单，保存时原样保留 */
export const toFormData = ({ method, path, operation = {} }, isOpenApi3) => {
  const requestBody = operation.requestBody || {};
  const requestBodyContentType = firstContentType(requestBody.content);
  return {
    method,
    path,
    summary: operation.summary || '',
    tags: operation.tags || [],
    description: operation.description || '',
    deprecated: !!operation.deprecated,
    parameters: (operation.parameters || [])
      .filter(param => !param.$ref)
      .map(param => ({
        name: param.name,
        in: param.in,
        required: !!param.required,
        schema: usesParamSchema(param, isOpenApi3) ? param.schema : pick(param, SWAGGER2_PARAM_SCHEMA_KEYS),
        description: param.description || ''
      })),
    requestBodyContentType: requestBodyContentType || DEFAULT_CONTENT_TYPE,
    requestBodyRequired: !!requestBody.required,
    requestBodyDescription: requestBody.description || '',
    requestBodySchema: requestBody.content?.[requestBodyContentType]?.schema,
    responses: Object.entries(operation.responses || {}).map(([status, response]) => {
      const contentType = firstContentType(response.content);
      return {
        status,
        description: response.description || '',
        contentType: contentType || DEFAULT_CONTENT_TYPE,
        schema: isOpenApi3 ? response.content?.[contentType]?.schema : response.schema
      };
    })
  };
};

const withContent = (origin = {}, contentType, schema) => {
  const oldContentType = firstContentType(origin.content);
  const content = Object.assign({}, origin.content);
  delete content[oldContentType];
  if (!isEmptySchema(schema)) {
    content[trim(contentType) || DEFAULT_CONTENT_TYPE] = Object.assign({}, origin.content?.[oldContentType], { schema });
  }
  return Object.keys(content).length ? content : undefined;
};

const buildParameters = (list = [], origin = [], isOpenApi3) => {
  const parameters = list.map(item => {
    const raw = origin.find(param => !param.$ref && param.name === item.name && param.in === item.in) || {};
    const param = Object.assign({}, raw, { name: trim(item.name), in: item.in, required: item.in === 'path' || !!item.required });
    trim(item.description) ? (param.description = trim(item.description)) : delete param.description;
    const schema = isEmptySchema(item.schema) ? undefined : item.schema;
    if (usesParamSchema(param, isOpenApi3)) {
      schema ? (param.schema = schema) : delete param.schema;
    } else {
      delete param.schema;
      SWAGGER2_PARAM_SCHEMA_KEYS.forEach(key => delete param[key]);
      Object.assign(param, pick(schema || {}, SWAGGER2_PARAM_SCHEMA_KEYS));
    }
    return param;
  });
  return [...parameters, ...origin.filter(param => param.$ref)];
};

const buildRequestBody = (formData, origin) => {
  const content = withContent(origin, formData.requestBodyContentType, formData.requestBodySchema);
  const description = trim(formData.requestBodyDescription);
  if (!content && !description) {
    return origin?.$ref ? origin : undefined;
  }
  const requestBody = Object.assign({}, origin, { content: content || {} });
  delete requestBody.$ref;
  description ? (requestBody.description = description) : delete requestBody.description;
  formData.requestBodyRequired ? (requestBody.required = true) : delete requestBody.required;
  return requestBody;
};

const buildResponses = (list = [], origin = {}, isOpenApi3) =>
  list.reduce((responses, item) => {
    const raw = origin[item.status] || {};
    if (raw.$ref && !trim(item.description) && isEmptySchema(item.schema)) {
      responses[item.status] = raw;
      return responses;
    }
    const response = Object.assign({}, raw, { description: trim(item.description) });
    delete response.$ref;
    if (isOpenApi3) {
      const content = withContent(raw, item.contentType, item.schema);
      content ? (response.content = content) : delete response.content;
    } else {
      isEmptySchema(item.schema) ? delete response.schema : (response.schema = item.schema);
    }
    responses[trim(item.status)] = response;
    return responses;
  }, {});

/** 表单数据合并回原始接口定义（表单未覆盖的字段如 operationId、security 原样保留） */
export const fromFormData = (formData, { operation: origin = {} }, isOpenApi3) => {
  const operation = Object.assign({}, origin, {
    summary: trim(formData.summary),
    description: trim(formData.description),
    tags: formData.tags || [],
    deprecated: !!formData.deprecated,
    parameters: buildParameters(formData.parameters, origin.parameters, isOpenApi3),
    responses: buildResponses(formData.responses, origin.responses, isOpenApi3)
  });
  if (isOpenApi3) {
    operation.requestBody = buildRequestBody(formData, origin.requestBody);
  }
  ['summary', 'description'].forEach(name => !operation[name] && delete operation[name]);
  !operation.tags.length && delete operation.tags;
  !operation.deprecated && delete operation.deprecated;
  !operation.parameters.length && delete operation.parameters;
  operation.requestBody === undefined && delete operation.requestBody;
  return { method: formData.method, path: trim(formData.path), operation };
};

export const toJsonText = ({ method, path, operation }) => JSON.stringify(Object.assign({ method, path }, operation), null, 2);

/** JSON 文本 → { method, path, operation }，格式不对抛错 */
export const fromJsonText = text => {
  const value = JSON.parse(text);
  if (!isPlainObject(value)) {
    throw new Error('not object');
  }
  const { method, path, ...operation } = value;
  return { method: String(method || '').toLowerCase(), path: trim(path), operation };
};

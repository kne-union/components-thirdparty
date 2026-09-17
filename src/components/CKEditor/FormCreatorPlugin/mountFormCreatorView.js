import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { SchemaRenderer, hasRenderableContent } from '@components/FormCreator';
import { FORM_CREATOR_DEFAULT_HEIGHT } from './constants';
import { parseSchemaText } from './schemaCodec';
import FormCreatorGlobalShell from './FormCreatorGlobalShell';

const roots = new WeakMap();

const resolveSchema = schemaOrText => {
  if (schemaOrText && typeof schemaOrText === 'object') {
    return schemaOrText;
  }

  return parseSchemaText(schemaOrText, { fallbackToDefault: true });
};

export const mountFormCreatorInHost = (
  host,
  {
    schema,
    height = FORM_CREATOR_DEFAULT_HEIGHT,
    preview = true,
    showActions = false,
    formProps = {},
    emptyText = '暂无表单内容'
  } = {}
) => {
  if (!host) {
    return;
  }

  const resolvedHeight = typeof height === 'number' ? `${height}px` : height || `${FORM_CREATOR_DEFAULT_HEIGHT}px`;
  const normalized = resolveSchema(schema);
  const resolvedFormProps = formProps && typeof formProps === 'object' ? formProps : {};

  host.classList.add('ck-form-creator-viewer');
  host.style.display = 'block';
  host.style.width = '100%';
  host.style.minHeight = resolvedHeight;

  let root = roots.get(host);

  if (!root) {
    root = createRoot(host);
    roots.set(host, root);
  }

  if (!hasRenderableContent(normalized)) {
    root.render(
      <div className="ck-form-creator-empty" style={{ padding: 16, color: 'rgba(0,0,0,0.45)' }}>
        {emptyText}
      </div>
    );
    return;
  }

  root.render(
    <FormCreatorGlobalShell>
      <SchemaRenderer schema={normalized} preview={preview} showActions={showActions} formProps={resolvedFormProps} />
    </FormCreatorGlobalShell>
  );
};

export const unmountFormCreatorFromHost = host => {
  if (!host) {
    return;
  }

  const root = roots.get(host);

  if (root) {
    try {
      flushSync(() => {
        root.unmount();
      });
    } catch {
      // 宿主已从文档移除时忽略
    }
    roots.delete(host);
  }
};

export const remountFormCreatorInHost = (host, options) => {
  unmountFormCreatorFromHost(host);
  mountFormCreatorInHost(host, options);
};

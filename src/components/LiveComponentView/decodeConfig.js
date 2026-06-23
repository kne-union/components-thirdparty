import { decode } from 'plantuml-encoder';

const normalizeConfig = value => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const content = String(value.content || '').trim();
  if (!content) {
    return null;
  }

  return {
    content,
    props: value.props && typeof value.props === 'object' ? value.props : {},
    scope: value.scope && typeof value.scope === 'object' ? value.scope : {}
  };
};

/** 解析 PlantUML 编码或 JSON 字符串为组件配置对象 */
export const decodeLiveComponentConfig = value => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return normalizeConfig(value);
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  // 与 LiveComponentEditor 一致：优先 plantuml decode，再尝试裸 JSON
  try {
    return normalizeConfig(JSON.parse(decode(trimmed)));
  } catch {
    try {
      return normalizeConfig(JSON.parse(trimmed));
    } catch {
      return null;
    }
  }
};

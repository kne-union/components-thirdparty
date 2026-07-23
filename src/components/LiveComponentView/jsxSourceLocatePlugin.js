/**
 * Babel 插件：为 JSX 开标签注入 data-live-line / data-live-column，便于预览双击定位源码。
 * @param {object} options
 * @param {number} options.lineOffset 相对用户源码的行偏移（如 FormInfo 外包多出的行数）
 * @param {string} options.wrapPrefix 外包前缀，如 'render('，用于修正首行列号
 */
const createJsxSourceLocatePlugin = (options = {}) => {
  const lineOffset = Number(options.lineOffset) || 0;
  const wrapPrefix = options.wrapPrefix || 'render(';

  return function jsxSourceLocatePlugin({ types: t }) {
    const ensureAttr = (opening, name, value) => {
      const existed = opening.attributes.find(
        attr => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === name
      );
      if (existed) {
        return;
      }
      opening.attributes.push(t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(String(value))));
    };

    return {
      name: 'jsx-source-locate',
      visitor: {
        JSXOpeningElement(path) {
          const loc = path.node.loc;
          if (!loc?.start) {
            return;
          }

          let line = loc.start.line - lineOffset;
          let column = loc.start.column + 1;

          if (loc.start.line === 1) {
            column = Math.max(1, column - wrapPrefix.length);
          }

          if (line < 1) {
            return;
          }

          ensureAttr(path.node, 'data-live-line', line);
          ensureAttr(path.node, 'data-live-column', column);
        }
      }
    };
  };
};

export default createJsxSourceLocatePlugin;

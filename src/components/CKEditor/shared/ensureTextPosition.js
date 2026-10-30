/**
 * 自定义 text upcast 会拦截默认转换器，也就丢了它的自动补段落：
 * 表格单元格等只收块级的位置，裸文本（如 `<td>{{ name }}</td>`）会被整段丢弃。
 * 这里按默认转换器的做法补一个 paragraph，返回段落内的位置；无法补段落时返回 null。
 */
export const ensureTextPosition = (position, { schema, writer }) => {
  if (schema.checkChild(position, '$text')) {
    return position;
  }
  if (!schema.checkChild(position, 'paragraph') || !schema.checkChild(['paragraph'], '$text')) {
    return null;
  }
  const paragraph = writer.createElement('paragraph');
  writer.insert(paragraph, position);
  return writer.createPositionAt(paragraph, 0);
};

export default ensureTextPosition;

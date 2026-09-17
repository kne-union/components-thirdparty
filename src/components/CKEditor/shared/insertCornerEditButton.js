import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export const SECTION_WIDGET_EDIT_CLASS = 'ck-section-widget-edit';

const roots = new WeakMap();

/**
 * 在 block widget 右上角插入 antd primary 圆形 small 编辑按钮（仅编辑态，不进入 getData）。
 */
export const insertCornerEditButton = (writer, section, { label, onEdit }) => {
  const host = writer.createRawElement('span', { class: SECTION_WIDGET_EDIT_CLASS }, domElement => {
    const stop = event => {
      event.preventDefault();
      event.stopPropagation();
    };

    domElement.addEventListener('mousedown', stop);
    domElement.addEventListener('mouseup', stop);

    let root = roots.get(domElement);

    if (!root) {
      root = createRoot(domElement);
      roots.set(domElement, root);
    }

    root.render(
      <Button
        type="primary"
        shape="circle"
        size="small"
        icon={<EditOutlined />}
        title={label}
        aria-label={label}
        onClick={event => {
          stop(event.nativeEvent || event);
          onEdit?.();
        }}
        onMouseDown={event => {
          stop(event.nativeEvent || event);
        }}
      />
    );

    return () => {
      const current = roots.get(domElement);

      if (current) {
        try {
          flushSync(() => {
            current.unmount();
          });
        } catch {
          // 宿主已从文档移除时忽略
        }
        roots.delete(domElement);
      }
    };
  });

  writer.insert(writer.createPositionAt(section, 'end'), host);

  return host;
};

import { Plugin } from 'ckeditor5';
import { findDialogWrap } from './dialogFloatingDropdown';

const IN_DIALOG_CLASS = 'ck-editor_in-dialog';

/**
 * 弹窗 / 抽屉内的工具栏修正：
 * 1. 入场动画（transform: scale）期间初始化时，工具栏按缩放后的宽度分组，按钮会全部收进「更多」；
 *    transform 不触发 ResizeObserver，动画结束后需手动重新分组。
 * 2. 吸顶工具栏默认下移 --nav-height 避开页面导航，弹窗内不需要，否则距顶部留出空隙。
 */
export default class DialogToolbarLayoutPlugin extends Plugin {
  static get pluginName() {
    return 'DialogToolbarLayout';
  }

  init() {
    const editor = this.editor;

    editor.ui.once('ready', () => {
      const editorElement = editor.ui.view.element;
      const toolbar = editor.ui.view.toolbar;

      if (!editorElement || !toolbar) {
        return;
      }

      // ToolbarView 未公开重新分组的 API，_behavior 仅在 shouldGroupWhenFull 时为 DynamicGrouping
      const regroup = () => toolbar._behavior?._updateGrouping?.();

      const syncDialogState = () => {
        editorElement.classList.toggle(IN_DIALOG_CLASS, !!findDialogWrap(editorElement));
      };

      const onAnimationEnd = event => {
        if (event.target instanceof Element && event.target.contains(editorElement)) {
          syncDialogState();
          regroup();
        }
      };

      syncDialogState();
      document.addEventListener('animationend', onAnimationEnd, true);
      document.addEventListener('transitionend', onAnimationEnd, true);

      editor.on('destroy', () => {
        document.removeEventListener('animationend', onAnimationEnd, true);
        document.removeEventListener('transitionend', onAnimationEnd, true);
      });
    });
  }
}

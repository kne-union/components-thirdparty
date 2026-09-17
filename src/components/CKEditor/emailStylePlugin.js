import { Plugin } from 'ckeditor5';
import { EMAIL_STYLE_CSS_SCOPED } from './emailStyles';
import { toEmailHtml } from './emailExport';

const STYLE_ELEMENT_ID = 'ck-email-styles';

/** 编辑态显示用的样式与发信 CSS 同源，注入一次即可，不随编辑器实例重复插入 */
const injectScopedStyles = () => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }

  const styleElement = document.createElement('style');

  styleElement.id = STYLE_ELEMENT_ID;
  styleElement.textContent = EMAIL_STYLE_CSS_SCOPED;
  document.head.appendChild(styleElement);
};

/**
 * 让编辑器出口直接产出可发信的 HTML。
 *
 * model 里只存样式 class（保持干净、「样式」下拉可继续切换），`editor.data.get()` 时才把
 * 对应声明派生成 inline style。因此 `onChange` / `getData()` 的结果无需再做转换即可投递，
 * 编辑态、存储、发信三者同源。
 *
 * 回填是幂等的：`htmlSupport` 未放开 p/h2 等的 `style`，内容回到编辑器时 inline style 被丢弃、
 * class 保留，显示仍由注入的 scoped CSS 负责，下次输出再重新派生。
 */
export default class EmailStylePlugin extends Plugin {
  static get pluginName() {
    return 'EmailStyle';
  }

  init() {
    injectScopedStyles();

    const data = this.editor.data;
    const originalGet = data.get.bind(data);

    data.get = (...args) => toEmailHtml(originalGet(...args));
  }
}

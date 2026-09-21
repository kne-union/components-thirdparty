const PANEL_CLASS = 'ck-template-dropdown-panel';
const FLOATING_FLAG = '_dialogFloatingDropdown';
const DIALOG_WRAP_SELECTOR = '.ant-modal-wrap, .ant-drawer';

const findDialogWrap = element => element?.closest?.(DIALOG_WRAP_SELECTOR) || null;

const resolveOverlayZIndex = element => {
  let node = element;

  while (node && node !== document.documentElement) {
    const zIndex = Number.parseInt(window.getComputedStyle(node).zIndex, 10);

    if (Number.isFinite(zIndex) && zIndex > 0) {
      return zIndex + 10;
    }

    node = node.parentElement;
  }

  return 1050;
};

/**
 * ContextualBalloon / widget toolbar 挂在共享的 `.ck-body-wrapper` 上，默认 z-index 约 1000。
 * useFormModal 等弹层常为 2000，会把条件工具栏气球盖住。弹窗内编辑器把 body wrapper 抬到弹层之上。
 */
const syncCkBodyWrapperForDialog = editor => {
  const dialog = findDialogWrap(editor.ui?.view?.element);
  const wrapper = document.querySelector('.ck-body-wrapper');

  if (!wrapper || !dialog) {
    return;
  }

  const nextZ = resolveOverlayZIndex(dialog);
  const prevZ = Number.parseInt(wrapper.dataset.ckDialogZ || '0', 10);

  if (nextZ >= prevZ) {
    wrapper.style.position = wrapper.style.position || 'relative';
    wrapper.style.zIndex = String(nextZ);
    wrapper.dataset.ckDialogZ = String(nextZ);
  }
};

/** 嵌套弹窗（编辑条件 / 比较值）需高于当前 Modal 与 ck-body-wrapper 气球层 */
const resolveNestedOverlayZIndex = () => {
  let maxZ = 2000;

  document.querySelectorAll('.ant-modal-wrap, .ant-drawer, .ck-body-wrapper').forEach(el => {
    const zIndex = Number.parseInt(window.getComputedStyle(el).zIndex, 10);

    if (Number.isFinite(zIndex) && zIndex > maxZ) {
      maxZ = zIndex;
    }
  });

  return maxZ + 10;
};

/**
 * 弹窗内点 widget 气球工具栏时，焦点锁会把焦点拉回弹窗并拆掉气球，click 来不及触发。
 * mousedown 上 preventDefault，焦点留在编辑器，否则/块级/编辑条件 才能执行。
 */
const bindDialogBalloonToolbar = editor => {
  syncCkBodyWrapperForDialog(editor);

  const onMouseDown = domEvt => {
    if (!findDialogWrap(editor.ui?.view?.element)) {
      return;
    }

    if (domEvt.target?.closest?.('.ck-balloon-panel .ck-button, .ck-toolbar-container .ck-button')) {
      domEvt.preventDefault();
    }
  };

  document.addEventListener('mousedown', onMouseDown, true);
  editor.on('destroy', () => {
    document.removeEventListener('mousedown', onMouseDown, true);
  });

  editor.on('ready', () => syncCkBodyWrapperForDialog(editor));
};

const isFloating = dropdown => dropdown[FLOATING_FLAG] === true;

const applyPanelClasses = (panelEl, extraClass) => {
  if (!panelEl) {
    return;
  }

  panelEl.classList.add(PANEL_CLASS);

  if (extraClass) {
    panelEl.classList.add(extraClass);
  }
};

const positionFloatingPanel = dropdown => {
  const panelEl = dropdown.panelView.element;
  const buttonEl = dropdown.buttonView.element;

  if (!panelEl || !buttonEl) {
    return;
  }

  const rect = buttonEl.getBoundingClientRect();
  const margin = 8;
  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const placeAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(120, Math.min(280, placeAbove ? spaceAbove : spaceBelow));
  const minWidth = Math.max(rect.width, 180);
  let left = rect.left;

  if (left + minWidth > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - margin - minWidth);
  }

  panelEl.style.position = 'fixed';
  panelEl.style.left = `${Math.round(left)}px`;
  panelEl.style.right = 'auto';
  panelEl.style.minWidth = `${Math.round(minWidth)}px`;
  panelEl.style.maxHeight = `${Math.round(maxHeight)}px`;
  panelEl.style.overflowX = 'hidden';
  panelEl.style.overflowY = 'auto';
  panelEl.style.overscrollBehavior = 'contain';
  panelEl.style.zIndex = String(panelEl._dialogFloatingZIndex || 1050);

  if (placeAbove) {
    panelEl.style.top = 'auto';
    panelEl.style.bottom = `${Math.round(window.innerHeight - rect.top)}px`;
  } else {
    panelEl.style.top = `${Math.round(rect.bottom)}px`;
    panelEl.style.bottom = 'auto';
  }
};

const pinFloatingPanel = (dropdown, editor, extraClass) => {
  const panelEl = dropdown.panelView.element;
  const dialog = findDialogWrap(editor.ui.view.element);

  if (!panelEl || !dialog) {
    return;
  }

  dropdown[FLOATING_FLAG] = true;
  panelEl._dialogFloatingZIndex = resolveOverlayZIndex(dialog);
  applyPanelClasses(panelEl, extraClass);

  if (panelEl.parentElement !== document.body) {
    document.body.appendChild(panelEl);
  }

  positionFloatingPanel(dropdown);
};

const restoreFloatingPanel = (dropdown, extraClass) => {
  const panelEl = dropdown.panelView.element;

  dropdown[FLOATING_FLAG] = false;

  if (!panelEl) {
    return;
  }

  if (extraClass) {
    panelEl.classList.remove(extraClass);
  }

  ['position', 'top', 'left', 'right', 'bottom', 'minWidth', 'maxHeight', 'zIndex', 'overflowX', 'overflowY', 'overscrollBehavior'].forEach(key => {
    panelEl.style[key] = '';
  });

  if (dropdown.element && panelEl.parentElement !== dropdown.element) {
    dropdown.element.appendChild(panelEl);
  }
};

/**
 * useFormModal 的滚动容器会裁切下拉。面板挂到 body 后，若焦点落到弹窗外，
 * 弹窗焦点锁会把焦点拉回，CKEditor 随即因失焦收起下拉。
 * 浮层打开期间焦点留在工具栏按钮上，并忽略这次失焦。
 */
const bindDialogFloatingDropdown = (dropdown, editor, extraClass) => {
  syncCkBodyWrapperForDialog(editor);

  const panelView = dropdown.panelView;
  const focusPanel = panelView.focus.bind(panelView);
  const focusPanelLast = panelView.focusLast.bind(panelView);
  const focusToolbarButton = () => {
    dropdown.buttonView.focus();
  };

  panelView.focus = (...args) => {
    if (isFloating(dropdown)) {
      focusToolbarButton();
      return;
    }

    return focusPanel(...args);
  };

  panelView.focusLast = (...args) => {
    if (isFloating(dropdown)) {
      focusToolbarButton();
      return;
    }

    return focusPanelLast(...args);
  };

  dropdown.focusTracker.on(
    'change:isFocused',
    (evt, name, isFocused) => {
      if (isFocused || !dropdown.isOpen || !isFloating(dropdown)) {
        return;
      }

      evt.stop();
      focusToolbarButton();
    },
    { priority: 'highest' }
  );

  const reposition = () => {
    if (dropdown.isOpen && isFloating(dropdown)) {
      positionFloatingPanel(dropdown);
    }
  };

  document.addEventListener('scroll', reposition, true);
  window.addEventListener('resize', reposition);
  editor.on('destroy', () => {
    document.removeEventListener('scroll', reposition, true);
    window.removeEventListener('resize', reposition);
    restoreFloatingPanel(dropdown, extraClass);
  });

  panelView.on('render', () => {
    const panelEl = panelView.element;

    if (!panelEl) {
      return;
    }

    applyPanelClasses(panelEl, extraClass);

    if (panelEl._dialogFloatingMouseBound) {
      return;
    }

    panelEl._dialogFloatingMouseBound = true;
    dropdown.listenTo(panelEl, 'mousedown', (evt, domEvt) => {
      if (!isFloating(dropdown)) {
        return;
      }

      if (domEvt.target?.closest?.('.ck-button, .ck-list-item-button')) {
        domEvt.preventDefault();
      }
    });
  });

  dropdown.on(
    'change:isOpen',
    () => {
      if (dropdown.isOpen) {
        syncCkBodyWrapperForDialog(editor);
        pinFloatingPanel(dropdown, editor, extraClass);
        return;
      }

      restoreFloatingPanel(dropdown, extraClass);
    },
    { priority: 'highest' }
  );

  dropdown.on(
    'change:isOpen',
    () => {
      if (!dropdown.isOpen || !isFloating(dropdown)) {
        return;
      }

      applyPanelClasses(dropdown.panelView.element, extraClass);
      positionFloatingPanel(dropdown);
    },
    { priority: 'lowest' }
  );
};

export { syncCkBodyWrapperForDialog, bindDialogBalloonToolbar, findDialogWrap, resolveOverlayZIndex, resolveNestedOverlayZIndex };
export default bindDialogFloatingDropdown;

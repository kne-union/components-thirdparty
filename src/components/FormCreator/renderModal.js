import React from 'react';
import { ConfigProvider } from 'antd';

const pickThemeToken = themeToken => {
  if (!themeToken || typeof themeToken !== 'object') {
    return null;
  }
  const token = {};
  if (themeToken.colorPrimary) {
    token.colorPrimary = themeToken.colorPrimary;
  }
  if (themeToken.colorPrimaryHover) {
    token.colorPrimaryHover = themeToken.colorPrimaryHover;
  }
  return Object.keys(token).length ? token : null;
};

/**
 * form-info FormModal 通过 renderModal 传入 footer（Cancel/Submit）；
 * components-core Modal 在 footerButtons 未显式置空时会再渲染一套默认按钮，导致重复。
 */
const adaptFormModalProps = props => {
  const { onCancel, footer, footerButtons, ...modalProps } = props;
  const hasCustomFooter = typeof footer === 'function' || (footer !== undefined && footer !== null);

  return {
    ...modalProps,
    footer,
    onClose: onCancel,
    onCancel,
    footerButtons: footerButtons ?? (hasCustomFooter ? [] : undefined)
  };
};

/**
 * 使用 components-core Modal 渲染 FormModal（与 FormInfo / super-select 约定一致）。
 *
 * @param {React.ComponentType} Modal components-core:Modal 默认导出
 * @param {object} [themeToken] 与 globalInit.themeToken 一致
 */
export const createRenderModal = (Modal, themeToken) => {
  if (!Modal) {
    return null;
  }

  const antdToken = pickThemeToken(themeToken);

  return props => {
    const modal = <Modal {...adaptFormModalProps(props)} />;

    if (!antdToken) {
      return modal;
    }

    return <ConfigProvider theme={{ token: antdToken }}>{modal}</ConfigProvider>;
  };
};

export default createRenderModal;

import { createWithRemoteLoader } from '@kne/remote-loader';

/**
 * Global 的 ConfigProvider 会把主题写进唯一的 `#component-core-theme`。
 * createRoot 脱离页面树后，若不传 themeToken，PureGlobal 会落到默认蓝 #4096ff 并覆盖宿主主题。
 * 调用方没带上 token 时，先读当前样式，避免把页面主题改掉。
 */
export const readHostThemeToken = () => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const colorPrimary = document
    .getElementById('component-core-theme')
    ?.textContent?.match(/--primary-color:([^;]+)/)?.[1]
    ?.trim();

  if (!colorPrimary) {
    return undefined;
  }

  return { colorPrimary };
};

export const resolveIsolatedThemeToken = themeToken => {
  if (themeToken && themeToken.colorPrimary) {
    return themeToken;
  }

  return readHostThemeToken() || themeToken;
};

/**
 * createRoot 挂载时脱离页面 Global 树；FormCreator / SchemaRenderer 的 withSyncGlobalLocale
 * 会调用 useGlobalContext('locale').setGlobal，无 Provider 时抛 setGlobal is not a function。
 * 与 LiveComponentEditor SafeRender 同理，外包 PureGlobal 提供独立上下文。
 */
const FormCreatorGlobalShell = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules, children, preset, themeToken, locale }) => {
  const [PureGlobal] = remoteModules;
  const resolvedThemeToken = resolveIsolatedThemeToken(themeToken);

  return (
    <PureGlobal
      preset={Object.assign({}, preset || {}, locale ? { locale } : null)}
      themeToken={resolvedThemeToken}
    >
      {children}
    </PureGlobal>
  );
});

export default FormCreatorGlobalShell;

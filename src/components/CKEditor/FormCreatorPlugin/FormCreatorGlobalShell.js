import { createWithRemoteLoader } from '@kne/remote-loader';

/**
 * createRoot 挂载时脱离页面 Global 树；FormCreator / SchemaRenderer 的 withSyncGlobalLocale
 * 会调用 useGlobalContext('locale').setGlobal，无 Provider 时抛 setGlobal is not a function。
 * 与 LiveComponentEditor SafeRender 同理，外包 PureGlobal 提供独立上下文。
 */
const FormCreatorGlobalShell = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules, children, preset, themeToken, locale }) => {
  const [PureGlobal] = remoteModules;

  return (
    <PureGlobal
      preset={Object.assign({}, preset || {}, locale ? { locale } : null)}
      themeToken={themeToken}
    >
      {children}
    </PureGlobal>
  );
});

export default FormCreatorGlobalShell;

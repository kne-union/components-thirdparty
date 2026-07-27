import { createWithRemoteLoader } from '@kne/remote-loader';
import { encode } from 'plantuml-encoder';
import { decodeLiveComponentConfig } from '@components/LiveComponentView/decodeConfig';
import { App, Tabs, Flex, Alert, Segmented, Splitter, Collapse, Button, Space, Empty, Tooltip } from 'antd';
import {
  MenuOutlined,
  SplitCellsOutlined,
  EyeOutlined,
  CopyOutlined,
  LinkOutlined,
  SnippetsOutlined,
  SaveOutlined,
  FormOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import CodeEditor from '@components/CodeEditor';
import LiveComponentView from '@components/LiveComponentView';
import useRefCallback from '@kne/use-ref-callback';
import lodash from 'lodash';
import { transform, debounce, throttle, get, isEqual } from 'lodash';
import dayjs from 'dayjs';
import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import SiteFilePanel, { SaveAsModal } from './SiteFilePanel';
import ContentShareModal from './ContentShareModal';
import AiAssistPanel from './AiAssistPanel';
import {
  createSiteApi,
  DEFAULT_USER_SITES_STORAGE_KEY,
  isLocalStorageHost,
  mergeSites,
  readUserSites
} from './siteApi';
import { extractSelectionFromContent, applySelectionToContent, mergeSuggestedProps } from './aiSelection';
import { installAiSiteMock, uninstallAiSiteMock, AI_MOCK_HOST } from './aiSiteMock';
import { getLibs } from '@components/LiveComponentView';
import {
  HIGHLIGHT_DURATION_MS,
  handlePreviewLocate,
  measureHighlightRects,
  rectsRelativeTo,
  resolveElementsFromEditorPosition,
  resolveSourceFromPoint,
  findSameSourceElements,
  scrollElementsIntoView
} from './previewLocate';
import style from './style.module.scss';

/** @deprecated 使用 decodeLiveComponentConfig */
export const decodeLiveComponentValue = decodeLiveComponentConfig;

const mergeParams = value => Object.assign({ content: '', props: {}, scope: {} }, decodeLiveComponentConfig(value) || {});

const buildPropsFormData = props => ({
  props: Object.keys(props).map(name => {
    const item = Object.assign({}, props[name]);
    return {
      name,
      type: item.type,
      defaultValue: item.defaultValue
    };
  })
});

const buildScopeFormData = scope => ({
  scope: Object.keys(scope).map(name => {
    const item = scope[name];
    return {
      name,
      token: item
    };
  })
});

const normalizePropsFormData = formData =>
  transform(
    formData.props || [],
    (result, value) => {
      if (!value?.name) {
        return;
      }
      result[value.name] = {
        defaultValue: value.type === 'function' ? '()=>null' : value.defaultValue ?? '',
        type: value.type
      };
    },
    {}
  );

const normalizeScopeFormData = formData =>
  transform(
    formData.scope || [],
    (result, value) => {
      if (!value?.name) {
        return;
      }
      result[value.name] = value.token;
    },
    {}
  );

const createFormAutoSaver = useFormContext => {
  return function FormAutoSaver({ onSave }) {
    const { formData } = useFormContext();
    const initializedRef = useRef(false);
    const snapshotRef = useRef('');

    useEffect(() => {
      const snapshot = JSON.stringify(formData);
      if (!initializedRef.current) {
        initializedRef.current = true;
        snapshotRef.current = snapshot;
        return;
      }
      if (snapshot === snapshotRef.current) {
        return;
      }
      snapshotRef.current = snapshot;
      onSave();
    }, [formData, onSave]);

    return null;
  };
};

const SafeRender = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalContext', 'components-core:Global@PureGlobal', 'components-core:Global@usePreset']
})(({ remoteModules, children }) => {
  const [useGlobalContext, PureGlobal, usePreset] = remoteModules;
  const { global } = useGlobalContext();
  const preset = usePreset();
  const containerRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!rootRef.current) {
      const dom = document.createElement('div');
      container.appendChild(dom);
      rootRef.current = createRoot(dom);
    }

    rootRef.current.render(
      <PureGlobal preset={Object.assign({}, preset, { locale: global.locale })} themeToken={global.themeToken}>
        {children}
      </PureGlobal>
    );
  }, [children, global.locale, global.themeToken, PureGlobal]);

  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} />;
});

const LiveComponentEditorCore = createWithRemoteLoader({
  modules: [
    'components-core:FormInfo',
    'components-core:FormInfo@useFormContext',
    'components-core:InfoPage',
    'components-core:InfoPage@CentralContent',
    'components-core:Common@SimpleBar'
  ]
})(
  withLocale(
    forwardRef(
      (
        {
          remoteModules,
          defaultValue,
          defaultMod = 'mix',
          height = 500,
          width = 260,
          aiWidth = 360,
          libs = { lodash, dayjs },
          onChange,
          toolbarExtra,
          sites,
          onSitesChange,
          siteActionsOpen = true,
          userSitesStorageKey = DEFAULT_USER_SITES_STORAGE_KEY,
          enableSourceLocate = true
        },
        ref
      ) => {
        const { formatMessage } = useIntl();
        const { message } = App.useApp();
        const [FormInfo, useFormContext, InfoPage, CentralContent, SimpleBar] = remoteModules;
        const FormAutoSaver = useMemo(() => createFormAutoSaver(useFormContext), [useFormContext]);
        const { Form, TableList } = FormInfo;
        const { Input, Select } = FormInfo.fields;
        const codeEditorRef = useRef(null);
        const skipEditorChangeRef = useRef(false);
        const updateContentDebouncedRef = useRef(null);
        if (!updateContentDebouncedRef.current) {
          updateContentDebouncedRef.current = debounce((newContent, setParams) => {
            setParams(prev => ({ ...prev, content: newContent }));
          }, 300);
        }
        const [params, setParams] = useState(() => mergeParams(defaultValue));
        const enableSites = Array.isArray(sites);
        const [currentFile, setCurrentFile] = useState(null);
        const [saveAsOpen, setSaveAsOpen] = useState(false);
        const [contentShareOpen, setContentShareOpen] = useState(false);
        const [treeRefreshToken, setTreeRefreshToken] = useState(0);
        const [sitesCollapsed, setSitesCollapsed] = useState(false);
        const [aiCollapsed, setAiCollapsed] = useState(false);
        const [aiEnabled, setAiEnabled] = useState(false);
        const [activeSiteHost, setActiveSiteHost] = useState(null);
        const [selectedSource, setSelectedSource] = useState(null);
        const [limitToSelection, setLimitToSelection] = useState(false);
        const resolvedUserSitesKey =
          String(userSitesStorageKey || '').trim() || DEFAULT_USER_SITES_STORAGE_KEY;
        // 合并后的站点列表（props.sites 在前 + 用户本地添加的站点），由 SiteFilePanel 维护并回调
        const [mergedSites, setMergedSites] = useState(() =>
          Array.isArray(sites) ? mergeSites(sites, readUserSites(resolvedUserSitesKey)) : []
        );
        const sitesPanelWidth = Number(width) > 0 ? Number(width) : 260;
        const aiPanelWidth = Number(aiWidth) > 0 ? Number(aiWidth) : 360;

        const handleSitesChange = useRefCallback(next => {
          setMergedSites(next);
          onSitesChange?.(next);
        });

        const applyParams = useRefCallback(nextParams => {
          const merged = Object.assign({}, { content: '', props: {}, scope: {} }, nextParams);

          // 避免 AI/外部写入后，编辑器 onChange 的 debounce 用旧值盖回 content
          updateContentDebouncedRef.current?.cancel?.();
          skipEditorChangeRef.current = true;
          setParams(merged);
          setPropsFormData(buildPropsFormData(merged.props));
          setScopeFormData(buildScopeFormData(merged.scope));
          codeEditorRef.current?.setValue(merged.content || '');
          updateContentDebouncedRef.current?.cancel?.();
          Promise.resolve().then(() => {
            updateContentDebouncedRef.current?.cancel?.();
            skipEditorChangeRef.current = false;
          });
        });
        const defaultValueRef = useRef(defaultValue);
        const outputContent = useMemo(() => {
          if (!String(params.content || '').trim()) {
            return '';
          }
          return encode(JSON.stringify(params));
        }, [params]);

        const [activeKey, setActiveKey] = useState('content');

        const handleChange = useRefCallback(onChange);

        useImperativeHandle(
          ref,
          () => ({
            getValue: () => outputContent,
            setValue: value => {
              const newParams = mergeParams(value);
              setParams(newParams);
              codeEditorRef.current?.setValue(newParams.content || '');
            }
          }),
          [outputContent]
        );

        useEffect(() => {
          if (!String(defaultValue || '').trim()) {
            return;
          }
          const merged = mergeParams(defaultValue);
          setParams(merged);
          setPropsFormData(buildPropsFormData(merged.props));
          setScopeFormData(buildScopeFormData(merged.scope));
          codeEditorRef.current?.setValue(merged.content || '');
        }, [defaultValue]);
        useEffect(() => {
          if (defaultValueRef.current !== outputContent) {
            defaultValueRef.current = outputContent;
            handleChange && handleChange(outputContent);
          }
        }, [outputContent, handleChange]);
        const [mod, setMod] = useState(defaultMod);
        const { content, props, scope } = Object.assign({}, { content: '', props: {}, scope: {} }, params);
        const [propsFormData, setPropsFormData] = useState(() => buildPropsFormData(props));
        const [scopeFormData, setScopeFormData] = useState(() => buildScopeFormData(scope));
        const propsFormRef = useRef(null);
        const scopeFormRef = useRef(null);

        const submitPropsDebouncedRef = useRef(null);
        const submitScopeDebouncedRef = useRef(null);

        if (!submitPropsDebouncedRef.current) {
          submitPropsDebouncedRef.current = debounce(() => {
            propsFormRef.current?.submit();
          }, 300);
        }

        if (!submitScopeDebouncedRef.current) {
          submitScopeDebouncedRef.current = debounce(() => {
            scopeFormRef.current?.submit();
          }, 300);
        }

        const handlePropsFormSave = useRefCallback(() => {
          submitPropsDebouncedRef.current?.();
        });

        const handleScopeFormSave = useRefCallback(() => {
          submitScopeDebouncedRef.current?.();
        });

        const flushFormSaves = useRefCallback(() => {
          submitPropsDebouncedRef.current?.flush();
          submitScopeDebouncedRef.current?.flush();
          propsFormRef.current?.submit();
          scopeFormRef.current?.submit();
        });

        useEffect(() => {
          return () => {
            submitPropsDebouncedRef.current?.cancel();
            submitScopeDebouncedRef.current?.cancel();
            updateContentDebouncedRef.current?.cancel();
          };
        }, []);

        const handleCopy = useRefCallback(async () => {
          if (!outputContent) {
            message.warning(formatMessage({ id: 'MsgNoCopyContent' }));
            return;
          }

          try {
            await navigator.clipboard.writeText(outputContent);
            message.success(formatMessage({ id: 'MsgCopySuccess' }));
          } catch (error) {
            console.error(error);
            message.error(formatMessage({ id: 'MsgCopyFail' }));
          }
        });

        const handleCopyContentUrl = useRefCallback(() => {
          if (!currentFile?.id || !currentFile?.siteHost || isLocalStorageHost(currentFile.siteHost)) {
            message.warning(formatMessage({ id: 'MsgNoContentUrl' }));
            return;
          }
          setContentShareOpen(true);
        });

        const handleImportFromClipboard = useRefCallback(async () => {
          if (!navigator.clipboard?.readText) {
            message.error(formatMessage({ id: 'MsgClipboardUnsupported' }));
            return;
          }

          try {
            const text = await navigator.clipboard.readText();
            const parsed = decodeLiveComponentValue(text);

            if (!parsed) {
              message.error(formatMessage({ id: 'MsgInvalidConfig' }));
              return;
            }

            applyParams(parsed);
            message.success(formatMessage({ id: 'MsgImportSuccess' }));
          } catch (error) {
            console.error(error);
            message.error(formatMessage({ id: 'MsgClipboardReadFail' }));
          }
        });

        const handleOpenFile = useRefCallback(({ siteHost, id, name, permission, content: fileContent }) => {
          const parsed = decodeLiveComponentConfig(fileContent);
          if (parsed) {
            applyParams(parsed);
          } else {
            applyParams({ content: String(fileContent || ''), props: {}, scope: {} });
          }
          setCurrentFile({ siteHost, id, name, permission });
          setSelectedSource(null);
          setLimitToSelection(false);
        });

        const handleSave = useRefCallback(async () => {
          if (!currentFile) {
            message.warning(formatMessage({ id: 'MsgNoCurrentFile' }));
            return;
          }
          if (currentFile.permission !== 'rw') {
            message.warning(formatMessage({ id: 'MsgReadOnly' }));
            return;
          }
          if (!outputContent) {
            message.warning(formatMessage({ id: 'MsgNoCopyContent' }));
            return;
          }
          try {
            const api = createSiteApi(currentFile.siteHost);
            await api.save({ id: currentFile.id, content: outputContent });
            message.success(formatMessage({ id: 'MsgSaveSuccess' }));
            setTreeRefreshToken(token => token + 1);
          } catch (error) {
            console.error(error);
            message.error(error.message || formatMessage({ id: 'MsgSaveFail' }));
          }
        });

        const handleSaveAs = useRefCallback(async ({ host, parentId, name }) => {
          try {
            const api = createSiteApi(host);
            const file = await api.create({ parentId, name, content: outputContent || '' });
            setCurrentFile({
              siteHost: host,
              id: file.id,
              name: file.name || name,
              permission: file.permission || 'rw'
            });
            setSaveAsOpen(false);
            setTreeRefreshToken(token => token + 1);
            message.success(formatMessage({ id: 'MsgSaveSuccess' }));
          } catch (error) {
            console.error(error);
            message.error(
              error.message === 'DUPLICATE_NAME'
                ? formatMessage({ id: 'MsgDuplicateName' })
                : error.message || formatMessage({ id: 'MsgSaveFail' })
            );
          }
        });

        const sourceLocateActive = enableSourceLocate && mod === 'mix';
        const sourceLocateActiveRef = useRef(sourceLocateActive);
        sourceLocateActiveRef.current = sourceLocateActive;

        const previewPanelRef = useRef(null);
        const previewRootRef = useRef(null);
        const hoverElementsRef = useRef([]);
        const cursorElementsRef = useRef([]);
        const locateFromPreviewRef = useRef(false);
        const flashTimerRef = useRef(null);
        const cursorDisposableRef = useRef(null);
        const [hoverRects, setHoverRects] = useState([]);
        const [cursorRects, setCursorRects] = useState([]);
        const [flashRects, setFlashRects] = useState([]);

        const toPanelRects = useRefCallback(clientRects => {
          return rectsRelativeTo(clientRects, previewPanelRef.current);
        });

        const clearLocateOverlays = useRefCallback(() => {
          hoverElementsRef.current = [];
          cursorElementsRef.current = [];
          setHoverRects([]);
          setCursorRects([]);
          setFlashRects([]);
          if (flashTimerRef.current) {
            window.clearTimeout(flashTimerRef.current);
            flashTimerRef.current = null;
          }
        });

        const remountLocateOverlays = useRefCallback(() => {
          if (hoverElementsRef.current.length) {
            setHoverRects(toPanelRects(measureHighlightRects(hoverElementsRef.current)));
          }
          if (cursorElementsRef.current.length) {
            setCursorRects(toPanelRects(measureHighlightRects(cursorElementsRef.current)));
          }
        });

        const syncCursorHighlight = useRefCallback((line, column) => {
          if (!sourceLocateActiveRef.current || locateFromPreviewRef.current) {
            return;
          }
          const els = resolveElementsFromEditorPosition(previewRootRef.current, line, column);
          cursorElementsRef.current = els;
          if (els.length) {
            scrollElementsIntoView(els, { block: 'nearest', behavior: 'smooth' });
            window.requestAnimationFrame(() => {
              remountLocateOverlays();
            });
            // smooth 滚动过程中再对齐一次 overlay
            window.setTimeout(() => {
              remountLocateOverlays();
            }, 320);
          }
          setCursorRects(toPanelRects(measureHighlightRects(els)));
          if (line) {
            setSelectedSource({ line, column: column || 1 });
          }
        });

        const handlePreviewMouseMove = useMemo(
          () =>
            throttle(event => {
              if (!sourceLocateActiveRef.current) {
                return;
              }
              const resolved = resolveSourceFromPoint(event.clientX, event.clientY, previewRootRef.current);
              if (!resolved) {
                hoverElementsRef.current = [];
                setHoverRects([]);
                return;
              }
              let els = findSameSourceElements(previewRootRef.current, resolved.line, resolved.column);
              if (!els.length) {
                els = [resolved.element];
              }
              hoverElementsRef.current = els;
              setHoverRects(toPanelRects(measureHighlightRects(els)));
            }, 50),
          [toPanelRects]
        );

        const handlePreviewMouseLeave = useRefCallback(() => {
          handlePreviewMouseMove.cancel?.();
          hoverElementsRef.current = [];
          setHoverRects([]);
        });

        const handlePreviewDoubleClick = useRefCallback(event => {
          if (!sourceLocateActiveRef.current) {
            return;
          }
          const result = handlePreviewLocate(event, {
            codeEditorRef,
            previewRoot: previewRootRef.current
          });
          if (!result.ok) {
            if (!String(content || '').trim()) {
              return;
            }
            const hasMarkers = !!previewRootRef.current?.querySelector('[data-live-line]');
            message.info(
              formatMessage({
                id: hasMarkers ? 'MsgLocateNoSource' : 'MsgLocatePreviewNotReady'
              })
            );
            return;
          }
          locateFromPreviewRef.current = true;
          window.setTimeout(() => {
            locateFromPreviewRef.current = false;
          }, 200);
          cursorElementsRef.current = result.elements || [];
          const panelRects = toPanelRects(result.rects || []);
          setCursorRects(panelRects);
          setFlashRects(panelRects);
          if (flashTimerRef.current) {
            window.clearTimeout(flashTimerRef.current);
          }
          flashTimerRef.current = window.setTimeout(() => {
            setFlashRects([]);
            flashTimerRef.current = null;
          }, HIGHLIGHT_DURATION_MS);
          if (result.line) {
            setSelectedSource({ line: result.line, column: result.column || 1 });
          }
        });

        const handleCodeEditorMount = useRefCallback(({ editor }) => {
          cursorDisposableRef.current?.dispose?.();
          if (!editor?.onDidChangeCursorPosition) {
            return;
          }
          const onCursor = debounce(e => {
            syncCursorHighlight(e.position.lineNumber, e.position.column);
          }, 150);
          const disposable = editor.onDidChangeCursorPosition(onCursor);
          cursorDisposableRef.current = {
            dispose: () => {
              onCursor.cancel?.();
              disposable?.dispose?.();
            }
          };
          if (sourceLocateActiveRef.current) {
            const pos = editor.getPosition?.();
            if (pos) {
              syncCursorHighlight(pos.lineNumber, pos.column);
            }
          }
        });

        useEffect(() => {
          if (!sourceLocateActive) {
            clearLocateOverlays();
            return undefined;
          }
          const onScrollOrResize = () => {
            remountLocateOverlays();
          };
          window.addEventListener('resize', onScrollOrResize);
          document.addEventListener('scroll', onScrollOrResize, true);
          return () => {
            window.removeEventListener('resize', onScrollOrResize);
            document.removeEventListener('scroll', onScrollOrResize, true);
          };
        }, [sourceLocateActive, clearLocateOverlays, remountLocateOverlays]);

        useEffect(() => {
          if (!sourceLocateActive) {
            return undefined;
          }
          const editor = codeEditorRef.current?.getEditor?.();
          const pos = editor?.getPosition?.();
          if (!pos) {
            return undefined;
          }
          const timer = window.setTimeout(() => {
            syncCursorHighlight(pos.lineNumber, pos.column);
          }, 120);
          return () => window.clearTimeout(timer);
        }, [outputContent, sourceLocateActive, syncCursorHighlight]);

        useEffect(() => {
          return () => {
            cursorDisposableRef.current?.dispose?.();
            handlePreviewMouseMove.cancel?.();
            if (flashTimerRef.current) {
              window.clearTimeout(flashTimerRef.current);
            }
          };
        }, [handlePreviewMouseMove]);

        const canSaveCurrent = !!(currentFile && currentFile.permission === 'rw');
        const canCopyContentUrl = !!(
          currentFile?.id &&
          currentFile?.siteHost &&
          !isLocalStorageHost(currentFile.siteHost)
        );

        const selection = useMemo(() => {
          if (!selectedSource?.line) {
            return null;
          }
          return extractSelectionFromContent(content, selectedSource.line, selectedSource.column);
        }, [content, selectedSource]);

        const aiSiteHost = useMemo(() => {
          if (!activeSiteHost || isLocalStorageHost(activeSiteHost)) {
            return null;
          }
          return activeSiteHost;
        }, [activeSiteHost]);

        const showAiPanel = enableSites && !!aiSiteHost && aiEnabled;

        useEffect(() => {
          let cancelled = false;
          if (!aiSiteHost) {
            setAiEnabled(false);
            return undefined;
          }
          setAiEnabled(false);
          createSiteApi(aiSiteHost)
            .getInfo()
            .then(info => {
              if (!cancelled) {
                setAiEnabled(!!info?.aiEnabled);
              }
            })
            .catch(() => {
              if (!cancelled) {
                setAiEnabled(false);
              }
            });
          return () => {
            cancelled = true;
          };
        }, [aiSiteHost]);

        const handleAiApplyGenerate = useRefCallback(({ content: nextCode, suggestedScope, suggestedProps } = {}) => {
          const next = Object.assign({}, params);
          let contentChanged = false;
          if (typeof nextCode === 'string' && nextCode.trim()) {
            if (limitToSelection && selection?.code) {
              next.content = applySelectionToContent(params.content, selection, nextCode);
            } else {
              next.content = nextCode;
            }
            contentChanged = true;
          }
          if (suggestedScope && typeof suggestedScope === 'object') {
            const nextScope = Object.assign({}, params.scope);
            Object.keys(suggestedScope).forEach(key => {
              if (!nextScope[key]) {
                nextScope[key] = suggestedScope[key];
              }
            });
            next.scope = nextScope;
          }
          // 再扫一遍最终 content，确保写入代码里用到的 props 都进「组件参数」
          const codeForProps = typeof next.content === 'string' ? next.content : '';
          const mergedPropsSuggest = mergeSuggestedProps(codeForProps, suggestedProps, params.props);
          if (mergedPropsSuggest && Object.keys(mergedPropsSuggest).length) {
            const nextProps = Object.assign({}, params.props);
            Object.keys(mergedPropsSuggest).forEach(key => {
              if (nextProps[key]) {
                return;
              }
              const item =
                mergedPropsSuggest[key] && typeof mergedPropsSuggest[key] === 'object' ? mergedPropsSuggest[key] : {};
              const type = item.type || 'string';
              nextProps[key] = {
                type,
                defaultValue: type === 'function' ? '()=>null' : item.defaultValue ?? ''
              };
            });
            next.props = nextProps;
          }
          applyParams(next);
          // 生成后切到 content，避免仍停在 props/scope 或纯预览时看不到写入
          if (contentChanged) {
            setActiveKey('content');
            if (mod === 'preview') {
              setMod('mix');
            }
          }
          return contentChanged;
        });

        const renderLocateOverlays = (rects, className) =>
          rects.map((rect, index) => (
            <div
              key={`${className}-${index}`}
              className={className}
              style={{
                top: rect.top,
                left: rect.left,
                width: Math.max(rect.width, 2),
                height: Math.max(rect.height, 2)
              }}
            />
          ));

        const editor = (
          <div className={style['code-editor']}>
            <CodeEditor
              ref={codeEditorRef}
              height={height}
              defaultValue={content}
              defaultLanguage="javascript"
              onMount={handleCodeEditorMount}
              onChange={value => {
                if (skipEditorChangeRef.current) {
                  return;
                }
                updateContentDebouncedRef.current(value, setParams);
              }}
            />
          </div>
        );

        const preview = (
          <div
            ref={previewPanelRef}
            className={style['preview-panel']}
            style={{ height: `${height}px` }}
            onMouseMove={sourceLocateActive ? handlePreviewMouseMove : undefined}
            onMouseLeave={sourceLocateActive ? handlePreviewMouseLeave : undefined}>
            <SimpleBar
              style={{
                maxHeight: `${height}px`
              }}>
              <div
                ref={previewRootRef}
                className={style['preview']}
                style={{ minHeight: `${height}px` }}
                onDoubleClick={sourceLocateActive ? handlePreviewDoubleClick : undefined}>
                {!content ? (
                  <Empty description={formatMessage({ id: 'EmptyContent' })} />
                ) : (
                  <SafeRender>
                    <Form>
                      <LiveComponentView
                        content={outputContent}
                        libs={libs}
                        enableSourceLocate={enableSourceLocate}
                      />
                    </Form>
                  </SafeRender>
                )}
              </div>
            </SimpleBar>
            {sourceLocateActive && (
              <div className={style['preview-locate-layer']} aria-hidden>
                {renderLocateOverlays(hoverRects, style['preview-locate-hover'])}
                {renderLocateOverlays(cursorRects, style['preview-locate-cursor'])}
                {renderLocateOverlays(flashRects, style['preview-locate-flash'])}
              </div>
            )}
          </div>
        );

        const editorTabs = (
          <Tabs
            className={style['editor-tabs']}
            activeKey={activeKey}
            onChange={nextKey => {
              flushFormSaves();
              if (nextKey === 'props') {
                setPropsFormData(buildPropsFormData(props));
              }
              if (nextKey === 'scope') {
                setScopeFormData(buildScopeFormData(scope));
              }
              setActiveKey(nextKey);
            }}
            tabBarExtraContent={
              <div className={style['toolbar-extra']}>
                <Space size={8} align="center">
                  <Space.Compact>
                    <Tooltip title={formatMessage({ id: 'Copy' })}>
                      <Button icon={<CopyOutlined />} onClick={handleCopy} />
                    </Tooltip>
                    <Tooltip title={formatMessage({ id: 'ImportFromClipboard' })}>
                      <Button icon={<SnippetsOutlined />} onClick={handleImportFromClipboard} />
                    </Tooltip>
                  </Space.Compact>
                  {enableSites && (
                    <Space.Compact>
                      <Tooltip title={formatMessage({ id: 'Save' })}>
                        <Button icon={<SaveOutlined />} disabled={!canSaveCurrent} onClick={handleSave} />
                      </Tooltip>
                      <Tooltip title={formatMessage({ id: 'SaveAs' })}>
                        <Button
                          icon={<FormOutlined />}
                          disabled={!mergedSites.length}
                          onClick={() => setSaveAsOpen(true)}
                        />
                      </Tooltip>
                      <Tooltip title={formatMessage({ id: 'CopyContentUrl' })}>
                        <Button
                          icon={<LinkOutlined />}
                          disabled={!canCopyContentUrl}
                          onClick={handleCopyContentUrl}
                        />
                      </Tooltip>
                    </Space.Compact>
                  )}
                  {toolbarExtra}
                  {activeKey === 'content' && (
                    <Segmented
                      className={style['view-mode-segmented']}
                      value={mod}
                      onChange={setMod}
                      options={[
                        {
                          label: formatMessage({ id: 'ModeEditor' }),
                          value: 'editor',
                          icon: <MenuOutlined />
                        },
                        {
                          label: formatMessage({ id: 'ModeMix' }),
                          value: 'mix',
                          icon: <SplitCellsOutlined />
                        },
                        {
                          label: formatMessage({ id: 'ModePreview' }),
                          value: 'preview',
                          icon: <EyeOutlined />
                        }
                      ]}
                    />
                  )}
                  {showAiPanel && aiCollapsed ? (
                    <Tooltip title={formatMessage({ id: 'AiExpand' })}>
                      <Button
                        type="text"
                        size="small"
                        className={style['ai-toolbar-toggle']}
                        icon={<MenuFoldOutlined rotate={180} />}
                        aria-label={formatMessage({ id: 'AiExpand' })}
                        onClick={() => setAiCollapsed(false)}
                      />
                    </Tooltip>
                  ) : null}
                </Space>
              </div>
            }
            items={[
              {
                key: 'props',
                label: formatMessage({ id: 'TabProps' }),
                children: (
                  <Form
                    ref={propsFormRef}
                    data={propsFormData}
                    onSubmit={formData => {
                      const nextProps = normalizePropsFormData(formData);
                      setParams(currentParams => {
                        if (isEqual(currentParams.props, nextProps)) {
                          return currentParams;
                        }
                        return Object.assign({}, currentParams, { props: nextProps });
                      });
                    }}>
                    <FormAutoSaver onSave={handlePropsFormSave} />
                    <TableList
                      title={formatMessage({ id: 'ParamListTitle' })}
                      name="props"
                      defaultLength={0}
                      minLength={0}
                      list={[
                        <Input name="name" label={formatMessage({ id: 'VarName' })} rule="REQ LEN-0-100" />,
                        <Select
                          name="type"
                          label={formatMessage({ id: 'Type' })}
                          rule="REQ"
                          defaultValue="string"
                          options={[
                            { label: formatMessage({ id: 'TypeString' }), value: 'string' },
                            { label: formatMessage({ id: 'TypeNumber' }), value: 'number' },
                            { label: formatMessage({ id: 'TypeBoolean' }), value: 'boolean' },
                            { label: formatMessage({ id: 'TypeArray' }), value: 'array' },
                            { label: formatMessage({ id: 'TypeObject' }), value: 'object' },
                            { label: formatMessage({ id: 'TypeFunction' }), value: 'function' }
                          ]}
                          onChange={(value, item, { openApi, groupArgs }) => {
                            setTimeout(() => {
                              openApi.setField({
                                name: 'defaultValue',
                                groupName: 'props',
                                groupIndex: groupArgs[0].index,
                                value: ''
                              });
                            }, 100);
                          }}
                        />,
                        <Input
                          name="defaultValue"
                          label={formatMessage({ id: 'DefaultValue' })}
                          rule="LEN-0-500"
                          display={({ formData, groupArgs }) => {
                            return get(formData.props, `${groupArgs[0].index}.type`) !== 'function';
                          }}
                        />,
                        <div
                          className={style['function-default-value']}
                          name="defaultValue"
                          label={formatMessage({ id: 'DefaultValue' })}
                          display={({ formData, groupArgs }) => {
                            return get(formData.props, `${groupArgs[0].index}.type`) === 'function';
                          }}>
                          {'()=>null'}
                        </div>
                      ]}
                    />
                  </Form>
                )
              },
              {
                key: 'scope',
                label: formatMessage({ id: 'TabScope' }),
                children: (
                  <Form
                    ref={scopeFormRef}
                    data={scopeFormData}
                    onSubmit={formData => {
                      const nextScope = normalizeScopeFormData(formData);
                      setParams(currentParams => {
                        if (isEqual(currentParams.scope, nextScope)) {
                          return currentParams;
                        }
                        return Object.assign({}, currentParams, { scope: nextScope });
                      });
                    }}>
                    <FormAutoSaver onSave={handleScopeFormSave} />
                    <TableList
                      title={formatMessage({ id: 'ScopeListTitle' })}
                      name="scope"
                      defaultLength={0}
                      minLength={0}
                      list={[
                        <Input name="name" label={formatMessage({ id: 'VarName' })} rule="REQ LEN-0-100" />,
                        <Input name="token" label={formatMessage({ id: 'Token' })} rule="REQ LEN-0-100" />
                      ]}
                    />
                  </Form>
                )
              },
              {
                key: 'content',
                label: formatMessage({ id: 'TabContent' }),
                children: (
                  <Flex vertical gap={12}>
                    <Collapse
                      size="small"
                      items={[
                        {
                          key: 'refer',
                          label: formatMessage({ id: 'RefLabel' }),
                          children: (
                            <Alert
                              message={
                                <InfoPage>
                                  <CentralContent
                                    dataSource={{ props, scope }}
                                    col={1}
                                    columns={[
                                      {
                                        name: 'props',
                                        title: formatMessage({ id: 'RefAvailableProps' }),
                                        getValueOf: item => {
                                          return Object.keys(item.props)
                                            .map(str => `props.${str}`)
                                            .join(',');
                                        }
                                      },
                                      {
                                        name: 'scope',
                                        title: formatMessage({ id: 'RefAvailableComponents' }),
                                        getValueOf: item => {
                                          return ['Antd', ...Object.keys(item.scope)].join(',');
                                        }
                                      },
                                      {
                                        name: 'lib',
                                        title: formatMessage({ id: 'RefAvailableLibs' }),
                                        getValueOf: () => {
                                          return Object.keys(libs).join(',');
                                        }
                                      }
                                    ]}
                                  />
                                </InfoPage>
                              }
                            />
                          )
                        }
                      ]}
                    />
                    {mod === 'editor' && editor}
                    {mod === 'mix' && (
                      <Splitter>
                        <Splitter.Panel>{editor}</Splitter.Panel>
                        <Splitter.Panel>{preview}</Splitter.Panel>
                      </Splitter>
                    )}
                    {mod === 'preview' && preview}
                  </Flex>
                )
              }
            ]}
          />
        );

        return (
          <>
            {enableSites ? (
              <div className={style['editor-with-sites']}>
                <aside
                  className={`${style['sites-aside']}${sitesCollapsed ? ` ${style['sites-aside-collapsed']}` : ''}`}
                  style={sitesCollapsed ? undefined : { width: sitesPanelWidth }}>
                  {!sitesCollapsed ? (
                    <div className={style['sites-aside-body']}>
                      <SiteFilePanel
                        sites={sites}
                        onSitesChange={handleSitesChange}
                        siteActionsOpen={siteActionsOpen}
                        userSitesStorageKey={resolvedUserSitesKey}
                        currentFile={currentFile}
                        onOpenFile={handleOpenFile}
                        onCurrentFileChange={setCurrentFile}
                        onActiveHostChange={setActiveSiteHost}
                        height={height}
                        refreshToken={treeRefreshToken}
                        onCollapse={() => setSitesCollapsed(true)}
                      />
                    </div>
                  ) : (
                    <Button
                      type="text"
                      size="small"
                      className={style['sites-toggle']}
                      icon={<MenuUnfoldOutlined />}
                      title={formatMessage({ id: 'SitesExpand' })}
                      aria-label={formatMessage({ id: 'SitesExpand' })}
                      onClick={() => setSitesCollapsed(false)}
                    />
                  )}
                </aside>
                <div className={style['sites-main']}>{editorTabs}</div>
                {showAiPanel && !aiCollapsed ? (
                  <aside className={style['ai-aside']} style={{ width: aiPanelWidth }}>
                    <AiAssistPanel
                      siteHost={aiSiteHost}
                      content={content}
                      scope={scope}
                      props={props}
                      libs={Object.assign({}, getLibs(), libs)}
                      selection={selection}
                      limitToSelection={limitToSelection}
                      onLimitToSelectionChange={setLimitToSelection}
                      onApplyGenerate={handleAiApplyGenerate}
                      onCollapse={() => setAiCollapsed(true)}
                      formatMessage={formatMessage}
                      height={height}
                    />
                  </aside>
                ) : null}
              </div>
            ) : (
              editorTabs
            )}
            {enableSites && (
              <SaveAsModal
                open={saveAsOpen}
                sites={mergedSites}
                defaultHost={currentFile?.siteHost || mergedSites[0]?.host}
                onCancel={() => setSaveAsOpen(false)}
                onOk={handleSaveAs}
              />
            )}
            {enableSites && (
              <ContentShareModal
                open={contentShareOpen}
                siteHost={currentFile?.siteHost}
                fileId={currentFile?.id}
                fileName={currentFile?.name}
                onCancel={() => setContentShareOpen(false)}
              />
            )}
          </>
        );
      }
    )
  )
);

const LiveComponentEditor = forwardRef((props, ref) => (
  <App>
    <LiveComponentEditorCore ref={ref} {...props} />
  </App>
));

LiveComponentEditor.installAiSiteMock = installAiSiteMock;
LiveComponentEditor.uninstallAiSiteMock = uninstallAiSiteMock;
LiveComponentEditor.AI_MOCK_HOST = AI_MOCK_HOST;

export { installAiSiteMock, uninstallAiSiteMock, AI_MOCK_HOST };
export default LiveComponentEditor;

import { createWithRemoteLoader } from '@kne/remote-loader';
import { encode } from 'plantuml-encoder';
import { decodeLiveComponentConfig } from '@components/LiveComponentView/decodeConfig';
import { App, Tabs, Flex, Segmented, Splitter, Collapse, Button, Space, Empty, Tooltip, Popover } from 'antd';
import { useIsMobile, usePopupContainer } from '@kne/responsive-utils';
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
  ArrowUpOutlined,
  SelectOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import CodeEditor from '@components/CodeEditor';
import LiveComponentView from '@components/LiveComponentView';
import useRefCallback from '@kne/use-ref-callback';
import lodash from 'lodash';
import { transform, debounce, throttle, isEqual } from 'lodash';
import dayjs from 'dayjs';
import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import classnames from 'classnames';
import { createRoot } from 'react-dom/client';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import SiteFilePanel, { SaveAsModal } from './SiteFilePanel';
import ContentShareModal from './ContentShareModal';
import AiAssistPanel from './AiAssistPanel';
import AiIcon from './AiIcon';
import {
  createSiteApi,
  DEFAULT_USER_SITES_STORAGE_KEY,
  isLocalStorageHost,
  mergeSites,
  readUserSites,
  writeEditorSelection
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
  findParentLiveSourceElement,
  unionRects,
  revealEditorPosition,
  scrollElementsIntoView
} from './previewLocate';
import { PropsEditor, ScopeEditor, createRowId, getEmptyDefaultValue, validatePropsRows, validateScopeRows } from './ParamsEditor';
import style from './style.module.scss';

// 标签区宽度低于该值时，桌面版单行工具栏放不下
const COMPACT_TOOLBAR_WIDTH = 640;

/** @deprecated 使用 decodeLiveComponentConfig */
export const decodeLiveComponentValue = decodeLiveComponentConfig;

const mergeParams = value => Object.assign({ content: '', props: {}, scope: {} }, decodeLiveComponentConfig(value) || {});

// 默认值统一以字符串存储（运行时按 type JSON.parse），表单内按类型转成控件需要的值
const toFormDefaultValue = (type, value) => {
  if (type === 'number') {
    const num = value === '' || value == null ? NaN : Number(value);
    return Number.isNaN(num) ? undefined : num;
  }
  if (type === 'boolean') {
    return value === true || value === 'true';
  }
  return value;
};

const toStoredDefaultValue = (type, value) => {
  if (type === 'function') {
    return '()=>null';
  }
  if (type === 'number') {
    return value === '' || value == null ? '' : String(value);
  }
  if (type === 'boolean') {
    return value === true || value === 'true' ? 'true' : 'false';
  }
  return value ?? '';
};

const buildPropsRows = props =>
  Object.keys(props).map(name => {
    const item = Object.assign({}, props[name]);
    const type = item.type || 'string';
    return {
      id: createRowId(),
      name,
      type,
      defaultValue: toFormDefaultValue(type, item.defaultValue) ?? getEmptyDefaultValue(type)
    };
  });

const buildScopeRows = scope =>
  Object.keys(scope).map(name => ({
    id: createRowId(),
    name,
    token: scope[name]
  }));

const normalizePropsRows = rows =>
  transform(
    rows,
    (result, row) => {
      if (!row.name) {
        return;
      }
      result[row.name] = {
        defaultValue: toStoredDefaultValue(row.type, row.defaultValue),
        type: row.type
      };
    },
    {}
  );

const normalizeScopeRows = rows =>
  transform(
    rows,
    (result, row) => {
      if (!row.name || !row.token) {
        return;
      }
      result[row.name] = row.token;
    },
    {}
  );

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
    'components-core:Common@SimpleBar',
    'components-core:Drawer'
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
          transformContentUrl = null,
          enableSourceLocate = true
        },
        ref
      ) => {
        const { formatMessage } = useIntl();
        const { message } = App.useApp();
        const [FormInfo, SimpleBar, Drawer] = remoteModules;
        const { Form } = FormInfo;
        const codeEditorRef = useRef(null);
        const skipEditorChangeRef = useRef(false);
        const updateContentDebouncedRef = useRef(null);
        if (!updateContentDebouncedRef.current) {
          updateContentDebouncedRef.current = debounce((newContent, setParams) => {
            setParams(prev => ({ ...prev, content: newContent }));
          }, 300);
        }
        const [params, setParams] = useState(() => mergeParams(defaultValue));
        const [propsRows, setPropsRows] = useState(() => buildPropsRows(params.props));
        const [scopeRows, setScopeRows] = useState(() => buildScopeRows(params.scope));
        const propsErrors = useMemo(() => validatePropsRows(propsRows), [propsRows]);
        const scopeErrors = useMemo(() => validateScopeRows(scopeRows), [scopeRows]);

        const submitPropsDebouncedRef = useRef(null);
        const submitScopeDebouncedRef = useRef(null);

        // 存在校验错误时保留上一次合法的配置
        if (!submitPropsDebouncedRef.current) {
          submitPropsDebouncedRef.current = debounce(rows => {
            if (Object.keys(validatePropsRows(rows)).length) {
              return;
            }
            const nextProps = normalizePropsRows(rows);
            setParams(currentParams => (isEqual(currentParams.props, nextProps) ? currentParams : Object.assign({}, currentParams, { props: nextProps })));
          }, 300);
        }

        if (!submitScopeDebouncedRef.current) {
          submitScopeDebouncedRef.current = debounce(rows => {
            if (Object.keys(validateScopeRows(rows)).length) {
              return;
            }
            const nextScope = normalizeScopeRows(rows);
            setParams(currentParams => (isEqual(currentParams.scope, nextScope) ? currentParams : Object.assign({}, currentParams, { scope: nextScope })));
          }, 300);
        }

        const handlePropsRowsChange = useRefCallback(rows => {
          setPropsRows(rows);
          submitPropsDebouncedRef.current(rows);
        });

        const handleScopeRowsChange = useRefCallback(rows => {
          setScopeRows(rows);
          submitScopeDebouncedRef.current(rows);
        });

        const resetParamRows = useRefCallback(nextParams => {
          submitPropsDebouncedRef.current?.cancel();
          submitScopeDebouncedRef.current?.cancel();
          setPropsRows(buildPropsRows(nextParams.props || {}));
          setScopeRows(buildScopeRows(nextParams.scope || {}));
        });

        const enableSites = Array.isArray(sites);
        const [currentFile, setCurrentFile] = useState(null);
        const [saveAsOpen, setSaveAsOpen] = useState(false);
        const [contentShareOpen, setContentShareOpen] = useState(false);
        const [treeRefreshToken, setTreeRefreshToken] = useState(0);
        const [sitesCollapsed, setSitesCollapsed] = useState(false);
        const [aiCollapsed, setAiCollapsed] = useState(false);
        const isMobile = useIsMobile();
        // 移动端侧栏改为抽屉，默认关闭，与桌面端折叠状态互不影响
        const [mobileSitesOpen, setMobileSitesOpen] = useState(false);
        const [mobileAiOpen, setMobileAiOpen] = useState(false);
        const getPopupContainer = usePopupContainer();
        // 编辑区本身过窄（如两侧面板同时展开）时也使用紧凑工具栏
        const editorRootRef = useRef(null);
        const [narrowEditor, setNarrowEditor] = useState(false);
        useEffect(() => {
          const tabsEl = editorRootRef.current?.querySelector(`.${CSS.escape(style['editor-tabs'])}`);
          if (!tabsEl) {
            return;
          }
          const observer = new ResizeObserver(([entry]) => {
            setNarrowEditor(entry.contentRect.width < COMPACT_TOOLBAR_WIDTH);
          });
          observer.observe(tabsEl);
          return () => observer.disconnect();
        }, [isMobile]);
        const compactToolbar = isMobile || narrowEditor;
        // 移动端工具栏不换行：toolbarExtra 放不下时收进「更多」按钮
        const toolbarRef = useRef(null);
        const extraSlotRef = useRef(null);
        const extraMoreRef = useRef(null);
        const extraWidthRef = useRef(0);
        const [extraCollapsed, setExtraCollapsed] = useState(false);
        const hasToolbarExtra = !!toolbarExtra;
        useEffect(() => {
          const container = toolbarRef.current;
          const space = container?.firstElementChild;
          if (!compactToolbar || !hasToolbarExtra || !container || !space) {
            setExtraCollapsed(false);
            return;
          }
          // 按钮组铺满整行（模式切换贴右），需累加各项宽度而非用 scrollWidth
          const getContentWidth = () => {
            const items = Array.from(space.children);
            const gap = parseFloat(getComputedStyle(space).columnGap) || 0;
            return items.reduce((sum, item) => sum + item.offsetWidth, 0) + gap * Math.max(items.length - 1, 0);
          };
          const check = () => {
            if (extraSlotRef.current) {
              extraWidthRef.current = extraSlotRef.current.offsetWidth;
              if (getContentWidth() > container.clientWidth) {
                setExtraCollapsed(true);
              }
              return;
            }
            const moreWidth = extraMoreRef.current?.offsetWidth || 0;
            if (getContentWidth() - moreWidth + extraWidthRef.current <= container.clientWidth) {
              setExtraCollapsed(false);
            }
          };
          check();
          const observer = new ResizeObserver(check);
          observer.observe(container);
          Array.from(space.children).forEach(item => observer.observe(item));
          return () => observer.disconnect();
        }, [compactToolbar, hasToolbarExtra, extraCollapsed]);
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
          resetParamRows(merged);
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
              resetParamRows(newParams);
              codeEditorRef.current?.setValue(newParams.content || '');
            }
          }),
          [outputContent, resetParamRows]
        );

        useEffect(() => {
          if (!String(defaultValue || '').trim()) {
            return;
          }
          const merged = mergeParams(defaultValue);
          setParams(merged);
          resetParamRows(merged);
          codeEditorRef.current?.setValue(merged.content || '');
        }, [defaultValue, resetParamRows]);
        useEffect(() => {
          if (defaultValueRef.current !== outputContent) {
            defaultValueRef.current = outputContent;
            handleChange && handleChange(outputContent);
          }
        }, [outputContent, handleChange]);
        const [mod, setMod] = useState(defaultMod);

        const { content, props, scope } = Object.assign({}, { content: '', props: {}, scope: {} }, params);
        const handleInsertReference = useRefCallback(async text => {
          const editor = mod !== 'preview' && codeEditorRef.current?.getEditor?.();
          if (editor) {
            editor.executeEdits('insert-reference', [{ range: editor.getSelection(), text, forceMoveMarkers: true }]);
            editor.focus();
            return;
          }
          try {
            await navigator.clipboard.writeText(text);
            message.success(formatMessage({ id: 'RefCopied' }));
          } catch (e) {
            message.warning(text);
          }
        });

        const flushFormSaves = useRefCallback(() => {
          submitPropsDebouncedRef.current?.flush();
          submitScopeDebouncedRef.current?.flush();
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
            writeEditorSelection(
              {
                activeHost: host,
                file: { siteHost: host, id: file.id, name: file.name || name }
              },
              resolvedUserSitesKey
            );
            setActiveSiteHost(host);
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

        const applySelectionHighlight = useRefCallback(({ line, column, elements }) => {
          locateFromPreviewRef.current = true;
          window.setTimeout(() => {
            locateFromPreviewRef.current = false;
          }, 200);
          const els = elements?.length ? elements : [];
          cursorElementsRef.current = els;
          const panelRects = toPanelRects(measureHighlightRects(els));
          setCursorRects(panelRects);
          setFlashRects(panelRects);
          if (flashTimerRef.current) {
            window.clearTimeout(flashTimerRef.current);
          }
          flashTimerRef.current = window.setTimeout(() => {
            setFlashRects([]);
            flashTimerRef.current = null;
          }, HIGHLIGHT_DURATION_MS);
          if (line) {
            setSelectedSource({ line, column: column || 1 });
          }
        });

        const handleSelectParent = useRefCallback(event => {
          event?.stopPropagation?.();
          event?.preventDefault?.();
          const current = cursorElementsRef.current?.[0];
          const parent = findParentLiveSourceElement(current, previewRootRef.current);
          if (!parent) {
            message.info(formatMessage({ id: 'MsgNoParentSelection' }));
            return;
          }
          revealEditorPosition(codeEditorRef.current, parent.line, parent.column);
          let elements = findSameSourceElements(previewRootRef.current, parent.line, parent.column);
          if (!elements.length) {
            elements = [parent.element];
          }
          applySelectionHighlight({
            line: parent.line,
            column: parent.column,
            elements
          });
        });

        const handleSelectInEditor = useRefCallback(event => {
          event?.stopPropagation?.();
          event?.preventDefault?.();
          if (!selectedSource?.line) {
            return;
          }
          const sel = extractSelectionFromContent(content, selectedSource.line, selectedSource.column);
          if (!sel?.code) {
            message.info(formatMessage({ id: 'MsgLocateNoSource' }));
            return;
          }
          const editor = codeEditorRef.current?.getEditor?.() || codeEditorRef.current;
          if (!editor?.setSelection) {
            return;
          }
          const range = {
            startLineNumber: sel.startLine,
            startColumn: sel.column || 1,
            endLineNumber: sel.endLine,
            endColumn: sel.endColumn || 1
          };
          locateFromPreviewRef.current = true;
          window.setTimeout(() => {
            locateFromPreviewRef.current = false;
          }, 200);
          editor.setSelection(range);
          if (editor.revealRangeInCenter) {
            editor.revealRangeInCenter(range);
          } else if (editor.revealLineInCenter) {
            editor.revealLineInCenter(range.startLineNumber);
          }
          editor.focus?.();
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

        const selectionUnionRect = useMemo(() => unionRects(cursorRects), [cursorRects]);
        const canSelectParent = !!(
          selectionUnionRect &&
          findParentLiveSourceElement(cursorElementsRef.current?.[0], previewRootRef.current)
        );

        const editor = (
          <div className={style['code-editor']}>
            <CodeEditor
              ref={codeEditorRef}
              height="100%"
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
            style={{ height: '100%' }}
            onMouseMove={sourceLocateActive ? handlePreviewMouseMove : undefined}
            onMouseLeave={sourceLocateActive ? handlePreviewMouseLeave : undefined}>
            <div className={style['preview']}>
              <SimpleBar
                style={{
                  maxHeight: '100%',
                  height: '100%'
                }}>
                <div
                  ref={previewRootRef}
                  className={style['preview-inner']}
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
            </div>
            {sourceLocateActive && (
              <div className={style['preview-locate-layer']} aria-hidden={!selectionUnionRect}>
                {renderLocateOverlays(hoverRects, style['preview-locate-hover'])}
                {renderLocateOverlays(cursorRects, style['preview-locate-cursor'])}
                {renderLocateOverlays(flashRects, style['preview-locate-flash'])}
                {selectionUnionRect ? (
                  <div
                    className={style['preview-locate-selection']}
                    style={{
                      top: selectionUnionRect.top,
                      left: selectionUnionRect.left,
                      width: Math.max(selectionUnionRect.width, 2),
                      height: Math.max(selectionUnionRect.height, 2)
                    }}>
                    <div className={style['preview-locate-actions']}>
                      <Space.Compact size="small">
                        <Tooltip title={formatMessage({ id: 'SelectParent' })}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<ArrowUpOutlined />}
                            disabled={!canSelectParent}
                            aria-label={formatMessage({ id: 'SelectParent' })}
                            onClick={handleSelectParent}
                          />
                        </Tooltip>
                        <Tooltip title={formatMessage({ id: 'SelectInEditor' })}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<SelectOutlined />}
                            aria-label={formatMessage({ id: 'SelectInEditor' })}
                            onClick={handleSelectInEditor}
                          />
                        </Tooltip>
                      </Space.Compact>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );

        const toolbar = (
          <div ref={toolbarRef} className={style['toolbar-extra']}>
            <Space size={compactToolbar ? 4 : 8} align="center">
              {enableSites && isMobile ? (
                <Button
                  icon={<MenuUnfoldOutlined />}
                  title={formatMessage({ id: 'SitesExpand' })}
                  aria-label={formatMessage({ id: 'SitesExpand' })}
                  onClick={() => setMobileSitesOpen(true)}
                />
              ) : null}
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
              {hasToolbarExtra && compactToolbar && extraCollapsed ? (
                <Popover
                  trigger="click"
                  placement="bottomRight"
                  getPopupContainer={getPopupContainer}
                  content={<Space size={8}>{toolbarExtra}</Space>}>
                  <Button ref={extraMoreRef} icon={<EllipsisOutlined />} />
                </Popover>
              ) : hasToolbarExtra && compactToolbar ? (
                <span ref={extraSlotRef} className={style['toolbar-extra-slot']}>
                  {toolbarExtra}
                </span>
              ) : (
                toolbarExtra
              )}
              {activeKey === 'content' && (
                <Segmented
                  className={style['view-mode-segmented']}
                  value={mod}
                  onChange={setMod}
                  options={[
                    {
                      label: compactToolbar ? null : formatMessage({ id: 'ModeEditor' }),
                      title: formatMessage({ id: 'ModeEditor' }),
                      value: 'editor',
                      icon: <MenuOutlined />
                    },
                    {
                      label: compactToolbar ? null : formatMessage({ id: 'ModeMix' }),
                      title: formatMessage({ id: 'ModeMix' }),
                      value: 'mix',
                      icon: <SplitCellsOutlined />
                    },
                    {
                      label: compactToolbar ? null : formatMessage({ id: 'ModePreview' }),
                      title: formatMessage({ id: 'ModePreview' }),
                      value: 'preview',
                      icon: <EyeOutlined />
                    }
                  ]}
                />
              )}
              {showAiPanel && (isMobile || aiCollapsed) ? (
                <Button
                  className={style['ai-toolbar-toggle']}
                  icon={<AiIcon />}
                  title={formatMessage({ id: 'AiExpand' })}
                  aria-label={formatMessage({ id: 'AiExpand' })}
                  onClick={() => (isMobile ? setMobileAiOpen(true) : setAiCollapsed(false))}
                />
              ) : null}
            </Space>
          </div>
        );

        const editorTabs = (
          <Tabs
            className={style['editor-tabs']}
            activeKey={activeKey}
            onChange={nextKey => {
              flushFormSaves();
              setActiveKey(nextKey);
            }}
            tabBarExtraContent={compactToolbar ? null : toolbar}
            renderTabBar={
              compactToolbar
                ? (tabBarProps, DefaultTabBar) => (
                    <>
                      <DefaultTabBar {...tabBarProps} />
                      <div className={style['toolbar-row']}>{toolbar}</div>
                    </>
                  )
                : undefined
            }
            items={[
              {
                key: 'props',
                label: formatMessage({ id: 'TabProps' }),
                children: <PropsEditor rows={propsRows} errors={propsErrors} onChange={handlePropsRowsChange} />
              },
              {
                key: 'scope',
                label: formatMessage({ id: 'TabScope' }),
                children: (
                  <ScopeEditor
                    rows={scopeRows}
                    errors={scopeErrors}
                    builtins={['Antd', ...Object.keys(libs || {})]}
                    onChange={handleScopeRowsChange}
                  />
                )
              },
              {
                key: 'content',
                label: formatMessage({ id: 'TabContent' }),
                children: (
                  <Flex vertical gap={12} className={style['content-body']}>
                    <Collapse
                      size="small"
                      items={[
                        {
                          key: 'refer',
                          label: formatMessage({ id: 'RefLabel' }),
                          children: (
                            <div className={style['ref-list']}>
                              {[
                                {
                                  key: 'props',
                                  title: formatMessage({ id: 'RefAvailableProps' }),
                                  tokens: Object.keys(props || {}).map(str => ({ label: `props.${str}`, text: `props.${str}` }))
                                },
                                {
                                  key: 'scope',
                                  title: formatMessage({ id: 'RefAvailableComponents' }),
                                  tokens: [
                                    { label: 'Antd', text: 'Antd' },
                                    ...Object.keys(scope || {}).map(str => ({ label: str, text: `<${str} />` }))
                                  ]
                                },
                                {
                                  key: 'lib',
                                  title: formatMessage({ id: 'RefAvailableLibs' }),
                                  tokens: Object.keys(libs || {}).map(str => ({ label: str, text: str }))
                                }
                              ].map(group => (
                                <div key={group.key} className={style['ref-row']}>
                                  <div className={style['ref-label']}>{group.title}</div>
                                  <div className={style['ref-tokens']}>
                                    {group.tokens.length ? (
                                      group.tokens.map(token => (
                                        <Tooltip key={token.label} title={formatMessage({ id: mod === 'preview' ? 'RefClickCopy' : 'RefClickInsert' })}>
                                          <button
                                            type="button"
                                            className={classnames(style['ref-token'], style['ref-token-action'])}
                                            onClick={() => handleInsertReference(token.text)}>
                                            {token.label}
                                          </button>
                                        </Tooltip>
                                      ))
                                    ) : (
                                      <span className={style['ref-empty']}>{formatMessage({ id: 'RefEmpty' })}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        }
                      ]}
                    />
                    <div className={style['content-stage']}>
                      {mod === 'editor' && editor}
                      {mod === 'mix' && (
                        <Splitter layout={isMobile ? 'vertical' : 'horizontal'} style={{ height: '100%' }}>
                          <Splitter.Panel>{editor}</Splitter.Panel>
                          <Splitter.Panel>{preview}</Splitter.Panel>
                        </Splitter>
                      )}
                      {mod === 'preview' && preview}
                    </div>
                  </Flex>
                )
              }
            ]}
          />
        );

        const editorRootClassName = classnames(
          style['live-component-editor'],
          enableSites && style['editor-with-sites']
        );

        const renderSitePanel = ({ onOpenFile, onCollapse }) => (
          <SiteFilePanel
            sites={sites}
            onSitesChange={handleSitesChange}
            siteActionsOpen={siteActionsOpen}
            userSitesStorageKey={resolvedUserSitesKey}
            transformContentUrl={transformContentUrl}
            currentFile={currentFile}
            onOpenFile={onOpenFile}
            onCurrentFileChange={setCurrentFile}
            onActiveHostChange={setActiveSiteHost}
            refreshToken={treeRefreshToken}
            onCollapse={onCollapse}
          />
        );

        const renderAiPanel = ({ onCollapse }) => (
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
            onCollapse={onCollapse}
            formatMessage={formatMessage}
          />
        );

        return (
          <>
            <div ref={editorRootRef} className={editorRootClassName}>
              {enableSites && isMobile ? (
                <>
                  <div className={style['sites-main']}>{editorTabs}</div>
                  <Drawer
                    placement="left"
                    forceRender
                    closable={false}
                    footer={null}
                    bodyScroll={false}
                    open={mobileSitesOpen}
                    onClose={() => setMobileSitesOpen(false)}>
                    <div className={style['sites-aside-body']}>
                      {renderSitePanel({
                        onOpenFile: (...args) => {
                          setMobileSitesOpen(false);
                          return handleOpenFile(...args);
                        },
                        onCollapse: () => setMobileSitesOpen(false)
                      })}
                    </div>
                  </Drawer>
                  {showAiPanel ? (
                    <Drawer
                      placement="right"
                      closable={false}
                      footer={null}
                      bodyScroll={false}
                      open={mobileAiOpen}
                      onClose={() => setMobileAiOpen(false)}>
                      <div className={style['ai-drawer-body']}>
                        {renderAiPanel({ onCollapse: () => setMobileAiOpen(false) })}
                      </div>
                    </Drawer>
                  ) : null}
                </>
              ) : enableSites ? (
                <>
                  <aside
                    className={`${style['sites-aside']}${sitesCollapsed ? ` ${style['sites-aside-collapsed']}` : ''}`}
                    style={sitesCollapsed ? undefined : { width: sitesPanelWidth }}>
                    {!sitesCollapsed ? (
                      <div className={style['sites-aside-body']}>
                        {renderSitePanel({ onOpenFile: handleOpenFile, onCollapse: () => setSitesCollapsed(true) })}
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
                      {renderAiPanel({ onCollapse: () => setAiCollapsed(true) })}
                    </aside>
                  ) : null}
                </>
              ) : (
                editorTabs
              )}
            </div>
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
                transformContentUrl={transformContentUrl}
                onCancel={() => setContentShareOpen(false)}
              />
            )}
          </>
        );
      }
    )
  )
);

const LiveComponentEditor = forwardRef(({ className, style: styleProp, height = 500, ...props }, ref) => (
  <div
    className={classnames(style['live-component-editor-host'], className)}
    style={className ? styleProp : { height: `${Number(height) + 120}px`, ...styleProp }}>
    <App>
      <LiveComponentEditorCore ref={ref} height={height} {...props} />
    </App>
  </div>
));

LiveComponentEditor.installAiSiteMock = installAiSiteMock;
LiveComponentEditor.uninstallAiSiteMock = uninstallAiSiteMock;
LiveComponentEditor.AI_MOCK_HOST = AI_MOCK_HOST;

export { installAiSiteMock, uninstallAiSiteMock, AI_MOCK_HOST };
export default LiveComponentEditor;

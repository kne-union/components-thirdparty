import { DiffEditor as MonacoDiffEditor, loader } from '@monaco-editor/react';
import ensureSlash from '@kne/ensure-slash';
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import style from './style.module.scss';

if (window.MONACO_EDITOR_DIR) {
  loader.config({ paths: { vs: `${ensureSlash(window.MONACO_EDITOR_DIR)}/min/vs` } });
}

/** 非字符串内容按 JSON 格式化后对比 */
const toText = value => {
  if (value === undefined || value === null) {
    return '';
  }
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
};

const DiffEditor = forwardRef(
  (
    {
      className,
      original,
      modified,
      language,
      height = 500,
      renderSideBySide = true,
      hideUnchangedRegions = true,
      readOnly = true,
      options,
      onMount,
      ...props
    },
    ref
  ) => {
    const apiRef = useRef({});
    const [editor, setEditor] = useState(null);
    const id = useId().replace(/:/g, '');
    const isJson = typeof original === 'object' || typeof modified === 'object';
    const originalText = useMemo(() => toText(original), [original]);
    const modifiedText = useMemo(() => toText(modified), [modified]);
    // 固定 path，避免内容更新时反复 create/dispose model（@monaco-editor/react 默认卸载时先 dispose model 再拆 widget，会触发 TextModel got disposed）
    const originalModelPath = `inmemory://diff/${id}/original`;
    const modifiedModelPath = `inmemory://diff/${id}/modified`;
    // Monaco 默认宽度 < 900 时会强制内联；显式并排时关掉该断点
    const mergedOptions = useMemo(
      () =>
        Object.assign(
          {
            renderSideBySide,
            renderSideBySideInlineBreakpoint: renderSideBySide ? 0 : 900,
            readOnly,
            originalEditable: false,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            hideUnchangedRegions: { enabled: !!hideUnchangedRegions }
          },
          options
        ),
      [renderSideBySide, readOnly, hideUnchangedRegions, options]
    );
    useEffect(() => {
      if (!editor) {
        return;
      }
      editor.updateOptions({
        renderSideBySide,
        renderSideBySideInlineBreakpoint: renderSideBySide ? 0 : 900,
        readOnly,
        hideUnchangedRegions: { enabled: !!hideUnchangedRegions },
        ...(options || {})
      });
      editor.layout();
    }, [editor, renderSideBySide, readOnly, hideUnchangedRegions, options]);
    // keepCurrent* 避免 @monaco-editor/react 在 dispose widget 前先 dispose model；
    // 卸挂时先 setModel(null) 解绑，再微任务里 dispose，避免与 DiffEditorWidget 重置竞态
    useEffect(() => {
      const originalPath = originalModelPath;
      const modifiedPath = modifiedModelPath;
      return () => {
        const { editor: diffEditor, monaco } = apiRef.current;
        apiRef.current = {};
        let originalModel;
        let modifiedModel;
        try {
          const current = diffEditor?.getModel?.();
          originalModel = current?.original;
          modifiedModel = current?.modified;
          diffEditor?.setModel?.(null);
        } catch (e) {
          // ignore disposed editor
        }
        const disposeModels = () => {
          try {
            originalModel?.dispose?.();
            modifiedModel?.dispose?.();
          } catch (e) {
            // ignore
          }
          if (!monaco) {
            return;
          }
          try {
            monaco.editor.getModel(monaco.Uri.parse(originalPath))?.dispose();
            monaco.editor.getModel(monaco.Uri.parse(modifiedPath))?.dispose();
          } catch (e) {
            // ignore
          }
        };
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(disposeModels);
        } else {
          setTimeout(disposeModels, 0);
        }
      };
    }, [originalModelPath, modifiedModelPath]);
    useImperativeHandle(
      ref,
      () => ({
        getOriginalValue: () => apiRef.current.editor?.getOriginalEditor().getValue(),
        getModifiedValue: () => apiRef.current.editor?.getModifiedEditor().getValue(),
        getEditor: () => apiRef.current.editor,
        getMonaco: () => apiRef.current.monaco
      }),
      []
    );
    return (
      <div className={classnames(className, style['diff-editor-container'])} style={{ height }}>
        <MonacoDiffEditor
          {...props}
          height="100%"
          original={originalText}
          modified={modifiedText}
          language={language || (isJson ? 'json' : undefined)}
          originalModelPath={originalModelPath}
          modifiedModelPath={modifiedModelPath}
          keepCurrentOriginalModel
          keepCurrentModifiedModel
          options={mergedOptions}
          onMount={(next, monaco) => {
            apiRef.current = { editor: next, monaco };
            setEditor(next);
            onMount?.({ editor: next, monaco });
          }}
        />
      </div>
    );
  }
);

export default DiffEditor;

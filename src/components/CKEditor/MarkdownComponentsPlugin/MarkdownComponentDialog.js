import { useMemo, useState } from 'react';
import { Modal, Segmented, Select, Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import CodeEditor from '@components/CodeEditor';
import withLocale from '../withLocale';
import MarkdownComponentsView, { MarkdownInlineComponent } from './MarkdownComponentsView';
import { TEMPLATES, isBlockSource, parseYmlSource, toBlockMarkdown, ymlToInlineSource } from './constants';
import style from './dialog.module.scss';

/** 统一用 YML 编辑；行内组件提交时转换为 md-components:Type{...} */
const resolveResult = (text, inline) => {
  try {
    if (inline) {
      return { source: ymlToInlineSource(text) };
    }
    if (!isBlockSource(text)) {
      throw new Error('需以 md-components: 开头');
    }
    parseYmlSource(text);
    const source = text.replace(/\s+$/, '');
    return { source, markdown: toBlockMarkdown(source) };
  } catch (error) {
    return { error: error?.message || String(error) };
  }
};

/** 默认左编辑右预览，容器宽度不足或移动端改为上下 */
const MarkdownComponentDialog = withLocale(
  ({ open, title, inline: defaultInline, isInsert, defaultValue, components, variables, zIndex, onOk, onCancel }) => {
    const { formatMessage } = useIntl();
    const [inline, setInline] = useState(!!defaultInline);
    const [text, setText] = useState(defaultValue || TEMPLATES[defaultInline ? 'inline' : 'block'][0].value);
    const result = useMemo(() => resolveResult(text, inline), [text, inline]);
    const templates = TEMPLATES[inline ? 'inline' : 'block'];
    const modeLabel = formatMessage({ id: inline ? 'MarkdownComponentInline' : 'MarkdownComponentBlock' });

    const switchMode = nextInline => {
      const isTemplate = TEMPLATES[inline ? 'inline' : 'block'].some(item => item.value === text);
      setInline(nextInline);
      if (!text.trim() || isTemplate) {
        setText(TEMPLATES[nextInline ? 'inline' : 'block'][0].value);
      }
    };

    const header = (
      <div className={style['header']}>
        <div className={style['header-main']}>
          <span className={style['header-title']}>{title}</span>
          {isInsert ? (
            <Segmented
              size="small"
              value={inline ? 'inline' : 'block'}
              options={[
                { label: formatMessage({ id: 'MarkdownComponentBlock' }), value: 'block' },
                { label: formatMessage({ id: 'MarkdownComponentInline' }), value: 'inline' }
              ]}
              onChange={value => switchMode(value === 'inline')}
            />
          ) : (
            <Tag className={style['mode-tag']}>{modeLabel}</Tag>
          )}
        </div>
        <div className={style['header-actions']}>
          <Select
            size="small"
            className={style['template']}
            placeholder={formatMessage({ id: 'MarkdownComponentTemplate' })}
            value={null}
            options={templates.map(item => ({ label: item.label, value: item.value }))}
            onChange={setText}
          />
          <Tooltip title={formatMessage({ id: 'MarkdownComponentTip' })}>
            <QuestionCircleOutlined className={style['help']} />
          </Tooltip>
        </div>
      </div>
    );

    return (
      <Modal
        open={open}
        title={header}
        width="min(960px, 96vw)"
        zIndex={zIndex}
        destroyOnClose
        centered
        className={style['modal']}
        okText={formatMessage({ id: 'ModalOk' })}
        cancelText={formatMessage({ id: 'ModalCancel' })}
        okButtonProps={{ disabled: !!result.error }}
        onCancel={onCancel}
        onOk={() => onOk?.({ inline, source: result.source })}
      >
        <div className={style['dialog']}>
          <div className={style['layout']}>
            <div className={style['pane']}>
              <div className={style['pane-label']}>{formatMessage({ id: 'MarkdownComponentConfig' })}</div>
              <div className={style['editor']}>
                <CodeEditor
                  height="100%"
                  defaultLanguage="yaml"
                  value={text}
                  formatActionOpen={false}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    tabSize: 2,
                    lineNumbersMinChars: 3,
                    padding: { top: 8 }
                  }}
                  onChange={value => setText(value || '')}
                />
              </div>
            </div>
            <div className={style['pane']}>
              <div className={style['pane-label']}>{formatMessage({ id: 'MarkdownComponentPreview' })}</div>
              <div className={style['preview']}>
                {result.error ? (
                  <div className={style['error']}>{result.error}</div>
                ) : inline ? (
                  <MarkdownInlineComponent source={result.source} components={components} variables={variables} />
                ) : (
                  <MarkdownComponentsView components={components} variables={variables}>
                    {result.markdown}
                  </MarkdownComponentsView>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
);

export default MarkdownComponentDialog;

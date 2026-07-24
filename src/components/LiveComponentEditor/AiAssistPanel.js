import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Flex, Input, Space, Typography, Tag } from 'antd';
import { RobotOutlined, SendOutlined, ThunderboltOutlined, MenuFoldOutlined } from '@ant-design/icons';
import createAjax from '@kne/axios-fetch';
import { getGlobal } from '@kne/remote-loader';
import { getLibs } from '@components/LiveComponentView';
import useRefCallback from '@kne/use-ref-callback';
import { createSiteApi, isLocalStorageHost } from './siteApi';
import { collectRemotesPayload, stripCodeFence } from './aiSelection';
import style from './style.module.scss';

const { Text } = Typography;
const { TextArea } = Input;

const createStreamAjax = () =>
  createAjax({
    errorHandler: () => {}
  });

const AiAssistPanel = ({
  siteHost,
  content,
  scope,
  libs,
  selection,
  limitToSelection,
  onLimitToSelectionChange,
  onApplyContent,
  onApplyScope,
  onCollapse,
  formatMessage,
  height
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const sseRef = useRef(null);
  const listRef = useRef(null);

  const stopStream = useRefCallback(() => {
    sseRef.current?.close?.();
    sseRef.current = null;
  });

  useEffect(() => () => stopStream(), [stopStream]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const buildPayload = useRefCallback((mode, nextMessages) => {
    const remotes = collectRemotesPayload(getGlobal()?.remotes);
    const libKeys = Object.keys(Object.assign({}, getLibs(), libs || {}));
    const payload = {
      mode,
      messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
      content: content || '',
      scope: scope || {},
      libs: libKeys,
      remotes
    };
    if (limitToSelection && selection?.code) {
      payload.selection = {
        startLine: selection.startLine,
        endLine: selection.endLine,
        code: selection.code,
        label: selection.label
      };
    }
    return payload;
  });

  const runStream = useRefCallback(async ({ mode, nextMessages, onDone }) => {
    if (!siteHost || isLocalStorageHost(siteHost)) {
      return;
    }
    stopStream();
    setLoading(true);
    setStreamingText('');
    try {
      const api = createSiteApi(siteHost);
      const { streamToken } = await api.aiStart(buildPayload(mode, nextMessages));
      if (!streamToken) {
        throw new Error('missing streamToken');
      }
      const ajax = createStreamAjax();
      let acc = '';
      let suggestedScope = null;
      const client = await ajax.sse({
        url: `${String(siteHost).replace(/\/$/, '')}/ai/stream`,
        params: { token: streamToken },
        onMessage: parsed => {
          if (!parsed || typeof parsed !== 'object') {
            return;
          }
          if (parsed.text) {
            acc += parsed.text;
            setStreamingText(acc);
          }
          if (parsed.done) {
            if (parsed.suggestedScope) {
              suggestedScope = parsed.suggestedScope;
            }
            onDone?.({ text: acc, suggestedScope });
            setStreamingText('');
            setLoading(false);
            stopStream();
          }
        },
        onError: () => {
          setLoading(false);
          stopStream();
        }
      });
      sseRef.current = client;
    } catch (e) {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: formatMessage({ id: 'AiMsgFail' }, { msg: e.message || '' }) }
      ]);
    }
  });

  const handleSend = useRefCallback(async () => {
    const text = input.trim();
    if (!text || loading) {
      return;
    }
    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    await runStream({
      mode: 'refine',
      nextMessages,
      onDone: ({ text: reply }) => {
        setMessages(prev => [...prev, { role: 'assistant', content: reply || '' }]);
      }
    });
  });

  const handleGenerate = useRefCallback(async () => {
    if (loading) {
      return;
    }
    await runStream({
      mode: 'generate',
      nextMessages: messages,
      onDone: ({ text: reply, suggestedScope }) => {
        const code = stripCodeFence(reply);
        if (code) {
          onApplyContent?.(code);
        }
        if (suggestedScope && typeof suggestedScope === 'object') {
          onApplyScope?.(suggestedScope);
        }
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: formatMessage({ id: 'AiMsgGenerateDone' }) }
        ]);
      }
    });
  });

  const displayMessages = streamingText
    ? [...messages, { role: 'assistant', content: streamingText, streaming: true }]
    : messages;

  return (
    <div className={style['ai-panel']} style={{ height: `${height + 120}px` }}>
      <Flex justify="space-between" align="center" className={style['ai-panel-header']}>
        <Space size={6}>
          <RobotOutlined />
          <Text strong>{formatMessage({ id: 'AiTitle' })}</Text>
        </Space>
        {onCollapse && (
          <Button
            type="text"
            size="small"
            icon={<MenuFoldOutlined />}
            onClick={onCollapse}
            title={formatMessage({ id: 'AiCollapse' })}
          />
        )}
      </Flex>

      <div className={style['ai-panel-scope']}>
        <Checkbox
          checked={limitToSelection}
          disabled={!selection?.code}
          onChange={e => onLimitToSelectionChange?.(e.target.checked)}>
          {formatMessage({ id: 'AiLimitSelection' })}
        </Checkbox>
        {selection?.label ? (
          <Tag className={style['ai-selection-tag']}>{selection.label}</Tag>
        ) : (
          <Text type="secondary" className={style['ai-selection-hint']}>
            {formatMessage({ id: 'AiNoSelection' })}
          </Text>
        )}
      </div>

      <div className={style['ai-panel-messages']} ref={listRef}>
        {!displayMessages.length && (
          <Text type="secondary">{formatMessage({ id: 'AiEmptyHint' })}</Text>
        )}
        {displayMessages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={msg.role === 'user' ? style['ai-msg-user'] : style['ai-msg-assistant']}>
            <Text type="secondary" className={style['ai-msg-role']}>
              {msg.role === 'user' ? formatMessage({ id: 'AiRoleUser' }) : formatMessage({ id: 'AiRoleAssistant' })}
            </Text>
            <pre className={style['ai-msg-content']}>{msg.content}</pre>
          </div>
        ))}
      </div>

      <div className={style['ai-panel-footer']}>
        <Button
          type="primary"
          block
          icon={<ThunderboltOutlined />}
          disabled={loading || !messages.length}
          onClick={handleGenerate}>
          {formatMessage({ id: 'AiStartGenerate' })}
        </Button>
        <Space.Compact className={style['ai-input-row']}>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
            disabled={loading}
            placeholder={formatMessage({ id: 'AiInputPlaceholder' })}
            onPressEnter={e => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={handleSend}>
            {formatMessage({ id: 'AiSend' })}
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
};

export default AiAssistPanel;

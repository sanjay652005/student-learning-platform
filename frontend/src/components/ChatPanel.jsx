import { useState, useRef, useEffect, useCallback } from 'react';
import { notesAPI } from '../services/api';
import { useToast } from './Toast';

const STARTERS = [
  'What are the main topics covered?',
  'Explain the key concepts simply',
  'What are the most important points?',
  'Give me a brief summary',
];

export default function ChatPanel({ noteId, initialHistory = [] }) {
  const [messages, setMessages] = useState(() =>
    initialHistory.map(m => ({ role: m.role, content: m.content }))
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const bottomRef = useRef();
  const inputRef = useRef();
  const toast = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await notesAPI.chat(noteId, q);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
      setUsageInfo(res.data.usage);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to get a response';

      if (status === 429) {
        toast.warning(msg);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⏱ ${msg}`,
          isRateLimit: true
        }]);
      } else if (status === 401) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '🔒 Please sign in to use the chat feature.',
          isError: true
        }]);
      } else {
        toast.error(msg);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ ${msg}`,
          isError: true
        }]);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, noteId, toast]);

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const remaining = usageInfo ? usageInfo.limit - usageInfo.used : null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 520, background: 'var(--surface)',
      border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', borderBottom: '1px solid var(--border-light)',
        background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)' }}>Chat with this note</div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>AI answers based solely on note content</div>
          </div>
        </div>
        {usageInfo && (
          <div style={{
            fontSize: 11, color: remaining <= 2 ? '#c0392b' : 'var(--ink-muted)',
            background: remaining <= 2 ? '#fdf0ee' : 'var(--parchment-dark)',
            padding: '3px 10px', borderRadius: 20, fontWeight: 500
          }}>
            {usageInfo.used}/{usageInfo.limit} chats today
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: 13, marginTop: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🤔</div>
            <p style={{ marginBottom: 18 }}>Ask any question — I'll answer using only this note's content</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {STARTERS.map(q => (
                <button key={q} className="btn btn-outline btn-sm"
                  style={{ fontSize: 12, borderRadius: 20 }}
                  onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, background: msg.isError || msg.isRateLimit ? '#fdf0ee' : 'var(--accent)',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 13, flexShrink: 0, marginTop: 4
              }}>
                {msg.isError || msg.isRateLimit ? '⚠' : '✦'}
              </div>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              background: msg.role === 'user'
                ? 'var(--accent)'
                : msg.isError || msg.isRateLimit ? '#fdf0ee'
                : 'var(--parchment)',
              color: msg.role === 'user' ? 'white'
                : msg.isError || msg.isRateLimit ? '#c0392b'
                : 'var(--ink)',
              fontSize: 14, lineHeight: 1.65,
              border: msg.role === 'assistant' && !msg.isError ? '1px solid var(--border-light)' : 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>✦</div>
            <div style={{
              padding: '12px 16px', background: 'var(--parchment)', border: '1px solid var(--border-light)',
              borderRadius: '4px 18px 18px 18px', display: 'flex', gap: 5, alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, background: 'var(--ink-muted)', borderRadius: '50%',
                  animation: `dotBounce 1.2s ease ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8 }}>
        <textarea
          ref={inputRef}
          className="form-input"
          style={{ flex: 1, borderRadius: 20, padding: '9px 16px', fontSize: 14, resize: 'none', lineHeight: 1.4, minHeight: 40, maxHeight: 120 }}
          placeholder="Ask a question about this note…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          rows={1}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, fontSize: 18, flexShrink: 0 }}
          title="Send (Enter)"
        >
          {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↑'}
        </button>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

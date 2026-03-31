import { useState, useCallback, createContext, useContext, useRef } from 'react';

const ToastContext = createContext(null);

const ICONS = { success: '✓', error: '✕', info: '✦', warning: '⚠' };
const COLORS = {
  success: { bg: 'var(--sage)', border: '#4a6b4c' },
  error: { bg: '#c0392b', border: '#a93226' },
  info: { bg: 'var(--accent)', border: 'var(--accent-dark)' },
  warning: { bg: 'var(--gold)', border: '#a07a20' },
};

function ToastItem({ toast, onRemove }) {
  const { bg, border } = COLORS[toast.type] || COLORS.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      background: bg, border: `1px solid ${border}`,
      color: 'white', fontSize: 14, fontWeight: 500,
      boxShadow: 'var(--shadow-lg)', minWidth: 260, maxWidth: 380,
      animation: 'toastIn 0.25s ease', cursor: 'pointer'
    }} onClick={() => onRemove(toast.id)}>
      <span style={{ fontSize: 16, opacity: 0.9 }}>{ICONS[toast.type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <span style={{ opacity: 0.6, fontSize: 12 }}>✕</span>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]);

  toast.success = (msg, d) => toast(msg, 'success', d);
  toast.error = (msg, d) => toast(msg, 'error', d);
  toast.info = (msg, d) => toast(msg, 'info', d);
  toast.warning = (msg, d) => toast(msg, 'warning', d);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 9999, pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }`}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

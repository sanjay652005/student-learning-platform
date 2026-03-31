export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(26,18,7,0.45)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease'
    }} onClick={onCancel}>
      <div className="card" style={{
        padding: 28, maxWidth: 420, width: '90%',
        animation: 'slideUp 0.2s ease'
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 10 }}>
          {title}
        </h3>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
          <button className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '📄', title, message, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '72px 24px', textAlign: 'center'
    }}>
      <div style={{
        width: 80, height: 80, background: 'var(--parchment-dark)',
        borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 36, marginBottom: 20
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.4rem',
        color: 'var(--ink-light)', fontWeight: 400, marginBottom: 8
      }}>
        {title}
      </h3>
      {message && (
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
      )}
      {action && (
        action.href
          ? <Link to={action.href} className="btn btn-primary">{action.label}</Link>
          : <button className="btn btn-primary" onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  );
}

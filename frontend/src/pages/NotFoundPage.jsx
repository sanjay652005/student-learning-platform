import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 24
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(5rem, 20vw, 9rem)',
        color: 'var(--parchment-darker)',
        lineHeight: 1, marginBottom: 8,
        letterSpacing: '-0.04em'
      }}>
        404
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.6rem',
        color: 'var(--ink)', fontWeight: 400, marginBottom: 12
      }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: 15, maxWidth: 360, lineHeight: 1.6, marginBottom: 32 }}>
        The page you're looking for doesn't exist, or you may not have permission to view it.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go back</button>
        <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
      </div>
    </div>
  );
}

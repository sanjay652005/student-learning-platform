import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { notesAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({ total: 0, public: 0, private: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      notesAPI.getAll({ filter: 'mine', limit: 5, page: 1 }),
      notesAPI.getAll({ filter: 'mine', limit: 1, visibility: 'public', page: 1 }),
    ]).then(([allRes]) => {
      const notes = allRes.data.notes;
      setRecentNotes(notes);
      setStats({
        total: allRes.data.total,
        public: notes.filter(n => n.visibility === 'public').length,
        private: notes.filter(n => n.visibility === 'private').length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const aiUsage = user?.aiUsage || {};
  const chatPct = Math.round(((aiUsage.chatCount || 0) / 10) * 100);
  const quizPct = Math.round(((aiUsage.quizCount || 0) / 5) * 100);

  const UsageBar = ({ label, used, limit, pct, color }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: 'var(--ink-light)', fontWeight: 500 }}>{label}</span>
        <span style={{ color: pct >= 80 ? '#c0392b' : 'var(--ink-muted)' }}>{used} / {limit} today</span>
      </div>
      <div style={{ height: 8, background: 'var(--parchment-dark)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: pct >= 80 ? '#c0392b' : color,
          borderRadius: 8, transition: 'width 0.6s ease'
        }} />
      </div>
      {pct >= 100 && <p style={{ fontSize: 11, color: '#c0392b', marginTop: 4 }}>Limit reached — resets in 24h</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>
          Your profile
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Manage your account and track AI usage</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Account info */}
        <div className="card" style={{ padding: 24, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 64, height: 64, background: 'var(--accent)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white',
              fontSize: 26, fontFamily: 'var(--font-display)', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', fontWeight: 400, marginBottom: 4 }}>
                {user?.name}
              </h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>{user?.email}</p>
              <p style={{ color: 'var(--ink-muted)', fontSize: 12, marginTop: 4 }}>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => { logout(); window.location.href = '/login'; }}
              style={{ color: '#c0392b', borderColor: '#f0c4bc', flexShrink: 0 }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Notes stats */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 20, fontWeight: 400 }}>
            Your notes
          </h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><div className="spinner" /></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total', value: stats.total, color: 'var(--accent)' },
                  { label: 'Public', value: stats.public, color: 'var(--sage)' },
                  { label: 'Private', value: stats.private, color: 'var(--ink-muted)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--parchment)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <Link to="/dashboard?filter=mine" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                View all my notes
              </Link>
            </>
          )}
        </div>

        {/* AI usage */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 20, fontWeight: 400 }}>
            AI usage today
          </h3>
          <UsageBar label="Chat with notes" used={aiUsage.chatCount || 0} limit={10} pct={chatPct} color="var(--accent)" />
          <UsageBar label="Quiz generation" used={aiUsage.quizCount || 0} limit={5} pct={quizPct} color="var(--sage)" />
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8 }}>
            Limits reset every 24 hours from first use
          </p>
        </div>

        {/* Recent notes */}
        {recentNotes.length > 0 && (
          <div className="card" style={{ padding: 24, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 400 }}>
                Recent notes
              </h3>
              <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: 'var(--accent)' }}>View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentNotes.map(note => (
                <Link key={note._id} to={`/notes/${note._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--parchment)', textDecoration: 'none',
                  transition: 'background 0.15s',
                  color: 'inherit'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--parchment-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--parchment)'}
                >
                  <span style={{ fontSize: 18 }}>{note.visibility === 'public' ? '🌐' : '🔒'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {note.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="badge badge-tag" style={{ fontSize: 11 }}>{tag}</span>
                  ))}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

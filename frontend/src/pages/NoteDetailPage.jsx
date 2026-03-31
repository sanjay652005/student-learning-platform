import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ChatPanel from '../components/ChatPanel';
import QuizPanel from '../components/QuizPanel';
import ConfirmModal from '../components/ConfirmModal';
import { NoteDetailSkeleton } from '../components/Skeleton';

const TABS = [
  { key: 'Overview', icon: '◈' },
  { key: 'Chat', icon: '💬' },
  { key: 'Quiz', icon: '🧠' },
];

export default function NoteDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [shareEmail, setShareEmail] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    notesAPI.getOne(id)
      .then(res => {
        setNote(res.data.note);
        setBookmarked(res.data.note.isBookmarked);
        setEditForm({ title: res.data.note.title, description: res.data.note.description || '', visibility: res.data.note.visibility });
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load note'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await notesAPI.generateSummary(id);
      setNote(prev => ({ ...prev, summary: res.data.summary }));
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Summary generation failed');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      await notesAPI.bookmark(id);
      setBookmarked(b => !b);
      toast.info(bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
    } catch { toast.error('Failed to update bookmark'); }
  };

  const handleDelete = async () => {
    try {
      await notesAPI.delete(id);
      toast.success('Note deleted');
      navigate('/dashboard');
    } catch { toast.error('Delete failed'); }
    setConfirmDelete(false);
  };

  const handleUpdate = async () => {
    try {
      const res = await notesAPI.update(id, editForm);
      setNote(prev => ({ ...prev, ...res.data.note }));
      setEditing(false);
      toast.success('Note updated');
    } catch { toast.error('Update failed'); }
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    try {
      const res = await notesAPI.share(id, shareEmail);
      toast.success(res.data.message);
      setShareEmail('');
    } catch (err) { toast.error(err.response?.data?.message || 'Share failed'); }
  };

  if (loading) return <NoteDetailSkeleton />;

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', fontWeight: 400 }}>{error}</h2>
      <Link to="/dashboard" className="btn btn-outline">← Back to dashboard</Link>
    </div>
  );

  const isOwner = note?.isOwner;
  const canUseAI = !!user;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/dashboard" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dashboard</Link>
        <span>›</span>
        <span style={{ color: 'var(--ink)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="form-input" value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }} />
              <textarea className="form-textarea" value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Description…" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select className="form-select" value={editForm.visibility}
                  onChange={e => setEditForm(f => ({ ...f, visibility: e.target.value }))} style={{ width: 'auto' }}>
                  <option value="private">🔒 Private</option>
                  <option value="public">🌐 Public</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={handleUpdate}>Save changes</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 400, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.2 }}>{note.title}</h1>
              {note.description && <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>{note.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className={`badge badge-${note.visibility}`}>{note.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>by {note.userId?.name}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>• {new Date(note.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>• {note.viewCount} view{note.viewCount !== 1 ? 's' : ''}</span>
              </div>
              {note.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {note.tags.map(tag => <span key={tag} className="badge badge-tag">{tag}</span>)}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {user && (
            <button className="btn btn-outline btn-sm" onClick={handleBookmark}
              style={{ color: bookmarked ? 'var(--gold)' : '', borderColor: bookmarked ? 'var(--gold)' : '' }}>
              {bookmarked ? '★ Saved' : '☆ Save'}
            </button>
          )}
          {isOwner && <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit</button>}
          {isOwner && <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-light)', marginBottom: 28 }}>
        {TABS.map(tab => {
          const disabled = !canUseAI && (tab.key === 'Chat' || tab.key === 'Quiz');
          return (
            <button key={tab.key} onClick={() => !disabled && setActiveTab(tab.key)}
              title={disabled ? 'Sign in to use AI features' : ''}
              style={{
                padding: '10px 20px', border: 'none', background: 'transparent',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                color: activeTab === tab.key ? 'var(--accent)' : disabled ? 'var(--border)' : 'var(--ink-muted)',
                borderBottom: `2px solid ${activeTab === tab.key ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -2, transition: 'all 0.15s ease'
              }}>
              <span>{tab.icon}</span> {tab.key}
              {disabled && <span style={{ fontSize: 10, opacity: 0.6 }}>(login)</span>}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

          {/* Note content */}
          {(note.extractedText || note.fileUrl) && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--ink)', fontWeight: 400 }}>Note content</h3>
                {note.fileUrl && (
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                    📄 View file
                  </a>
                )}
              </div>
              {note.extractedText ? (
                <div style={{
                  maxHeight: 320, overflowY: 'auto', fontSize: 13,
                  color: 'var(--ink-light)', lineHeight: 1.75,
                  whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                  background: 'var(--parchment)', padding: 14,
                  borderRadius: 'var(--radius-md)'
                }}>
                  {note.extractedText.slice(0, 3000)}{note.extractedText.length > 3000 ? '\n\n[...truncated for display]' : ''}
                </div>
              ) : (
                <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>File uploaded — click "View file" to open it.</p>
              )}
            </div>
          )}

          {/* AI Summary */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--ink)', fontWeight: 400 }}>✦ AI Summary</h3>
              {canUseAI && (
                <button className="btn btn-sm" onClick={handleSummary} disabled={summaryLoading}
                  style={{ background: note.summary?.shortExplanation ? 'transparent' : 'var(--accent)', color: note.summary?.shortExplanation ? 'var(--ink-muted)' : 'white', border: note.summary?.shortExplanation ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                  {summaryLoading ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Generating…</> : note.summary?.shortExplanation ? '↺ Regenerate' : 'Generate ✦'}
                </button>
              )}
            </div>

            {note.summary?.shortExplanation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--parchment)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Overview</div>
                  <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7 }}>{note.summary.shortExplanation}</p>
                </div>
                {note.summary.keyPoints?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Key Points</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {note.summary.keyPoints.map((pt, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--ink-light)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>✦</span>{pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {note.summary.concepts?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Key Concepts</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {note.summary.concepts.map(c => (
                        <span key={c} style={{ background: 'rgba(196,98,45,0.1)', color: 'var(--accent)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--ink-muted)', fontSize: 13, textAlign: 'center', padding: '36px 0' }}>
                {canUseAI
                  ? <><div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>Click "Generate" to create an AI summary</>
                  : <><Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link> to generate AI summaries</>}
              </div>
            )}
          </div>

          {/* Share panel (owner only) */}
          {isOwner && (
            <div className="card" style={{ padding: 20, gridColumn: '1 / -1' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--ink)', fontWeight: 400, marginBottom: 14 }}>
                Share with a user
              </h3>
              <div style={{ display: 'flex', gap: 10, maxWidth: 480 }}>
                <input className="form-input" type="email" placeholder="Enter user email address"
                  value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleShare()} />
                <button className="btn btn-primary btn-sm" onClick={handleShare} disabled={!shareEmail.trim()}>Share</button>
              </div>
              {note.sharedWith?.length > 0 && (
                <p style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-muted)' }}>
                  Shared with {note.sharedWith.length} user{note.sharedWith.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Chat' && <ChatPanel noteId={id} initialHistory={note.chatHistory?.slice(-20) || []} />}
      {activeTab === 'Quiz' && <QuizPanel noteId={id} />}

      <ConfirmModal isOpen={confirmDelete} title="Delete this note?" message="This will permanently delete the note, its AI summary, and all chat history. This cannot be undone." confirmLabel="Delete permanently" danger onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  );
}

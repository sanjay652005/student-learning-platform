import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
import NoteCard from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { notes, loading, error, pagination, fetchNotes, deleteNote, toggleBookmark } = useNotes();

  useEffect(() => { fetchNotes({ filter, page, limit: 12 }); }, [filter, page]);

  const handleFilterChange = f => { setFilter(f); setPage(1); setSearchParams(f !== 'all' ? { filter: f } : {}); };

  const handleDelete = async id => {
    try { await deleteNote(id); toast.success('Note deleted'); }
    catch { toast.error('Failed to delete note'); }
    setConfirmDelete(null);
  };

  const handleBookmark = async id => {
    try {
      const wasBookmarked = notes.find(n => n._id === id)?.isBookmarked;
      await toggleBookmark(id);
      toast.info(wasBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
    } catch { toast.error('Failed to update bookmark'); }
  };

  const aiUsage = user?.aiUsage || {};
  const FILTERS = [
    { key: 'all', label: 'All', icon: '◈' },
    { key: 'mine', label: 'My notes', icon: '◉' },
    { key: 'public', label: 'Public', icon: '◎' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 4 }}>
            Good day, {user?.name?.split(' ')[0]} ✦
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
            {loading ? '…' : `${pagination.total} note${pagination.total !== 1 ? 's' : ''} accessible`}
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary"><span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Upload note</Link>
      </div>

      {/* AI stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Chats today', used: aiUsage.chatCount || 0, limit: 10, icon: '💬', color: 'var(--accent)' },
          { label: 'Quizzes today', used: aiUsage.quizCount || 0, limit: 5, icon: '🧠', color: 'var(--sage)' },
          { label: 'Notes total', used: pagination.total, limit: null, icon: '📄', color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 600, color: s.color, fontFamily: 'var(--font-display)' }}>
                  {s.used}{s.limit ? ` / ${s.limit}` : ''}
                </div>
              </div>
            </div>
            {s.limit && (
              <div style={{ marginTop: 8, height: 3, background: 'var(--parchment-dark)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min((s.used / s.limit) * 100, 100)}%`, background: s.used >= s.limit ? '#c0392b' : s.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--parchment-dark)', padding: 3, borderRadius: 'var(--radius-md)', width: 'fit-content', marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => handleFilterChange(f.key)} className="btn btn-sm"
            style={{ background: filter === f.key ? 'var(--surface)' : 'transparent', color: filter === f.key ? 'var(--accent)' : 'var(--ink-muted)', boxShadow: filter === f.key ? 'var(--shadow-sm)' : 'none', border: 'none', fontWeight: filter === f.key ? 500 : 400, gap: 6 }}>
            <span style={{ fontSize: 13 }}>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <EmptyState icon="⚠️" title="Something went wrong" message={error} action={{ label: 'Retry', onClick: () => fetchNotes({ filter, page, limit: 12 }) }} />
      ) : loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Array(9).fill(0).map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={filter === 'mine' ? '📝' : '📚'}
          title={filter === 'mine' ? 'No notes yet' : 'Nothing here'}
          message={filter === 'mine' ? 'Upload your first note to get started.' : 'No notes match this filter.'}
          action={filter === 'mine' ? { label: 'Upload first note', href: '/upload' } : { label: 'Show all', onClick: () => handleFilterChange('all') }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {notes.map(note => <NoteCard key={note._id} note={note} onDelete={id => setConfirmDelete(id)} onBookmark={handleBookmark} />)}
          </div>
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36 }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(p)} style={{ minWidth: 36 }}>{p}</button>
              ))}
              <button className="btn btn-outline btn-sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      <ConfirmModal isOpen={!!confirmDelete} title="Delete note" message="This will permanently delete the note and all its AI data. This cannot be undone." confirmLabel="Yes, delete" danger onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

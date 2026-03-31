import { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import NoteCard from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function BookmarksPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchBookmarks = async (p = 1) => {
    setLoading(true);
    try {
      const res = await notesAPI.getBookmarks({ page: p, limit: 12 });
      setNotes(res.data.notes);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookmarks(page); }, [page]);

  const handleUnbookmark = async id => {
    try {
      await notesAPI.bookmark(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success('Removed from bookmarks');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleDelete = async id => {
    try {
      await notesAPI.delete(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
    setConfirmDelete(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>
          Bookmarks ★
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Notes you've saved for quick access</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Array(6).fill(0).map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon="★"
          title="No bookmarks yet"
          message="Star notes from the dashboard or note detail page to save them here."
          action={{ label: 'Browse notes', href: '/dashboard' }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {notes.map(note => (
              <NoteCard
                key={note._id}
                note={{ ...note, isBookmarked: true }}
                onBookmark={handleUnbookmark}
                onDelete={id => setConfirmDelete(id)}
              />
            ))}
          </div>
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--ink-muted)', padding: '0 8px' }}>
                Page {page} of {pages}
              </span>
              <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete note"
        message="This will permanently delete the note and all its AI data. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

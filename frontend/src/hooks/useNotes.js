import { useState, useCallback } from 'react';
import { notesAPI } from '../services/api';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await notesAPI.getAll(params);
      setNotes(res.data.notes);
      setPagination({ total: res.data.total, page: res.data.page, pages: res.data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNote = useCallback(async (id) => {
    await notesAPI.delete(id);
    setNotes(prev => prev.filter(n => n._id !== id));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
  }, []);

  const toggleBookmark = useCallback(async (id) => {
    await notesAPI.bookmark(id);
    setNotes(prev => prev.map(n =>
      n._id === id ? { ...n, isBookmarked: !n.isBookmarked } : n
    ));
  }, []);

  return { notes, loading, error, pagination, fetchNotes, deleteNote, toggleBookmark };
}

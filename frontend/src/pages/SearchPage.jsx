import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import NoteCard from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

const SUGGESTIONS = ['machine learning', 'calculus', 'world history', 'algorithms', 'organic chemistry', 'economics'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState('text');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [count, setCount] = useState(0);
  const toast = useToast();
  const inputRef = useRef();

  const doSearch = async (q = query, type = searchType) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setSearchParams({ q: q.trim(), ...(type !== 'text' && { type }) });
    try {
      const res = await searchAPI.search(q.trim(), type);
      setResults(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      const msg = err.response?.data?.message || 'Search failed';
      toast.error(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Run search on initial load if query param present
  useEffect(() => {
    const q = searchParams.get('q');
    const t = searchParams.get('type') || 'text';
    if (q) { setQuery(q); setSearchType(t); doSearch(q, t); }
  }, []); // eslint-disable-line

  const handleTypeChange = t => {
    setSearchType(t);
    if (searched && query.trim()) doSearch(query, t);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>
          Search notes
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
          Search across public notes and your own collection
        </p>
      </div>

      {/* Search bar */}
      <div className="card" style={{ padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            ref={inputRef}
            className="form-input"
            style={{ flex: 1, fontSize: 15 }}
            type="text"
            placeholder="Search by title, description, tags…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={() => doSearch()}
            disabled={loading || !query.trim()}
            style={{ minWidth: 90 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Search'}
          </button>
        </div>

        {/* Search type toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>Mode:</span>
          <div style={{ display: 'flex', gap: 4, background: 'var(--parchment-dark)', padding: 3, borderRadius: 'var(--radius-md)' }}>
            {[
              { key: 'text', label: '🔤 Text', desc: 'Title, tags, description' },
              { key: 'semantic', label: '🧠 Semantic', desc: 'Meaning & concept match' },
            ].map(t => (
              <button key={t.key} onClick={() => handleTypeChange(t.key)}
                className="btn btn-sm"
                title={t.desc}
                style={{
                  background: searchType === t.key ? 'var(--surface)' : 'transparent',
                  color: searchType === t.key ? 'var(--accent)' : 'var(--ink-muted)',
                  border: 'none', fontWeight: searchType === t.key ? 500 : 400,
                  boxShadow: searchType === t.key ? 'var(--shadow-sm)' : 'none'
                }}>
                {t.label}
              </button>
            ))}
          </div>
          {searchType === 'semantic' && (
            <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Finds notes by conceptual similarity
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Array(6).fill(0).map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No results found"
          message={`No notes match "${searchParams.get('q')}". Try different keywords or switch to semantic search.`}
          action={{ label: 'Clear search', onClick: () => { setQuery(''); setSearched(false); setSearchParams({}); inputRef.current?.focus(); } }}
        />
      ) : results.length > 0 ? (
        <>
          <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginBottom: 16 }}>
            <strong style={{ color: 'var(--ink)' }}>{count}</strong> result{count !== 1 ? 's' : ''} for{' '}
            <strong style={{ color: 'var(--ink)' }}>"{searchParams.get('q')}"</strong>
            {searchType === 'semantic' && <span style={{ color: 'var(--sage)', marginLeft: 6 }}>• semantic match</span>}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {results.map(note => <NoteCard key={note._id} note={note} />)}
          </div>
        </>
      ) : (
        /* Initial state */
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink-light)', fontWeight: 400, marginBottom: 8 }}>
            Discover notes
          </h3>
          <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 24 }}>
            Search through public notes and your own collection by topic, keyword, or concept
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="btn btn-outline btn-sm"
                onClick={() => { setQuery(s); doSearch(s); }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

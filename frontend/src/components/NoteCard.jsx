import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NoteCard({ note, onDelete, onBookmark }) {
  const { user } = useAuth();
  const isOwner = note.isOwner || (user && (
    note.userId?._id?.toString() === user._id?.toString() ||
    note.userId?.toString() === user._id?.toString()
  ));
  const isBookmarked = note.isBookmarked || note.bookmarkedBy?.includes(user?._id);

  const timeAgo = date => {
    const d = new Date(date), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="card" style={{
      padding: 20, display:'flex', flexDirection:'column', gap:12,
      transition:'all 0.2s ease', cursor:'pointer',
      borderLeft: '3px solid var(--accent)'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <Link to={`/notes/${note._id}`} style={{ color:'inherit', textDecoration:'none', flex:1 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:500, lineHeight:1.3, color:'var(--ink)' }}>
            {note.title}
          </h3>
        </Link>
        <span className={`badge badge-${note.visibility}`}>
          {note.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
        </span>
      </div>

      {/* Description */}
      {note.description && (
        <p style={{ fontSize:13, color:'var(--ink-muted)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {note.description}
        </p>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {note.tags.slice(0, 4).map(tag => (
            <span key={tag} className="badge badge-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Summary indicator */}
      {note.summary?.shortExplanation && (
        <div style={{
          background:'var(--parchment)', border:'1px solid var(--border-light)',
          borderRadius:'var(--radius-sm)', padding:'8px 12px',
          fontSize:12, color:'var(--ink-light)', lineHeight:1.4,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
        }}>
          ✦ {note.summary.shortExplanation}
        </div>
      )}

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:12, color:'var(--ink-muted)' }}>
          <span>by {note.userId?.name || 'Unknown'}</span>
          <span>•</span>
          <span>{timeAgo(note.createdAt)}</span>
          {note.viewCount > 0 && <><span>•</span><span>{note.viewCount} views</span></>}
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {onBookmark && (
            <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onBookmark(note._id); }}
              style={{ color: isBookmarked ? 'var(--gold)' : 'var(--ink-muted)', padding:'4px 8px', fontSize:16 }}
              title="Bookmark">
              {isBookmarked ? '★' : '☆'}
            </button>
          )}
          {isOwner && onDelete && (
            <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onDelete(note._id); }}
              style={{ color:'var(--ink-muted)', padding:'4px 8px', fontSize:13 }} title="Delete">
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

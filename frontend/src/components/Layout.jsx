import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const isActive = path => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const NavLink = ({ to, children }) => (
    <Link to={to} className="btn btn-ghost btn-sm"
      style={isActive(to) ? { color: 'var(--accent)', background: 'rgba(196,98,45,0.08)' } : {}}>
      {children}
    </Link>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, background: 'var(--accent)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 15, flexShrink: 0
            }}>✦</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink)', fontWeight: 400 }}>NotesMind</span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/search">Search</NavLink>
                <NavLink to="/upload">Upload</NavLink>

                <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 6px' }} />

                {/* User dropdown */}
                <div style={{ position: 'relative' }} ref={menuRef}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}>
                    <div style={{
                      width: 28, height: 28, background: 'var(--accent)', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 12, fontWeight: 600, flexShrink: 0
                    }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name?.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--ink-muted)', transition: 'transform 0.15s', transform: menuOpen ? 'rotate(180deg)' : '' }}>▾</span>
                  </button>

                  {menuOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--surface)', border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                      minWidth: 180, overflow: 'hidden', zIndex: 200,
                      animation: 'dropIn 0.15s ease'
                    }}>
                      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{user.email}</div>
                      </div>
                      {[
                        { to: '/profile', label: '👤 Profile' },
                        { to: '/bookmarks', label: '★ Bookmarks' },
                        { to: '/dashboard?filter=mine', label: '📄 My notes' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                          style={{ display: 'block', padding: '9px 16px', fontSize: 13, color: 'var(--ink)', textDecoration: 'none', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--parchment)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          {item.label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border-light)' }}>
                        <button onClick={handleLogout} style={{
                          width: '100%', padding: '9px 16px', fontSize: 13, color: '#c0392b',
                          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                          transition: 'background 0.1s'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fdf0ee'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink to="/search">Explore</NavLink>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, padding: '32px 0 72px' }}>
        <div className="container page-enter">
          <Outlet />
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-light)', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10 }}>✦</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-muted)' }}>NotesMind</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {user ? (
              <>
                {[
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/search', label: 'Search' },
                  { to: '/bookmarks', label: 'Bookmarks' },
                ].map(l => (
                  <Link key={l.to} to={l.to} style={{ fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}>
                    {l.label}
                  </Link>
                ))}
              </>
            ) : (
              <>
                {[{ to: '/search', label: 'Explore' }, { to: '/register', label: 'Sign up' }].map(l => (
                  <Link key={l.to} to={l.to} style={{ fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}>
                    {l.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </footer>

      <style>{`@keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

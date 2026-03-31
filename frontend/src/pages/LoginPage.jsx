import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--parchment)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:52, height:52, background:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:22, margin:'0 auto 16px' }}>✦</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--ink)', fontWeight:400 }}>Welcome back</h1>
          <p style={{ color:'var(--ink-muted)', marginTop:6, fontSize:14 }}>Sign in to your NotesMind account</p>
        </div>

        <div className="card" style={{ padding:28 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background:'#fdf0ee', border:'1px solid #f0c4bc', borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:16, fontSize:13, color:'#c0392b' }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', marginTop:4, padding:'12px' }}>
              {loading ? <><span className="spinner" />Signing in...</> : 'Sign in'}
            </button>
          </form>
          <div style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--ink-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--accent)', fontWeight:500 }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

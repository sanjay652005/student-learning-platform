import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useToast } from '../components/Toast';

const ACCEPTED_TYPES = { 'application/pdf': 'PDF', 'text/plain': 'TXT', 'text/markdown': 'MD' };
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadPage() {
  const [form, setForm] = useState({ title: '', description: '', visibility: 'private', textContent: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'text'
  const fileInput = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  const validateFile = f => {
    if (!f) return null;
    if (!ACCEPTED_TYPES[f.type]) return 'Only PDF, TXT, and MD files are supported';
    if (f.size > MAX_SIZE) return `File too large — max 10MB (this file is ${(f.size / 1024 / 1024).toFixed(1)}MB)`;
    return null;
  };

  const handleFile = f => {
    const error = validateFile(f);
    if (error) { toast.error(error); return; }
    setFile(f);
    // Auto-fill title from filename if empty
    if (!form.title.trim()) {
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setForm(prev => ({ ...prev, title: name.charAt(0).toUpperCase() + name.slice(1) }));
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (inputMode === 'file' && !file) { toast.error('Please select a file to upload'); return; }
    if (inputMode === 'text' && !form.textContent.trim()) { toast.error('Please enter some text content'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('visibility', form.visibility);
      if (inputMode === 'file' && file) fd.append('file', file);
      else fd.append('textContent', form.textContent);

      const res = await notesAPI.upload(fd);
      toast.success('Note uploaded! AI is processing tags…');
      navigate(`/notes/${res.data.note._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const charCount = form.textContent.length;
  const wordCount = form.textContent.trim() ? form.textContent.trim().split(/\s+/).length : 0;

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>
          Upload a note
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
          AI automatically generates tags and enables chat, quiz, and semantic search
        </p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit}>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title <span style={{ color: '#c0392b' }}>*</span></label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Introduction to Machine Learning"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              maxLength={200}
              required
            />
            <div style={{ fontSize: 11, color: 'var(--ink-muted)', textAlign: 'right', marginTop: 3 }}>
              {form.title.length}/200
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="form-textarea"
              placeholder="Brief description of the content…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              maxLength={1000}
            />
          </div>

          {/* Visibility */}
          <div className="form-group">
            <label className="form-label">Visibility</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { value: 'private', icon: '🔒', label: 'Private', desc: 'Only you' },
                { value: 'public', icon: '🌐', label: 'Public', desc: 'Anyone can view & use AI' },
              ].map(opt => (
                <label key={opt.value} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', border: `1.5px solid ${form.visibility === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: form.visibility === opt.value ? 'rgba(196,98,45,0.05)' : 'transparent',
                  transition: 'all 0.15s'
                }}>
                  <input type="radio" name="visibility" value={opt.value} checked={form.visibility === opt.value}
                    onChange={() => setForm(f => ({ ...f, visibility: opt.value }))}
                    style={{ accentColor: 'var(--accent)' }} />
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{opt.icon} {opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 1 }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Input mode toggle */}
          <div className="form-group">
            <label className="form-label">Content source</label>
            <div style={{ display: 'flex', gap: 4, background: 'var(--parchment-dark)', padding: 3, borderRadius: 'var(--radius-md)', width: 'fit-content', marginBottom: 14 }}>
              {[{ key: 'file', label: '📎 Upload file' }, { key: 'text', label: '✏️ Paste text' }].map(m => (
                <button key={m.key} type="button" onClick={() => setInputMode(m.key)} className="btn btn-sm"
                  style={{
                    background: inputMode === m.key ? 'var(--surface)' : 'transparent',
                    color: inputMode === m.key ? 'var(--accent)' : 'var(--ink-muted)',
                    border: 'none', fontWeight: inputMode === m.key ? 500 : 400,
                    boxShadow: inputMode === m.key ? 'var(--shadow-sm)' : 'none'
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            {inputMode === 'file' ? (
              /* Drop zone */
              <div
                style={{
                  border: `2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--sage)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', padding: '28px 20px', textAlign: 'center',
                  cursor: 'pointer', background: dragOver ? 'rgba(196,98,45,0.04)' : file ? 'rgba(90,122,92,0.04)' : 'var(--parchment)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => fileInput.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {file ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {ACCEPTED_TYPES[file.type] === 'PDF' ? '📕' : '📄'}
                    </div>
                    <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 15, marginBottom: 4 }}>{file.name}</div>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 12 }}>
                      {ACCEPTED_TYPES[file.type]} · {(file.size / 1024).toFixed(0)} KB
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      style={{ marginTop: 10, color: '#c0392b', fontSize: 12 }}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10, color: 'var(--ink-muted)' }}>⬆</div>
                    <div style={{ fontSize: 14, color: 'var(--ink-light)', fontWeight: 500, marginBottom: 4 }}>
                      {dragOver ? 'Drop it here!' : 'Drop file here or click to browse'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>PDF, TXT, or MD · max 10MB</div>
                  </div>
                )}
              </div>
            ) : (
              /* Text area */
              <div>
                <textarea
                  className="form-textarea"
                  placeholder="Paste your notes, lecture content, or any text here…"
                  value={form.textContent}
                  onChange={e => setForm(f => ({ ...f, textContent: e.target.value }))}
                  rows={10}
                  style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 4, fontSize: 11, color: 'var(--ink-muted)' }}>
                  <span>{wordCount} words</span>
                  <span>{charCount.toLocaleString()} chars</span>
                </div>
              </div>
            )}
            <input ref={fileInput} type="file" accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
              style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading} style={{ minWidth: 160 }}>
              {uploading
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Processing…</>
                : '✦ Upload & process'}
            </button>
          </div>
        </form>
      </div>

      {/* Info panel */}
      <div style={{
        marginTop: 16, padding: '14px 18px',
        background: 'rgba(90,122,92,0.08)', border: '1px solid rgba(90,122,92,0.2)',
        borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--sage)'
      }}>
        <strong>✦ What happens after upload:</strong>
        <ul style={{ listStyle: 'none', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <li>→ Text is extracted from your file</li>
          <li>→ AI generates relevant tags automatically</li>
          <li>→ Content is indexed for semantic search</li>
          <li>→ Chat and quiz features become available immediately</li>
        </ul>
      </div>
    </div>
  );
}

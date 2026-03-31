import { Link } from 'react-router-dom';

const features = [
  { icon: '📤', title: 'Upload & Extract', desc: 'Drop in PDFs or paste text. We extract and index every word automatically.' },
  { icon: '✦', title: 'AI Summaries', desc: 'Get instant key points, concepts, and explanations generated from your notes.' },
  { icon: '💬', title: 'Chat with Notes', desc: 'Ask questions and get answers grounded strictly in your note content.' },
  { icon: '🧠', title: 'Generate Quizzes', desc: 'Test yourself with AI-generated MCQs and short-answer questions.' },
  { icon: '🔍', title: 'Semantic Search', desc: 'Find notes by meaning, not just keywords, using vector similarity.' },
  { icon: '🔒', title: 'Access Control', desc: 'Keep notes private, make them public, or share with specific users.' },
];

export default function LandingPage() {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero */}
      <section style={{
        minHeight: '72vh', display: 'flex', alignItems: 'center',
        position: 'relative', paddingTop: 40
      }}>
        {/* Decorative background blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,98,45,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(90,122,92,0.07) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 720, position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(196,98,45,0.08)', border: '1px solid rgba(196,98,45,0.2)',
            borderRadius: 40, padding: '6px 14px', marginBottom: 28
          }}>
            <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>✦ AI-Powered Learning Platform</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 24
          }}>
            Your notes,{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>amplified</em>{' '}
            by AI
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--ink-muted)',
            lineHeight: 1.7, maxWidth: 560, marginBottom: 40
          }}>
            Upload your PDFs and notes. NotesMind generates summaries, lets you chat
            with your content, and creates quizzes — so you learn faster and retain more.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for free →
            </Link>
            <Link to="/search" className="btn btn-outline btn-lg">
              Browse public notes
            </Link>
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'AI chats / day', value: '10' },
              { label: 'Quizzes / day', value: '5' },
              { label: 'File types', value: 'PDF, TXT, MD' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 12 }}>
            Everything you need to learn deeply
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            From raw notes to mastered knowledge — NotesMind handles the heavy lifting.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div key={f.title} className="card" style={{
              padding: 24,
              animation: `fadeUp 0.4s ease ${i * 0.06}s both`
            }}>
              <div style={{
                width: 44, height: 44, background: 'var(--parchment-dark)',
                borderRadius: 'var(--radius-md)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 14
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--ink)', marginBottom: 8, fontWeight: 400 }}>
                {f.title}
              </h3>
              <p style={{ color: 'var(--ink-muted)', fontSize: 13, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-light)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, textAlign: 'center', marginBottom: 48, color: 'var(--ink)' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {[
            { step: '01', title: 'Upload', desc: 'Add PDFs, text files, or paste content directly' },
            { step: '02', title: 'Process', desc: 'AI extracts text, generates tags and embeddings' },
            { step: '03', title: 'Learn', desc: 'Chat, quiz yourself, and search semantically' },
            { step: '04', title: 'Share', desc: 'Keep private or publish for others to discover' },
          ].map((s, i) => (
            <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', position: 'relative' }}>
              {i < 3 && (
                <div style={{ position: 'absolute', right: -4, top: '40%', color: 'var(--border)', fontSize: 20, display: 'none' }}>→</div>
              )}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--parchment-darker)',
                fontWeight: 400, lineHeight: 1, marginBottom: 12, letterSpacing: '-0.02em'
              }}>{s.step}</div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 6, fontWeight: 400 }}>{s.title}</h4>
              <p style={{ color: 'var(--ink-muted)', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section style={{
        margin: '40px 0 20px',
        background: 'var(--ink)', borderRadius: 'var(--radius-xl)',
        padding: '48px 40px', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(196,98,45,0.2) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'white', fontWeight: 400, marginBottom: 12, position: 'relative' }}>
          Ready to study smarter?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 28, position: 'relative' }}>
          Free to start. No credit card required.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg" style={{ position: 'relative', background: 'var(--accent)' }}>
          Create free account →
        </Link>
      </section>

      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

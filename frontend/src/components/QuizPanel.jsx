import { useState } from 'react';
import { notesAPI } from '../services/api';
import { useToast } from './Toast';

export default function QuizPanel({ noteId }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const toast = useToast();

  const fetchQuiz = async () => {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await notesAPI.quiz(noteId);
      setQuiz(res.data.quiz);
      setUsageInfo(res.data.usage);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to generate quiz';
      if (status === 429) {
        toast.warning(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const mcqScore = quiz?.mcq
    ? quiz.mcq.filter((q, i) => String(answers[`mcq-${i}`]) === String(q.correctAnswer)).length
    : 0;
  const totalMcq = quiz?.mcq?.length || 0;
  const scorePercent = totalMcq ? Math.round((mcqScore / totalMcq) * 100) : 0;

  const scoreColor = scorePercent >= 80 ? 'var(--sage)' : scorePercent >= 50 ? 'var(--gold)' : '#c0392b';
  const scoreEmoji = scorePercent >= 80 ? '🎉' : scorePercent >= 50 ? '📚' : '💪';
  const scoreMsg = scorePercent >= 80 ? 'Excellent work!' : scorePercent >= 50 ? 'Good effort — keep reviewing!' : 'Keep studying and try again!';

  /* ── Intro screen ─────────────────────────────────────── */
  if (!quiz && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 20px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🧠</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', fontWeight: 400, marginBottom: 8 }}>
          Test your knowledge
        </h3>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.6 }}>
          AI generates 5 multiple choice questions and 3 short answer questions from this note's content.
        </p>
        {usageInfo && (
          <div style={{ marginBottom: 16, fontSize: 13, color: usageInfo.used >= usageInfo.limit ? '#c0392b' : 'var(--ink-muted)' }}>
            {usageInfo.used}/{usageInfo.limit} quizzes used today
          </div>
        )}
        <button className="btn btn-primary btn-lg" onClick={fetchQuiz}>
          Generate quiz ✦
        </button>
      </div>
    );
  }

  /* ── Loading ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 64 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <span style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Generating quiz from note content…</span>
        <span style={{ color: 'var(--ink-muted)', fontSize: 12 }}>This takes about 10–15 seconds</span>
      </div>
    );
  }

  /* ── Error state ──────────────────────────────────────── */
  if (!quiz?.mcq?.length && !quiz?.shortAnswer?.length) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: 'var(--ink-muted)', marginBottom: 20 }}>Quiz could not be generated for this note.</p>
        <button className="btn btn-outline" onClick={fetchQuiz}>Try again</button>
      </div>
    );
  }

  /* ── Quiz ─────────────────────────────────────────────── */
  const allMcqAnswered = quiz.mcq ? Object.keys(answers).filter(k => k.startsWith('mcq')).length >= totalMcq : true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Score banner */}
      {submitted && (
        <div style={{
          background: `${scoreColor}18`, border: `1px solid ${scoreColor}40`,
          borderRadius: 'var(--radius-lg)', padding: '18px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <div>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{scoreEmoji} {scoreMsg}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              {mcqScore} of {totalMcq} multiple choice correct
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '2.5rem',
            color: scoreColor, fontWeight: 400, lineHeight: 1
          }}>
            {scorePercent}%
          </div>
        </div>
      )}

      {/* Usage indicator */}
      {usageInfo && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 400 }}>
            Multiple Choice
          </h3>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            {usageInfo.used}/{usageInfo.limit} quizzes today
          </span>
        </div>
      )}

      {/* MCQ section */}
      {quiz.mcq?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!usageInfo && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 400 }}>Multiple Choice</h3>}
          {quiz.mcq.map((q, qi) => {
            const selected = answers[`mcq-${qi}`];
            const isCorrect = submitted && String(selected) === String(q.correctAnswer);
            const isWrong   = submitted && selected !== undefined && String(selected) !== String(q.correctAnswer);
            return (
              <div key={qi} className="card" style={{
                padding: 18,
                borderLeft: `3px solid ${isCorrect ? 'var(--sage)' : isWrong ? '#c0392b' : 'var(--border)'}`
              }}>
                <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--ink-muted)', marginRight: 6 }}>{qi + 1}.</span>
                  {q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {q.options?.map((opt, oi) => {
                    const isSelected = String(selected) === String(oi);
                    const isAnswer   = submitted && String(oi) === String(q.correctAnswer);
                    return (
                      <label key={oi} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 13px', borderRadius: 'var(--radius-sm)', cursor: submitted ? 'default' : 'pointer',
                        background: isAnswer && submitted ? 'rgba(90,122,92,0.1)' : isSelected && !submitted ? 'rgba(196,98,45,0.07)' : 'transparent',
                        border: `1px solid ${isAnswer && submitted ? 'var(--sage)' : isSelected && !submitted ? 'var(--accent)' : 'var(--border-light)'}`,
                        fontSize: 13, color: 'var(--ink)', transition: 'all 0.1s',
                        userSelect: 'none'
                      }}>
                        <input type="radio" name={`mcq-${qi}`} value={oi}
                          disabled={submitted} checked={isSelected}
                          onChange={() => !submitted && setAnswers(prev => ({ ...prev, [`mcq-${qi}`]: oi }))}
                          style={{ accentColor: 'var(--accent)', flexShrink: 0 }}
                        />
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isAnswer && submitted && (
                          <span style={{ color: 'var(--sage)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>✓</span>
                        )}
                        {isSelected && isWrong && String(oi) === String(selected) && (
                          <span style={{ color: '#c0392b', fontSize: 12, flexShrink: 0 }}>✗</span>
                        )}
                      </label>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <div style={{
                    marginTop: 12, padding: '9px 12px',
                    background: 'var(--parchment)', borderRadius: 'var(--radius-sm)',
                    fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55,
                    borderLeft: '3px solid var(--gold)'
                  }}>
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Short answer section */}
      {quiz.shortAnswer?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 400 }}>
            Short Answer
          </h3>
          {quiz.shortAnswer.map((q, qi) => (
            <div key={qi} className="card" style={{ padding: 18 }}>
              <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--ink-muted)', marginRight: 6 }}>{qi + 1}.</span>
                {q.question}
              </p>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Write your answer here…"
                disabled={submitted}
                value={answers[`sa-${qi}`] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [`sa-${qi}`]: e.target.value }))}
                style={{ fontSize: 13 }}
              />
              {submitted && (
                <div style={{
                  marginTop: 10, padding: '10px 14px',
                  background: 'rgba(90,122,92,0.08)', border: '1px solid rgba(90,122,92,0.25)',
                  borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--sage)', lineHeight: 1.55
                }}>
                  <strong>Model answer:</strong> {q.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        {!submitted ? (
          <>
            <button
              className="btn btn-primary"
              onClick={() => setSubmitted(true)}
              disabled={!allMcqAnswered}
              title={!allMcqAnswered ? 'Answer all multiple choice questions first' : ''}
            >
              Submit answers
            </button>
            <button className="btn btn-ghost btn-sm" onClick={fetchQuiz} style={{ color: 'var(--ink-muted)' }}>
              ↺ New quiz
            </button>
          </>
        ) : (
          <button className="btn btn-outline" onClick={fetchQuiz}>
            ↺ Generate new quiz
          </button>
        )}
      </div>
    </div>
  );
}

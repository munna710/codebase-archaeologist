import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { askQuestion } from '../api/chat';

function Chat() {
  const { id } = useParams();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]); // array of { question, answer, relevantClasses }
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setAsking(true);
    setError(null);

    try {
      const result = await askQuestion(id, trimmedQuestion);

      // Prepend so the newest question appears at the top.
      setHistory((prev) => [
        { question: trimmedQuestion, answer: result.answer, relevantClasses: result.relevantClasses },
        ...prev,
      ]);
      setQuestion('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to get an answer. Please try again.'
      );
    } finally {
      setAsking(false);
    }
  };

  return (
    <div>
      <h1>Ask About This Codebase</h1>
      <p style={{ color: '#64748b' }}>
        Ask a question in plain English — e.g. "Where is payment validation handled?"
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Where is...?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={asking}
          style={{ width: '500px', maxWidth: '100%' }}
        />
        <button type="submit" disabled={asking || !question.trim()}>
          {asking ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {history.length === 0 && !asking && (
        <p style={{ color: '#94a3b8' }}>No questions asked yet.</p>
      )}

      {history.map((entry, index) => (
        <div
          key={index}
          style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Q: {entry.question}</p>
          <p style={{ whiteSpace: 'pre-wrap', marginBottom: '0.75rem' }}>{entry.answer}</p>

          {entry.relevantClasses.length > 0 && (
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Related classes:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {entry.relevantClasses.map((cls) => (
                  <Link
                    key={cls.classId}
                    to={`/projects/${id}/classes/${cls.classId}`}
                    style={{
                      fontSize: '0.85rem',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '999px',
                      textDecoration: 'none',
                    }}
                  >
                    {cls.className}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Chat;
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyzeError } from '../api/debug';
import MarkdownContent from '../components/MarkdownContent';

const SAMPLE_TRACE = `java.lang.NullPointerException: Cannot invoke "String.length()" because "name" is null
	at com.example.owner.OwnerController.processCreationForm(OwnerController.java:89)
	at com.example.owner.Owner.validate(Owner.java:45)`;

function Debug() {
  const { id } = useParams();
  const [stackTrace, setStackTrace] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = stackTrace.trim();
    if (!trimmed) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeError(id, trimmed);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze the error. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <h1>Debug an Error</h1>
      <p style={{ color: '#64748b' }}>
        Paste a stack trace or error message below. The system will identify likely
        classes involved, using both the stack trace itself and a search across the codebase.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={stackTrace}
          onChange={(e) => setStackTrace(e.target.value)}
          placeholder="Paste your stack trace or error message here..."
          rows={10}
          disabled={analyzing}
          style={{
            width: '100%',
            maxWidth: '700px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            padding: '0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            display: 'block',
          }}
        />

        <div style={{ marginTop: '0.75rem' }}>
          <button type="submit" disabled={analyzing || !stackTrace.trim()}>
            {analyzing ? 'Analyzing...' : 'Find Likely Cause'}
          </button>
          {' '}
          <button
            type="button"
            onClick={() => setStackTrace(SAMPLE_TRACE)}
            disabled={analyzing}
            style={{ backgroundColor: '#64748b' }}
          >
            Try a Sample
          </button>
        </div>
      </form>

      {error && <p style={{ color: '#dc2626', marginTop: '1rem' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            {result.exceptionType && (
              <p>
                <strong>Exception:</strong> {result.exceptionType}
              </p>
            )}
            {result.exceptionMessage && (
              <p style={{ color: '#64748b' }}>"{result.exceptionMessage}"</p>
            )}
          </div>

          <div
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #7dd3fc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Analysis</h3>
            <div style={{ marginBottom: '0.75rem' }}><MarkdownContent content={result.aiAnalysis} /></div>
          </div>

          {result.likelyClasses.length > 0 && (
            <div>
              <h3>Likely Classes Involved</h3>
              {result.likelyClasses.map((cls) => (
                <div
                  key={cls.classId}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Link to={`/projects/${id}/classes/${cls.classId}`} style={{ fontWeight: 'bold' }}>
                      {cls.className}
                    </Link>
                    <span style={{ color: '#64748b', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                      {cls.packageName}
                    </span>
                  </div>
                  {cls.relevanceScore === 100 && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontWeight: 'bold',
                      }}
                    >
                      In stack trace
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Debug;
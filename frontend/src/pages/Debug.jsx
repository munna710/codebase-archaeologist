
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyzeError } from '../api/debug';
import MarkdownContent from '../components/MarkdownContent';

import '../theme.css';
import './debug.css';

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
      setError(
        err.response?.data?.message ||
        'Failed to analyze the error. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="debug-page">

      {/* Header */}
      <header className="debug-header">
        <div>
          <h1>Debug an Error</h1>
          <p>
            Paste a stack trace or error message below. The system will identify
            likely classes involved using both the stack trace itself and a
            search across the codebase.
          </p>
        </div>

        <Link
          to={`/projects/${id}`}
          className="debug-back-link"
        >
          ← Project Overview
        </Link>
      </header>

      {/* Input Card */}
      <section className="debug-input-card">
        <div className="debug-section-header">
          <div>
            <h2>Error Input</h2>
            <p>
              Provide the stack trace or exception message you want to investigate.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={stackTrace}
            onChange={(e) => setStackTrace(e.target.value)}
            placeholder="Paste your stack trace or error message here..."
            rows={10}
            disabled={analyzing}
            className="debug-textarea"
          />

          <div className="debug-actions">
            <button
              type="submit"
              disabled={analyzing || !stackTrace.trim()}
              className="debug-primary-btn"
            >
              {analyzing ? (
                <>
                  <span className="debug-button-spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Find Likely Cause'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStackTrace(SAMPLE_TRACE)}
              disabled={analyzing}
              className="debug-sample-btn"
            >
              Try a Sample
            </button>
          </div>
        </form>
      </section>

      {/* Error */}
      {error && (
        <div className="debug-error">
          <span className="debug-error-icon">!</span>
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="debug-results">

          {/* Exception Information */}
          {(result.exceptionType || result.exceptionMessage) && (
            <section className="exception-card">
              <div className="exception-header">
                <span className="exception-icon">!</span>
                <div>
                  <h2>Exception Detected</h2>
                  <span>Parsed from the supplied error information</span>
                </div>
              </div>

              {result.exceptionType && (
                <div className="exception-type">
                  {result.exceptionType}
                </div>
              )}

              {result.exceptionMessage && (
                <p className="exception-message">
                  "{result.exceptionMessage}"
                </p>
              )}
            </section>
          )}

          {/* AI Analysis */}
          <section className="debug-analysis-card">
            <div className="debug-analysis-header">
              <div className="analysis-icon">
                ✦
              </div>

              <div>
                <h2>Analysis</h2>
                <p>
                  AI-generated analysis based on the error and project source code.
                </p>
              </div>
            </div>

            <div className="debug-analysis-content">
              <MarkdownContent content={result.aiAnalysis} />
            </div>
          </section>

          {/* Likely Classes */}
          {result.likelyClasses?.length > 0 && (
            <section className="likely-classes-section">

              <div className="likely-classes-header">
                <div>
                  <h2>Likely Classes Involved</h2>
                  <p>
                    Classes identified from the stack trace and codebase search.
                  </p>
                </div>

                <span className="class-count">
                  {result.likelyClasses.length}{' '}
                  {result.likelyClasses.length === 1 ? 'class' : 'classes'}
                </span>
              </div>

              <div className="likely-classes-list">
                {result.likelyClasses.map((cls) => (
                  <div
                    key={cls.classId}
                    className="likely-class-card"
                  >
                    <div className="likely-class-info">

                      <div className="class-symbol">
                        C
                      </div>

                      <div className="class-details">
                        <Link
                          to={`/projects/${id}/classes/${cls.classId}`}
                          className="class-name"
                        >
                          {cls.className}
                        </Link>

                        <span className="package-name">
                          {cls.packageName}
                        </span>
                      </div>

                    </div>

                    {cls.relevanceScore === 100 && (
                      <span className="stack-trace-badge">
                        In stack trace
                      </span>
                    )}
                  </div>
                ))}
              </div>

            </section>
          )}

        </div>
      )}

    </div>
  );
}

export default Debug;


import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCommits, explainCommit } from '../api/commits';

const CHANGE_TYPE_COLORS = {
  ADD: '#16a34a',
  MODIFY: '#d97706',
  DELETE: '#dc2626',
  RENAME: '#2563eb',
};

function Commits() {
  const { id } = useParams();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCommitId, setSelectedCommitId] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState(null);

  useEffect(() => {
    getCommits(id)
      .then(setCommits)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load commit history.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExplain = async (commit) => {
    setSelectedCommitId(commit.commitId);
    setExplaining(true);
    setExplainError(null);
    setExplanation(null);

    try {
      const data = await explainCommit(id, commit.commitId);
      setExplanation(data);
    } catch (err) {
      setExplainError(err.response?.data?.message || 'Failed to explain this commit.');
    } finally {
      setExplaining(false);
    }
  };

  if (loading) return <p>Loading commit history...</p>;
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;

  return (
    <div>
      <h1>Commit History</h1>
      <p style={{ color: '#64748b' }}>
        Recent commits from the repository. Click "Explain" to get an AI summary of what changed
        and which classes were affected.
      </p>

      {commits.length === 0 && <p>No commit history available.</p>}

      {commits.map((commit) => (
        <div key={commit.commitId} style={{ marginBottom: '0.5rem' }}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <code style={{ color: '#64748b', marginRight: '0.75rem' }}>{commit.shortId}</code>
              <span>{commit.message}</span>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                {commit.authorName} · {new Date(commit.commitDate).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => handleExplain(commit)}
              disabled={explaining && selectedCommitId === commit.commitId}
            >
              {explaining && selectedCommitId === commit.commitId ? 'Explaining...' : 'Explain'}
            </button>
          </div>

          {selectedCommitId === commit.commitId && explainError && (
            <p style={{ color: '#dc2626', marginTop: '0.5rem' }}>{explainError}</p>
          )}

          {selectedCommitId === commit.commitId && explanation && (
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #7dd3fc',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '0.5rem',
              }}
            >
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Changes from {explanation.fromCommit} → {explanation.toCommit}
              </p>

              <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{explanation.aiExplanation}</p>

              {explanation.changedFiles.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    Changed files:
                  </p>
                  {explanation.changedFiles.map((f, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      <span style={{ color: CHANGE_TYPE_COLORS[f.changeType] || '#334155', fontWeight: 'bold' }}>
                        [{f.changeType}]
                      </span>{' '}
                      {f.filePath}
                    </div>
                  ))}
                </div>
              )}

              {explanation.affectedClasses.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    Affected classes:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {explanation.affectedClasses.map((cls) => (
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
          )}
        </div>
      ))}
    </div>
  );
}

export default Commits;
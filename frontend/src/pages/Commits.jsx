
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCommits, explainCommit } from '../api/commits';
import MarkdownContent from '../components/MarkdownContent';

import '../theme.css';
import './commits.css';

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
      .catch((err) =>
        setError(
          err.response?.data?.message ||
          'Failed to load commit history.'
        )
      )
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
      setExplainError(
        err.response?.data?.message ||
        'Failed to explain this commit.'
      );
    } finally {
      setExplaining(false);
    }
  };

  if (loading) {
    return (
      <div className="commits-page">
        <div className="commits-state">
          <div className="commits-spinner"></div>
          <p>Loading commit history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="commits-page">
        <div className="commits-state commits-error">
          <span className="commits-error-icon">!</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="commits-page">

      {/* Header */}
      <header className="commits-header">
        <div>
          <h1>Commit History</h1>
          <p>
            Recent commits from the repository. Explain a commit to get an
            AI summary of what changed and which classes were affected.
          </p>
        </div>

        <Link
          to={`/projects/${id}`}
          className="commits-back-link"
        >
          ← Project Overview
        </Link>
      </header>

      {/* Commit count */}
      {commits.length > 0 && (
        <div className="commits-meta">
          {commits.length} {commits.length === 1 ? 'commit' : 'commits'}
        </div>
      )}

      {/* Empty state */}
      {commits.length === 0 && (
        <div className="commits-state commits-empty">
          <div className="empty-commit-icon">↻</div>

          <h3>No commit history available</h3>

          <p>
            No commits were found for this repository.
          </p>
        </div>
      )}

      {/* Commits */}
      {commits.length > 0 && (
        <section className="commits-list">

          {commits.map((commit) => {
            const isSelected =
              selectedCommitId === commit.commitId;

            const isExplaining =
              explaining &&
              selectedCommitId === commit.commitId;

            return (
              <article
                key={commit.commitId}
                className={`commit-card ${
                  isSelected ? 'commit-card-selected' : ''
                }`}
              >

                {/* Commit Header */}
                <div className="commit-main">

                  <div className="commit-info">

                    <div className="commit-top-row">
                      <code className="commit-hash">
                        {commit.shortId}
                      </code>

                      <span className="commit-message">
                        {commit.message}
                      </span>
                    </div>

                    <div className="commit-meta">
                      <span>{commit.authorName}</span>
                      <span className="meta-separator">·</span>
                      <span>
                        {new Date(commit.commitDate).toLocaleString()}
                      </span>
                    </div>

                  </div>

                  <button
                    onClick={() => handleExplain(commit)}
                    disabled={isExplaining}
                    className={`explain-btn ${
                      isExplaining ? 'explaining' : ''
                    }`}
                  >
                    {isExplaining && (
                      <span className="explain-spinner"></span>
                    )}

                    {isExplaining
                      ? 'Explaining...'
                      : 'Explain'}
                  </button>

                </div>

                {/* Explanation Error */}
                {isSelected && explainError && (
                  <div className="commit-explain-error">
                    <span>!</span>
                    {explainError}
                  </div>
                )}

                {/* Explanation */}
                {isSelected && explanation && (
                  <div className="commit-explanation">

                    {/* Explanation Header */}
                    <div className="explanation-header">
                      <div>
                        <h2>AI Explanation</h2>

                        <p>
                          Changes from{' '}
                          <code>{explanation.fromCommit}</code>
                          {' → '}
                          <code>{explanation.toCommit}</code>
                        </p>
                      </div>

                      <div className="ai-badge">
                        AI
                      </div>
                    </div>

                    {/* AI Content */}
                    <div className="explanation-content">
                      <MarkdownContent
                        content={explanation.aiExplanation}
                      />
                    </div>

                    {/* Changed Files */}
                    {explanation.changedFiles?.length > 0 && (
                      <div className="commit-detail-section">

                        <div className="detail-section-header">
                          <h3>Changed Files</h3>
                          <span>
                            {explanation.changedFiles.length}
                          </span>
                        </div>

                        <div className="changed-files-list">
                          {explanation.changedFiles.map((file, index) => {
                            const changeColor =
                              CHANGE_TYPE_COLORS[file.changeType] ||
                              '#334155';

                            return (
                              <div
                                key={index}
                                className="changed-file"
                              >
                                <span
                                  className="change-type"
                                  style={{
                                    color: changeColor,
                                  }}
                                >
                                  [{file.changeType}]
                                </span>

                                <span className="file-path">
                                  {file.filePath}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    )}

                    {/* Affected Classes */}
                    {explanation.affectedClasses?.length > 0 && (
                      <div className="commit-detail-section">

                        <div className="detail-section-header">
                          <h3>Affected Classes</h3>
                          <span>
                            {explanation.affectedClasses.length}
                          </span>
                        </div>

                        <div className="affected-classes">
                          {explanation.affectedClasses.map((cls) => (
                            <Link
                              key={cls.classId}
                              to={`/projects/${id}/classes/${cls.classId}`}
                              className="affected-class"
                            >
                              <span className="class-icon">C</span>
                              {cls.className}
                            </Link>
                          ))}
                        </div>

                      </div>
                    )}

                  </div>
                )}

              </article>
            );
          })}

        </section>
      )}

    </div>
  );
}

export default Commits;


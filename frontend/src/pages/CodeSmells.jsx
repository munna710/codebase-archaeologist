
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCodeSmells } from '../api/codeSmells';

import '../theme.css';
import './code-smells.css';

const SEVERITY_COLORS = {
  HIGH: {
    bg: '#fef2f2',
    text: '#dc2626',
    border: '#fca5a5',
  },
  MEDIUM: {
    bg: '#fffbeb',
    text: '#d97706',
    border: '#fcd34d',
  },
  LOW: {
    bg: '#f0f9ff',
    text: '#0284c7',
    border: '#7dd3fc',
  },
};

const SMELL_LABELS = {
  GOD_CLASS: 'God Class',
  LONG_PARAMETER_LIST: 'Long Parameter List',
  HIGH_COUPLING: 'High Coupling',
  HUB_CLASS: 'Hub Class',
};

function CodeSmells() {
  const { id } = useParams();

  const [smells, setSmells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    getCodeSmells(id)
      .then(setSmells)
      .catch(() => setError('Failed to load code smells.'))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredSmells = useMemo(() => {
    if (severityFilter === 'ALL') {
      return smells;
    }

    return smells.filter((s) => s.severity === severityFilter);
  }, [smells, severityFilter]);

  const counts = useMemo(() => {
    return {
      HIGH: smells.filter((s) => s.severity === 'HIGH').length,
      MEDIUM: smells.filter((s) => s.severity === 'MEDIUM').length,
      LOW: smells.filter((s) => s.severity === 'LOW').length,
    };
  }, [smells]);

  if (loading) {
    return (
      <div className="code-smells-page">
        <div className="code-smells-state">
          <div className="state-spinner"></div>
          <p>Loading code smells...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="code-smells-page">
        <div className="code-smells-state code-smells-error">
          <span className="state-icon">!</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-smells-page">

      {/* Header */}
      <header className="code-smells-header">
        <div>
          <h1>Code Smells</h1>
          <p>
            Automatically detected patterns that may indicate design issues,
            based on method counts, parameter counts, and dependency counts
            extracted from the codebase.
          </p>
        </div>

        <Link
          to={`/projects/${id}`}
          className="back-project-link"
        >
          ← Project Overview
        </Link>
      </header>

      {/* Severity summary */}
      <section className="smell-summary">

        <button
          className={`severity-filter ${
            severityFilter === 'ALL' ? 'active' : ''
          }`}
          onClick={() => setSeverityFilter('ALL')}
        >
          <span className="filter-count">{smells.length}</span>
          <span className="filter-label">All</span>
        </button>

        <button
          className={`severity-filter severity-high ${
            severityFilter === 'HIGH' ? 'active' : ''
          }`}
          onClick={() => setSeverityFilter('HIGH')}
        >
          <span className="filter-count">{counts.HIGH}</span>
          <span className="filter-label">High</span>
        </button>

        <button
          className={`severity-filter severity-medium ${
            severityFilter === 'MEDIUM' ? 'active' : ''
          }`}
          onClick={() => setSeverityFilter('MEDIUM')}
        >
          <span className="filter-count">{counts.MEDIUM}</span>
          <span className="filter-label">Medium</span>
        </button>

        <button
          className={`severity-filter severity-low ${
            severityFilter === 'LOW' ? 'active' : ''
          }`}
          onClick={() => setSeverityFilter('LOW')}
        >
          <span className="filter-count">{counts.LOW}</span>
          <span className="filter-label">Low</span>
        </button>

      </section>

      {/* Empty state */}
      {smells.length === 0 && (
        <div className="smells-empty success-state">
          <div className="empty-icon">✓</div>
          <h3>No code smells detected</h3>
          <p>
            This codebase looks well-structured according to the
            currently configured heuristics.
          </p>
        </div>
      )}

      {/* Filter empty state */}
      {smells.length > 0 && filteredSmells.length === 0 && (
        <div className="smells-empty">
          <div className="empty-icon muted">—</div>
          <h3>No smells at this severity level</h3>
          <p>
            Try selecting another severity level to see more results.
          </p>
        </div>
      )}

      {/* Results */}
      {filteredSmells.length > 0 && (
        <section className="smells-section">

          <div className="smells-section-header">
            <div>
              <h2>Detected Issues</h2>
              <span>
                Showing {filteredSmells.length}{' '}
                {filteredSmells.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>
          </div>

          <div className="smells-list">
            {filteredSmells.map((smell, index) => {
              const colors =
                SEVERITY_COLORS[smell.severity] ||
                SEVERITY_COLORS.LOW;

              return (
                <article
                  key={index}
                  className="smell-card"
                  style={{
                    '--smell-bg': colors.bg,
                    '--smell-text': colors.text,
                    '--smell-border': colors.border,
                  }}
                >

                  <div className="smell-card-header">

                    <div className="smell-class-info">
                      <span className="smell-index">
                        #{String(index + 1).padStart(2, '0')}
                      </span>

                      <Link
                        to={`/projects/${id}/classes/${smell.classId}`}
                        className="smell-class-link"
                      >
                        {smell.className}
                      </Link>
                    </div>

                    <div className="smell-meta">
                      <span className="smell-type">
                        {SMELL_LABELS[smell.smellType] ||
                          smell.smellType}
                      </span>

                      <span className="severity-badge">
                        {smell.severity}
                      </span>
                    </div>

                  </div>

                  <div className="smell-description">
                    {smell.description}
                  </div>

                </article>
              );
            })}
          </div>

        </section>
      )}

    </div>
  );
}

export default CodeSmells;


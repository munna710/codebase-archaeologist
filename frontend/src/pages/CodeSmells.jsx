import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCodeSmells } from '../api/codeSmells';

const SEVERITY_COLORS = {
  HIGH: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
  MEDIUM: { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' },
  LOW: { bg: '#f0f9ff', text: '#0284c7', border: '#7dd3fc' },
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
    if (severityFilter === 'ALL') return smells;
    return smells.filter((s) => s.severity === severityFilter);
  }, [smells, severityFilter]);

  const counts = useMemo(() => {
    return {
      HIGH: smells.filter((s) => s.severity === 'HIGH').length,
      MEDIUM: smells.filter((s) => s.severity === 'MEDIUM').length,
      LOW: smells.filter((s) => s.severity === 'LOW').length,
    };
  }, [smells]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Code Smells</h1>
      <p style={{ color: '#64748b' }}>
        Automatically detected patterns that may indicate design issues, based on method counts,
        parameter counts, and dependency counts extracted from the codebase.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
          <button
            key={level}
            onClick={() => setSeverityFilter(level)}
            style={{
              backgroundColor: severityFilter === level ? '#2563eb' : '#e2e8f0',
              color: severityFilter === level ? '#fff' : '#334155',
            }}
          >
            {level === 'ALL' ? `All (${smells.length})` : `${level} (${counts[level]})`}
          </button>
        ))}
      </div>

      {smells.length === 0 && (
        <p style={{ color: '#16a34a' }}>
          No code smells detected — this codebase looks well-structured by these heuristics!
        </p>
      )}

      {smells.length > 0 && filteredSmells.length === 0 && (
        <p style={{ color: '#94a3b8' }}>No smells at this severity level.</p>
      )}

      {filteredSmells.map((smell, index) => {
        const colors = SEVERITY_COLORS[smell.severity] || SEVERITY_COLORS.LOW;

        return (
          <div
            key={index}
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Link
                to={`/projects/${id}/classes/${smell.classId}`}
                style={{ fontWeight: 'bold', color: '#1e293b' }}
              >
                {smell.className}
              </Link>
              <span style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.85rem' }}>
                {SMELL_LABELS[smell.smellType] || smell.smellType} · {smell.severity}
              </span>
            </div>
            <p style={{ marginTop: '0.5rem', marginBottom: 0, color: '#475569' }}>
              {smell.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default CodeSmells;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboard';
import ChartDisplay from '../components/ChartDisplay'; // see note below

const STATUS_COLORS = {
  COMPLETED: '#16a34a',
  FAILED: '#dc2626',
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard stats. Is the backend running?'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!stats) return <p>Loading...</p>;

  if (stats.totalProjects === 0) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: '#64748b' }}>You haven't analyzed any projects yet.</p>
        <Link to="/projects/new">
          <button>Add Your First Project</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Files" value={stats.totalFiles} />
        <StatCard label="Classes" value={stats.totalClasses} />
        <StatCard label="Methods" value={stats.totalMethods} />
        <StatCard label="Dependencies" value={stats.totalDependencies} />
        <StatCard
          label="Open Code Smells"
          value={stats.totalCodeSmells}
          color={stats.totalCodeSmells > 0 ? '#d97706' : '#16a34a'}
        />
      </div>

      <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
        {stats.completedProjects} completed · {stats.inProgressProjects} in progress ·{' '}
        <span style={{ color: stats.failedProjects > 0 ? '#dc2626' : 'inherit' }}>
          {stats.failedProjects} failed
        </span>
      </div>

      {stats.topComplexClassName && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
            Most complex class across all your projects
          </p>
          <Link
            to={`/projects/${stats.topComplexClassProjectId}/classes/${stats.topComplexClassId}`}
            style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            {stats.topComplexClassName}
          </Link>
          <span style={{ color: '#64748b' }}>
            {' '}in {stats.topComplexClassProjectName} — complexity score {stats.topComplexClassScore}
          </span>
        </div>
      )}

      <h3>Classes per Project</h3>
      <ChartDisplay projects={stats.projects} />

      <h3 style={{ marginTop: '2rem' }}>Your Projects</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '0.5rem' }}>Project</th>
            <th style={{ padding: '0.5rem' }}>Status</th>
            <th style={{ padding: '0.5rem' }}>Files</th>
            <th style={{ padding: '0.5rem' }}>Classes</th>
            <th style={{ padding: '0.5rem' }}>Smells</th>
            <th style={{ padding: '0.5rem' }}>Added</th>
          </tr>
        </thead>
        <tbody>
          {stats.projects.map((p) => (
            <tr key={p.projectId} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.5rem' }}>
                <Link to={`/projects/${p.projectId}`}>{p.projectName}</Link>
              </td>
              <td style={{ padding: '0.5rem', color: STATUS_COLORS[p.status] || '#64748b' }}>
                {p.status}
              </td>
              <td style={{ padding: '0.5rem' }}>{p.fileCount}</td>
              <td style={{ padding: '0.5rem' }}>{p.classCount}</td>
              <td style={{ padding: '0.5rem' }}>{p.smellCount > 0 ? p.smellCount : '—'}</td>
              <td style={{ padding: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                {new Date(p.uploadedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem 1.5rem',
        minWidth: '120px',
      }}
    >
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: color || '#1e293b' }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</div>
    </div>
  );
}

export default Dashboard;
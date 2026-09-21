import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboard';
import ChartDisplay from '../components/ChartDisplay';

import '../theme.css';
import './login.css';

const fmt = (n) => Number(n ?? 0).toLocaleString();

function formatStatus(status) {
  if (!status) return 'Unknown';
  const text = status.toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setError('');
    setStats(null);

    getDashboardStats()
      .then((data) => {
        if (!ignore) setStats(data);
      })
      .catch(() => {
        if (!ignore) {
          setError("We couldn't load the dashboard stats. Check that the backend is running, then try again.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [attempt]);

  const header = (
    <header className="dash-header">
      <h1 className="h2 mb-1">Dashboard</h1>
      <p className="text-body-secondary mb-0">Everything analyzed so far.</p>
    </header>
  );

  if (error) {
    return (
      <main className="dash-page">
        {header}
        <div className="alert alert-danger dash-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setAttempt((a) => a + 1)}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="dash-page">
        {header}
        <div className="dash-status" role="status" aria-live="polite">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span>Loading dashboard…</span>
        </div>
      </main>
    );
  }

  if (stats.totalProjects === 0) {
    return (
      <main className="dash-page">
        {header}
        <div className="card">
          <div className="card-body p-4">
            <p className="text-body-secondary mb-3">You haven't analyzed any projects yet.</p>
            <Link to="/projects/new" className="btn btn-primary">
              Add your first project
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const hasSmells = stats.totalCodeSmells > 0;

  const cells = [
    { label: 'Projects', value: stats.totalProjects },
    { label: 'Files', value: stats.totalFiles },
    { label: 'Classes', value: stats.totalClasses },
    { label: 'Methods', value: stats.totalMethods },
    { label: 'Dependencies', value: stats.totalDependencies },
    { label: 'Open code smells', value: stats.totalCodeSmells, warn: hasSmells },
  ];

  return (
    <main className="dash-page">
      {header}

      <dl className="dash-grid">
        {cells.map(({ label, value, warn }) => (
          <div key={label} className="dash-cell">
            <dt className="dash-label">{label}</dt>
            <dd className={`dash-value ${warn ? 'is-warn' : ''}`}>{fmt(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="scale-bar" aria-hidden="true" />

      <p className="dash-summary">
        <span>{fmt(stats.completedProjects)} completed</span>
        <span>{fmt(stats.inProgressProjects)} in progress</span>
        <span className={stats.failedProjects > 0 ? 'is-bad' : ''}>{fmt(stats.failedProjects)} failed</span>
      </p>

      {stats.topComplexClassName && (
        <div className="dash-callout">
          <p className="dash-callout-label">Most complex class across all your projects</p>
          <Link
            className="dash-callout-link"
            to={`/projects/${stats.topComplexClassProjectId}/classes/${stats.topComplexClassId}`}
          >
            {stats.topComplexClassName}
          </Link>
          <p className="dash-callout-meta">
            in {stats.topComplexClassProjectName}, complexity score {stats.topComplexClassScore}
          </p>
        </div>
      )}

      <section className="dash-section">
        <h2 className="h5">Classes per project</h2>
        <div className="dash-panel">
          <ChartDisplay projects={stats.projects} />
        </div>
      </section>

      <section className="dash-section">
        <h2 className="h5">Your projects</h2>
        <div className="dash-table-wrap">
          <table className="table dash-table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">Status</th>
                <th scope="col" className="dash-num">Files</th>
                <th scope="col" className="dash-num">Classes</th>
                <th scope="col" className="dash-num">Smells</th>
                <th scope="col">Added</th>
              </tr>
            </thead>
            <tbody>
              {stats.projects.map((p) => (
                <tr key={p.projectId}>
                  <td>
                    <Link className="dash-project-link" to={`/projects/${p.projectId}`}>
                      {p.projectName}
                    </Link>
                  </td>
                  <td>
                    <span className={`dash-tag dash-tag--${(p.status || '').toLowerCase()}`}>
                      {formatStatus(p.status)}
                    </span>
                  </td>
                  <td className="dash-num">{fmt(p.fileCount)}</td>
                  <td className="dash-num">{fmt(p.classCount)}</td>
                  <td className="dash-num">{p.smellCount > 0 ? fmt(p.smellCount) : '—'}</td>
                  <td className="dash-date">{new Date(p.uploadedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
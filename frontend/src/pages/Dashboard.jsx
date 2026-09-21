
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboard';
import ChartDisplay from '../components/ChartDisplay';

import '../theme.css';
import './dashboard.css';

const STATUS_COLORS = {
  COMPLETED: '#16a34a',
  FAILED: '#dc2626',
  CLONING: '#2563eb',
  PARSING: '#2563eb',
  ANALYZING_DEPENDENCIES: '#2563eb',
  PENDING: '#64748b',
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() =>
        setError('Failed to load dashboard stats. Is the backend running?')
      );
  }, []);

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (stats.totalProjects === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your analyzed codebases.</p>
          </div>
        </div>

        <div className="dashboard-empty">
          <div className="empty-icon">📊</div>
          <h2>No projects yet</h2>
          <p>
            You haven't analyzed any projects yet. Add your first project
            to start exploring your codebase.
          </p>

          <Link to="/projects/new" className="dashboard-primary-btn">
            Add Your First Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your analyzed codebases.</p>
        </div>

        <Link to="/projects/new" className="dashboard-primary-btn">
          + Add Project
        </Link>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <StatCard
          label="Projects"
          value={stats.totalProjects}
          icon="📁"
        />

        <StatCard
          label="Files"
          value={stats.totalFiles}
          icon="📄"
        />

        <StatCard
          label="Classes"
          value={stats.totalClasses}
          icon="▣"
        />

        <StatCard
          label="Methods"
          value={stats.totalMethods}
          icon="ƒ"
        />

        <StatCard
          label="Dependencies"
          value={stats.totalDependencies}
          icon="↗"
        />

        <StatCard
          label="Open Code Smells"
          value={stats.totalCodeSmells}
          icon="⚠"
          color={stats.totalCodeSmells > 0 ? '#d97706' : '#16a34a'}
        />
      </div>

      {/* Project status summary */}
      <div className="status-summary">
        <div className="status-item">
          <span className="status-dot completed"></span>
          <strong>{stats.completedProjects}</strong>
          <span>Completed</span>
        </div>

        <div className="status-item">
          <span className="status-dot progress"></span>
          <strong>{stats.inProgressProjects}</strong>
          <span>In Progress</span>
        </div>

        <div className="status-item">
          <span className="status-dot failed"></span>
          <strong>{stats.failedProjects}</strong>
          <span>Failed</span>
        </div>
      </div>

      {/* Most complex class */}
      {stats.topComplexClassName && (
        <div className="complexity-card">
          <div className="complexity-icon">⚠</div>

          <div className="complexity-content">
            <div className="complexity-label">
              Most Complex Class
            </div>

            <Link
              to={`/projects/${stats.topComplexClassProjectId}/classes/${stats.topComplexClassId}`}
              className="complexity-class-name"
            >
              {stats.topComplexClassName}
            </Link>

            <div className="complexity-meta">
              {stats.topComplexClassProjectName}
              <span>•</span>
              Complexity score: {stats.topComplexClassScore}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Classes per Project</h2>
            <p>Number of classes detected in each project.</p>
          </div>
        </div>

        <div className="chart-card">
          <ChartDisplay projects={stats.projects} />
        </div>
      </section>

      {/* Projects table */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Your Projects</h2>
            <p>Overview of your analyzed repositories.</p>
          </div>

          <Link to="/projects" className="view-all-link">
            View all →
          </Link>
        </div>

        <div className="projects-table-card">
          <div className="table-wrapper">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th>Classes</th>
                  <th>Smells</th>
                  <th>Added</th>
                </tr>
              </thead>

              <tbody>
                {stats.projects.map((p) => (
                  <tr key={p.projectId}>
                    <td>
                      <Link
                        to={`/projects/${p.projectId}`}
                        className="project-name-link"
                      >
                        {p.projectName}
                      </Link>
                    </td>

                    <td>
                      <span
                        className="project-status"
                        style={{
                          color:
                            STATUS_COLORS[p.status] || '#64748b',
                        }}
                      >
                        <span
                          className="status-indicator"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[p.status] || '#64748b',
                          }}
                        ></span>

                        {p.status}
                      </span>
                    </td>

                    <td>{p.fileCount}</td>

                    <td>{p.classCount}</td>

                    <td>
                      {p.smellCount > 0 ? (
                        <span className="smell-count">
                          {p.smellCount}
                        </span>
                      ) : (
                        <span className="no-smells">—</span>
                      )}
                    </td>

                    <td className="date-cell">
                      {new Date(p.uploadedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <div
        className="stat-value"
        style={{ color: color || '#9eb0cd' }}
      >
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>
    </div>
  );
}

export default Dashboard;


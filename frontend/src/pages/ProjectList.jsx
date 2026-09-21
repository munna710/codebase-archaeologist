
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../api/projects';

import '../theme.css';
import './project-list.css';

const STATUS_STYLES = {
  COMPLETED: {
    className: 'status-completed',
    label: 'Completed',
  },
  FAILED: {
    className: 'status-failed',
    label: 'Failed',
  },
  PENDING: {
    className: 'status-pending',
    label: 'Pending',
  },
  CLONING: {
    className: 'status-progress',
    label: 'Cloning',
  },
  PARSING: {
    className: 'status-progress',
    label: 'Parsing',
  },
  ANALYZING_DEPENDENCIES: {
    className: 'status-progress',
    label: 'Analyzing Dependencies',
  },
};

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProjects()
      .then(setProjects)
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="project-list-page">
        <div className="project-list-state">
          <div className="project-list-spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-list-page">
        <div className="project-list-state project-list-error">
          <div className="state-error-icon">!</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-list-page">

      {/* Header */}
      <header className="project-list-header">
        <div>
          <h1>Projects</h1>
          <p>
            View and explore your analyzed codebases.
          </p>
        </div>

        <Link
          to="/add-project"
          className="project-list-add-btn"
        >
          + Add Project
        </Link>
      </header>

      {/* Project count */}
      {projects.length > 0 && (
        <div className="project-list-meta">
          <span>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="project-list-state project-list-empty">
          <div className="empty-project-icon">⌂</div>

          <h3>No projects yet</h3>

          <p>
            Add a GitHub repository or upload a project to start
            analyzing your codebase.
          </p>

          <Link
            to="/add-project"
            className="project-list-empty-btn"
          >
            Add Your First Project
          </Link>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="projects-grid">
          {projects.map((project) => {
            const status =
              STATUS_STYLES[project.status] || {
                className: 'status-pending',
                label: project.status,
              };

            return (
              <Link
                key={project.projectId}
                to={`/projects/${project.projectId}`}
                className="project-card"
              >
                <div className="project-card-header">

                  <div className="project-card-icon">
                    &lt;/&gt;
                  </div>

                  <span
                    className={`project-status ${status.className}`}
                  >
                    {status.label}
                  </span>

                </div>

                <div className="project-card-body">
                  <h2>{project.projectName}</h2>

                  {project.repositoryUrl && (
                    <p className="project-repository">
                      {project.repositoryUrl}
                    </p>
                  )}
                </div>

                <div className="project-card-footer">
                  <span>View project</span>
                  <span className="project-arrow">→</span>
                </div>
              </Link>
            );
          })}
        </section>
      )}

    </div>
  );
}

export default ProjectList;


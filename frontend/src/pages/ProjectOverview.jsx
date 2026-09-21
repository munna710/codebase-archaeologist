
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { getProjectById, reanalyzeProject } from '../api/projects';
import { getClassRanking, getComplexityRanking } from '../api/classes';
import {
  STATUS_STEPS,
  STATUS_LABELS,
  isInProgress,
} from '../utils/projectStatus';

import '../theme.css';
import './project-overview.css';

function ProjectOverview() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [complexity, setComplexity] = useState([]);
  const [error, setError] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [pollTrigger, setPollTrigger] = useState(0);

  /*
   * Poll project status while analysis is running.
   * Stops automatically once the project reaches a terminal state.
   */
  useEffect(() => {
    let intervalId;

    const poll = () => {
      getProjectById(id)
        .then((data) => {
          setProject(data);

          if (!isInProgress(data.status)) {
            clearInterval(intervalId);
          }
        })
        .catch(() => {
          setError('Failed to load project.');
          clearInterval(intervalId);
        });
    };

    poll();

    intervalId = setInterval(poll, 2000);

    return () => clearInterval(intervalId);
  }, [id, pollTrigger]);

  /*
   * Re-analyze project.
   */
  const handleReanalyze = async () => {
    setReanalyzing(true);
    setError(null);

    try {
      await reanalyzeProject(id);

      setRanking([]);
      setComplexity([]);

      // Restart polling.
      setPollTrigger((prev) => prev + 1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to start re-analysis.'
      );
    } finally {
      setReanalyzing(false);
    }
  };

  /*
   * Load rankings only after analysis is complete.
   */
  useEffect(() => {
    if (project?.status !== 'COMPLETED') return;

    getClassRanking(id)
      .then(setRanking)
      .catch(() =>
        console.error('Failed to load class ranking')
      );

    getComplexityRanking(id)
      .then(setComplexity)
      .catch(() =>
        console.error('Failed to load complexity ranking')
      );
  }, [id, project?.status]);

  if (error) {
    return (
      <div className="project-overview-page">
        <div className="project-error">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-overview-page">
        <div className="project-loading">
          Loading project...
        </div>
      </div>
    );
  }

  return (
    <div className="project-overview-page">

      {/* =========================
          Project Header
          ========================= */}

      <div className="project-header">
        <div className="project-header-info">
          <h1>{project.projectName}</h1>

          {project.repositoryUrl && (
            <p className="project-repository">
              Repository:{' '}
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
              >
                {project.repositoryUrl}
              </a>
            </p>
          )}
        </div>

        {(project.status === 'COMPLETED' ||
          project.status === 'FAILED') && (
          <button
            className="project-reanalyze-btn"
            onClick={handleReanalyze}
            disabled={reanalyzing}
          >
            {reanalyzing ? 'Starting...' : 'Re-analyze'}
          </button>
        )}
      </div>


      {/* =========================
          Analysis Progress
          ========================= */}

      {isInProgress(project.status) && (
        <section className="analysis-progress-card">

          <div className="analysis-progress-header">
            <div className="analysis-progress-icon">
              ↻
            </div>

            <div>
              <h2>
                {STATUS_LABELS[project.status]}...
              </h2>

              <p>
                Your project is currently being analyzed.
              </p>
            </div>
          </div>

          <ol className="analysis-steps">
            {STATUS_STEPS.map((step) => {
              const stepIndex = STATUS_STEPS.indexOf(step);
              const currentIndex =
                STATUS_STEPS.indexOf(project.status);

              const isDone = stepIndex < currentIndex;
              const isCurrent = step === project.status;

              let className = 'analysis-step';

              if (isDone) {
                className += ' step-done';
              } else if (isCurrent) {
                className += ' step-current';
              } else {
                className += ' step-pending';
              }

              return (
                <li
                  key={step}
                  className={className}
                >
                  <span className="step-marker">
                    {isDone
                      ? '✓'
                      : isCurrent
                        ? '→'
                        : '○'}
                  </span>

                  <span>
                    {STATUS_LABELS[step]}
                  </span>
                </li>
              );
            })}
          </ol>

        </section>
      )}


      {/* =========================
          Failed State
          ========================= */}

      {project.status === 'FAILED' && (
        <div className="analysis-failed">
          <div className="analysis-failed-icon">
            !
          </div>

          <div>
            <strong>Analysis failed</strong>

            <p>
              Check the repository URL and try again.
            </p>
          </div>
        </div>
      )}


      {/* =========================
          Completed Project
          ========================= */}

      {project.status === 'COMPLETED' && (
        <>
          {/* Navigation */}
          <nav className="project-navigation">

            <Link
              to={`/projects/${id}/explorer`}
              className="project-nav-link"
            >
              Code Explorer
            </Link>

            <Link
              to={`/projects/${id}/dependencies`}
              className="project-nav-link"
            >
              Dependency Graph
            </Link>

            <Link
              to={`/projects/${id}/documentation`}
              className="project-nav-link"
            >
              Documentation
            </Link>

            <Link
              to={`/projects/${id}/chat`}
              className="project-nav-link"
            >
              Ask a Question
            </Link>

            <Link
              to={`/projects/${id}/code-smells`}
              className="project-nav-link"
            >
              Code Smells
            </Link>

            <Link
              to={`/projects/${id}/debug`}
              className="project-nav-link"
            >
              Debug an Error
            </Link>

            {project.sourceType === 'GITHUB' && (
              <Link
                to={`/projects/${id}/commits`}
                className="project-nav-link"
              >
                Commit History
              </Link>
            )}

          </nav>


          {/* =========================
              Rankings
              ========================= */}

          {(ranking.length > 0 || complexity.length > 0) && (
            <div className="project-rankings">

              {/* Most depended upon */}
              {ranking.length > 0 && (
                <section className="ranking-card">

                  <div className="ranking-header">
                    <div className="ranking-icon">
                      ↗
                    </div>

                    <div>
                      <h2>Most Depended-Upon Classes</h2>
                      <p>
                        Classes used by the largest number of
                        other classes.
                      </p>
                    </div>
                  </div>

                  <ol className="ranking-list">
                    {ranking.slice(0, 10).map((cls, index) => (
                      <li
                        key={cls.classId}
                        className="ranking-item"
                      >
                        <span className="ranking-number">
                          {index + 1}
                        </span>

                        <div className="ranking-class">
                          <Link
                            to={`/projects/${id}/classes/${cls.classId}`}
                          >
                            {cls.className}
                          </Link>

                          <span>
                            depended on by{' '}
                            <strong>
                              {cls.dependentCount}
                            </strong>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>

                </section>
              )}


              {/* Most complex */}
              {complexity.length > 0 && (
                <section className="ranking-card">

                  <div className="ranking-header">
                    <div className="ranking-icon">
                      #
                    </div>

                    <div>
                      <h2>Most Complex Classes</h2>
                      <p>
                        Classes with the highest complexity
                        scores.
                      </p>
                    </div>
                  </div>

                  <ol className="ranking-list">
                    {complexity.slice(0, 10).map((cls, index) => (
                      <li
                        key={cls.classId}
                        className="ranking-item"
                      >
                        <span className="ranking-number">
                          {index + 1}
                        </span>

                        <div className="ranking-class">
                          <Link
                            to={`/projects/${id}/classes/${cls.classId}`}
                          >
                            {cls.className}
                          </Link>

                          <span>
                            complexity score{' '}
                            <strong>
                              {cls.complexityScore}
                            </strong>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>

                </section>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
}

export default ProjectOverview;


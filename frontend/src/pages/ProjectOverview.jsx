import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '../api/projects';
import { getClassRanking, getComplexityRanking } from '../api/classes';
import { STATUS_STEPS, STATUS_LABELS, isInProgress } from '../utils/projectStatus';

function ProjectOverview() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [complexity, setComplexity] = useState([]);
  const [error, setError] = useState(null);

  // Poll for status while analysis is in progress; stop once it reaches a
  // terminal state (COMPLETED or FAILED).
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

    poll(); // fetch immediately on page load
    intervalId = setInterval(poll, 2000);

    return () => clearInterval(intervalId); // cleanup when leaving the page
  }, [id]);

  // Only fetch these insights once analysis has actually finished —
  // querying them mid-analysis would just return empty/partial results.
  useEffect(() => {
    if (project?.status !== 'COMPLETED') return;

    getClassRanking(id).then(setRanking).catch(() => console.error('Failed to load class ranking'));
    getComplexityRanking(id).then(setComplexity).catch(() => console.error('Failed to load complexity ranking'));
  }, [id, project?.status]);

  if (error) return <p>{error}</p>;
  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <h1>{project.projectName}</h1>
      <p>Repository: {project.repositoryUrl}</p>

      {isInProgress(project.status) && (
        <div style={{ margin: '1.5rem 0' }}>
          <p><strong>{STATUS_LABELS[project.status]}...</strong></p>
          <ol>
            {STATUS_STEPS.map((step) => {
              const stepIndex = STATUS_STEPS.indexOf(step);
              const currentIndex = STATUS_STEPS.indexOf(project.status);
              const isDone = stepIndex < currentIndex;
              const isCurrent = step === project.status;

              return (
                <li key={step} style={{ color: isDone ? '#16a34a' : isCurrent ? '#2563eb' : '#94a3b8' }}>
                  {isDone ? '✓ ' : isCurrent ? '→ ' : '  '}
                  {STATUS_LABELS[step]}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {project.status === 'FAILED' && (
        <p style={{ color: '#dc2626' }}>Analysis failed. Check the repository URL and try again.</p>
      )}

      {project.status === 'COMPLETED' && (
        <>
          <nav>
            <Link to={`/projects/${id}/explorer`}>Code Explorer</Link>
            {' | '}
            <Link to={`/projects/${id}/dependencies`}>View Dependency Graph</Link>
            {' | '}
            <Link to={`/projects/${id}/documentation`}>View Documentation</Link>
          </nav>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {ranking.length > 0 && (
              <section style={{ flex: 1, minWidth: '300px' }}>
                <h3>Most Depended-Upon Classes</h3>
                <ol>
                  {ranking.slice(0, 10).map((cls) => (
                    <li key={cls.classId}>
                      <Link to={`/projects/${id}/classes/${cls.classId}`}>{cls.className}</Link>
                      {' '}— depended on by {cls.dependentCount}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {complexity.length > 0 && (
              <section style={{ flex: 1, minWidth: '300px' }}>
                <h3>Most Complex Classes</h3>
                <ol>
                  {complexity.slice(0, 10).map((cls) => (
                    <li key={cls.classId}>
                      <Link to={`/projects/${id}/classes/${cls.classId}`}>{cls.className}</Link>
                      {' '}— score: {cls.complexityScore}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectOverview;
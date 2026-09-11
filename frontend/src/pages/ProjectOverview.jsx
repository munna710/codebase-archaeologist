import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '../api/projects';

function ProjectOverview() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjectById(id)
      .then(setProject)
      .catch(() => setError('Failed to load project.'));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <h1>{project.projectName}</h1>
      <p>Repository: {project.repositoryUrl}</p>
      <p>Status: {project.status}</p>
        <nav>
        <Link to={`/projects/${id}/explorer`}>Code Explorer</Link>
        {' | '}
        <Link to={`/projects/${id}/dependencies`}>View Dependency Graph</Link>
        {' | '}
        <Link to={`/projects/${id}/documentation`}>View Documentation</Link>
      </nav>
    </div>
  );
}

export default ProjectOverview;
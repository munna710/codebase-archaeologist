import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../api/projects';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllProjects()
      .then(setProjects)
      .catch(() => setError('Failed to load projects.'));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.projectId}>
            <Link to={`/projects/${project.projectId}`}>
              {project.projectName}
            </Link>
            {' '}— {project.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectList;
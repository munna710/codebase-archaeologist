import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, analyzeProject } from '../api/projects';

function AddProject() {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | creating | analyzing | error
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('creating');
    setErrorMessage('');

    try {
      const project = await createProject(repositoryUrl, '');
      setStatus('analyzing');

      await analyzeProject(project.projectId);

      navigate(`/projects/${project.projectId}`);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 'Something went wrong. Check the repository URL and try again.'
      );
    }
  };

  return (
    <div>
      <h1>Add Project</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="https://github.com/user/repository"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={status === 'creating' || status === 'analyzing'}>
          {status === 'analyzing' ? 'Analyzing...' : 'Analyze Project'}
        </button>
      </form>

      {status === 'error' && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default AddProject;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, createProjectFromZip, analyzeProject } from '../api/projects';

function AddProject() {
  const [mode, setMode] = useState('github'); // 'github' | 'zip'
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | creating | analyzing | error
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleGithubSubmit = async (e) => {
    e.preventDefault();

    const trimmedUrl = repositoryUrl.trim();
    if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(trimmedUrl)) {
      setStatus('error');
      setErrorMessage('Please enter a valid GitHub URL, e.g. https://github.com/user/repository');
      return;
    }

    setStatus('creating');
    setErrorMessage('');

    try {
      const project = await createProject(trimmedUrl, '');
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

  const handleZipSubmit = async (e) => {
    e.preventDefault();

    if (!zipFile) {
      setStatus('error');
      setErrorMessage('Please choose a .zip file first.');
      return;
    }
    if (!zipFile.name.toLowerCase().endsWith('.zip')) {
      setStatus('error');
      setErrorMessage('Only .zip files are supported.');
      return;
    }

    setStatus('creating');
    setErrorMessage('');

    try {
      const project = await createProjectFromZip(zipFile, '');
      setStatus('analyzing');
      await analyzeProject(project.projectId);
      navigate(`/projects/${project.projectId}`);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 'Something went wrong uploading the ZIP file. Please try again.'
      );
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStatus('idle');
    setErrorMessage('');
  };

  const busy = status === 'creating' || status === 'analyzing';

  return (
    <div>
      <h1>Add Project</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => switchMode('github')}
          disabled={busy}
          style={{ backgroundColor: mode === 'github' ? '#2563eb' : '#e2e8f0', color: mode === 'github' ? '#fff' : '#334155' }}
        >
          GitHub URL
        </button>
        {' '}
        <button
          type="button"
          onClick={() => switchMode('zip')}
          disabled={busy}
          style={{ backgroundColor: mode === 'zip' ? '#2563eb' : '#e2e8f0', color: mode === 'zip' ? '#fff' : '#334155' }}
        >
          Upload ZIP
        </button>
      </div>

      {mode === 'github' && (
        <form onSubmit={handleGithubSubmit}>
          <input
            type="text"
            placeholder="https://github.com/user/repository"
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            disabled={busy}
            required
          />
          <button type="submit" disabled={busy || !repositoryUrl.trim()}>
            {status === 'analyzing' ? 'Analyzing...' : status === 'creating' ? 'Adding...' : 'Analyze Project'}
          </button>
        </form>
      )}

      {mode === 'zip' && (
        <form onSubmit={handleZipSubmit}>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setZipFile(e.target.files[0] || null)}
            disabled={busy}
          />
          <div style={{ marginTop: '0.75rem' }}>
            <button type="submit" disabled={busy || !zipFile}>
              {status === 'analyzing' ? 'Analyzing...' : status === 'creating' ? 'Uploading...' : 'Upload & Analyze'}
            </button>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Maximum file size: 100 MB. Only .zip files containing Java source code are supported.
          </p>
        </form>
      )}

      {status === 'error' && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default AddProject;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, createProjectFromZip, analyzeProject } from '../api/projects';

import '../theme.css';
import './login.css';

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
      setErrorMessage('Enter a valid GitHub URL, like https://github.com/user/repository');
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
      setErrorMessage('Choose a .zip file first.');
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
        err.response?.data?.message || 'Something went wrong uploading the ZIP file. Try again.'
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
    <main className="add-page">
      <header className="add-header">
        <h1 className="h2 mb-1">Add project</h1>
        <p className="text-body-secondary mb-0">Analyze a GitHub repository or upload a ZIP file.</p>
      </header>

      <div className="card add-card">
        <div className="card-body p-4">
          <div className="btn-group add-tabs mb-4" role="group" aria-label="Project source">
            <button
              type="button"
              className={`btn ${mode === 'github' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => switchMode('github')}
              disabled={busy}
              aria-pressed={mode === 'github'}
            >
              GitHub URL
            </button>
            <button
              type="button"
              className={`btn ${mode === 'zip' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => switchMode('zip')}
              disabled={busy}
              aria-pressed={mode === 'zip'}
            >
              Upload ZIP
            </button>
          </div>

          {status === 'error' && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}

          {busy && (
            <div className="add-status" role="status" aria-live="polite">
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              <span>{status === 'analyzing' ? 'Analyzing your code…' : 'Adding your project…'}</span>
            </div>
          )}

          {mode === 'github' && (
            <form onSubmit={handleGithubSubmit}>
              <div className="mb-4">
                <label htmlFor="repository-url" className="form-label">Repository URL</label>
                <input
                  id="repository-url"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  className="form-control"
                  placeholder="https://github.com/user/repository"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={busy || !repositoryUrl.trim()}>
                  {status === 'analyzing' ? 'Analyzing…' : status === 'creating' ? 'Adding…' : 'Analyze project'}
                </button>
              </div>
            </form>
          )}

          {mode === 'zip' && (
            <form onSubmit={handleZipSubmit}>
              <div className="mb-4">
                <label htmlFor="zip-file" className="form-label">ZIP file</label>
                <input
                  id="zip-file"
                  type="file"
                  accept=".zip"
                  className="form-control"
                  aria-describedby="zip-hint"
                  onChange={(e) => setZipFile(e.target.files[0] || null)}
                  disabled={busy}
                />
                <div id="zip-hint" className="form-text">
                  Maximum file size: 100 MB. Only .zip files containing Java source code are supported.
                </div>
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={busy || !zipFile}>
                  {status === 'analyzing' ? 'Analyzing…' : status === 'creating' ? 'Uploading…' : 'Upload and analyze'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="scale-bar" aria-hidden="true" />
    </main>
  );
}

export default AddProject;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getDocumentation,
  generateDocumentation,
  downloadMarkdown,
  downloadPdf,
} from '../api/documentation';
import MarkdownContent from '../components/MarkdownContent';

import '../theme.css';
// import './login.css';
import './documentation.css';

function Documentation() {
  const { id } = useParams();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const loadDocs = () => {
    setLoading(true);

    getDocumentation(id)
      .then(setDocs)
      .catch(() => setError('Failed to load documentation.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const updatedDocs = await generateDocumentation(id);
      setDocs(updatedDocs);
    } catch (err) {
      setError('Failed to generate documentation. Check backend logs.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (type) => {
    setDownloading(type);
    setError(null);

    try {
      if (type === 'markdown') {
        await downloadMarkdown(id);
      } else {
        await downloadPdf(id);
      }
    } catch (err) {
      setError('Failed to download the file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <main className="documentation-page">
        <div className="documentation-loading">
          <span className="spinner-border spinner-border-sm" />
          <span>Loading documentation…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="documentation-page">
      {/* Header */}
      <header className="documentation-header">
        <div>
          <h1 className="h2 mb-1">Documentation</h1>
          <p className="text-body-secondary mb-0">
            AI-generated documentation and project overview.
          </p>
        </div>
      </header>

      {/* Actions */}
      <div className="card documentation-actions-card">
        <div className="card-body p-4">
          <div className="documentation-actions">
            <div className="documentation-export-actions">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handleDownload('markdown')}
                disabled={downloading !== null}
              >
                {downloading === 'markdown'
                  ? 'Preparing…'
                  : 'Export as Markdown'}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handleDownload('pdf')}
                disabled={downloading !== null}
              >
                {downloading === 'pdf'
                  ? 'Preparing…'
                  : 'Export as PDF'}
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Generating…
                </>
              ) : (
                'Generate Documentation'
              )}
            </button>
          </div>

          {generating && (
            <div className="documentation-status">
              <span className="spinner-border spinner-border-sm" />
              <span>
                Generating documentation… This can take a while.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger documentation-alert" role="alert">
          {error}
        </div>
      )}

      {/* Empty state */}
      {docs.length === 0 && !generating && (
        <div className="card documentation-empty-card">
          <div className="card-body">
            <div className="documentation-empty-icon">▤</div>

            <h3>No documentation yet</h3>

            <p>
              Click <strong>Generate Documentation</strong> to analyze the
              project and create documentation.
            </p>
          </div>
        </div>
      )}

      {/* Documentation cards */}
      <div className="documentation-list">
        {docs.map((doc) => (
          <article
            key={doc.documentationId}
            className="card documentation-card"
          >
            <div className="documentation-card-header">
              <div className="documentation-class-icon">
                ◈
              </div>

              <h2>
                {doc.javaClass
                  ? doc.javaClass.className
                  : 'Project Overview'}
              </h2>
            </div>

            <div className="documentation-card-body">
              <MarkdownContent content={doc.content} />
            </div>
          </article>
        ))}
      </div>

      <div className="scale-bar" aria-hidden="true" />
    </main>
  );
}

export default Documentation;


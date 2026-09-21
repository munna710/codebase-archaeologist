import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDocumentation, generateDocumentation, downloadMarkdown, downloadPdf } from '../api/documentation';
import MarkdownContent from '../components/MarkdownContent';

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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Documentation</h1>
        <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => handleDownload('markdown')} disabled={downloading !== null}>
          {downloading === 'markdown' ? 'Preparing...' : 'Export as Markdown'}
        </button>
        {' '}
        <button onClick={() => handleDownload('pdf')} disabled={downloading !== null}>
          {downloading === 'pdf' ? 'Preparing...' : 'Export as PDF'}
        </button>
      </div>

      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating... (this can take a while)' : 'Generate Documentation'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {docs.length === 0 && !generating && (
        <p>No documentation generated yet. Click the button above to generate it.</p>
      )}

      {docs.map((doc) => (
        <div
          key={doc.documentationId}
          style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem 0' }}
        >
          <h3>{doc.javaClass ? doc.javaClass.className : 'Project Overview'}</h3>
          <MarkdownContent content={doc.content} />
        </div>
      ))}
    </div>
  );
}

export default Documentation;
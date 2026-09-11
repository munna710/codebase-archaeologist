import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDocumentation, generateDocumentation } from '../api/documentation';

function Documentation() {
  const { id } = useParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Documentation</h1>
        <div style={{ marginBottom: '1rem' }}>
        <a href={`http://localhost:8080/api/projects/${id}/export/markdown`}>
          Export as Markdown
        </a>
        {' | '}
        <a href={`http://localhost:8080/api/projects/${id}/export/pdf`}>
          Export as PDF
        </a>
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
          <p style={{ whiteSpace: 'pre-wrap' }}>{doc.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Documentation;
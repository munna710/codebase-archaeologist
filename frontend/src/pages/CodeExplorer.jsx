import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectFiles } from '../api/files';

function CodeExplorer() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjectFiles(id)
      .then(setFiles)
      .catch(() => setError('Failed to load files.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Filters files down to only classes/methods matching the search term.
  // Recalculates only when files or searchTerm change, not on every render.
  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;

    const term = searchTerm.toLowerCase();

    return files
      .map((file) => {
        const matchingClasses = file.classes
          .map((cls) => {
            const classMatches = cls.className.toLowerCase().includes(term);

            const matchingMethods = cls.methods.filter((method) =>
              method.methodName.toLowerCase().includes(term)
            );

            // Keep this class if the class name matches, OR any of its methods match.
            if (classMatches || matchingMethods.length > 0) {
              return {
                ...cls,
                // If the class itself matched, show all its methods.
                // If only some methods matched, show just those.
                methods: classMatches ? cls.methods : matchingMethods,
              };
            }
            return null;
          })
          .filter(Boolean);

        const fileNameMatches = file.fileName.toLowerCase().includes(term);

        // Keep this file if its name matches, or it has any matching classes.
        if (fileNameMatches || matchingClasses.length > 0) {
          return {
            ...file,
            classes: fileNameMatches ? file.classes : matchingClasses,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [files, searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Code Explorer</h1>

      <input
        type="text"
        placeholder="Search files, classes, or methods..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '1.5rem' }}
      />

      <p style={{ color: '#64748b' }}>
        Showing {filteredFiles.length} of {files.length} files
      </p>

      {filteredFiles.length === 0 && (
        <p>No files, classes, or methods match "{searchTerm}".</p>
      )}

      {filteredFiles.map((file) => (
        <div
          key={file.fileId}
          style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}
        >
          <h3>{file.fileName}</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{file.filePath}</p>

          {file.classes.map((cls) => (
            <div key={cls.classId} style={{ marginLeft: '1rem', marginTop: '0.75rem' }}>
              <strong>{cls.classType}:</strong> {cls.className}
              {' '}
              <span style={{ color: '#64748b' }}>({cls.packageName})</span>

              {cls.methods.length > 0 && (
                <ul>
                  {cls.methods.map((method) => (
                    <li key={method.methodId}>
                      {method.returnType} {method.methodName}({method.parameters})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default CodeExplorer;
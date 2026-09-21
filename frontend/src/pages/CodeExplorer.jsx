
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectFiles } from '../api/files';

import '../theme.css';
import './login.css';

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

            if (classMatches || matchingMethods.length > 0) {
              return {
                ...cls,
                methods: classMatches ? cls.methods : matchingMethods,
              };
            }

            return null;
          })
          .filter(Boolean);

        const fileNameMatches = file.fileName.toLowerCase().includes(term);

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

  if (loading) {
    return (
      <main className="explorer-page">
        <div className="explorer-loading">
          <span className="spinner-border spinner-border-sm" />
          <span>Loading code explorer…</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="explorer-page">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="explorer-page">
      {/* Header */}
      <header className="explorer-header">
        <div>
          <h1 className="h2 mb-1">Code Explorer</h1>
          <p className="text-body-secondary mb-0">
            Browse files, classes, and methods in your project.
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="card explorer-search-card">
        <div className="card-body p-4">
          <label htmlFor="code-search" className="form-label">
            Search code
          </label>

          <input
            id="code-search"
            type="text"
            className="form-control"
            placeholder="Search files, classes, or methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />

          <div className="explorer-search-info">
            Showing <strong>{filteredFiles.length}</strong> of{' '}
            <strong>{files.length}</strong> files
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredFiles.length === 0 && (
        <div className="card explorer-empty-card">
          <div className="card-body">
            <div className="explorer-empty-icon">⌕</div>

            <h3>No results found</h3>

            <p>
              No files, classes, or methods match{' '}
              <strong>"{searchTerm}"</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Files */}
      <div className="explorer-files">
        {filteredFiles.map((file) => (
          <div key={file.fileId} className="card explorer-file-card">
            <div className="card-body p-4">
              {/* File header */}
              <div className="explorer-file-header">
                <div className="explorer-file-icon">
                  ◫
                </div>

                <div className="explorer-file-info">
                  <h2 className="explorer-file-name">
                    {file.fileName}
                  </h2>

                  <p className="explorer-file-path">
                    {file.filePath}
                  </p>
                </div>
              </div>

              {/* Classes */}
              {file.classes.length > 0 && (
                <div className="explorer-classes">
                  {file.classes.map((cls) => (
                    <div
                      key={cls.classId}
                      className="explorer-class"
                    >
                      <div className="explorer-class-header">
                        <span className="explorer-class-icon">
                          ◈
                        </span>

                        <span className="explorer-class-type">
                          {cls.classType}
                        </span>

                        <Link
                          to={`/projects/${id}/classes/${cls.classId}`}
                          className="explorer-class-name"
                        >
                          {cls.className}
                        </Link>

                        <span className="explorer-package">
                          {cls.packageName}
                        </span>
                      </div>

                      {/* Methods */}
                      {cls.methods.length > 0 && (
                        <div className="explorer-methods">
                          {cls.methods.map((method) => (
                            <div
                              key={method.methodId}
                              className="explorer-method"
                            >
                              <span className="explorer-method-dot">
                                •
                              </span>

                              <code>
                                {method.returnType}{' '}
                                <strong>{method.methodName}</strong>
                                ({method.parameters})
                              </code>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="scale-bar" aria-hidden="true" />
    </main>
  );
}

export default CodeExplorer;



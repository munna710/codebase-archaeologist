
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClassDetails } from '../api/classes';
import MarkdownContent from '../components/MarkdownContent';

// import '../theme.css';

import './ClassDetails.css';

function ClassDetails() {
  const { id, classId } = useParams();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClassDetails(id, classId)
      .then(setDetails)
      .catch(() => setError('Failed to load class details.'));
  }, [id, classId]);

  if (error) {
    return (
      <div className="class-details-page">
        <div className="class-details-alert">{error}</div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="class-details-page">
        <div className="class-details-loading">
          <div className="class-details-spinner" />
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="class-details-page">
      <div className="class-details-header">
        <Link
          to={`/projects/${id}`}
          className="class-details-back"
        >
          ← Back to Project
        </Link>

        <h1>{details.className}</h1>

        <p className="class-details-subtitle">
          {details.classType} in{' '}
          <code>{details.packageName}</code>
        </p>

        <div className="class-details-file">
          <span className="class-details-file-label">Source file</span>
          <code>{details.fileName}</code>
        </div>
      </div>

      <section className="class-details-card">
        <div className="class-details-card-header">
          <div>
            <h2>AI Explanation</h2>
            <p>Understand the purpose and behavior of this class.</p>
          </div>
        </div>

        <div className="class-details-card-body">
          {details.aiExplanation ? (
             <div className="class-details-explanation">
              <MarkdownContent content={details.aiExplanation} />
            </div>
          ) : (
            <div className="class-details-empty">
              <p>AI explanation has not been generated yet.</p>
              <Link
                to={`/projects/${id}/documentation`}
                className="class-details-action-link"
              >
                Visit Documentation →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="class-details-card">
        <div className="class-details-card-header">
          <div>
            <h2>Methods</h2>
            <p>Methods declared in this class.</p>
          </div>
          <span className="class-details-count">
            {details.methods.length}
          </span>
        </div>

        <div className="class-details-card-body">
          {details.methods.length === 0 ? (
            <p className="class-details-muted">No methods found.</p>
          ) : (
            <div className="class-details-method-list">
              {details.methods.map((method, index) => (
                <div className="class-details-method" key={index}>
                  <code className="class-details-return-type">
                    {method.returnType}
                  </code>
                  <div className="class-details-method-signature">
                    <strong>{method.methodName}</strong>
                    <span>({method.parameters})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="class-details-card">
        <div className="class-details-card-header">
          <div>
            <h2>Depends On</h2>
            <p>Classes this class depends on.</p>
          </div>
          <span className="class-details-count">
            {details.outgoingDependencies.length}
          </span>
        </div>

        <div className="class-details-card-body">
          {details.outgoingDependencies.length === 0 ? (
            <p className="class-details-muted">
              This class has no outgoing dependencies.
            </p>
          ) : (
            <div className="class-details-dependency-list">
              {details.outgoingDependencies.map((dep, index) => (
                <div className="class-details-dependency" key={index}>
                  <Link
                    to={`/projects/${id}/classes/${dep.classId}`}
                    className="class-details-dependency-link"
                  >
                    {dep.className}
                  </Link>
                  <span className="class-details-dependency-type">
                    {dep.dependencyType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="class-details-card">
        <div className="class-details-card-header">
          <div>
            <h2>Used By</h2>
            <p>Classes that depend on this class.</p>
          </div>
          <span className="class-details-count">
            {details.incomingDependencies.length}
          </span>
        </div>

        <div className="class-details-card-body">
          {details.incomingDependencies.length === 0 ? (
            <p className="class-details-muted">
              No other classes depend on this one.
            </p>
          ) : (
            <div className="class-details-dependency-list">
              {details.incomingDependencies.map((dep, index) => (
                <div className="class-details-dependency" key={index}>
                  <Link
                    to={`/projects/${id}/classes/${dep.classId}`}
                    className="class-details-dependency-link"
                  >
                    {dep.className}
                  </Link>
                  <span className="class-details-dependency-type">
                    {dep.dependencyType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ClassDetails;

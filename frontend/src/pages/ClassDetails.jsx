import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClassDetails } from '../api/classes';

function ClassDetails() {
  const { id, classId } = useParams();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClassDetails(id, classId)
      .then(setDetails)
      .catch(() => setError('Failed to load class details.'));
  }, [id, classId]);

  if (error) return <p>{error}</p>;
  if (!details) return <p>Loading...</p>;

  return (
    <div>
      <h1>{details.className}</h1>
      <p style={{ color: '#64748b' }}>
        {details.classType} in <code>{details.packageName}</code> ({details.fileName})
      </p>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>AI Explanation</h3>
        {details.aiExplanation ? (
          <p style={{ whiteSpace: 'pre-wrap' }}>{details.aiExplanation}</p>
        ) : (
          <p style={{ color: '#94a3b8' }}>
            Not generated yet. Visit the{' '}
            <Link to={`/projects/${id}/documentation`}>Documentation page</Link> to generate it.
          </p>
        )}
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Methods ({details.methods.length})</h3>
        {details.methods.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No methods.</p>
        ) : (
          <ul>
            {details.methods.map((m, i) => (
              <li key={i}>
                {m.returnType} <strong>{m.methodName}</strong>({m.parameters})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Depends On ({details.outgoingDependencies.length})</h3>
        {details.outgoingDependencies.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>This class has no outgoing dependencies.</p>
        ) : (
          <ul>
            {details.outgoingDependencies.map((dep, i) => (
              <li key={i}>
                <Link to={`/projects/${id}/classes/${dep.classId}`}>{dep.className}</Link>
                {' '}
                <span style={{ color: '#64748b' }}>({dep.dependencyType})</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Used By ({details.incomingDependencies.length})</h3>
        {details.incomingDependencies.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No other classes depend on this one.</p>
        ) : (
          <ul>
            {details.incomingDependencies.map((dep, i) => (
              <li key={i}>
                <Link to={`/projects/${id}/classes/${dep.classId}`}>{dep.className}</Link>
                {' '}
                <span style={{ color: '#64748b' }}>({dep.dependencyType})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ClassDetails;
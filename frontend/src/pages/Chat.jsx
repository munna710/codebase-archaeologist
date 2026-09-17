
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { askQuestion } from '../api/chat';
import MarkdownContent from '../components/MarkdownContent';

function Chat() {
  const { id } = useParams();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  // Convert our history into the format expected by the backend.
  const buildApiHistory = () => {
    const apiHistory = [];

    for (const entry of history) {
      apiHistory.push({
        role: 'user',
        content: entry.question,
      });

      apiHistory.push({
        role: 'assistant',
        content: entry.answer,
      });
    }

    return apiHistory;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || asking) return;

    setAsking(true);
    setError(null);

    try {
      const apiHistory = buildApiHistory();

      const result = await askQuestion(
        id,
        trimmedQuestion,
        apiHistory
      );

      setHistory((prev) => [
        ...prev,
        {
          question: trimmedQuestion,
          answer: result.answer,
          relevantClasses: result.relevantClasses || [],
        },
      ]);

      setQuestion('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to get an answer. Please try again.'
      );
    } finally {
      setAsking(false);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setError(null);
    setQuestion('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.25rem',
              color: '#0f172a',
            }}
          >
            Ask About This Codebase
          </h1>

          <p
            style={{
              margin: '0.25rem 0 0',
              color: '#64748b',
              fontSize: '0.85rem',
            }}
          >
            Ask questions about your analyzed project
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleNewConversation}
            style={{
              backgroundColor: '#64748b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 0.8rem',
              cursor: 'pointer',
            }}
          >
            New Chat
          </button>
        )}
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2rem 1rem 8rem',
          boxSizing: 'border-box',
        }}
      >
        {/* Empty state */}
        {history.length === 0 && !asking && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '20vh',
              color: '#64748b',
            }}
          >
            <h2
              style={{
                color: '#0f172a',
                marginBottom: '0.5rem',
              }}
            >
              Ask about your codebase
            </h2>

            <p>
              Try questions like:
            </p>

            <p
              style={{
                fontSize: '0.9rem',
                color: '#94a3b8',
              }}
            >
              "Where is authentication handled?"
              <br />
              "How does the application find an owner?"
              <br />
              "What does this service depend on?"
            </p>
          </div>
        )}

        {/* Conversation */}
        {history.map((entry, index) => (
          <div key={index}>
            {/* USER MESSAGE */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '0.75rem 1rem',
                  borderRadius: '16px 16px 4px 16px',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                }}
              >
                {entry.question}
              </div>
            </div>

            {/* AI MESSAGE */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  padding: '1rem',
                  borderRadius: '4px 16px 16px 16px',
                  lineHeight: '1.6',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {/* AI answer */}
                {/* AI answer */}
                <div style={{ marginBottom: '0.75rem' }}>
                <MarkdownContent content={entry.answer} />
                </div>

                {/* Related classes */}
                {entry.relevantClasses &&
                  entry.relevantClasses.length > 0 && (
                    <div
                      style={{
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #e2e8f0',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          margin: '0 0 0.5rem',
                          fontWeight: '600',
                        }}
                      >
                        Related classes
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {entry.relevantClasses.map((cls) => (
                          <Link
                            key={cls.classId}
                            to={`/projects/${id}/classes/${cls.classId}`}
                            style={{
                              fontSize: '0.8rem',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              padding: '0.3rem 0.65rem',
                              borderRadius: '999px',
                              textDecoration: 'none',
                              border: '1px solid #dbeafe',
                            }}
                          >
                            {cls.className}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {asking && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '0.75rem 1rem',
                borderRadius: '4px 16px 16px 16px',
                color: '#64748b',
              }}
            >
              Thinking...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '1rem',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <input
            type="text"
            placeholder="Ask anything about this codebase..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={asking}
            style={{
              flex: 1,
              padding: '0.8rem 1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              outline: 'none',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={asking || !question.trim()}
            style={{
              backgroundColor:
                asking || !question.trim()
                  ? '#94a3b8'
                  : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0 1.25rem',
              cursor:
                asking || !question.trim()
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight: '600',
            }}
          >
            {asking ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;


import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { askQuestion } from '../api/chat';
import MarkdownContent from '../components/MarkdownContent';

import '../theme.css';
// 
import './chat.css';

function Chat() {
  const { id } = useParams();

  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

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
    <main className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div>
          <h1 className="h2 mb-1">Ask About This Codebase</h1>
          <p className="text-body-secondary mb-0">
            Ask questions about your analyzed project.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleNewConversation}
          >
            New Chat
          </button>
        )}
      </header>

      {/* Chat content */}
      <div className="chat-content">
        {/* Empty state */}
        {history.length === 0 && !asking && (
          <div className="chat-empty">
            <div className="chat-empty-icon">✦</div>

            <h2>Ask about your codebase</h2>

            <p>Try questions like:</p>

            <div className="chat-examples">
              <span>"Where is authentication handled?"</span>
              <span>"How does the application find an owner?"</span>
              <span>"What does this service depend on?"</span>
            </div>
          </div>
        )}

        {/* Conversation */}
        <div className="chat-messages">
          {history.map((entry, index) => (
            <div key={index} className="chat-conversation">
              {/* User message */}
              <div className="chat-user-row">
                <div className="chat-user-message">
                  {entry.question}
                </div>
              </div>

              {/* AI message */}
              <div className="chat-ai-row">
                <div className="chat-ai-message">
                  <div className="chat-ai-content">
                    <MarkdownContent content={entry.answer} />
                  </div>

                  {/* Related classes */}
                  {entry.relevantClasses &&
                    entry.relevantClasses.length > 0 && (
                      <div className="chat-related">
                        <div className="chat-related-title">
                          Related classes
                        </div>

                        <div className="chat-related-list">
                          {entry.relevantClasses.map((cls) => (
                            <Link
                              key={cls.classId}
                              to={`/projects/${id}/classes/${cls.classId}`}
                              className="chat-related-class"
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

          {/* Thinking */}
          {asking && (
            <div className="chat-ai-row">
              <div className="chat-thinking">
                <span className="spinner-border spinner-border-sm" />
                <span>Thinking…</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger chat-error" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <form
          onSubmit={handleSubmit}
          className="chat-input-form"
        >
          <input
            type="text"
            className="form-control chat-input"
            placeholder="Ask anything about this codebase..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={asking}
          />

          <button
            type="submit"
            className="btn btn-primary chat-send-button"
            disabled={asking || !question.trim()}
          >
            {asking ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>

      <div className="scale-bar" aria-hidden="true" />
    </main>
  );
}

export default Chat;


import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";



import "../theme.css";
import "./login.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Props
 *  onRegister({ name, email, password })  async; throw an Error to show its message
 */
export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    else if (form.name.trim().length < 2) next.name = "Your name needs at least 2 characters.";

    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter an email like name@company.com.";

    if (!form.password) next.password = "Choose a password.";
    else if (form.password.length < 8) next.password = "Use at least 8 characters.";

    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const next = validate();
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setLoading(true);
    try {
      await onRegister?.({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setFormError(err?.message || "We couldn't create your account. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <aside className="login-aside">
        <div>
          <p className="h6 login-brand">Codebase Archaeologist</p>
          <p className="h1 login-title">Dig into legacy code and document what you find.</p>
        </div>

        <div>
          <div className="scale-bar" aria-hidden="true" />
        </div>
      </aside>

      <main className="login-main">
        <div className="card login-card">
          <div className="card-body p-4 p-sm-5">
            <h1 className="h3 mb-1 text-center">Create account</h1>
            <p className="text-body-secondary mb-4 text-center">Start your first dig in a few minutes.</p>

            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                <div id="name-error" className="invalid-feedback">{errors.name}</div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                <div id="email-error" className="invalid-feedback">{errors.email}</div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group has-validation">
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={form.password}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : "password-hint"}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <div id="password-error" className="invalid-feedback">{errors.password}</div>
                </div>
                <div id="password-hint" className="form-text">Use at least 8 characters.</div>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading} aria-busy={loading}>
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </div>
            </form>

            <p className="text-center text-body-secondary mt-4 mb-0">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
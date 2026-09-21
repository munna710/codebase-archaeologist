import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../theme.css";
import "./login.css";


console.log("LOGIN CSS IMPORT TEST");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Props
 *  onLogin({ email, password, remember })  async; throw an Error to show its message
 *  onOAuth(provider)                       called with "github"
 */
export default function LoginPage({ onLogin, onOAuth }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter an email like name@company.com.";
    if (!form.password) next.password = "Enter your password.";
    return next;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const next = validate();
    setErrors(next);
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setLoading(true);
    try {
      await onLogin?.({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      });
      navigate("/dashboard");
    } catch (err) {
      setFormError(err?.message || "Email or password is incorrect. Check them and try again.");
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
            <h1 className="h3 mb-1 text-center">Log in</h1>
            <p className="text-body-secondary mb-4 text-center">Pick up where you left off.</p>

            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="name@gmail.com"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                <div id="email-error" className="invalid-feedback">{errors.email}</div>
              </div>

              <div className="mb-3">
                <div className="login-row">
                  <label htmlFor="password" className="form-label">Password</label>
                  <a href="/forgot-password">Forgot your password?</a>
                </div>
                <div className="input-group has-validation">
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={form.password}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
              </div>

              

              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading} aria-busy={loading}>
                  {loading ? "Signing in…" : "Log in"}
                </button>
              </div>
            </form>

           

           
            <p className="text-center text-body-secondary mt-4 mb-0">
              New here? <a href="/register">Create an account</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

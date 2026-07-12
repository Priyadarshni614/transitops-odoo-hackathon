import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser } from "./authService";

const roles = [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst",
];

function Login() {
  const navigate = useNavigate();
  const existingUser = getCurrentUser();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Fleet Manager",
  });

  const [error, setError] = useState("");

  if (existingUser) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      loginUser(form.email, form.password, form.role);
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <div className="login-page">
      <section className="login-brand-panel">
        <div>
          <div className="login-logo">TO</div>
          <h1>TransitOps</h1>
          <p>Smart Transport Operations Platform</p>
        </div>

        <div className="role-summary">
          <h3>One login, four roles</h3>
          <ul>
            <li>Fleet Manager</li>
            <li>Dispatcher</li>
            <li>Safety Officer</li>
            <li>Financial Analyst</li>
          </ul>
        </div>

        <small>TransitOps © 2026</small>
      </section>

      <section className="login-form-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign in to your account</h2>
          <p>Enter your credentials to continue.</p>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="fleet@transitops.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />

          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            {roles.map((role) => (
              <option value={role} key={role}>
                {role}
              </option>
            ))}
          </select>

          {error && <div className="login-error">{error}</div>}

          <button className="sign-in-button" type="submit">
            Sign In
          </button>

          <div className="demo-credentials">
            <strong>Demo credentials</strong>
            <p>Password for all accounts: transit123</p>
            <p>Fleet Manager: fleet@transitops.com</p>
            <p>Dispatcher: dispatch@transitops.com</p>
            <p>Safety Officer: safety@transitops.com</p>
            <p>Financial Analyst: finance@transitops.com</p>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Login;
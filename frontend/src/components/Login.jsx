import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});

    const result = await login(
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({
        submit: result.message,
      });
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    const result = await googleLogin();

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({
        submit: result.message,
      });
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back 👋</h1>
          <p>
            Sign in to continue managing your
            tasks efficiently.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {errors.submit && (
            <p className="error-message">
              {errors.submit}
            </p>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? 'Signing In...'
              : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
          />

          Continue with Google
        </button>

        <p className="auth-footer">
          Don’t have an account?{' '}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
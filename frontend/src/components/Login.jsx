import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';

import {
  useNavigate,
  Link,
} from 'react-router-dom';

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
    const result = await googleLogin();

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({
        submit: result.message,
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {errors.submit && (
            <p>{errors.submit}</p>
          )}

          <button type="submit">
            {loading
              ? 'Signing In...'
              : 'Sign In'}
          </button>
        </form>

        <button onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <p>
          No account?
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
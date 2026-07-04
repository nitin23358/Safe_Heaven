import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fillDemo = () => {
    setEmail('demo@safehaven.com');
    setPassword('demo123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server. Make sure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb--1" />
        <div className="auth-bg-orb auth-bg-orb--2" />
        <div className="auth-bg-orb auth-bg-orb--3" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-brand">
          <span className="auth-logo">🛡️</span>
          <h1>SafeHaven</h1>
          <p>Empowering women with safer choices</p>
        </div>

        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to plan safe routes and explore locations</p>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {error}
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          <div className="demo-hint">
            <p><strong>Demo account:</strong> demo@safehaven.com / demo123</p>
            <button type="button" className="btn btn-secondary btn-full" onClick={fillDemo}>
              Use Demo Account
            </button>
          </div>
        </motion.form>

        <div className="auth-features">
          <div className="auth-feature">
            <span>🗺️</span>
            <small>Route risk analysis</small>
          </div>
          <div className="auth-feature">
            <span>📍</span>
            <small>Location safety scores</small>
          </div>
          <div className="auth-feature">
            <span>🏪</span>
            <small>Verified safe zones</small>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

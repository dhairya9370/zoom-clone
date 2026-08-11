import React, { useState } from 'react';
import axios from 'axios';
import { Video, User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { BASE_URL } from '../services/api';

export default function Auth({ onLogin, triggerToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister
        ? `${BASE_URL}/register`
        : `${BASE_URL}/login`;

      const payload = isRegister
        ? { name: name.trim(), username: username.trim(), password }
        : { username: username.trim(), password };

      const response = await axios.post(endpoint, payload);

      // Destructure token and user object directly from backend API response
      const { token, user,message} = response.data;
      
      if (isRegister) {
        triggerToast('Registration successful! Logging you in...');
      } else {
        triggerToast('Logged in successfully!');
      }

      onLogin(token, user);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'An error occurred. Please try again.';
      setError(typeof errorMsg === 'string' ? errorMsg : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header / Brand */}
        <div className="auth-header">
          <div className="auth-logo">
            <Video size={28} />
          </div>
          <h2>{isRegister ? 'Create Your Account' : 'Welcome to Zoom'}</h2>
          <p>{isRegister ? 'Sign up to start hosting and joining meetings' : 'Sign in to access your meetings and workspace'}</p>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && <div className="auth-error">{error}</div>}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name field (Register only) */}
          {isRegister && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Dhairya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field auth-input"
                  required={isRegister}
                />
              </div>
            </div>
          )}

          {/* Username / Email field */}
          <div className="input-group">
            <label>Username or Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                placeholder="dhairya@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field auth-input"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="input-group">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field auth-input"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary btn-auth" disabled={isLoading}>
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Switch mode footer link */}
        <div className="auth-footer">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={handleToggleMode}>
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button type="button" className="link-btn" onClick={handleToggleMode}>
                Register now
              </button>
            </p>
          )}
        </div>

        <div className="auth-secure-badge">
          <ShieldCheck size={14} /> Secure end-to-end encrypted connection
        </div>
      </div>
    </div>
  );
}

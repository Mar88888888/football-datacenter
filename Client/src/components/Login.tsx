import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../constants';
import type { AuthResponse } from '../types';
import { AxiosError } from 'axios';

type AuthTab = 'signin' | 'signup';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, saveToken } = useAuth();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_SIGNIN, {
        email,
        password,
      });
      saveToken(response.data.accessToken);
      setUser(response.data.user);
      navigate('/favorites');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 429) {
        setError('Too many login attempts. Please try again in a minute.');
      } else {
        setError(axiosError.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_SIGNUP, {
        email,
        password,
        name,
      });
      saveToken(response.data.accessToken);
      setUser(response.data.user);
      navigate('/favorites');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">&#9917;</div>
          <h1 className="auth-title">Football DataCenter</h1>
          <p className="auth-subtitle">Track matches, standings, and your favorite teams</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => switchTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label className="form-label" htmlFor="signin-email">
                  Email
                </label>
                <input
                  type="email"
                  id="signin-email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signin-password">
                  Password
                </label>
                <input
                  type="password"
                  id="signin-password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="form-error show">{error}</div>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">
                  Name
                </label>
                <input
                  type="text"
                  id="signup-name"
                  className="form-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">
                  Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">
                  Password
                </label>
                <input
                  type="password"
                  id="signup-password"
                  className="form-input"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {error && <div className="form-error show">{error}</div>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        <Link to="/" className="back-link">
          &#8592; Back to matches
        </Link>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(8, 145, 178, 0.06) 0%, transparent 50%),
            var(--bg-primary);
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          padding: 20px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 16px;
          box-shadow: 0 0 40px var(--cyan-glow);
        }

        .auth-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          font-size: 14px;
          color: var(--text-muted);
        }

        .auth-card {
          background: var(--bg-secondary);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 32px;
        }

        .auth-tabs {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--bg-tertiary);
          border-radius: 10px;
          margin-bottom: 24px;
        }

        .auth-tab {
          flex: 1;
          padding: 12px;
          border: none;
          background: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .auth-tab:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .auth-tab.active {
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan-light);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .form-error {
          font-size: 12px;
          color: #f87171;
          margin-bottom: 16px;
          display: none;
        }

        .form-error.show {
          display: block;
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary));
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .btn-submit:hover {
          box-shadow: 0 0 30px var(--cyan-glow);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .back-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default Login;

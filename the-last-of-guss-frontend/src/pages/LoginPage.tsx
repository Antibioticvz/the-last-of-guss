import React, { useState } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onLogin: (token: string, user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = isLogin
        ? await authService.login({ username, password })
        : await authService.register({ username, password });
      
      onLogin(response.access_token, response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🎯 The Last of Guss</h1>
          <p>The ultimate tapping competition</p>
        </div>

        <div className="login-form-container">
          <div className="login-tabs">
            <button
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              <LogIn size={16} />
              Login
            </button>
            <button
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              <UserPlus size={16} />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
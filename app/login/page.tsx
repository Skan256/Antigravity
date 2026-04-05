"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { Eye, EyeOff, Globe } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div className="auth-header">
          <h1 className="title-glow" style={{ fontSize: '2.8rem', letterSpacing: '-1px' }}>ArcheoMind</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Access the central excavation terminal</p>
        </div>
        
        {error && (
          <div className="error-message" style={{ animation: 'shake 0.4s ease-in-out' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleGoogleLogin} 
            disabled={loading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem', 
              padding: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <Globe size={20} color="var(--color-accent-secondary)" />
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Credential ID (Email)</label>
              <input 
                className="input-field"
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="archaeologist@example.com"
                required 
              />
            </div>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Access Token (Password)</label>
                <Link href="/reset-password" style={{ fontSize: '0.8rem', color: 'var(--color-accent-secondary)', opacity: 0.8 }}>
                  Lost Access?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  className="input-field"
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                  style={{ paddingRight: '3rem' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    opacity: 0.5
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1.5rem', padding: '1rem' }}>
              {loading ? 'Authenticating...' : 'Initiate Session'}
            </button>
          </form>
        </div>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          New Researcher? <Link href="/register" style={{ fontWeight: 600, color: 'var(--color-accent-primary)' }}>Register Profile</Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .error-message {
          background: rgba(255, 68, 68, 0.1);
          border-left: 3px solid #ff4444;
          color: #ffbbbb;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: left;
        }
        .btn-secondary {
          background: transparent;
          color: var(--color-text-primary);
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

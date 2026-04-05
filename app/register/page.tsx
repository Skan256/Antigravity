"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { Eye, EyeOff, Globe, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(email, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      <div className="auth-container glass-panel" style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '520px' }}>
        <div className="auth-header">
          <ShieldCheck size={48} color="var(--color-accent-primary)" style={{ margin: '0 auto 1.5rem', display: 'block', filter: 'drop-shadow(0 0 10px rgba(224, 108, 67, 0.4))' }} />
          <h1 className="title-glow" style={{ fontSize: '2.5rem' }}>Join ArcheoMind</h1>
          <p style={{ opacity: 0.8 }}>Create your secure researcher account</p>
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
            onClick={handleGoogleSignup} 
            disabled={loading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem', 
              padding: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)'
            }}
          >
            <Globe size={20} color="var(--color-accent-secondary)" />
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>OR USE EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="email">Work Email</label>
              <input 
                className="input-field"
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@archeomind.com"
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Security Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="input-field"
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required 
                  minLength={6}
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Verify Password</label>
              <input 
                className="input-field"
                type="password" 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1.5rem', padding: '1rem' }}>
              {loading ? 'Processing...' : 'Establish Profile'}
            </button>
          </form>
        </div>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          Already registered? <Link href="/login" style={{ fontWeight: 600, color: 'var(--color-accent-secondary)' }}>Login instead</Link>
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
        }
        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

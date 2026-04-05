"use client";

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 'var(--spacing-md) var(--spacing-xl)',
      borderBottom: 'var(--border-glass)',
      borderRadius: '0',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
        <NotificationBell />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--color-accent-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff'
          }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.email || 'Guest'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)', textTransform: 'capitalize' }}>{user?.role || 'Visitor'}</div>
          </div>
        </div>
        
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--color-text-secondary)', padding: 'var(--spacing-sm)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
          <LogOut size={18} />
          <span style={{ fontSize: '0.9rem' }}>Logout</span>
        </button>
      </div>
    </header>
  );
}

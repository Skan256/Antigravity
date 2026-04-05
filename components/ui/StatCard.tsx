"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subValue?: string;
}

export default function StatCard({ title, value, icon: Icon, color = "var(--color-accent-primary)", subValue }: StatCardProps) {
  return (
    <div className="glass-panel" style={{ 
      padding: 'var(--spacing-lg)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.75rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, border-color 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'rgba(224, 108, 67, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{title}</div>
        <div style={{ 
          background: `rgba(${color === 'var(--color-accent-primary)' ? '224, 108, 67' : '200, 153, 51'}, 0.1)`, 
          padding: '0.5rem', 
          borderRadius: 'var(--radius-md)',
          color: color
        }}>
          <Icon size={20} />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
        {subValue && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{subValue}</div>}
      </div>
      
      {/* Subtle Background Glow */}
      <div style={{ 
        position: 'absolute', 
        top: '-10%', 
        right: '-10%', 
        width: '60px', 
        height: '60px', 
        background: color, 
        filter: 'blur(40px)', 
        opacity: 0.1,
        pointerEvents: 'none'
      }}></div>
    </div>
  );
}

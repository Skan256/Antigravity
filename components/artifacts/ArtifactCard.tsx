"use client";

import Link from "next/link";
import { Artifact } from "@/lib/artifacts";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

interface ArtifactCardProps {
  artifact: Artifact;
}

export default function ArtifactCard({ artifact }: ArtifactCardProps) {
  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      transition: 'transform 0.3s ease, border-color 0.3s ease',
      height: '100%',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'rgba(224, 108, 67, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    }}>
      {/* Image Preview */}
      <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
        {artifact.imageUrl ? (
          <img 
            src={artifact.imageUrl} 
            alt={artifact.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
            No Preview
          </div>
        )}
        <div style={{ 
          position: 'absolute', 
          bottom: '0.5rem', 
          left: '0.5rem', 
          background: 'rgba(10, 15, 22, 0.6)', 
          backdropFilter: 'blur(4px)',
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          color: 'var(--color-accent-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <Calendar size={12} />
          {artifact.period}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{artifact.title}</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          <MapPin size={14} />
          {artifact.location}
        </div>
        
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--color-text-secondary)', 
            display: '-webkit-box', 
            WebkitLineClamp: '2', 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}>
            {artifact.description}
          </p>
        </div>

        <Link href={`/artifacts/${artifact.id}`} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginTop: 'var(--spacing-md)', 
          padding: '0.5rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(255,255,255,0.03)', 
          fontSize: '0.85rem', 
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-accent-primary)';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}>
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

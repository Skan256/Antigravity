"use client";

import Link from "next/link";
import { Report } from "@/lib/reports";
import { FileText, Calendar, ArrowRight, Tag } from "lucide-react";

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Generated": return "rgba(74, 222, 128, 0.1)";
      case "Draft": return "rgba(250, 204, 21, 0.1)";
      case "Exported": return "rgba(96, 165, 250, 0.1)";
      default: return "rgba(255, 255, 255, 0.05)";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Generated": return "#4ade80";
      case "Draft": return "#facc15";
      case "Exported": return "#60a5fa";
      default: return "var(--color-text-secondary)";
    }
  };

  return (
    <Link href={`/reports/${report.id}`} className="glass-panel" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: 'var(--spacing-lg)', 
      gap: 'var(--spacing-lg)',
      transition: 'transform 0.3s ease, border-color 0.3s ease',
      textDecoration: 'none',
      color: 'inherit'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = 'rgba(224, 108, 67, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    }}>
      <div style={{ 
        background: 'rgba(224, 108, 67, 0.1)', 
        padding: '1rem', 
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-accent-primary)'
      }}>
        <FileText size={28} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{report.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} />
            {new Date(report.createdAt).toLocaleDateString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Tag size={14} />
            Artifact: {report.artifactId.substring(0, 8)}...
          </span>
        </div>
      </div>

      <div style={{ 
        background: getStatusColor(report.status), 
        color: getStatusText(report.status), 
        padding: '0.4rem 0.8rem', 
        borderRadius: '20px', 
        fontSize: '0.75rem', 
        fontWeight: 700,
        border: `1px solid ${getStatusText(report.status)}22`,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {report.status}
      </div>

      <ArrowRight size={20} style={{ opacity: 0.3 }} />
    </Link>
  );
}

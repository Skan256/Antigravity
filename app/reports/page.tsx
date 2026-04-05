"use client";

import { useEffect, useState } from "react";
import { getReports, Report } from "@/lib/reports";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import ReportCard from "@/components/reports/ReportCard";
import { Search, Filter, Loader2, FilePlus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadReports() {
      if (!user || !activeProject) {
        setLoading(false);
        return;
      }
      try {
        const data = await getReports(user.uid, activeProject.projectId);
        setReports(data);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [user, activeProject]);

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>Report Archives</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Centralized repository of archaeological syntheses.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search reports by title or status..." 
            className="input-field" 
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} />
          Filter
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: 'var(--spacing-xl)', opacity: 0.6 }}>
          <Loader2 className="animate-spin" size={48} color="var(--color-accent-primary)" />
          <p>Accessing Secure Archives...</p>
        </div>
      ) : filteredReports.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {filteredReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-accent-primary)' }}>
            <FilePlus size={40} />
          </div>
          <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
            {searchTerm ? "No reports match your search criteria." : "No reports generated yet."}
          </h2>
          <p style={{ fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            {searchTerm ? "Try adjusting your search terms or filters." : "Start by selecting an artifact from the vault and triggering the 'Generate Report' action."}
          </p>
          {!searchTerm && (
            <Link href="/artifacts" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Go to Artifact Vault
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      )}

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

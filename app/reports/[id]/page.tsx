"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReportById, Report, updateReportStatus } from "@/lib/reports";
import { getArtifactById, Artifact } from "@/lib/artifacts";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, FileText, Calendar, Database, Shield, Download, CheckCircle } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [report, setReport] = useState<Report | null>(null);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!id || typeof id !== "string") return;
      try {
        const data = await getReportById(id);
        if (data && user && data.userId === user.uid) {
          setReport(data);
          // Fetch linked artifact for AI results
          const artData = await getArtifactById(data.artifactId);
          setArtifact(artData);
        } else if (data) {
          router.push("/reports");
        }
      } catch (err) {
        console.error("Error loading report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id, user, router]);

  const handleExportPDF = async () => {
    if (!reportRef.current || !report) return;
    
    setExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        format: "a4",
        unit: "mm"
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`ArcheoMind_Report_${report.title.replace(/\s+/g, '_')}.pdf`);
      
      // Update status to Exported
      await updateReportStatus(report.id as string, "Exported");
      setReport({ ...report, status: "Exported" });
      
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to export PDF.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-accent-primary)" />
        <p>Retrieving Archival Data...</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', maxWidth: '850px', margin: '0 auto 2rem' }}>
        <Link 
          href="/reports" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          <ArrowLeft size={16} />
          Back to Archives
        </Link>
        <button 
          className="btn-primary" 
          onClick={handleExportPDF} 
          disabled={exporting}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
        >
          {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {exporting ? 'Generating PDF...' : 'Export PDF Document'}
        </button>
      </div>

      {/* Paper Container */}
      <div 
        ref={reportRef}
        style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          margin: '0 auto', 
          background: '#ffffff', 
          color: '#1a1a1a', 
          padding: '25mm 20mm', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          borderRadius: '2px',
          position: 'relative'
        }}
      >
        {/* Branding Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1a1a1a', paddingBottom: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: '#e06c43', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
             <FileText size={24} />
             ARCHEOMIND OS
          </div>
          <div style={{ fontSize: '0.75rem', textAlign: 'right', fontWeight: 500, opacity: 0.7 }}>
            CLASSIFIED: RESEARCH ARCHIVE<br />
            VERSION 1.0.4-MVP
          </div>
        </div>

        {/* Report Content */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            {report.title}
          </h1>
          <div style={{ fontSize: '1rem', color: '#555', fontWeight: 500 }}>
            ARCHAEOLOGICAL SYNTHESIS REPORT
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', border: '1px solid #ddd', padding: '1.5rem', marginBottom: '3rem', fontSize: '0.8rem' }}>
          <div>
            <div style={{ color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Date of Origin</div>
            <div style={{ fontWeight: 600 }}>{new Date(report.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <div>
            <div style={{ color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Artifact Registry ID</div>
            <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>AM-{report.artifactId.substring(0, 8).toUpperCase()}</div>
          </div>
          <div>
            <div style={{ color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Archive Status</div>
            <div style={{ fontWeight: 600, color: '#e06c43', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
               <CheckCircle size={14} />
               OFFICIALLY {report.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Body Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              01. Physical Characteristics
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#333', textAlign: 'justify' }}>
              {report.description}
            </p>
          </section>

          <section>
             <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              02. Historical Context Analysis
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#333', textAlign: 'justify' }}>
              Initial archaeological research suggests this find dates to a period of significant geopolitical transition in the region. The craftmanship indicates specialized artisanal knowledge, possibly originating from a centralized production hub. Further comparative study with established chronologies is required to confirm exact dating.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              03. Archaeological Assessment
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#333', textAlign: 'justify' }}>
              The state of preservation is consistent with long-term exposure to anaerobic conditions. Surface wear patterns suggest regular use prior to deposition. Chemical analysis of trace residues will be necessary to determine original content or ceremonial purpose.
            </p>
          </section>

          <section style={{ background: '#f9f9f9', padding: '1.5rem', borderLeft: '4px solid #e06c43' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#e06c43', marginBottom: '0.75rem' }}>
              AI Insights (Cognitive Analysis)
            </h3>
            {artifact?.aiAnalysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.6' }}>
                  <strong>Interpretation:</strong> {artifact.aiAnalysis.interpretation}
                </p>
                <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.6' }}>
                  <strong>Usage:</strong> {artifact.aiAnalysis.usage}
                </p>
                <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.6' }}>
                  <strong>Significance:</strong> {artifact.aiAnalysis.significance}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#444', lineHeight: '1.6' }}>
                "Initial archival synthesis complete. Mind-Model Alpha-1 has not yet been triggered for this specific artifact chain. Run AI Analysis from the Artifact Vault to populate advanced cognitive insights."
              </p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '1rem', fontSize: '0.7rem', color: '#888' }}>
          <div>ArcheoMind Digital Artifacts Vault // {report.id}</div>
          <div>CONFIDENTIAL // PAGE 01</div>
        </div>
      </div>

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

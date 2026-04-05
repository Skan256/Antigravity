"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getArtifactById, Artifact, updateArtifact, deleteArtifact } from "@/lib/artifacts";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { ArrowLeft, MapPin, Calendar, Clock, Share2, Download, Trash2, Edit3, Loader2, FileText, Sparkles, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { createReport } from "@/lib/reports";
import LeafletMap from "@/components/maps/LeafletMap";
import { createNotification } from "@/lib/notifications";

export default function ArtifactDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { activeProject } = useProject();
  const router = useRouter();
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function loadArtifact() {
      if (!id || typeof id !== "string") return;
      try {
        const data = await getArtifactById(id);
        if (data && user && data.userId === user.uid) {
          setArtifact(data);
        } else if (data) {
          router.push("/artifacts"); // Unauthorized
        }
      } catch (err) {
        console.error("Error loading artifact:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArtifact();
  }, [id, user, router]);

  const handleGenerateReport = async () => {
    if (!artifact || !user) return;
    
    setGenerating(true);
    try {
      const reportId = await createReport({
        artifactId: id as string,
        projectId: activeProject?.projectId || "",
        title: artifact.title,
        description: artifact.description,
        userId: user.uid
      });
      await createNotification({
        userId: user.uid,
        type: 'report',
        message: `Professional report generated for ${artifact.title}`,
        link: `/reports/${reportId}`
      });
      router.push(`/reports/${reportId}`);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report.");
      setGenerating(false);
    }
  };

  const handleRunAI = async () => {
    if (!artifact || !user) return;
    
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        body: JSON.stringify({
          title: artifact.title,
          period: artifact.period,
          location: artifact.location,
          description: artifact.description
        })
      });
      
      const analysis = await res.json();
      await updateArtifact(id as string, { aiAnalysis: analysis });
      setArtifact({ ...artifact, aiAnalysis: analysis });
      
      await createNotification({
        userId: user.uid,
        type: 'ai',
        message: `Cognitive insights synthesized for ${artifact.title}`,
        link: `/artifacts/${id}`
      });
    } catch (err) {
      console.error("AI Analysis Error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!artifact || !confirm("Are you sure you want to delete this artifact? This action cannot be undone.")) return;
    
    try {
      await deleteArtifact(id as string);
      router.push("/artifacts");
    } catch (err) {
      console.error("Error deleting artifact:", err);
      alert("Failed to delete artifact.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-accent-primary)" />
        <p>Retrieving Archival Metadata...</p>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', margin: '2rem auto', maxWidth: '600px' }}>
        <h2 style={{ color: 'var(--color-accent-primary)', marginBottom: '1rem' }}>Artifact Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>We couldn't locate the artifact record you're looking for.</p>
        <Link href="/artifacts" className="btn-primary">Return to Vault</Link>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Navigation Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <Link 
          href="/artifacts" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          <ArrowLeft size={16} />
          Back to Vault
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-primary" 
            onClick={handleGenerateReport} 
            disabled={generating}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleRunAI}
            disabled={analyzing || !!artifact.aiAnalysis}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: artifact.aiAnalysis ? '#4ade80' : 'var(--color-text-primary)' }}
          >
            {analyzing ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
            {analyzing ? 'AI Thinking...' : artifact.aiAnalysis ? 'Analysis Complete' : 'Run AI Analysis'}
          </button>
          <button className="btn-secondary" style={{ padding: '0.5rem' }} title="Edit"><Edit3 size={18} /></button>
          <button className="btn-secondary" style={{ padding: '0.5rem' }} title="Share"><Share2 size={18} /></button>
          <button className="btn-secondary" onClick={handleDelete} style={{ padding: '0.5rem', color: '#ff4444' }} title="Delete"><Trash2 size={18} /></button>
          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}><Download size={18} /> Export Data</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
        {/* Artifact Imagery */}
        <div className="glass-panel" style={{ padding: '0.5rem', overflow: 'hidden' }}>
          {artifact.imageUrl ? (
            <img 
              src={artifact.imageUrl} 
              alt={artifact.title} 
              style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
            />
          ) : (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
              No image available
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', color: 'var(--color-accent-primary)', lineHeight: '1', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
              {artifact.title}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} color="var(--color-accent-secondary)" /> {artifact.period}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} color="var(--color-accent-secondary)" /> {artifact.location}</span>
            </div>
          </div>

          {/* Site Map Snapshot */}
          {artifact.lat && artifact.lng && (
            <div className="glass-panel" style={{ padding: '4px', background: 'rgba(255,255,255,0.02)' }}>
              <LeafletMap 
                pins={[{ id: artifact.id!, lat: artifact.lat, lng: artifact.lng, title: artifact.title, period: artifact.period }]} 
                center={[artifact.lat, artifact.lng]}
                zoom={16}
                height="200px" 
              />
              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>GPS Location Lock</span>
                <span>{artifact.lat.toFixed(4)}, {artifact.lng.toFixed(4)}</span>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.03)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--color-accent-primary)" />
              Timeline & Context
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {artifact.description}
            </p>
          </div>

          {/* AI Analysis Result Section */}
          {artifact.aiAnalysis && (
            <div className="glass-panel" style={{ 
              padding: 'var(--spacing-lg)', 
              background: 'rgba(224, 108, 67, 0.05)', 
              borderLeft: '4px solid var(--color-accent-primary)',
              animation: 'fadeIn 0.6s ease-out'
            }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-accent-primary)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} />
                AI Cognitive Insights
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Historical Interpretation</div>
                  <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{artifact.aiAnalysis.interpretation}</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Hypothesized Usage</div>
                  <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{artifact.aiAnalysis.usage}</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Cultural Significance</div>
                  <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{artifact.aiAnalysis.significance}</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-md)', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Registry ID</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{id}</div>
            </div>
            <div className="glass-panel" style={{ padding: 'var(--spacing-md)', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Catalogued On</div>
              <div style={{ fontWeight: 600 }}>{new Date(artifact.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
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

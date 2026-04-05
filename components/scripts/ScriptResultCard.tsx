"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  History, 
  Trash2, 
  Link as LinkIcon, 
  Save, 
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { createScriptAnalysis, ScriptAnalysis } from "@/lib/scripts";
import { getArtifacts, Artifact } from "@/lib/artifacts";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";

interface ScriptResultCardProps {
  result: any;
  imageFile: File | null;
  onSave?: () => void;
  isHistory?: boolean;
  historyItem?: ScriptAnalysis;
}

export default function ScriptResultCard({ result, imageFile, onSave, isHistory, historyItem }: ScriptResultCardProps) {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [saving, setSaving] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState("");

  useEffect(() => {
    async function loadArtifacts() {
      if (!user || !activeProject) return;
      const data = await getArtifacts(user.uid, activeProject.projectId);
      setArtifacts(data);
    }
    loadArtifacts();
  }, [user, activeProject]);

  const handleSave = async () => {
    if (!user || !activeProject || !imageFile) return;
    
    setSaving(true);
    try {
      await createScriptAnalysis({
        userId: user.uid,
        projectId: activeProject.projectId,
        imageUrl: "", // Handled by createScriptAnalysis
        scriptType: result.scriptType,
        transcription: result.transcription,
        translation: result.translation,
        confidence: result.confidence,
        historicalContext: result.historicalContext,
        linkedArtifactId: selectedArtifactId || undefined
      }, imageFile);
      
      if (onSave) onSave();
      
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to archive analysis.");
    } finally {
      setSaving(false);
    }
  };

  const confidenceColor = result.confidence > 80 ? "#4ade80" : result.confidence > 50 ? "#fbbf24" : "#f87171";

  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isHistory ? <History size={20} color="var(--color-text-secondary)" /> : <CheckCircle2 size={24} color="#4ade80" />}
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-accent-primary)' }}>
            {isHistory ? "Archived Analysis" : "Synthesis Complete"}
          </h3>
        </div>
        {!isHistory && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${confidenceColor}` }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Confidence:</span>
            <span style={{ fontWeight: 700, color: confidenceColor }}>{result.confidence}%</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-xl)' }}>
        {/* Visual Record */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <img 
            src={isHistory ? historyItem?.imageUrl : URL.createObjectURL(imageFile!)} 
            alt="Source Inscription" 
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: 'var(--border-glass)' }} 
          />
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Detected Script</div>
            <div style={{ fontWeight: 600, color: 'var(--color-accent-primary)' }}>{result.scriptType}</div>
          </div>

          {isHistory && historyItem?.linkedArtifactId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <LinkIcon size={14} />
              Synced to Artifact Archive
            </div>
          )}
        </div>

        {/* Textual Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-accent-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Transcription</div>
            <div style={{ fontSize: '1.25rem', fontFamily: 'serif', background: 'rgba(255,255,255,0.03)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)', border: 'var(--border-glass)' }}>
              {result.transcription}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-accent-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Translation</div>
            <div style={{ fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
              "{result.translation}"
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-accent-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Archival Context</div>
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              {result.historicalContext}
            </div>
          </div>

          {!isHistory && (
            <div style={{ marginTop: 'var(--spacing-md)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'var(--spacing-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem' }}>
                <div className="form-group">
                  <select 
                    className="input-field"
                    value={selectedArtifactId}
                    onChange={(e) => setSelectedArtifactId(e.target.value)}
                    style={{ appearance: 'none', background: 'rgba(0,0,0,0.2) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 0.75rem center', paddingRight: '2.5rem' }}
                  >
                    <option value="">Link to Existing Artifact (Optional)</option>
                    {artifacts.map(art => (
                      <option key={art.id} value={art.id}>{art.title}</option>
                    ))}
                  </select>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={handleSave} 
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Archive Result
                </button>
              </div>
            </div>
          )}
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

"use client";

import { useEffect, useState } from "react";
import { getScriptAnalyses, ScriptAnalysis } from "@/lib/scripts";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import ScriptAnalyzer from "@/components/scripts/ScriptAnalyzer";
import ScriptResultCard from "@/components/scripts/ScriptResultCard";
import { Loader2, History, Languages } from "lucide-react";

export default function ScriptAnalyzerPage() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [analyses, setAnalyses] = useState<ScriptAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentResult, setCurrentResult] = useState<any | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadAnalyses() {
      if (!user || !activeProject) {
        setLoading(false);
        return;
      }
      try {
        const data = await getScriptAnalyses(user.uid, activeProject.projectId);
        setAnalyses(data);
      } catch (err) {
        console.error("Error loading analyses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalyses();
  }, [user, activeProject]);

  const handleAnalysisComplete = (result: any, file: File) => {
    setCurrentResult(result);
    setCurrentFile(file);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    setCurrentResult(null);
    setCurrentFile(null);
    // Reload history
    if (!user || !activeProject) return;
    const data = await getScriptAnalyses(user.uid, activeProject.projectId);
    setAnalyses(data);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>Ancient Script Analyzer</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Expert epigraphic OCR, translation, and historical synthesis.</p>
        </div>
      </div>

      {currentResult && currentFile ? (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <ScriptResultCard 
            result={currentResult} 
            imageFile={currentFile} 
            onSave={handleSave} 
          />
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              className="btn-secondary" 
              onClick={() => { setCurrentResult(null); setCurrentFile(null); }}
              style={{ fontSize: '0.9rem' }}
            >
              Analyze Another Inscription
            </button>
          </div>
        </div>
      ) : (
        <ScriptAnalyzer onAnalysisComplete={handleAnalysisComplete} />
      )}

      {/* History */}
      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--spacing-lg)' }}>
          <History size={20} color="var(--color-accent-secondary)" />
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>Archival History</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)', padding: '2rem' }}>
            <Loader2 className="animate-spin" size={24} />
            Accessing script archives...
          </div>
        ) : analyses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {analyses.map(item => (
              <ScriptResultCard 
                key={item.id}
                result={{
                  scriptType: item.scriptType,
                  transcription: item.transcription,
                  translation: item.translation,
                  confidence: item.confidence,
                  historicalContext: item.historicalContext
                }}
                imageFile={null}
                isHistory={true}
                historyItem={item}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', borderStyle: 'dashed' }}>
            <Languages size={48} opacity={0.1} style={{ marginBottom: '1rem' }} />
            <div>Your script archival history is currently empty.</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Upload an inscription above to begin translation.</div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

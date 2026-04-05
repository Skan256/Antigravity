"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Sparkles, Languages, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";

interface ScriptAnalyzerProps {
  onAnalysisComplete: (result: any, file: File) => void;
}

export default function ScriptAnalyzer({ onAnalysisComplete }: ScriptAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scriptHint, setScriptHint] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzeScript = async () => {
    if (!imageFile) return;
    
    setLoading(true);

    try {
      // 1. Convert to base64 for API
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });

      const base64Image = await base64Promise;

      // 2. Call Vision API
      const res = await fetch("/api/ai/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType: imageFile.type,
          scriptTypeHint: scriptHint
        })
      });

      const result = await res.json();
      onAnalysisComplete(result, imageFile);
      
    } catch (err) {
      console.error("Script Analysis Error:", err);
      alert("Failed to analyze inscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ background: 'var(--color-accent-primary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Languages size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-accent-primary)' }}>Epigraphic Vision Input</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
        {/* Upload Zone */}
        <div 
          onClick={() => !loading && fileInputRef.current?.click()}
          className="upload-zone"
          style={{ 
            border: '2px dashed rgba(255,255,255,0.1)', 
            borderRadius: 'var(--radius-md)', 
            minHeight: '300px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
            disabled={loading}
          />

          {imagePreview ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', padding: '1rem' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-sm)', 
                  border: 'var(--border-glass)' 
                }} 
              />
              {!loading && (
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  style={{ 
                    position: 'absolute', 
                    top: '0', 
                    right: '0', 
                    background: 'var(--color-accent-primary)', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)' }}>
              <Upload size={48} opacity={0.3} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Archive Inscription Image</div>
                <div style={{ fontSize: '0.85rem' }}>PNG, JPG or WEBP (Max 10MB)</div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Settings2 size={16} />
              Script Context (Optional)
            </label>
            <select 
              className="input-field"
              value={scriptHint}
              onChange={(e) => setScriptHint(e.target.value)}
              disabled={loading}
              style={{ appearance: 'none', background: 'rgba(0,0,0,0.2) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 0.75rem center', paddingRight: '2.5rem' }}
            >
              <option value="">Auto-Detect Script</option>
              <option value="Egyptian Hieroglyphics">Egyptian Hieroglyphics</option>
              <option value="Cuneiform">Cuneiform (Sumerian/Akkadian)</option>
              <option value="Ancient Greek">Ancient Greek</option>
              <option value="Latin">Classical Latin</option>
              <option value="Phoenician">Phoenician</option>
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Specifying the script type can improve transcription accuracy for damaged artifacts.
            </p>
          </div>

          <div style={{ flex: 1 }}></div>

          <button 
            className="btn-primary" 
            onClick={analyzeScript}
            disabled={!imageFile || loading}
            style={{ width: '100%', padding: '1rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Processing Inscription...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Synthesize Analysis
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .upload-zone:hover {
          border-color: var(--color-accent-primary) !important;
          background: rgba(255,255,255,0.05) !important;
        }
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

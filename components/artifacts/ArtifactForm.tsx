"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createArtifact } from "@/lib/artifacts";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { Upload, X, Loader2, Save } from "lucide-react";

export default function ArtifactForm() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    period: "Roman",
    location: "",
    material: "Ceramic",
    description: "",
    lat: "",
    lng: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError("");

    try {
      await createArtifact(
        { 
          ...formData, 
          userId: user.uid, 
          projectId: activeProject?.projectId || "", 
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lng: formData.lng ? parseFloat(formData.lng) : undefined,
          imageUrl: "" 
        },
        imageFile
      );
      router.push("/artifacts");
    } catch (err: any) {
      setError(err.message || "Failed to create artifact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ 
      padding: 'var(--spacing-xl)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--spacing-lg)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent-primary)', marginBottom: 'var(--spacing-md)' }}>Register New Discovery</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        <div className="form-group">
          <label htmlFor="title">Artifact Title</label>
          <input 
            className="input-field"
            type="text" 
            id="title" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Bronze Corinthian Helmet"
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="period">Historical Period</label>
          <select 
            className="input-field"
            id="period" 
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            required
            style={{ appearance: 'none', background: 'rgba(0,0,0,0.2) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 0.75rem center', paddingRight: '2.5rem' }}
          >
            <option value="Bronze Age">Bronze Age</option>
            <option value="Iron Age">Iron Age</option>
            <option value="Carthaginian">Carthaginian / Punic</option>
            <option value="Roman">Roman</option>
            <option value="Byzantine">Byzantine</option>
            <option value="Islamic">Islamic Period</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        <div className="form-group">
          <label htmlFor="location">Excavation Site / Location</label>
          <input 
            className="input-field"
            type="text" 
            id="location" 
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Carthage Northern Sector"
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="material">Primary Material</label>
          <select 
            className="input-field"
            id="material" 
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            required
            style={{ appearance: 'none', background: 'rgba(0,0,0,0.2) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 0.75rem center', paddingRight: '2.5rem' }}
          >
            <option value="Ceramic">Ceramic / Pottery</option>
            <option value="Stone">Stone / Marble</option>
            <option value="Metal">Bronze / Iron / Gold</option>
            <option value="Glass">Glass / Mosaic</option>
            <option value="Organic">Bone / Wood / Ivory</option>
            <option value="Terracotta">Terracotta</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        <div className="form-group">
          <label htmlFor="lat">Latitude (GPS)</label>
          <input 
            className="input-field"
            type="number" 
            step="any"
            id="lat" 
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            placeholder="e.g., 36.8521"
          />
        </div>
        <div className="form-group">
          <label htmlFor="lng">Longitude (GPS)</label>
          <input 
            className="input-field"
            type="number" 
            step="any"
            id="lng" 
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            placeholder="e.g., 10.3234"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Detailed Description</label>
        <textarea 
          className="input-field"
          id="description" 
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe physical characteristics, state of preservation, and context..."
          required
          style={{ resize: 'vertical', minHeight: '120px' }}
        />
      </div>

      <div className="form-group">
        <label>Artifact Imagery</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            border: '2px dashed rgba(255,255,255,0.1)', 
            borderRadius: 'var(--radius-md)', 
            padding: 'var(--spacing-xl)', 
            textAlign: 'center', 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            background: 'rgba(255,255,255,0.02)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {imagePreview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-sm)', border: 'var(--border-glass)' }} />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  right: '-10px', 
                  background: 'var(--color-accent-primary)', 
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
              <Upload size={32} />
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Click or drag image to upload</div>
              <div style={{ fontSize: '0.8rem' }}>High-resolution JPEG or PNG recommended</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--spacing-md)' }}>
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
          style={{ flex: 1, padding: '1rem' }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving to Vault...
            </>
          ) : (
            <>
              <Save size={20} />
              Register Artifact
            </>
          )}
        </button>
        <button 
          type="button" 
          className="btn-secondary" 
          disabled={loading}
          onClick={() => router.back()}
          style={{ flex: 0.3 }}
        >
          Cancel
        </button>
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
    </form>
  );
}

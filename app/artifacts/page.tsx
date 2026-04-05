"use client";

import { useEffect, useState, useMemo } from "react";
import { getArtifacts, Artifact } from "@/lib/artifacts";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import ArtifactCard from "@/components/artifacts/ArtifactCard";
import { Search, Filter, Plus, Loader2, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function ArtifactsPage() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    period: "All",
    material: "All",
    location: "All"
  });

  useEffect(() => {
    async function loadArtifacts() {
      if (!user || !activeProject) {
        setLoading(false);
        return;
      }
      try {
        const data = await getArtifacts(user.uid, activeProject.projectId);
        setArtifacts(data);
      } catch (err) {
        console.error("Error loading artifacts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArtifacts();
  }, [user, activeProject]);

  // Derived filter options
  const periods = useMemo(() => ["All", ...Array.from(new Set(artifacts.map(a => a.period)))], [artifacts]);
  const materials = useMemo(() => ["All", ...Array.from(new Set(artifacts.map(a => a.material || "Unknown")))], [artifacts]);
  const locations = useMemo(() => ["All", ...Array.from(new Set(artifacts.map(a => a.location)))], [artifacts]);

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = 
      artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      artifact.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeriod = filters.period === "All" || artifact.period === filters.period;
    const matchesMaterial = filters.material === "All" || artifact.material === filters.material;
    const matchesLocation = filters.location === "All" || artifact.location === filters.location;

    return matchesSearch && matchesPeriod && matchesMaterial && matchesLocation;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ period: "All", material: "All", location: "All" });
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>Artifact Vault</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Centralized repository of all excavations.</p>
        </div>
        <Link href="/artifacts/new" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
          <Plus size={20} />
          Register Discovery
        </Link>
      </div>

      {/* Advanced Toolbar */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Search by title or description..." 
              className="input-field" 
              style={{ paddingLeft: '3rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-secondary" 
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: showFilters ? 'var(--color-accent-primary)' : 'var(--color-text-primary)' }}
          >
            <SlidersHorizontal size={18} />
            Filters {(filters.period !== "All" || filters.material !== "All" || filters.location !== "All") && "•"}
          </button>
          {(searchTerm || filters.period !== "All" || filters.material !== "All" || filters.location !== "All") && (
            <button className="btn-secondary" onClick={clearFilters} style={{ padding: '0.5rem' }} title="Clear All">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem', 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Period</label>
              <select 
                className="input-field" 
                value={filters.period} 
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                style={{ fontSize: '0.85rem' }}
              >
                {periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Material</label>
              <select 
                className="input-field" 
                value={filters.material} 
                onChange={(e) => setFilters({ ...filters, material: e.target.value })}
                style={{ fontSize: '0.85rem' }}
              >
                {materials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Location</label>
              <select 
                className="input-field" 
                value={filters.location} 
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                style={{ fontSize: '0.85rem' }}
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: 'var(--spacing-xl)', opacity: 0.6 }}>
          <Loader2 className="animate-spin" size={48} color="var(--color-accent-primary)" />
          <p>Accessing Secure Vault...</p>
        </div>
      ) : filteredArtifacts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-xl)' }}>
          {filteredArtifacts.map(artifact => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>
            {searchTerm || showFilters ? "No artifacts match your search criteria." : "Your vault is currently empty."}
          </p>
          <Link href="/artifacts/new" className="btn-primary">Register Your First Artifact</Link>
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

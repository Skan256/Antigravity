"use client";

import { useEffect, useState } from "react";
import { getArtifacts, Artifact } from "@/lib/artifacts";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import LeafletMap from "@/components/maps/LeafletMap";
import { Loader2, Navigation, Layers, Info } from "lucide-react";

export default function SiteMapPage() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

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

  const mapPins = artifacts
    .filter(a => a.lat !== undefined && a.lng !== undefined)
    .map(a => ({
      id: a.id!,
      lat: a.lat!,
      lng: a.lng!,
      title: a.title,
      period: a.period
    }));

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>Site Explorer</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
            Interactive geospatial mapping for <strong>{activeProject?.projectName}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} />
            <span>Map Layer: OpenStreetMap</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={16} />
            <span>{mapPins.length} Active Pins</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--color-accent-primary)" />
            <p>Triangulating site coordinates...</p>
          </div>
        ) : (
          <>
            <LeafletMap pins={mapPins} height="100%" />
            
            {mapPins.length === 0 && (
              <div style={{ 
                position: 'absolute', 
                top: '2rem', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 10,
                width: '80%',
                maxWidth: '500px'
              }}>
                <div className="glass-panel" style={{ 
                  padding: 'var(--spacing-md)', 
                  background: 'rgba(26, 21, 18, 0.9)', 
                  border: '1px solid var(--color-accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  <Info color="var(--color-accent-primary)" size={32} />
                  <div>
                    <h3 style={{ color: 'white', margin: 0 }}>No GPS Pins Detected</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Register artifacts with Latitude and Longitude to populate this excavation map.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
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
      `}</style>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getArtifacts, Artifact, getRecentArtifacts } from "@/lib/artifacts";
import { getReports } from "@/lib/reports";
import { useProject } from "@/contexts/ProjectContext";
import StatCard from "@/components/ui/StatCard";
import ArtifactCard from "@/components/artifacts/ArtifactCard";
import { Database, FileText, Activity, Plus, Sparkles, PieChart, Info, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, sendVerification } = useAuth();
  const { activeProject } = useProject();
  const [sent, setSent] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user || !activeProject) return;
      try {
        const [arts, reps] = await Promise.all([
          getArtifacts(user.uid, activeProject.projectId),
          getReports(user.uid, activeProject.projectId)
        ]);
        setArtifacts(arts);
        setReportsCount(reps.length);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user, activeProject]);

  // Analytics Logic
  const analytics = useMemo(() => {
    if (artifacts.length === 0) return null;

    const aiAnalyses = artifacts.filter(a => !!a.aiAnalysis).length;
    const aiCoverage = Math.round((aiAnalyses / artifacts.length) * 100);

    // Frequency Maps
    const periodMap: Record<string, number> = {};
    const locationMap: Record<string, number> = {};

    artifacts.forEach(a => {
      periodMap[a.period] = (periodMap[a.period] || 0) + 1;
      locationMap[a.location] = (locationMap[a.location] || 0) + 1;
    });

    const sortedPeriods = Object.entries(periodMap).sort((a, b) => b[1] - a[1]);
    const sortedLocations = Object.entries(locationMap).sort((a, b) => b[1] - a[1]);

    return {
      aiAnalyses,
      aiCoverage,
      mostCommonPeriod: sortedPeriods[0]?.[0] || "N/A",
      mostCommonLocation: sortedLocations[0]?.[0] || "N/A",
      periodDist: sortedPeriods.slice(0, 5),
      locationDist: sortedLocations.slice(0, 5)
    };
  }, [artifacts]);

  const handleResend = async () => {
    try {
      await sendVerification();
      setSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Verification Banner */}
      {!user?.emailVerified && (
        <div className="glass-panel" style={{ 
          background: 'rgba(224, 108, 67, 0.1)', 
          borderLeft: '4px solid var(--color-accent-primary)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📧</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-accent-primary)' }}>Email Verification Required</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Please verify your email to access all features.</div>
            </div>
          </div>
          <button className="btn-secondary" onClick={handleResend} disabled={sent} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            {sent ? 'Verification Sent!' : 'Resend Email'}
          </button>
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 'var(--spacing-lg)', borderBottom: 'var(--border-glass)', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>Command Center</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Smart archaeological monitoring and trend analysis.</p>
        </div>
        <Link href="/artifacts/new" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
          <Plus size={20} />
          Register Discovery
        </Link>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <StatCard title="Total Artifacts" value={artifacts.length} icon={Database} subValue="Physical findings" />
        <StatCard title="Generated Reports" value={reportsCount} icon={FileText} color="var(--color-accent-secondary)" subValue="Archival synthesis" />
        <StatCard title="AI Analyses" value={analytics?.aiAnalyses || 0} icon={Sparkles} color="#4ade80" subValue={`${analytics?.aiCoverage || 0}% Coverage`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
        {/* Analytics Section */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-accent-primary)' }}>
            <TrendingUp size={20} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Archival Trends</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {/* Period Dist */}
             <div>
               <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Distribution by Period</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analytics?.periodDist.map(([period, count]) => (
                    <div key={period} style={{ fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{period}</span>
                        <span>{count}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(count / artifacts.length) * 100}%`, height: '100%', background: 'var(--color-accent-primary)' }}></div>
                      </div>
                    </div>
                  ))}
                  {artifacts.length === 0 && <div style={{ opacity: 0.5 }}>No data available</div>}
               </div>
             </div>

             {/* Location Dist */}
             <div>
               <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Primary Excavation Sites</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analytics?.locationDist.map(([loc, count]) => (
                    <div key={loc} style={{ fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{loc}</span>
                        <span>{count}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(count / artifacts.length) * 100}%`, height: '100%', background: 'var(--color-accent-secondary)' }}></div>
                      </div>
                    </div>
                  ))}
                  {artifacts.length === 0 && <div style={{ opacity: 0.5 }}>No data available</div>}
               </div>
             </div>
          </div>
        </div>

        {/* Insights Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', background: 'linear-gradient(135deg, rgba(224, 108, 67, 0.1), rgba(0,0,0,0))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-accent-primary)' }}>
              <Info size={20} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Mind-Model Insights</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>🏛️</div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>Dominant Era</div>
                  <div style={{ fontWeight: 600 }}>{analytics?.mostCommonPeriod}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>📍</div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>Active Hub</div>
                  <div style={{ fontWeight: 600 }}>{analytics?.mostCommonLocation}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>🧬</div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>AI Confidence</div>
                  <div style={{ fontWeight: 600 }}>{analytics?.aiCoverage || 0}% Data Saturation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            <PieChart size={40} color="var(--color-accent-secondary)" />
            <div>
              <div style={{ fontWeight: 600 }}>Archive Health</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                {artifacts.length > 5 ? "Robust data collection. Trend mapping is statistically significant." : "Growing archive. Collect more artifacts to improve trend accuracy."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Disoveries (Condensed) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Recent Discoveries</h2>
          <Link href="/artifacts" style={{ fontSize: '0.9rem', color: 'var(--color-accent-secondary)', fontWeight: 500 }}>View Vault →</Link>
        </div>
        
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)' }}>
             {[1, 2, 3].map(i => <div key={i} className="glass-panel" style={{ height: '300px', opacity: 0.3 }}></div>)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-lg)' }}>
            {artifacts.slice(0, 3).map(art => <ArtifactCard key={art.id} artifact={art} />)}
            {artifacts.length === 0 && <p style={{ color: 'var(--color-text-secondary)' }}>No recent discoveries found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

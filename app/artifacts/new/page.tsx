"use client";

import ArtifactForm from "@/components/artifacts/ArtifactForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewArtifactPage() {
  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Link 
          href="/artifacts" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)', width: 'fit-content' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          <ArrowLeft size={16} />
          Back to Vault
        </Link>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>New Discovery</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Enter the details of your latest excavation find.</p>
      </div>

      <ArtifactForm />
    </div>
  );
}

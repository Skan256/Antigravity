import Link from 'next/link';
import { Compass, Book, Database, FileText, Settings, Users, ChevronDown, Rocket, Map, Languages, MessageSquare } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { activeProject, projects, switchProject } = useProject();
  const [showProjects, setShowProjects] = useState(false);

  return (
    <aside style={{
      width: '260px',
      background: 'var(--color-bg-secondary)',
      borderRight: 'var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--spacing-xl) 0',
      boxShadow: 'var(--shadow-glass)',
      zIndex: 10
    }}>
      <div style={{ padding: '0 var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
        <h2 className="title-glow" style={{ fontSize: '1.5rem', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={28} />
          ArcheoMind
        </h2>
      </div>



      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, padding: '0 var(--spacing-md)' }}>
        <SidebarLink href="/" icon={<Book size={20} />} label="Dashboard" />
        <SidebarLink href="/messages" icon={<MessageSquare size={20} />} label="Discussions" />
        <SidebarLink href="/artifacts" icon={<Database size={20} />} label="Artifact Vault" />
        <SidebarLink href="/map" icon={<Map size={20} />} label="Site Explorer" />
        <SidebarLink href="/scripts" icon={<Languages size={20} />} label="Script Analyzer" />
        <SidebarLink href="/reports" icon={<FileText size={20} />} label="Report Archives" />
        <SidebarLink href="/team" icon={<Users size={20} />} label="Team Members" />
      </nav>

      <div style={{ padding: '0 var(--spacing-md)' }}>
        <SidebarLink href="/settings" icon={<Settings size={20} />} label="Settings" />
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      borderRadius: 'var(--radius-md)',
      color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
      background: isActive ? 'var(--color-bg-glass)' : 'transparent',
      transition: 'all 0.2s',
      fontWeight: 500
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--color-bg-glass)';
      e.currentTarget.style.color = 'var(--color-accent-primary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = isActive ? 'var(--color-bg-glass)' : 'transparent';
      e.currentTarget.style.color = isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)';
    }}>
      {icon}
      {label}
    </Link>
  );
}

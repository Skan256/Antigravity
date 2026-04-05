import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import ProtectedLayout from '@/components/ProtectedLayout';

export const metadata: Metadata = {
  title: 'ArcheoMind | Archaeological SaaS',
  description: 'A premium collaborative SaaS tool for the archaeological sector.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <ProjectProvider>
            <ProtectedLayout>
              {children}
            </ProtectedLayout>
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

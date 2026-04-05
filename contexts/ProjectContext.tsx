"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMembershipsForUser, createProject, getMemberships, Membership } from "@/lib/projects";

interface ProjectContextType {
  activeProject: (Membership & { projectName?: string }) | null;
  projects: (Membership & { projectName?: string })[];
  loading: boolean;
  switchProject: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<(Membership & { projectName?: string })[]>([]);
  const [activeProject, setActiveProject] = useState<(Membership & { projectName?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setActiveProject(null);
      setLoading(false);
      return;
    }

    try {
      // Use getMembershipsForUser to also claim email-based pending invitations
      let memberships = await getMembershipsForUser({ uid: user.uid, email: user.email });
      
      // If no projects exist (new user), create a default one
      if (memberships.length === 0) {
        const defaultName = `${user.email?.split('@')[0]}'s Workspace`;
        await createProject(defaultName, user.uid);
        memberships = await getMembershipsForUser({ uid: user.uid, email: user.email });
      }

      setProjects(memberships);
      
      // Keep active project if it still exists in the list, otherwise pick the first one
      const currentActive = memberships.find(p => p.projectId === activeProject?.projectId) || memberships[0];
      setActiveProject(currentActive);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const switchProject = (projectId: string) => {
    const proj = projects.find(p => p.projectId === projectId);
    if (proj) setActiveProject(proj);
  };

  return (
    <ProjectContext.Provider value={{ 
      activeProject, 
      projects, 
      loading, 
      switchProject, 
      refreshProjects: fetchProjects 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

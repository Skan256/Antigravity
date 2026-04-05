"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { 
  getProjectMembers, 
  inviteMember, 
  updateMemberRole, 
  removeMember, 
  Membership 
} from "@/lib/projects";
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Mail, 
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function TeamPage() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Membership["role"]>("Viewer");
  const [success, setSuccess] = useState("");

  const isOwner = activeProject?.role === "Owner";

  const loadMembers = async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    try {
      const data = await getProjectMembers(activeProject.projectId);
      setMembers(data);
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [activeProject]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !inviteEmail) return;

    setInviting(true);
    try {
      await inviteMember(activeProject.projectId, inviteEmail, inviteRole);
      
      // Trigger the Email API Route
      try {
        await fetch('/api/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: inviteEmail,
            projectId: activeProject.projectId,
            role: inviteRole,
            inviterEmail: user?.email
          })
        });
      } catch (emailErr) {
        console.error("Email API warning:", emailErr);
        // Continue even if email fails, as the internal notification worked
      }

      setInviteEmail("");
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setTimeout(() => setSuccess(""), 3000);
      loadMembers();
    } catch (err) {
      console.error("Invite error:", err);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: Membership["role"]) => {
    if (!isOwner) return;
    try {
      await updateMemberRole(memberId, role);
      loadMembers();
    } catch (err) {
      console.error("Update role error:", err);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!isOwner) return;
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await removeMember(memberId);
      loadMembers();
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner": return <ShieldAlert size={16} color="var(--color-accent-primary)" />;
      case "Editor": return <ShieldCheck size={16} color="var(--color-accent-secondary)" />;
      default: return <Shield size={16} color="var(--color-text-secondary)" />;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>Team Collaboration</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Managing access for <strong>{activeProject?.projectName}</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Member List */}
        <div className="glass-panel" style={{ padding: '0' }}>
          <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--color-accent-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Project Members</h2>
          </div>

          {loading ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem var(--spacing-lg)' }}>Member</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '1rem var(--spacing-lg)' }}>
                        <div style={{ fontWeight: 500 }}>{member.email || "Pending User"}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{member.userId ? `ID: ${member.userId.substring(0, 8)}...` : "Awaiting Join"}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {getRoleIcon(member.role)}
                          {isOwner && member.userId !== user?.uid ? (
                            <select 
                              value={member.role} 
                              onChange={(e) => handleUpdateRole(member.id!, e.target.value as any)}
                              className="input-field"
                              style={{ padding: '2px 8px', fontSize: '0.8rem', width: 'auto' }}
                            >
                              <option value="Viewer">Viewer</option>
                              <option value="Editor">Editor</option>
                              <option value="Owner">Owner</option>
                            </select>
                          ) : (
                            <span style={{ fontSize: '0.9rem' }}>{member.role}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem var(--spacing-lg)', textAlign: 'right' }}>
                        {isOwner && member.userId !== user?.uid && (
                          <button 
                            onClick={() => handleRemove(member.id!)}
                            style={{ color: '#ff4444', padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            title="Remove Member"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invite Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <UserPlus size={20} color="var(--color-accent-secondary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Invite Researcher</h2>
            </div>

            {success && (
              <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input 
                    type="email" 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="archaeologist@museum.org"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Assign Role</label>
                <select 
                  className="input-field"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                >
                  <option value="Viewer">Viewer (Read-only)</option>
                  <option value="Editor">Editor (Can edit artifacts)</option>
                  <option value="Owner">Owner (Full access)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={inviting || !isOwner}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {inviting ? <Loader2 size={18} className="animate-spin" /> : "Send Invitation"}
              </button>
              
              {!isOwner && (
                <p style={{ fontSize: '0.75rem', color: '#ffcc00', textAlign: 'center', marginTop: '0.5rem' }}>
                  Only project owners can invite members.
                </p>
              )}
            </form>
          </div>

          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Role Definitions</h3>
            <ul style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', padding: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><strong>Owner:</strong> Complete control over visibility and team management.</li>
              <li><strong>Editor:</strong> Can register artifacts, generate reports, and run AI analysis.</li>
              <li><strong>Viewer:</strong> Access to view discoveries and exported reports only.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

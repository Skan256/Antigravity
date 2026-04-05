"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  listenToNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  Notification 
} from "@/lib/notifications";
import { 
  Bell, 
  Sparkles, 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;
    return listenToNotifications(user.uid, user.email, (data) => {
      setNotifications(data);
    });
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id!);
    if (unreadIds.length > 0) {
      await markAllNotificationsAsRead(user.uid, unreadIds);
    }
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id!);
    }
    setIsOpen(false);
    router.push(notif.link);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai': return <Sparkles size={16} color="var(--color-accent-primary)" />;
      case 'report': return <FileText size={16} color="var(--color-accent-secondary)" />;
      case 'invite': return <Users size={16} color="#4ade80" />;
      default: return <Bell size={16} />;
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return "";
    const date = typeof ts === 'string' ? new Date(ts) : ts.toDate();
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="bell-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer',
          padding: '0.5rem',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: unreadCount > 0 ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
          transition: 'all 0.3s ease'
        }}
      >
        <Bell size={24} className={unreadCount > 0 ? "animate-bell-pulse" : ""} />
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '4px', 
            background: '#ff4444', 
            color: 'white', 
            fontSize: '10px', 
            fontWeight: 700,
            borderRadius: '10px',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--color-bg-secondary)',
            boxShadow: '0 0 10px rgba(255,0,0,0.5)'
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <div className={`glass-panel notif-dropdown ${isOpen ? 'active' : ''}`} 
        style={{ 
          position: 'absolute', 
          top: '100%', 
          right: 0, 
          width: '320px', 
          marginTop: '1rem',
          zIndex: 100,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          border: '1px solid rgba(224, 108, 67, 0.1)',
          pointerEvents: isOpen ? 'all' : 'none'
        }}
      >
        <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--color-accent-primary)' }}>Archival Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              <CheckCircle2 size={14} /> Clear All
            </button>
          )}
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => handleNotifClick(notif)}
                className="notif-item"
                style={{ 
                  padding: 'var(--spacing-md)', 
                  borderBottom: '1px solid rgba(255,255,255,0.03)', 
                  cursor: 'pointer',
                  background: notif.read ? 'transparent' : 'rgba(224, 108, 67, 0.03)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '0.75rem'
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {getTypeIcon(notif.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: notif.read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', lineHeight: '1.4' }}>
                    {notif.message}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px', opacity: 0.5, fontSize: '0.7rem' }}>
                    <Clock size={12} /> {formatTime(notif.createdAt)}
                  </div>
                </div>
                <ChevronRight size={14} style={{ alignSelf: 'center', opacity: 0.3 }} />
              </div>
            ))
          ) : (
            <div style={{ padding: '4rem var(--spacing-md)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Bell size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Secure field channel is currently quiet.</p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div style={{ padding: 'var(--spacing-sm)', textAlign: 'center', background: 'rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>All ARCHIVE communications encrypted</span>
          </div>
        )}
      </div>

      <style jsx global>{`
        .notif-item:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        .bell-trigger:hover {
          color: #fff !important;
        }
        .notif-dropdown {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          transition: all 0.2s ease-out;
        }
        .notif-dropdown.active {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        @keyframes bell-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-bell-pulse {
          animation: bell-pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

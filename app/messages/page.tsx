"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { Message, listenToMessages, sendMessage } from "@/lib/messages";
import { Send, MessageSquare, Loader2, Info } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeProject) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToMessages(activeProject.projectId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [activeProject]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !activeProject) return;

    const msg = text;
    setText(""); // Optimistic clear

    try {
      await sendMessage(activeProject.projectId, user.uid, msg, user.email || "Unknown");
    } catch (err) {
      console.error("Error sending message:", err);
      // Optional: restore text on failure
    }
  };

  if (!activeProject) {
    return (
      <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <MessageSquare size={48} color="var(--color-text-secondary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>No Project Selected</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Select a workspace to start chatting with your team.</p>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)', letterSpacing: '-1px' }}>Discussions</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Team Chat for <strong>{activeProject.projectName}</strong>
        </p>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Loader2 className="animate-spin" size={32} color="var(--color-accent-primary)" />
            </div>
          ) : messages.length === 0 ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
               <Info size={32} color="var(--color-text-secondary)" style={{ marginBottom: '1rem' }} />
               <p>No messages yet in this workspace.</p>
               <p style={{ fontSize: '0.85rem' }}>Start the conversation below!</p>
             </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.userId === user?.uid;
              return (
                <div key={msg.id} style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                   {!isMine && <span style={{ fontSize: '0.75rem', opacity: 0.5, marginLeft: '8px' }}>{msg.userEmail}</span>}
                   <div style={{
                     background: isMine ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.1)',
                     color: isMine ? '#fff' : 'var(--color-text-primary)',
                     padding: '0.75rem 1rem',
                     borderRadius: 'var(--radius-lg)',
                     borderBottomRightRadius: isMine ? '0' : 'var(--radius-lg)',
                     borderBottomLeftRadius: isMine ? 'var(--radius-lg)' : '0',
                     boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                   }}>
                     {msg.text}
                   </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ 
          padding: 'var(--spacing-md)', 
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
           <input 
             type="text"
             className="input-field"
             placeholder="Discuss findings, hypothesis, or say hello..."
             value={text}
             onChange={(e) => setText(e.target.value)}
             style={{ flex: 1, padding: '1rem' }}
           />
           <button 
             type="submit" 
             className="btn-primary"
             disabled={!text.trim()}
             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.5rem', height: '100%' }}
           >
             Send <Send size={16} />
           </button>
        </form>
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

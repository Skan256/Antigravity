import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { db, IS_DEMO_MODE } from "./firebase";

export interface Notification {
  id?: string;
  userId: string;
  email?: string | null;
  type: 'report' | 'ai' | 'invite';
  message: string;
  link: string;
  read: boolean;
  createdAt: any;
}

const NOTIFICATIONS_COLLECTION = "notifications";

// --- CRUD Operations ---

export const createNotification = async (data: Omit<Notification, "id" | "createdAt" | "read">): Promise<void> => {
  if (IS_DEMO_MODE) {
    const demoId = "notif-" + Math.random().toString(36).substr(2, 9);
    const demoNotifs = JSON.parse(localStorage.getItem("archeomind-demo-notifications") || "[]");
    
    const newNotif = {
      id: demoId,
      ...data,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    demoNotifs.unshift(newNotif); // Add to front
    localStorage.setItem("archeomind-demo-notifications", JSON.stringify(demoNotifs));
    
    // Trigger a simplified local event for real-time simulation in demo mode
    window.dispatchEvent(new CustomEvent('archeomind-notification', { detail: newNotif }));
    return;
  }

  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...data,
    read: false,
    createdAt: serverTimestamp()
  });
};

export const listenToNotifications = (userId: string, email: string | null, callback: (notifs: Notification[]) => void) => {
  if (IS_DEMO_MODE) {
    const getLocal = () => {
      const demoNotifs = JSON.parse(localStorage.getItem("archeomind-demo-notifications") || "[]");
      callback(demoNotifs.filter((n: Notification) => n.userId === userId || (n.email && n.userId === "invited-user")));
    };
    
    getLocal();
    window.addEventListener('archeomind-notification', getLocal);
    return () => window.removeEventListener('archeomind-notification', getLocal);
  }

  // Query by userId
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION), 
    where("userId", "==", userId),
    limit(20)
  );

  // Also query by email (for invitations sent before account creation)
  const qEmail = email ? query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", email),
    limit(20)
  ) : null;

  let uidNotifs: Notification[] = [];
  let emailNotifs: Notification[] = [];

  const merge = () => {
    const all = [...uidNotifs, ...emailNotifs];
    // Deduplicate by id
    const seen = new Set();
    const deduped = all.filter(n => { if (seen.has(n.id)) return false; seen.add(n.id); return true; });
    callback(deduped);
  };

  const unsubUid = onSnapshot(q, (snap) => {
    uidNotifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    merge();
  });

  if (qEmail) {
    const unsubEmail = onSnapshot(qEmail, (snap) => {
      emailNotifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      merge();
    });
    return () => { unsubUid(); unsubEmail(); };
  }

  return () => unsubUid();
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  if (IS_DEMO_MODE) {
    const demoNotifs = JSON.parse(localStorage.getItem("archeomind-demo-notifications") || "[]");
    const idx = demoNotifs.findIndex((n: Notification) => n.id === id);
    if (idx !== -1) {
      demoNotifs[idx].read = true;
      localStorage.setItem("archeomind-demo-notifications", JSON.stringify(demoNotifs));
      window.dispatchEvent(new CustomEvent('archeomind-notification'));
    }
    return;
  }

  const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
  await updateDoc(docRef, { read: true });
};

export const markAllNotificationsAsRead = async (userId: string, notifIds: string[]): Promise<void> => {
  if (IS_DEMO_MODE) {
     const demoNotifs = JSON.parse(localStorage.getItem("archeomind-demo-notifications") || "[]");
     demoNotifs.forEach((n: Notification) => {
       if (notifIds.includes(n.id!)) n.read = true;
     });
     localStorage.setItem("archeomind-demo-notifications", JSON.stringify(demoNotifs));
     window.dispatchEvent(new CustomEvent('archeomind-notification'));
     return;
  }

  // Ideally use a writeBatch for Firestore but keeping simple for MVP
  await Promise.all(notifIds.map(id => markNotificationAsRead(id)));
};

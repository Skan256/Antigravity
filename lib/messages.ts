import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { db, IS_DEMO_MODE } from "./firebase";

export interface Message {
  id?: string;
  projectId: string;
  userId: string;
  userEmail?: string;
  text: string;
  createdAt: any;
}

const MESSAGES_COLLECTION = "messages";

export const sendMessage = async (projectId: string, userId: string, text: string, userEmail?: string): Promise<void> => {
  if (IS_DEMO_MODE) {
    const demoMsgs = JSON.parse(localStorage.getItem("archeomind-demo-messages") || "[]");
    const newMsg = {
      id: "msg-" + Date.now(),
      projectId,
      userId,
      userEmail,
      text,
      createdAt: new Date().toISOString()
    };
    demoMsgs.push(newMsg);
    localStorage.setItem("archeomind-demo-messages", JSON.stringify(demoMsgs));
    window.dispatchEvent(new CustomEvent('archeomind-message'));
    return;
  }

  await addDoc(collection(db, MESSAGES_COLLECTION), {
    projectId,
    userId,
    userEmail: userEmail || "User",
    text,
    createdAt: serverTimestamp()
  });
};

export const listenToMessages = (projectId: string, callback: (msgs: Message[]) => void) => {
  if (IS_DEMO_MODE) {
    const getLocal = () => {
      const demoMsgs = JSON.parse(localStorage.getItem("archeomind-demo-messages") || "[]");
      const filtered = demoMsgs.filter((m: Message) => m.projectId === projectId);
      // Sort in ascending order
      filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(filtered);
    };
    
    getLocal();
    window.addEventListener('archeomind-message', getLocal);
    return () => window.removeEventListener('archeomind-message', getLocal);
  }

  const q = query(
    collection(db, MESSAGES_COLLECTION), 
    where("projectId", "==", projectId)
    // orderBy removed to avoid needing composite index for MVP, we sort client-side
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    } as Message));

    // Sort client-side
    msgs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(msgs);
  });
};

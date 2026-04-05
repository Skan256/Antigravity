import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, IS_DEMO_MODE } from "./firebase";
import { createNotification } from "./notifications";

export interface Project {
  id?: string;
  name: string;
  ownerId: string;
  createdAt: any;
}

export interface Membership {
  id?: string;
  projectId: string;
  userId: string;
  email: string | null;
  role: "Owner" | "Editor" | "Viewer";
  invitedAt: any;
}

const PROJECTS_COLLECTION = "projects";
const MEMBERSHIPS_COLLECTION = "memberships";

// --- Project Operations ---

export const createProject = async (name: string, userId: string): Promise<string> => {
  if (IS_DEMO_MODE) {
    const id = "proj-" + Math.random().toString(36).substr(2, 9);
    const demoProjects = JSON.parse(localStorage.getItem("archeomind-demo-projects") || "[]");
    const newProj = { id, name, ownerId: userId, createdAt: new Date().toISOString() };
    demoProjects.push(newProj);
    localStorage.setItem("archeomind-demo-projects", JSON.stringify(demoProjects));

    // Auto-create membership for owner
    const demoMembers = JSON.parse(localStorage.getItem("archeomind-demo-memberships") || "[]");
    demoMembers.push({ 
      id: "mem-" + Date.now(), 
      projectId: id, 
      userId, 
      role: "Owner", 
      invitedAt: new Date().toISOString() 
    });
    localStorage.setItem("archeomind-demo-memberships", JSON.stringify(demoMembers));

    return id;
  }

  const pDoc = await addDoc(collection(db, PROJECTS_COLLECTION), {
    name,
    ownerId: userId,
    createdAt: serverTimestamp()
  });

  // Create initial membership with predictable ID for security rules
  await setDoc(doc(db, MEMBERSHIPS_COLLECTION, `${userId}_${pDoc.id}`), {
    projectId: pDoc.id,
    userId,
    role: "Owner",
    invitedAt: serverTimestamp()
  });

  return pDoc.id;
};

export const getMemberships = async (userId: string): Promise<(Membership & { projectName?: string })[]> => {
  if (IS_DEMO_MODE) {
    const mems = JSON.parse(localStorage.getItem("archeomind-demo-memberships") || "[]").filter((m: any) => m.userId === userId);
    const projs = JSON.parse(localStorage.getItem("archeomind-demo-projects") || "[]");
    
    return mems.map((m: any) => ({
      ...m,
      projectName: projs.find((p: any) => p.id === m.projectId)?.name || "Personal Project"
    }));
  }

  const q = query(collection(db, MEMBERSHIPS_COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  
  const memberships = snap.docs.map(d => ({ id: d.id, ...d.data() } as Membership));

  const results = await Promise.all(memberships.map(async (m) => {
    const pDoc = await getDoc(doc(db, PROJECTS_COLLECTION, m.projectId));
    return { 
      ...m, 
      projectName: pDoc.exists() ? pDoc.data().name : "Unknown Project" 
    };
  }));

  return results;
};

export const getMembershipsForUser = async (user: { uid: string, email: string | null }): Promise<(Membership & { projectName?: string })[]> => {
  if (IS_DEMO_MODE) {
    const mems = JSON.parse(localStorage.getItem("archeomind-demo-memberships") || "[]").filter((m: any) => m.userId === user.uid || (m.email && m.email === user.email));
    const projs = JSON.parse(localStorage.getItem("archeomind-demo-projects") || "[]");
    
    return mems.map((m: any) => ({
      ...m,
      projectName: projs.find((p: any) => p.id === m.projectId)?.name || "Personal Project"
    }));
  }

  // 1. Get explicit memberships by UID
  const qUid = query(collection(db, MEMBERSHIPS_COLLECTION), where("userId", "==", user.uid));
  const snapUid = await getDocs(qUid);
  
  // 2. Get pending invitations by email
  let memberships = snapUid.docs.map(d => ({ id: d.id, ...d.data() } as Membership));
  
  if (user.email) {
    const qEmail = query(collection(db, MEMBERSHIPS_COLLECTION), where("email", "==", user.email), where("userId", "==", null));
    const snapEmail = await getDocs(qEmail);
    
    for (const d of snapEmail.docs) {
      // Claim the invitation
      const mData = d.data() as Membership;
      const newId = `${user.uid}_${mData.projectId}`;
      await setDoc(doc(db, MEMBERSHIPS_COLLECTION, newId), {
        ...mData,
        userId: user.uid
      });
      await deleteDoc(d.ref); // Remove the unclaimed one
      
      memberships.push({ id: newId, ...mData, userId: user.uid });
    }
  }

  const results = await Promise.all(memberships.map(async (m) => {
    const pDoc = await getDoc(doc(db, PROJECTS_COLLECTION, m.projectId));
    return { 
      ...m, 
      projectName: pDoc.exists() ? pDoc.data().name : "Unknown Project" 
    };
  }));

  return results;
};

// --- Team Management ---

export const getProjectMembers = async (projectId: string): Promise<Membership[]> => {
  if (IS_DEMO_MODE) {
    return JSON.parse(localStorage.getItem("archeomind-demo-memberships") || "[]").filter((m: any) => m.projectId === projectId);
  }

  const q = query(collection(db, MEMBERSHIPS_COLLECTION), where("projectId", "==", projectId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Membership));
};

export const inviteMember = async (projectId: string, email: string, role: Membership["role"]): Promise<void> => {
  if (IS_DEMO_MODE) {
    const mems = JSON.parse(localStorage.getItem("archeomind-demo-memberships") || "[]");
    mems.push({
      id: "mem-" + Math.random().toString(36).substr(2, 5),
      projectId,
      userId: "invited-user", // Mocking an invited state
      email,
      role,
      invitedAt: new Date().toISOString()
    });
    localStorage.setItem("archeomind-demo-memberships", JSON.stringify(mems));
    return;
  }

  // NOTE: Ideally, we check for an existing user UID first or store by email
  await addDoc(collection(db, MEMBERSHIPS_COLLECTION), {
    projectId,
    email,
    userId: null, // Placeholder if the user hasn't accepted yet
    role,
    invitedAt: serverTimestamp()
  });

  // Notify the invited researcher (stored by email, claimed when they login)
  await createNotification({
    userId: email, // Use email as userId placeholder so notification listener can find it
    email,
    type: 'invite',
    message: `You have been invited to collaborate on workspace "${projectId}"`,
    link: "/team"
  });
};

export const updateMemberRole = async (membershipId: string, role: Membership["role"]): Promise<void> => {
   if (IS_DEMO_MODE) {
     const mems = JSON.parse(localStorage.getItem("archeomind-demo-memberships") || "[]");
     const idx = mems.findIndex((m: any) => m.id === membershipId);
     if (idx !== -1) {
       mems[idx].role = role;
       localStorage.setItem("archeomind-demo-memberships", JSON.stringify(mems));
     }
     return;
   }
   await updateDoc(doc(db, MEMBERSHIPS_COLLECTION, membershipId), { role });
};

export const removeMember = async (membershipId: string): Promise<void> => {
  if (IS_DEMO_MODE) {
     const mems = JSON.parse(localStorage.getItem("archeomind-demo-memberships") || "[]");
     const newMems = mems.filter((m: any) => m.id !== membershipId);
     localStorage.setItem("archeomind-demo-memberships", JSON.stringify(newMems));
     return;
  }
  await deleteDoc(doc(db, MEMBERSHIPS_COLLECTION, membershipId));
};

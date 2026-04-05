import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { db, storage, IS_DEMO_MODE } from "./firebase";

export interface Artifact {
  id?: string;
  title: string;
  projectId: string;
  period: string;
  location: string;
  material: string;
  description: string;
  imageUrl: string;
  lat?: number;
  lng?: number;
  userId: string;
  createdAt: any;
  aiAnalysis?: {
    interpretation: string;
    usage: string;
    significance: string;
  };
}

// Collections
const ARTIFACTS_COLLECTION = "artifacts";

// Create Artifact
export const createArtifact = async (
  data: Omit<Artifact, "id" | "createdAt">, 
  imageFile: File | null
): Promise<string> => {
  if (IS_DEMO_MODE) {
    // In demo mode, we simulate a successful create
    console.log("[DEMO] Creating artifact:", data);
    const demoId = "demo-" + Math.random().toString(36).substr(2, 9);
    
    // Simulate image upload if needed
    let finalImageUrl = data.imageUrl;
    if (imageFile) {
      finalImageUrl = URL.createObjectURL(imageFile); // Local preview URL
    }

    const demoArtifacts = JSON.parse(localStorage.getItem("archeomind-demo-artifacts") || "[]");
    demoArtifacts.push({ 
      id: demoId, 
      ...data, 
      imageUrl: finalImageUrl, 
      createdAt: new Date().toISOString() 
    });
    localStorage.setItem("archeomind-demo-artifacts", JSON.stringify(demoArtifacts));
    return demoId;
  }

  let imageUrl = "";
  if (imageFile) {
    const storageRef = ref(storage, `artifacts/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  const docRef = await addDoc(collection(db, ARTIFACTS_COLLECTION), {
    ...data,
    imageUrl,
    createdAt: serverTimestamp()
  });

  return docRef.id;
};

// Get All Artifacts for a User
export const getArtifacts = async (userId: string, projectId?: string): Promise<Artifact[]> => {
  if (IS_DEMO_MODE) {
    const demoArtifacts = JSON.parse(localStorage.getItem("archeomind-demo-artifacts") || "[]");
    
    // Auto-seed some coordinates if empty (Carthage area)
    const seeded = demoArtifacts.map((a: Artifact, idx: number) => ({
      ...a,
      lat: a.lat || (36.852 + (idx * 0.002)),
      lng: a.lng || (10.323 + (idx * 0.003))
    }));

    return seeded.filter((a: Artifact) => 
      projectId ? a.projectId === projectId : a.userId === userId
    );
  }

  const constraints = [where("userId", "==", userId)];
  if (projectId) {
    constraints.push(where("projectId", "==", projectId));
  }

  const q = query(
    collection(db, ARTIFACTS_COLLECTION), 
    ...constraints,
    // orderBy("createdAt", "desc") // Temporarily disabled for jury demo (avoids missing index error)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Artifact));
};

// Get Artifact by ID
export const getArtifactById = async (id: string): Promise<Artifact | null> => {
  if (IS_DEMO_MODE) {
    const demoArtifacts = JSON.parse(localStorage.getItem("archeomind-demo-artifacts") || "[]");
    return demoArtifacts.find((a: Artifact) => a.id === id) || null;
  }

  const docRef = doc(db, ARTIFACTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Artifact;
  }
  return null;
};

// Get Recent Activity (limited)
export const getRecentArtifacts = async (userId: string, count: number = 5): Promise<Artifact[]> => {
  if (IS_DEMO_MODE) {
    const artifacts = await getArtifacts(userId);
    return artifacts.slice(0, count);
  }

  const q = query(
    collection(db, ARTIFACTS_COLLECTION), 
    where("userId", "==", userId), 
    // orderBy("createdAt", "desc"), // Temporarily disabled for jury demo
    limit(count)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Artifact));
};

export const updateArtifact = async (id: string, data: Partial<Artifact>): Promise<void> => {
  if (IS_DEMO_MODE) {
    const demoArtifacts = JSON.parse(localStorage.getItem("archeomind-demo-artifacts") || "[]");
    const index = demoArtifacts.findIndex((a: Artifact) => a.id === id);
    if (index !== -1) {
      demoArtifacts[index] = { ...demoArtifacts[index], ...data };
      localStorage.setItem("archeomind-demo-artifacts", JSON.stringify(demoArtifacts));
    }
    return;
  }

  const docRef = doc(db, ARTIFACTS_COLLECTION, id);
  await updateDoc(docRef, data);
};

export const deleteArtifact = async (id: string): Promise<void> => {
  if (IS_DEMO_MODE) {
    let demoArtifacts = JSON.parse(localStorage.getItem("archeomind-demo-artifacts") || "[]");
    demoArtifacts = demoArtifacts.filter((a: Artifact) => a.id !== id);
    localStorage.setItem("archeomind-demo-artifacts", JSON.stringify(demoArtifacts));
    return;
  }

  const docRef = doc(db, ARTIFACTS_COLLECTION, id);
  await deleteDoc(docRef);
};


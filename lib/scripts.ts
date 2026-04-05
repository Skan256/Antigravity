import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc,
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { db, storage, IS_DEMO_MODE } from "./firebase";

export interface ScriptAnalysis {
  id?: string;
  userId: string;
  projectId: string;
  imageUrl: string;
  scriptType: string;
  transcription: string;
  translation: string;
  confidence: number;
  historicalContext: string;
  linkedArtifactId?: string;
  createdAt: any;
}

const SCRIPTS_COLLECTION = "scriptAnalyses";

// --- CRUD Operations ---

export const createScriptAnalysis = async (
  data: Omit<ScriptAnalysis, "id" | "createdAt">, 
  imageFile: File | null
): Promise<string> => {
  if (IS_DEMO_MODE) {
    const demoId = "script-" + Math.random().toString(36).substr(2, 9);
    const demoScripts = JSON.parse(localStorage.getItem("archeomind-demo-scripts") || "[]");
    
    let finalImageUrl = data.imageUrl;
    if (imageFile) {
      finalImageUrl = URL.createObjectURL(imageFile);
    }

    const newScript = { 
      id: demoId, 
      ...data, 
      imageUrl: finalImageUrl, 
      createdAt: new Date().toISOString() 
    };
    
    demoScripts.unshift(newScript);
    localStorage.setItem("archeomind-demo-scripts", JSON.stringify(demoScripts));
    return demoId;
  }

  let imageUrl = data.imageUrl;
  if (imageFile) {
    const storageRef = ref(storage, `scripts/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  const docRef = await addDoc(collection(db, SCRIPTS_COLLECTION), {
    ...data,
    imageUrl,
    createdAt: serverTimestamp()
  });

  return docRef.id;
};

export const getScriptAnalyses = async (userId: string, projectId: string): Promise<ScriptAnalysis[]> => {
  if (IS_DEMO_MODE) {
    const scripts = JSON.parse(localStorage.getItem("archeomind-demo-scripts") || "[]");
    return scripts.filter((s: ScriptAnalysis) => s.projectId === projectId);
  }

  const q = query(
    collection(db, SCRIPTS_COLLECTION), 
    where("projectId", "==", projectId), 
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as ScriptAnalysis));
};

export const deleteScriptAnalysis = async (id: string): Promise<void> => {
  if (IS_DEMO_MODE) {
    const scripts = JSON.parse(localStorage.getItem("archeomind-demo-scripts") || "[]");
    const filtered = scripts.filter((s: ScriptAnalysis) => s.id !== id);
    localStorage.setItem("archeomind-demo-scripts", JSON.stringify(filtered));
    return;
  }

  await deleteDoc(doc(db, SCRIPTS_COLLECTION, id));
};

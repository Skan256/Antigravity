import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  doc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, IS_DEMO_MODE } from "./firebase";

export interface Report {
  id?: string;
  artifactId: string;
  projectId: string;
  title: string;
  description: string;
  status: "Generated" | "Draft" | "Exported";
  userId: string;
  createdAt: any;
}

const REPORTS_COLLECTION = "reports";

export const createReport = async (data: Omit<Report, "id" | "createdAt" | "status">): Promise<string> => {
  if (IS_DEMO_MODE) {
    const demoId = "rep-" + Math.random().toString(36).substr(2, 9);
    const demoReports = JSON.parse(localStorage.getItem("archeomind-demo-reports") || "[]");
    
    const newReport = {
      id: demoId,
      ...data,
      status: "Generated",
      createdAt: new Date().toISOString()
    };
    
    demoReports.push(newReport);
    localStorage.setItem("archeomind-demo-reports", JSON.stringify(demoReports));
    return demoId;
  }

  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...data,
    status: "Generated",
    createdAt: serverTimestamp()
  });

  return docRef.id;
};

export const getReportById = async (id: string): Promise<Report | null> => {
  if (IS_DEMO_MODE) {
    const demoReports = JSON.parse(localStorage.getItem("archeomind-demo-reports") || "[]");
    return demoReports.find((r: Report) => r.id === id) || null;
  }

  const docRef = doc(db, REPORTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Report;
  }
  return null;
};

export const getReports = async (userId: string, projectId?: string): Promise<Report[]> => {
  if (IS_DEMO_MODE) {
    const demoReports = JSON.parse(localStorage.getItem("archeomind-demo-reports") || "[]");
    return demoReports.filter((r: Report) => 
      projectId ? r.projectId === projectId : r.userId === userId
    );
  }

  const constraints = [where("userId", "==", userId)];
  if (projectId) {
    constraints.push(where("projectId", "==", projectId));
  }

  const q = query(
    collection(db, REPORTS_COLLECTION), 
    ...constraints,
    // orderBy("createdAt", "desc") // Temporarily disabled for jury demo (avoids missing index error)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Report));
};

export const updateReportStatus = async (id: string, status: Report["status"]): Promise<void> => {
  if (IS_DEMO_MODE) {
    const demoReports = JSON.parse(localStorage.getItem("archeomind-demo-reports") || "[]");
    const index = demoReports.findIndex((r: Report) => r.id === id);
    if (index !== -1) {
      demoReports[index].status = status;
      localStorage.setItem("archeomind-demo-reports", JSON.stringify(demoReports));
    }
    return;
  }

  const docRef = doc(db, REPORTS_COLLECTION, id);
  await updateDoc(docRef, { status });
};


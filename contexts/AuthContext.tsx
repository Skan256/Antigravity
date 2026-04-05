"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, IS_DEMO_MODE } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface UserProfile {
  uid: string;
  email: string | null;
  role: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Mock states for demo mode
  useEffect(() => {
    if (IS_DEMO_MODE) {
      // Simulate demo user
      const savedUser = localStorage.getItem("archeomind-demo-user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              emailVerified: firebaseUser.emailVerified,
              ...userDoc.data() 
            } as UserProfile);
          } else {
            // Document might not be created yet during registration race condition
            setUser({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              emailVerified: firebaseUser.emailVerified,
              role: "user" 
            });
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (IS_DEMO_MODE) {
      const mockUser = { 
        uid: "demo123", 
        email, 
        role: "admin",
        emailVerified: true
      };
      setUser(mockUser);
      localStorage.setItem("archeomind-demo-user", JSON.stringify(mockUser));
      router.push("/");
      return;
    }
    
    await signInWithEmailAndPassword(auth, email, pass);
    router.push("/");
  };

  const register = async (email: string, pass: string) => {
    if (IS_DEMO_MODE) {
      const mockUser = { 
        uid: "demo-new-" + Date.now(), 
        email, 
        role: "user",
        emailVerified: false
      };
      setUser(mockUser);
      localStorage.setItem("archeomind-demo-user", JSON.stringify(mockUser));
      router.push("/");
      return;
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { user: newUser } = userCredential;
    
    // Create base user record
    await setDoc(doc(db, "users", newUser.uid), {
      email: newUser.email,
      role: "user",
      createdAt: new Date().toISOString()
    });
    
    router.push("/");
  };

  const logout = async () => {
    if (IS_DEMO_MODE) {
      setUser(null);
      localStorage.removeItem("archeomind-demo-user");
      router.push("/login");
      return;
    }
    
    await signOut(auth);
    router.push("/login");
  };

  const resetPassword = async (email: string) => {
    if (IS_DEMO_MODE) {
      if (!email) throw new Error("Email is required for password reset.");
      console.log(`[DEMO] Reset password email sent to ${email}`);
      return;
    }
    
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    if (IS_DEMO_MODE) {
      const mockUser = { 
        uid: "google-demo-" + Date.now(), 
        email: "google-user@example.com", 
        role: "user",
        emailVerified: true
      };
      setUser(mockUser);
      localStorage.setItem("archeomind-demo-user", JSON.stringify(mockUser));
      router.push("/");
      return;
    }

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const { user: firebaseUser } = userCredential;

    // Standard profile persistence check
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: firebaseUser.email,
        role: "user",
        createdAt: new Date().toISOString(),
        provider: "google"
      });
    }

    router.push("/");
  };

  const sendVerification = async () => {
    if (IS_DEMO_MODE) {
      console.log("[DEMO] Verification email sent.");
      return;
    }

    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, loginWithGoogle, sendVerification }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

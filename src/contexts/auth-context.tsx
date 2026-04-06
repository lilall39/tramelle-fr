"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/app";
import { getFirebaseAuth } from "@/lib/firebase/services";
import { createUserProfile, ensureUserProfile, getUserProfile } from "@/lib/community/users";
import type { CommunityUser } from "@/types/community";

type AuthState = {
  user: User | null;
  profile: CommunityUser | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CommunityUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const app = getFirebaseApp();
    if (!app) {
      setProfile(null);
      return;
    }
    const u = getAuth(app).currentUser;
    if (!u) {
      setProfile(null);
      return;
    }
    const p = (await ensureUserProfile(u)) ?? (await getUserProfile(u.uid));
    setProfile(p);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const app = getFirebaseApp();
    if (!app) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (cancelled) return;
      setUser(u);
      if (u) {
        try {
          const p = (await ensureUserProfile(u)) ?? (await getUserProfile(u.uid));
          if (!cancelled) setProfile(p);
        } catch {
          if (!cancelled) setProfile(null);
        }
      } else {
        setProfile(null);
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(cred.user.uid, email, displayName);
  }, []);

  const signOut = useCallback(async () => {
    const app = getFirebaseApp();
    if (!app) return;
    await firebaseSignOut(getAuth(app));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}

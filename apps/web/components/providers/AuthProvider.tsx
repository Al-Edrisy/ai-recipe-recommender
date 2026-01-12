// apps/web/lib/auth/context.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

// 1) Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider wraps your app and provides:
 *  - user:       the Firebase User object or null
 *  - loading:    true while onAuthStateChanged is initializing
 *  - isAdmin:    boolean (hardcoded based on email, adjust as needed)
 *  - isAuthenticated: !!user
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to Firebase auth state changes:
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === 'salehfree33@gmail.com');
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAdmin,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, isAdmin]
  );

  // While Firebase is initializing, show a loading indicator:
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-lg font-medium">Loading…</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for consuming the auth context.
 * Throws an error if used outside of <AuthProvider>.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

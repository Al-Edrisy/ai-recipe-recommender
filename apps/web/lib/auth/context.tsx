'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/api/user';
import { toast } from '@/components/ui/use-toast';
import { getUid, getIdToken } from '@/lib/auth/utils';

interface AuthContextType {
  user: User | null;
  userProfile: any;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  uid: string | null;
  token: string | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loadAuthData = async (currentUser: User | null) => {
    if (!currentUser) {
      setUserProfile(null);
      setIsAdmin(false);
      setUid(null);
      setToken(null);
      return;
    }

    try {
      const [profile, currentToken] = await Promise.all([
        UserService.getCurrentUser(),
        getIdToken()
      ]);
      
      setUserProfile(profile);
      setIsAdmin(profile?.role === 'admin');
      setUid(currentUser.uid);
      setToken(currentToken);
    } catch (error) {
      console.error('Failed to load auth data:', error);
      setUserProfile(null);
      setIsAdmin(false);
      
      if (user !== null) {
        toast({
          title: 'Profile Error',
          description: 'Failed to load user data',
          variant: 'destructive',
        });
      }
    }
  };

  const refreshAuth = async () => {
    if (auth.currentUser) {
      await loadAuthData(auth.currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);
      await loadAuthData(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      userProfile,
      loading,
      isAdmin,
      isAuthenticated: !!user,
      uid,
      token,
      refreshAuth,
    }),
    [user, userProfile, loading, isAdmin, uid, token]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="text-lg font-medium">Loading authentication...</span>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import { auth } from '@/lib/firebase';
import { User, IdTokenResult } from 'firebase/auth';

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getUid = (): string | null => {
  return auth.currentUser?.uid || null;
};

export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    await auth.authStateReady();
    const token = await auth.currentUser?.getIdToken(forceRefresh);
    return token || null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

export const getIdTokenResult = async (): Promise<IdTokenResult | null> => {
  try {
    await auth.authStateReady();
    const tokenResult = await auth.currentUser?.getIdTokenResult();
    return tokenResult || null;
  } catch (error) {
    console.error('Error getting ID token result:', error);
    return null;
  }
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getIdToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    'Content-Type': 'application/json',
  };
};

export const verifyAuth = async (): Promise<{
  user: User | null;
  token: string | null;
  uid: string | null;
}> => {
  try {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) return { user: null, token: null, uid: null };

    const token = await user.getIdToken();
    return { user, token, uid: user.uid };
  } catch (error) {
    console.error('Error verifying auth:', error);
    return { user: null, token: null, uid: null };
  }
};
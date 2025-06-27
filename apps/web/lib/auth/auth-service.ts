import { auth, googleProvider } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as firebaseUpdatePassword,
  AuthError,
} from 'firebase/auth';
import { toast } from '@/components/ui/use-toast';

const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'Account disabled';
    case 'auth/user-not-found':
      return 'User not found';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/account-exists-with-different-credential':
      return 'Account exists with different credential';
    case 'auth/popup-closed-by-user':
      return 'Popup closed before completing login';
    default:
      return error.message || 'Authentication failed';
  }
};

export class AuthService {
  static async loginWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userCredential.user.email}`,
      });
      return userCredential;
    } catch (error) {
      const authError = error as AuthError;
      const message = getErrorMessage(authError);
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
      throw new Error(message);
    }
  }

  static async loginWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      toast({
        title: 'Login successful',
        description: `Welcome, ${userCredential.user.displayName || userCredential.user.email}`,
      });
      return userCredential;
    } catch (error) {
      const authError = error as AuthError;
      const message = getErrorMessage(authError);
      toast({
        title: 'Google login failed',
        description: message,
        variant: 'destructive',
      });
      throw new Error(message);
    }
  }

  static async register(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      toast({
        title: 'Registration successful',
        description: `Welcome, ${name || email}!`,
      });
      return userCredential;
    } catch (error) {
      const authError = error as AuthError;
      const message = getErrorMessage(authError);
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
      throw new Error(message);
    }
  }

  static async logout() {
    try {
      await signOut(auth);
      toast({
        title: 'Logged out',
        description: 'You have been signed out successfully',
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Logout failed',
        description: authError.message || 'Failed to sign out',
        variant: 'destructive',
      });
      throw error;
    }
  }

  static async updateUserProfile(user: User, updates: { displayName?: string; photoURL?: string }) {
    try {
      await updateProfile(user, updates);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Update failed',
        description: authError.message || 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  }

  static async updatePassword(currentPassword: string, newPassword: string) {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('User not signed in.');
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await firebaseUpdatePassword(currentUser, newPassword);
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });
    } catch (error) {
      const authError = error as AuthError;
      const message = getErrorMessage(authError);
      toast({
        title: 'Password update failed',
        description: message,
        variant: 'destructive',
      });
      throw new Error(message);
    }
  }
}

export const logout = AuthService.logout;
export const updateUserProfile = AuthService.updateUserProfile;
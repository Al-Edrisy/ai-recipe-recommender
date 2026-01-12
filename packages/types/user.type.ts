import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  lastActiveAt: Timestamp;

  preferences?: {
    dietType?: string;
    restrictions?: string[];
    cuisinePreferences?: string[];
    lifestyle?: 'Active' | 'Sedentary' | string;
  };
}
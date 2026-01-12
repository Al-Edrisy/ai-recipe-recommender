import { Timestamp } from 'firebase/firestore';

export interface Favorite {
  userId: string;
  recipeId: string;
  savedAt: Timestamp;
}

import { Timestamp } from 'firebase/firestore';


export interface History {
  userId: string;
  recipeId: string;
  action: 'generate' | 'update';
  createdAt: Timestamp;

  input: {
    servings?: number;
    cuisine?: string;
    restrictions?: string[];
    dietType?: string;
    lifestyle?: string;
    ingredients?: string[];
    prepTime?: number;
  };

  message?: string; // For update prompt
  modelUsed: string;
  source: 'form' | 'playground';
}

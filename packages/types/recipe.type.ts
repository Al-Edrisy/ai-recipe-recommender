import { Timestamp } from 'firebase/firestore';

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  cuisine: string;
  servings: number;
  restrictions: string[];
  dietType: string;
  lifestyle: string;
  ingredients: string[];
  cookTime: number;
  instructions: string[];
  modelUsed: string;
  source: 'llm' | 'user' | 'playground';
  createdAt: Date;
  updatedAt: Date;
}


// Define GenerateRecipeInput type locally if not available from @types
export type GenerateRecipeInput = {
  ingredients: string[];
  diet: string;
  cuisine: string;
  cookTime: number;
  servings: number;
  preferences: {
    spiceLevel: string;
    lowFat: boolean;
  };
};
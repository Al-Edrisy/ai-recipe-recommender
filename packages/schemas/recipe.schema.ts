import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';



/** innterface for ingradiants to update */
interface Ingredient {
  name: string;
  quantity: string;
  preparation: string;
}

interface Instruction {
  step: number;
  detail: string;
}


export const GenerateRecipeInputSchema = z.object({
ingredients: z.array(z.string().min(1)).min(1, "At least one ingredient is required"),
  diet: z.string().optional(),
  cuisine: z.string().optional(),
  cookTime: z.number().int().min(1).optional(),
  servings: z.number().int().min(1).optional().default(4),
  restrictions: z.array(z.string()).optional().default([]),
  lifestyle: z.string().optional().default(''),
  preferences: z.object({
    spiceLevel: z.string().optional(),
    lowFat: z.boolean().optional(),
    glutenFree: z.boolean().optional(),
    dairyFree: z.boolean().optional(),
  }).optional(),
}).strict();

export const RecipeInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  cuisine: z.string().min(1, "Cuisine is required"),
  servings: z.number().int().min(1),
  restrictions: z.array(z.string()).optional().default([]),
  dietType: z.string().optional().default(''),
  lifestyle: z.string().optional().default(''),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    preparation: z.string(),
  })).min(1, "At least one ingredient is required"),
  prepTime: z.number().int().min(1, "Preparation time must be at least 1 minute"),
  instructions: z.array(z.object({
    step: z.number(),
    detail: z.string(),
  })).min(1, "At least one instruction is required"),
});

export const RecipeUpdateSchema = RecipeInputSchema.partial();
export const RecipeSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  cuisine: z.string(),
  servings: z.number().int().min(1),
  restrictions: z.array(z.string()),
  dietType: z.string(),
  lifestyle: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    preparation: z.string(),
  })),
  prepTime: z.number().int().min(1),
  instructions: z.array(z.object({
    step: z.number(),
    detail: z.string(),
  })).min(1, "At least one instruction is required"),
  modelUsed: z.string().optional(),
  source: z.enum(['llm', 'user', 'playground']).default('user'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;
export type RecipeInput = z.infer<typeof RecipeInputSchema>;
export type RecipeUpdate = z.infer<typeof RecipeUpdateSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
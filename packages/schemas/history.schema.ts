import { z } from 'zod';

export const historySchema = z.object({
  userId: z.string(),
  recipeId: z.string(),
  action: z.enum(['generate', 'update']),
  createdAt: z.date(),

  input: z.object({
    servings: z.number().int().min(1).optional(),
    cuisine: z.string().optional(),
    restrictions: z.array(z.string()).optional(),
    dietType: z.string().optional(),
    lifestyle: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
    prepTime: z.number().int().min(1).optional(),
  }),

  message: z.string().optional(),
  modelUsed: z.string(),
  source: z.enum(['form', 'playground']),
});

export const historyInputSchema = historySchema.omit({ createdAt: true });
export const historyUpdateSchema = historySchema.partial();

export type HistorySchema = z.infer<typeof historySchema>;
export type HistoryInputSchema = z.infer<typeof historyInputSchema>;
export type HistoryUpdateSchema = z.infer<typeof historyUpdateSchema>;

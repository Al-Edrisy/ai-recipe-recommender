import { z } from 'zod';

export const favoriteSchema = z.object({
  userId: z.string(),
  recipeId: z.string(),
  savedAt: z.date(),
});

export const favoriteInputSchema = favoriteSchema.omit({ savedAt: true });
export const favoriteUpdateSchema = favoriteSchema.partial();

export type FavoriteSchema = z.infer<typeof favoriteSchema>;
export type FavoriteInputSchema = z.infer<typeof favoriteInputSchema>;
export type FavoriteUpdateSchema = z.infer<typeof favoriteUpdateSchema>;

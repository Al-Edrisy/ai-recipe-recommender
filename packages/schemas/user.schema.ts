import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

// Schema for Firestore documents
export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  photoURL: z.string().url().optional().nullable(),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  lastActiveAt: z.instanceof(Timestamp),
  preferences: z.object({
    dietType: z.string().optional(),
    restrictions: z.array(z.string()).optional(),
    cuisinePreferences: z.array(z.string()).optional(),
    lifestyle: z.string().optional(),
  }).optional().nullable()
});

// Input schema for creating users
export const userInputSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
}).extend({
  password: z.string().min(8).optional()
});

// Update schema
export const userUpdateSchema = userInputSchema
  .partial()
  .omit({ uid: true, password: true })
  .extend({
    role: z.enum(['user', 'admin']).optional()
  });

// TypeScript types
export type User = z.infer<typeof userSchema>;
export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;



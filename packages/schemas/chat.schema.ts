import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.date(),
});

export const chatSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
  recipeId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  messages: z.array(chatMessageSchema),
  lastPrompt: z.string().optional(),
  modelUsed: z.string(),
});

export const chatInputSchema = chatSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const chatUpdateSchema = chatSchema.partial();

export type ChatSchema = z.infer<typeof chatSchema>;
export type ChatInputSchema = z.infer<typeof chatInputSchema>;
export type ChatUpdateSchema = z.infer<typeof chatUpdateSchema>;

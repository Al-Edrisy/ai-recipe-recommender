import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.date().optional(),
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

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Chat = z.infer<typeof chatSchema>;
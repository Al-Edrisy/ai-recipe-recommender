import { Recipe } from '@types';
import { getAuthHeaders } from '@/lib/auth/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/playground';

export const generateRecipe = async (params: any): Promise<Recipe> => {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to generate recipe');
  return res.json();
};

export const sendChatMessage = async (
  message: string, 
  currentRecipe: Recipe | null
): Promise<{ message: string; recipe?: Recipe }> => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ message, currentRecipe })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};

export const loadRecipe = async (title: string): Promise<Recipe> => {
  const res = await fetch(`${API_BASE}/recipes/${encodeURIComponent(title)}`, {
    headers: await getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to load recipe');
  return res.json();
};
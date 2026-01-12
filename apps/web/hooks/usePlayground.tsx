import { useState, useEffect, useCallback } from 'react';
import { Recipe, GenerateRecipeInput, ChatMessage } from '@types';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const usePlayground = () => {
  const { firebaseUser } = useAuth();

  const [recipeForm, setRecipeForm] = useState<GenerateRecipeInput>({
    ingredients: [],
    diet: 'none',
    cuisine: '',
    cookTime: 30,
    servings: 4,
    preferences: {
      spiceLevel: 'medium',
      lowFat: false,
    },
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithAuth = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      if (!firebaseUser) throw new Error('User not authenticated');

      const token = await firebaseUser.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Unexpected non-JSON response');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    },
    [firebaseUser]
  );

  const fetchSavedRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/recipes?limit=100&offset=0');
      if (!Array.isArray(data)) throw new Error('Invalid recipe data format');
      setSavedRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const handleGenerateRecipe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newRecipe = await fetchWithAuth('/recipes/generate', {
        method: 'POST',
        body: JSON.stringify(recipeForm),
      });

      if (!newRecipe?.id) throw new Error('Invalid recipe data');

      setCurrentRecipe(newRecipe);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Generated recipe: ${newRecipe.title}`,
          createdAt: new Date(),
        },
      ]);

      await fetchSavedRecipes();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${msg}`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [recipeForm, fetchWithAuth, fetchSavedRecipes]);

  const handleSaveRecipe = useCallback(async () => {
    if (!currentRecipe?.id) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await fetchWithAuth(`/recipes/${currentRecipe.id}`, {
        method: 'PUT',
        body: JSON.stringify(currentRecipe),
      });

      if (!updated?.id) throw new Error('Failed to save');

      setCurrentRecipe(updated);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Recipe saved: ${updated.title}`,
          createdAt: new Date(),
        },
      ]);
      await fetchSavedRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  }, [currentRecipe, fetchWithAuth, fetchSavedRecipes]);

  const handleDeleteRecipe = useCallback(async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/recipes/${id}`, { method: 'DELETE' });
      if (currentRecipe?.id === id) setCurrentRecipe(null);

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Recipe deleted',
          createdAt: new Date(),
        },
      ]);
      await fetchSavedRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
    } finally {
      setLoading(false);
    }
  }, [currentRecipe, fetchWithAuth, fetchSavedRecipes]);

  const loadRecipe = useCallback(async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const recipe = await fetchWithAuth(`/recipes/${id}`);
      if (!recipe?.id) throw new Error('Recipe not found');
      setCurrentRecipe(recipe);
      return recipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const handleFormChange = useCallback((field: string, value: any) => {
    if (field.startsWith('preferences.')) {
      const prefKey = field.split('.')[1];
      setRecipeForm((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value,
        },
      }));
    } else {
      setRecipeForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      fetchSavedRecipes();
    }
  }, [firebaseUser, fetchSavedRecipes]);

  return {
    recipeForm,
    chatMessages,
    currentRecipe,
    savedRecipes,
    loading,
    error,
    handleFormChange,
    handleGenerateRecipe,
    handleSaveRecipe,
    handleDeleteRecipe,
    setCurrentRecipe,
    setChatMessages,
    loadRecipe,
  };
};

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
    preferences: { spiceLevel: 'medium', lowFat: false }
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    try {
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      // Get fresh token for each request
      const token = await firebaseUser.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      // Handle HTML responses (like 404 pages)
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        if (text.startsWith('<!DOCTYPE html>')) {
          throw new Error('Server returned HTML instead of JSON');
        }
        throw new Error(`Unexpected response: ${text.slice(0, 100)}`);
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        const newToken = await firebaseUser.getIdToken(true);
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` }
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `API error: ${retryResponse.status}`);
        }
        return retryResponse.json();
      }

      // Handle other error statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    }
  }, [firebaseUser]);

  const fetchSavedRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recipes = await fetchWithAuth('/recipes?limit=100&offset=0');
      if (!Array.isArray(recipes)) {
        throw new Error('Invalid recipes data received');
      }
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setError('Failed to load recipes. Please try again.');
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
        body: JSON.stringify(recipeForm)
      });

      if (!newRecipe?.id) {
        throw new Error('Invalid recipe data received');
      }

      setCurrentRecipe(newRecipe);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Generated recipe: ${newRecipe.title}`,
        createdAt: new Date()
      }]);
      await fetchSavedRecipes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate recipe';
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        createdAt: new Date()
      }]);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [recipeForm, fetchWithAuth, fetchSavedRecipes]);

  const handleSaveRecipe = useCallback(async () => {
    if (!currentRecipe?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const updatedRecipe = await fetchWithAuth(`/recipes/${currentRecipe.id}`, {
        method: 'PUT',
        body: JSON.stringify(currentRecipe)
      });

      if (!updatedRecipe?.id) {
        throw new Error('Failed to save recipe');
      }

      setCurrentRecipe(updatedRecipe);
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Recipe saved: ${updatedRecipe.title}`,
          createdAt: new Date()
        }
      ]);
      await fetchSavedRecipes();
    } catch (error) {
      console.error('Save failed:', error);
      setError('Failed to save recipe. Please try again.');
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
      if (!recipe?.id) {
        throw new Error('Recipe not found');
      }
      setCurrentRecipe(recipe);
    } catch (error) {
      console.error('Load failed:', error);
      setError('Failed to load recipe. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const handleDeleteRecipe = useCallback(async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/recipes/${id}`, { method: 'DELETE' });
      if (currentRecipe?.id === id) {
        setCurrentRecipe(null);
      }
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Recipe deleted',
          createdAt: new Date()
        }
      ]);
      await fetchSavedRecipes();
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, currentRecipe, fetchSavedRecipes]);

  const handleFormChange = useCallback((field: string, value: any) => {
    if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      if (typeof prefField === 'string') {
        setRecipeForm(prev => ({
          ...prev,
          preferences: { 
            ...prev.preferences, 
            [prefField]: value 
          }
        }));
      }
    } else {
      setRecipeForm(prev => ({ 
        ...prev, 
        [field]: value 
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
    loadRecipe
  };
};
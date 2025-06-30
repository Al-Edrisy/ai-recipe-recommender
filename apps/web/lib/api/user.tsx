import { getAuthHeaders } from '@/lib/auth/utils';
import { userInputSchema, userUpdateSchema } from '@schemas/index';
import { User } from '@types';
import { z } from 'zod';

export type UserCreateInput = z.infer<typeof userInputSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const UserService = {
  getCurrentUser: async (): Promise<User> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/me`, { 
        headers,
        credentials: 'include'
      });

      if (response.redirected) {
        throw new Error("Authentication required");
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (text.includes('<html') || text.includes('<!DOCTYPE')) {
          throw new Error("Authentication session expired");
        }
        throw new Error(`Unexpected response: ${text}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch current user');
      }

      return response.json();
    } catch (error) {
      console.error('UserService.getCurrentUser error:', error);
      throw new Error('Authentication session expired. Please sign in again.');
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users`, { 
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return response.json();
    } catch (error) {
      console.error('UserService.getUsers error:', error);
      throw new Error('Failed to fetch users. Please try again later.');
    }
  },

  getUserById: async (id: string): Promise<User> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/${id}`, { 
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return response.json();
    } catch (error) {
      console.error('UserService.getUserById error:', error);
      throw new Error('Failed to fetch user. Please try again later.');
    }
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      return response.json();
    } catch (error) {
      console.error('UserService.createUser error:', error);
      throw new Error('Failed to create user. Please try again later.');
    }
  },

  updateUser: async (id: string, data: UserUpdateInput): Promise<User> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      return response.json();
    } catch (error) {
      console.error('UserService.updateUser error:', error);
      throw new Error('Failed to update user. Please try again later.');
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw new Error('Failed to delete user. Please try again later.');
    }
  },
};
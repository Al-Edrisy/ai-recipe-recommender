import axios from 'axios';
import { getAuthHeaders } from '@/lib/auth/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type ApiClientConfig = {
  headers?: Record<string, string>;
  noContentType?: boolean;
  noAuth?: boolean;
};

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

const handleError = (error: any) => {
  if (error.response) {
    const { data, status } = error.response;
    const err = new Error(data?.message || `HTTP ${status}`);
    (err as any).status = status;
    throw err;
  }
  throw new Error(error.message || 'Request failed');
};

export const apiClient = {
  get: async <T>(endpoint: string, config?: ApiClientConfig): Promise<T> => {
    try {
      const headers = {
        ...(config?.headers || {}),
        ...(!config?.noAuth ? await getAuthHeaders() : {}),
      };
      const response = await instance.get<T>(endpoint, { headers });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error; // Ensure we throw after handling
    }
  },

  post: async <T>(endpoint: string, body: any, config?: ApiClientConfig): Promise<T> => {
    try {
      const headers = {
        ...(config?.headers || {}),
        ...(!config?.noAuth ? await getAuthHeaders() : {}),
        ...(!config?.noContentType ? { 'Content-Type': 'application/json' } : {}),
      };
      const response = await instance.post<T>(endpoint, body, { headers });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  put: async <T>(endpoint: string, body: any, config?: ApiClientConfig): Promise<T> => {
    try {
      const headers = {
        ...(config?.headers || {}),
        ...(!config?.noAuth ? await getAuthHeaders() : {}),
        ...(!config?.noContentType ? { 'Content-Type': 'application/json' } : {}),
      };
      const response = await instance.put<T>(endpoint, body, { headers });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  delete: async <T>(endpoint: string, config?: ApiClientConfig): Promise<T> => {
    try {
      const headers = {
        ...(config?.headers || {}),
        ...(!config?.noAuth ? await getAuthHeaders() : {}),
      };
      const response = await instance.delete<T>(endpoint, { headers });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  
};
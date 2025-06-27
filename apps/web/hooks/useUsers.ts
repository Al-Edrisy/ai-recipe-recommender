// apps/web/hooks/users.ts
import { useState, useEffect } from 'react';
// Define UserProfile locally if not exported from '@portfolio/types'
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  // Add other fields as needed
}
import { UserService } from '@/lib/api/user';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
}
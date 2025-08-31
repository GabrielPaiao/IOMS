// src/hooks/useUser.ts
import { useEffect, useState } from 'react';
import usersService from '../services/users.service';
import { useAuth } from '../context/AuthContext';

export function useUser() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(authUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await usersService.getUserById(authUser.id);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar usuário');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [authUser?.id]);

  return { user, loading, error };
}

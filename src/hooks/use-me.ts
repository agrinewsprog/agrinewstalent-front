'use client';

import { useState, useEffect } from 'react';
import { User } from '@/src/types';

/**
 * Hook para obtener el usuario actual desde el cliente
 * Nota: En server components, usa getSession() directamente
 */
export function useMe() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('No autorizado');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  return { user, loading, error };
}

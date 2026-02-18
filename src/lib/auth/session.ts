import { cookies } from 'next/headers';
import { api } from '@/src/lib/api/client';
import { User } from '@/src/types';
import { cache } from 'react';

export interface MeResponse {
  user: User;
}

/**
 * Obtiene la sesión del usuario actual desde la API
 * Usa cache() de React para evitar múltiples llamadas en el mismo render
 */
export const getSession = cache(async (): Promise<User | null> => {
  try {
    const response = await api.get<MeResponse>('/auth/me');
    return response.user;
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return null;
  }
});

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(
  allowedRoles: User['role'][]
): Promise<boolean> {
  const user = await getSession();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Requiere autenticación. Lanza error si no hay sesión
 */
export async function requireAuth(): Promise<User> {
  const user = await getSession();
  if (!user) {
    throw new Error('No autorizado');
  }
  return user;
}

/**
 * Requiere un rol específico. Lanza error si no tiene el rol
 */
export async function requireRole(
  allowedRoles: User['role'][]
): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('No tienes permisos para acceder a este recurso');
  }
  return user;
}

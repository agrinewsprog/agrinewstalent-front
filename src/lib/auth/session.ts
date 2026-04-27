import { cookies, headers } from 'next/headers';
import { api } from '@/lib/api/client';
import { User } from '@/types';
import { cache } from 'react';

export interface MeResponse {
  user: User;
}

/**
 * Resuelve el token de acceso desde:
 *   1. Header Authorization: Bearer <token>  (peticiones SSR con token explícito)
 *   2. Cookie "access_token" o "token"       (flujo con cookie httpOnly)
 */
async function resolveToken(): Promise<string | null> {
  // 1) Authorization header
  try {
    const headerStore = await headers();
    const auth = headerStore.get('authorization') ?? headerStore.get('Authorization');
    if (auth?.startsWith('Bearer ')) {
      return auth.slice(7);
    }
  } catch {
    // headers() solo está disponible en contexto de request; ignorar fuera de él
  }

  // 2) Cookie
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('token')?.value ??
      null;
    return token;
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesión del usuario actual desde la API.
 * Usa cache() de React para evitar múltiples llamadas en el mismo render.
 */
export const getSession = cache(async (): Promise<User | null> => {
  try {
    const token = await resolveToken();

    const options = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;

    const response = await api.get<MeResponse>('/api/auth/me', options);
    const user = response.user;
    // Normalizar el rol a minúsculas y unificar super_admin → admin
    // (el backend puede devolver 'COMPANY', 'SUPER_ADMIN', etc.)
    if (user?.role) {
      const normalized = user.role.toLowerCase();
      (user as { role: string }).role =
        normalized === 'super_admin' ? 'admin' : normalized;
    }
    return user;
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

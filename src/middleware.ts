import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

// Mapeo de roles a rutas permitidas
const ROLE_PATHS = {
  STUDENT: '/intranet/student',
  COMPANY: '/intranet/company',
  UNIVERSITY: '/intranet/university',
  SUPER_ADMIN: '/intranet/admin',
} as const;

type UserRole = keyof typeof ROLE_PATHS;

interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo verificar sesión en rutas /intranet
  if (!pathname.startsWith('/intranet')) {
    return NextResponse.next();
  }

  // Verificar sesión
  let user: AuthMeResponse['user'] | null = null;

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data: AuthMeResponse = await response.json();
      user = data.user;
    }
  } catch (error) {
    // API caída o error de red
    if (process.env.NODE_ENV === 'development') {
      console.error('[Middleware] Session check failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    // Redirigir a login si está en intranet y falla la verificación
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Verificar que el usuario está en su ruta correcta según rol
  const allowedPath = ROLE_PATHS[user.role];
  
  if (!pathname.startsWith(allowedPath)) {
    // Redirigir a su dashboard correcto
    const url = request.nextUrl.clone();
    url.pathname = `${allowedPath}/dashboard`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/intranet/:path*',
  ],
};

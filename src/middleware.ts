import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/about', '/contact', '/pricing'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

// Mapeo de roles a sus dashboards
const ROLE_DASHBOARDS = {
  student: '/intranet/student/dashboard',
  company: '/intranet/company/dashboard',
  university: '/intranet/university/dashboard',
  admin: '/intranet/admin/dashboard',
} as const;

type Role = keyof typeof ROLE_DASHBOARDS;

interface MeResponse {
  user: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si es ruta pública, permitir acceso
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Verificar sesión llamando a /auth/me
  let user: MeResponse['user'] | null = null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data: MeResponse = await response.json();
      user = data.user;
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
  }

  // Si no hay sesión y está en ruta de autenticación, permitir
  if (!user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Si no hay sesión y NO está en ruta de autenticación, redirigir a login
  if (!user && !AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Si hay sesión y está en ruta de autenticación, redirigir a su dashboard
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_DASHBOARDS[user.role];
    return NextResponse.redirect(url);
  }

  // Si está en intranet, verificar que el rol coincida
  if (pathname.startsWith('/intranet/') && user) {
    const roleFromPath = pathname.split('/')[2] as Role;

    // Si el rol en la URL no coincide con el rol del usuario, redirigir a su dashboard
    if (roleFromPath !== user.role) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_DASHBOARDS[user.role];
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Mapeo rol (backend, normalizado a minúsculas) → basePath de la intranet
const ROLE_TO_BASE: Record<string, string> = {
  student:     '/intranet/student',
  company:     '/intranet/company',
  university:  '/intranet/university',
  super_admin: '/intranet/admin',
  admin:       '/intranet/admin',
};

/** Extrae el valor de una cookie por nombre del header Cookie. */
function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Llama a /api/auth/me pasando las cookies del request.
 * Si hay un token en la cookie "access_token" o "token", lo manda también como Bearer.
 * Devuelve el rol normalizado en minúsculas, o null si no hay sesión válida.
 */
async function fetchRole(cookieHeader: string): Promise<string | null> {
  try {
    const bearerToken =
      extractCookie(cookieHeader, 'access_token') ??
      extractCookie(cookieHeader, 'token');

    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        cookie: cookieHeader,
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    const role: string | undefined = data?.user?.role ?? data?.role;
    return role ? role.toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1) Solo rutas /intranet/*
  if (!pathname.startsWith('/intranet')) {
    return NextResponse.next();
  }

  // Saltar peticiones internas de Next.js para no disparar el rate-limit de /me:
  //  - RSC (navegaciones suaves del App Router)
  //  - Prefetch
  //  - Peticiones de datos internas (_next/data, __nextjs*)
  const isRSC       = request.headers.get('RSC') === '1';
  const isPrefetch  = request.headers.get('Next-Router-Prefetch') === '1';
  const isNextData  = pathname.includes('/_next/') || pathname.startsWith('/__nextjs');

  if (isRSC || isPrefetch || isNextData) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get('cookie') ?? '';

  // 2) Obtener rol desde /api/auth/me
  const role = await fetchRole(cookieHeader);

  // 3) Sin sesión → redirigir a /login con callbackUrl
  if (!role) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set(
      'callbackUrl',
      encodeURIComponent(pathname + search),
    );
    return NextResponse.redirect(loginUrl);
  }

  // 4) Determinar basePath según rol
  const basePath = ROLE_TO_BASE[role];

  if (!basePath) {
    // Rol desconocido → /login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  // 5) Si ya está dentro de su basePath → permitir
  if (pathname.startsWith(basePath)) {
    return NextResponse.next();
  }

  // 6) Está en una ruta de otro rol → redirigir a su dashboard
  const destination = `${basePath}/dashboard`;

  // 7) Anti-bucle: si por alguna razón ya estamos en destination, dejar pasar
  if (pathname === destination) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = destination;
  redirectUrl.search = '';
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/intranet/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Locale-aware intranet pattern: /en/intranet/..., /es/intranet/..., /pt/intranet/...
const LOCALE_PATTERN = new RegExp(`^/(${routing.locales.join('|')})/intranet`);

// Role → intranet base path segment
const ROLE_TO_BASE: Record<string, string> = {
  student:     'student',
  company:     'company',
  university:  'university',
  super_admin: 'admin',
  admin:       'admin',
};

/** Extracts cookie value by name from a Cookie header string. */
function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Calls /api/auth/me and returns the normalised role or null. */
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
    if (!role) return null;
    const normalized = role.toLowerCase();
    return normalized === 'super_admin' ? 'admin' : normalized;
  } catch {
    return null;
  }
}

// Build the next-intl middleware handler
const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/__nextjs') ||
    pathname.includes('/api/') ||
    /\.(.+)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Skip RSC & prefetch to avoid rate-limiting /me
  const isRSC      = request.headers.get('RSC') === '1';
  const isPrefetch = request.headers.get('Next-Router-Prefetch') === '1';

  // ─── Auth guard for locale-prefixed intranet routes ────────────────────────
  if (LOCALE_PATTERN.test(pathname) && !isRSC && !isPrefetch) {
    const locale = pathname.split('/')[1] ?? routing.defaultLocale;
    const cookieHeader = request.headers.get('cookie') ?? '';
    const role = await fetchRole(cookieHeader);

    // Not authenticated → redirect to /{locale}/login
    if (!role) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      loginUrl.search = '';
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname + search));
      return NextResponse.redirect(loginUrl);
    }

    const base = ROLE_TO_BASE[role];
    if (!base) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }

    const expectedPrefix = `/${locale}/intranet/${base}`;

    // On their correct section → let next-intl set the locale header and pass through
    if (pathname.startsWith(expectedPrefix) || pathname === `/${locale}/intranet`) {
      return handleI18nRouting(request);
    }

    // Wrong role section → redirect to correct dashboard
    const destination = `/${locale}/intranet/${base}/dashboard`;
    if (pathname === destination) return handleI18nRouting(request);

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = destination;
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  // ─── i18n routing for all other routes ─────────────────────────────────────
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};

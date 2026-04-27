import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import UniversityDashboardClient, {
  unwrapDashboard,
  type DashboardData,
} from './dashboard-client';

/* ------------------------------------------------------------------ */
/*  Server-side fetch                                                  */
/* ------------------------------------------------------------------ */
async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/universities/me/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return unwrapDashboard(json);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Page (server component → delegates render to client)               */
/* ------------------------------------------------------------------ */
export default async function UniversityDashboard() {
  const [user, data] = await Promise.all([getSession(), getDashboardData()]);

  return (
    <UniversityDashboardClient
      serverData={data}
      userName={user?.name ?? ''}
    />
  );
}

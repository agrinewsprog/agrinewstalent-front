import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import UniversityProfileClient from './university-profile-client';
import PendingProgramOffers from './pending-program-offers';
import type { UniversityProfile } from './types';

export type { UniversityProfile };

/* ------------------------------------------------------------------ */
/*  Server fetch                                                        */
/* ------------------------------------------------------------------ */
async function fetchProfile(): Promise<UniversityProfile | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';

    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${API}/api/universities/me/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    // Backend may return { profile: {...} }, { data: {...} }, or object directly
    const raw = data?.profile ?? data?.data ?? data;

    return {
      id:            raw?.id,
      name:          raw?.name ?? raw?.universityName ?? '',
      email:         raw?.email ?? raw?.user?.email ?? '',
      logoUrl:       raw?.logoUrl ?? null,
      location:      raw?.location ?? null,
      description:   raw?.description ?? null,
      careers:       Array.isArray(raw?.careers)
        ? raw.careers
        : typeof raw?.careers === 'string'
          ? raw.careers.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      convenioTypes: Array.isArray(raw?.convenioTypes)
        ? raw.convenioTypes
        : typeof raw?.convenioTypes === 'string'
          ? raw.convenioTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      verified: raw?.verified ?? false,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function UniversityProfilePage() {
  const [profile, t] = await Promise.all([
    fetchProfile(),
    getTranslations('intranet'),
  ]);

  return (
    <div className="space-y-8">
      <UniversityProfileClient
        initialProfile={profile}
        pageTitle={t('university.profile.title')}
      />
      <div className="max-w-3xl mx-auto">
        <PendingProgramOffers />
      </div>
    </div>
  );
}

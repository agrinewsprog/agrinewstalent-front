import { cookies } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import UniversityProgramsClient from './university-programs-client';
import type { UniversityProgram } from './types';

/* ------------------------------------------------------------------ */
/*  Fetch                                                              */
/* ------------------------------------------------------------------ */
async function fetchPrograms(): Promise<UniversityProgram[]> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${API}/api/universities/me/programs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    // Backend may return { programs: [...] }, { data: [...] }, or a plain array
    const raw: unknown = data?.programs ?? data?.data ?? data;
    if (!Array.isArray(raw)) return [];
    return raw.map((item: unknown) => {
      const r = item as Record<string, unknown>;
      return {
        id: String(r.id ?? ''),
        title: String(r.title ?? r.name ?? ''),
        description: typeof r.description === 'string' ? r.description : null,
        rules: typeof r.rules === 'string' ? r.rules : null,
        requiresCourseId: typeof r.requiresCourseId === 'number' ? r.requiresCourseId : typeof r.require_course_id === 'number' ? r.require_course_id : null,
        status: typeof r.status === 'string' ? r.status.toUpperCase() : 'ACTIVE',
        companiesCount: Number(r.companiesCount ?? r.companies_count ?? 0),
        approvedCompaniesCount: Number(r.approvedCompaniesCount ?? r.approved_companies_count ?? 0),
        offersCount: Number(r.offersCount ?? r.offers_count ?? 0),
        applicationsCount: Number(r.applicationsCount ?? r.applications_count ?? 0),
        createdAt: typeof r.createdAt === 'string' ? r.createdAt : typeof r.created_at === 'string' ? r.created_at : undefined,
      } satisfies UniversityProgram;
    });
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function UniversityProgramsPage() {
  const [programs, t, locale] = await Promise.all([
    fetchPrograms(),
    getTranslations('intranet'),
    getLocale(),
  ]);

  return (
    <UniversityProgramsClient
      initialPrograms={programs}
      locale={locale}
      pageTitle={t('university.programs.title')}
      pageSubtitle={t('university.programs.subtitle')}
    />
  );
}

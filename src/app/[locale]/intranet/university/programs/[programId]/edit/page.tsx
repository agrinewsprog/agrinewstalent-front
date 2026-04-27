import { cookies } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import EditProgramClient from './edit-client';
import type { UniversityProgram } from '../../types';

/* ------------------------------------------------------------------ */
/*  Server-side fetch (best-effort — client has fallback)              */
/* ------------------------------------------------------------------ */
async function fetchProgram(id: string): Promise<UniversityProgram | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const url = `${API}/api/universities/me/programs/${id}`;

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();

    // Support { program: {...} }, { data: {...} }, or direct object
    const r = (data?.program ?? data?.data ?? data) as Record<string, unknown>;

    return {
      id: String(r.id ?? id),
      title: String(r.title ?? r.name ?? ''),
      description: typeof r.description === 'string' ? r.description : null,
      rules: typeof r.rules === 'string' ? r.rules : null,
      requiresCourseId:
        typeof r.requiresCourseId === 'number' ? r.requiresCourseId :
        typeof r.require_course_id === 'number' ? r.require_course_id : null,
      status: typeof r.status === 'string' ? r.status.toUpperCase() : 'ACTIVE',
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : typeof r.created_at === 'string' ? r.created_at : undefined,
      updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : typeof r.updated_at === 'string' ? r.updated_at : undefined,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const [program, t, locale] = await Promise.all([
    fetchProgram(programId),
    getTranslations('intranet'),
    getLocale(),
  ]);

  // Don't notFound() — let the client try its own fetch with credentials
  return (
    <EditProgramClient
      program={program ?? null}
      programId={programId}
      locale={locale}
      pageTitle={t('university.programs.editTitle')}
      pageSubtitle={t('university.programs.editSubtitle')}
      backLabel={t('university.programs.backToPrograms')}
    />
  );
}

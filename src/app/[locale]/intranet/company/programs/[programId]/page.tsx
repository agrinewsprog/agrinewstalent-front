import { cookies } from 'next/headers';
import { CompanyProgramDetailClient } from './program-detail-client';
import type { CompanyProgram } from '../page';

/* ------------------------------------------------------------------ */
/*  Normalizer                                                         */
/* ------------------------------------------------------------------ */
function normalize(raw: Record<string, unknown>): CompanyProgram {
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown) => (v !== undefined && v !== null ? Number(v) || 0 : undefined);

  return {
    id: String(raw.id ?? raw._id ?? ''),
    title: str(raw.title) ?? str(raw.name) ?? '',
    description: str(raw.description) ?? null,
    rules: str(raw.rules) ?? null,
    status: str(raw.status) ?? 'ACTIVE',
    universityName:
      str(raw.universityName) ??
      str((raw.university as Record<string, unknown>)?.universityName) ??
      str((raw.university as Record<string, unknown>)?.name) ??
      undefined,
    companiesCount: num(raw.companiesCount),
    approvedCompaniesCount: num(raw.approvedCompaniesCount),
    applicationsCount: num(raw.applicationsCount),
    offersCount: num(raw.offersCount),
    requiresCourse: raw.requiresCourseId != null,
    requiresCourseId: (raw.requiresCourseId as string | number | null | undefined) ?? null,
    interestStatus: str(raw.interestStatus) ?? str(raw.interest_status) ?? str(raw.companyInterestStatus) ?? 'NONE',
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
  };
}

function unwrapProgram(data: unknown): CompanyProgram | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const inner = obj.program ?? obj.data ?? obj;
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return null;
  return normalize(inner as Record<string, unknown>);
}

/* ------------------------------------------------------------------ */
/*  Server fetch                                                       */
/* ------------------------------------------------------------------ */
async function getProgram(id: string): Promise<CompanyProgram | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/programs/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return unwrapProgram(json);
  } catch (e) {
    console.error('[company/programs/detail] server fetch error', e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function CompanyProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const program = await getProgram(programId);

  return <CompanyProgramDetailClient serverProgram={program} programId={programId} />;
}

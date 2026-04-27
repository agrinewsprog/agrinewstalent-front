import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import { CompanyProgramsClient } from './programs-client';

/* ------------------------------------------------------------------ */
/*  Types (company-side program view)                                  */
/* ------------------------------------------------------------------ */
export interface CompanyProgram {
  id: string | number;
  title?: string;
  name?: string;
  description?: string | null;
  rules?: string | null;
  status?: string;
  interestStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  universityName?: string;
  university?: { universityName?: string; name?: string };
  companiesCount?: number;
  approvedCompaniesCount?: number;
  applicationsCount?: number;
  offersCount?: number;
  requiresCourse?: boolean;
  requiresCourseId?: string | number | null;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

function unwrapList(data: unknown): CompanyProgram[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map((d) => normalize(d));
  const obj = data as Record<string, unknown>;
  const inner = obj.programs ?? obj.data ?? obj;
  if (Array.isArray(inner)) return inner.map((d) => normalize(d));
  return [];
}

/* ------------------------------------------------------------------ */
/*  Server fetch                                                       */
/* ------------------------------------------------------------------ */
async function getPrograms(): Promise<CompanyProgram[]> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/companies/me/programs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const json = await res.json();
    return unwrapList(json);
  } catch (e) {
    console.error('[company/programs] server fetch error', e);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function CompanyProgramsPage() {
  const [user, programs] = await Promise.all([getSession(), getPrograms()]);
  return <CompanyProgramsClient serverPrograms={programs} />;
}

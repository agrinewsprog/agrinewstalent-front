import { cookies } from 'next/headers';
import { StudentProgramsClient } from './programs-client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface StudentProgram {
  id: string | number;
  title?: string;
  name?: string;
  description?: string | null;
  rules?: string | null;
  status?: string;
  universityName?: string;
  university?: { universityName?: string; name?: string };
  companiesCount?: number;
  approvedCompaniesCount?: number;
  applicationsCount?: number;
  offersCount?: number;
  approvedOffersCount?: number;
  requiresCourse?: boolean;
  requiresCourseId?: string | number | null;
  isEnrolled?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkedUniversity {
  id: string | number;
  name: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  description?: string;
}

/* ------------------------------------------------------------------ */
/*  Normalizer                                                         */
/* ------------------------------------------------------------------ */
function normalize(raw: Record<string, unknown>): StudentProgram {
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
    approvedOffersCount: num(raw.approvedOffersCount),
    requiresCourse: raw.requiresCourseId != null,
    requiresCourseId: (raw.requiresCourseId as string | number | null | undefined) ?? null,
    isEnrolled: raw.isEnrolled === true || raw.enrolled === true,
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
  };
}

function unwrapList(data: unknown): StudentProgram[] {
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
async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

async function getPrograms(headers: Record<string, string>): Promise<StudentProgram[]> {
  const endpoint = `${API}/api/students/me/programs`;
  try {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...headers },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[student/programs] SSR error:', res.status, body);
      return [];
    }

    const json = await res.json();

    return unwrapList(json);
  } catch (e) {
    console.error('[student/programs] SSR fetch error:', e);
    return [];
  }
}

async function getLinkedUniversity(headers: Record<string, string>): Promise<LinkedUniversity | null> {
  const endpoint = `${API}/api/students/me/university`;
  try {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...headers },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    const uni = data?.university ?? data;
    if (uni && (uni.name || uni.universityName || uni.id)) {
      const result: LinkedUniversity = {
        id: uni.id,
        name: uni.name ?? uni.universityName ?? '',
        logoUrl: uni.logoUrl ?? uni.logo,
        city: uni.city,
        country: uni.country,
        description: uni.description,
      };
      return result;
    }
    return null;
  } catch (e) {
    console.error('[student/university] SSR fetch error:', e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function StudentProgramsPage() {
  const authHeader = await getAuthHeader();
  const [programs, university] = await Promise.all([
    getPrograms(authHeader),
    getLinkedUniversity(authHeader),
  ]);

  return <StudentProgramsClient serverPrograms={programs} serverUniversity={university} />;
}

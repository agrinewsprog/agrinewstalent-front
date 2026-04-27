import { cookies } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ProgramDetailClient from './program-detail-client';
import type { UniversityProgram, ProgramCompany, ProgramApplication, ProgramOffer } from '../types';
import {
  resolveCompanyId,
  resolveJobOfferId,
  resolveProgramOfferId,
  resolveStudentId,
  unwrapCollection,
  unwrapEntity,
} from '@/lib/frontend/contracts';

/* ------------------------------------------------------------------ */
/*  Fetchers                                                           */
/* ------------------------------------------------------------------ */
async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  return (
    cookieStore.get('access_token')?.value ??
    cookieStore.get('accessToken')?.value ??
    cookieStore.get('token')?.value ??
    ''
  );
}

async function fetchProgram(id: string, token: string): Promise<UniversityProgram | null> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/universities/me/programs/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const r = unwrapEntity<Record<string, unknown>>(data, ['program', 'data']);
    if (!r) return null;
    return {
      id: String(r.id ?? id),
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
      updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : typeof r.updated_at === 'string' ? r.updated_at : undefined,
    };
  } catch {
    return null;
  }
}

async function fetchCompanies(id: string, token: string): Promise<ProgramCompany[]> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/universities/me/programs/${id}/companies`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = unwrapCollection<unknown>(data, ['companies', 'data']);
    if (!Array.isArray(raw)) return [];
    const mapped = raw.map((item: unknown) => {
      const r = item as Record<string, unknown>;
      const company = (r.company ?? {}) as Record<string, unknown>;
      return {
        id: String(r.id ?? ''),
        companyId: String(resolveCompanyId(r, company) ?? r.id ?? ''),
        companyName: String(r.companyName ?? r.company_name ?? company.name ?? r.name ?? ''),
        status: typeof r.status === 'string' ? r.status : 'pending',
        logoUrl: typeof r.logoUrl === 'string' ? r.logoUrl
          : typeof r.logo_url === 'string' ? r.logo_url
          : typeof company.logoUrl === 'string' ? company.logoUrl
          : typeof company.logo_url === 'string' ? String(company.logo_url) : null,
        location: typeof r.location === 'string' ? r.location
          : typeof company.location === 'string' ? String(company.location) : null,
        verified: typeof r.verified === 'boolean' ? r.verified
          : typeof company.verified === 'boolean' ? company.verified as boolean : undefined,
        approvedOffersCount: typeof r.approvedOffersCount === 'number' ? r.approvedOffersCount
          : typeof r.approved_offers_count === 'number' ? r.approved_offers_count as number : undefined,
      };
    });
    // Deduplicate by companyId — keep first occurrence
    const seen = new Set<string>();
    return mapped.filter(c => {
      const key = String(c.companyId || c.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

async function fetchApplications(id: string, token: string): Promise<ProgramApplication[]> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const url = `${API}/api/universities/me/programs/${id}/applications`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const raw = unwrapCollection<unknown>(data, ['applications', 'data']);
    if (!Array.isArray(raw)) return [];
    return raw.map((item: unknown) => {
      const r = item as Record<string, unknown>;
      const student = (r.student ?? {}) as Record<string, unknown>;
      const user = (r.user ?? student.user ?? {}) as Record<string, unknown>;
      const offer = (r.offer ?? {}) as Record<string, unknown>;
      const offerCompany = (offer.company ?? {}) as Record<string, unknown>;
      const company = (r.company ?? offer.company ?? {}) as Record<string, unknown>;

      // Build full name from every possible backend shape
      const firstName = String(r.firstName ?? r.first_name ?? student.firstName ?? student.first_name ?? user.firstName ?? user.first_name ?? '');
      const lastName  = String(r.lastName  ?? r.last_name  ?? student.lastName  ?? student.last_name  ?? user.lastName  ?? user.last_name  ?? '');
      const composed  = [firstName, lastName].filter(Boolean).join(' ');

      const resolvedName =
        r.fullName           ?? r.full_name           ??
        r.studentName        ?? r.student_name        ??
        student.studentName  ??
        student.fullName     ?? student.full_name      ??
        student.name         ??
        user.fullName        ?? user.full_name         ??
        user.name            ??
        (composed || undefined);

      const rawName = resolvedName ? String(resolvedName).trim() : '';
      const placeholderNames = new Set([
        'Estudiante sin nombre',
        'Student without name',
        'Sin nombre',
      ]);
      const nameStr = rawName && !placeholderNames.has(rawName)
        ? rawName
        : composed || String(student.fullName ?? student.name ?? user.fullName ?? user.name ?? '').trim();

      return {
        id: String(r.id ?? ''),
        studentId: String(resolveStudentId(r, student, user) ?? ''),
        studentName: nameStr,
        student: {
          name: nameStr,
          fullName: nameStr,
          email: typeof student.email === 'string' ? student.email
            : typeof user.email === 'string' ? user.email : undefined,
        },
        offerId: (r.offerId ?? r.offer_id) as string | number | undefined,
        offerTitle: String(offer.title ?? r.offerTitle ?? r.offer_title ?? ''),
        companyName: typeof r.companyName === 'string' ? r.companyName
          : typeof company.companyName === 'string' ? company.companyName
          : typeof company.name === 'string' ? company.name
          : typeof offerCompany.companyName === 'string' ? offerCompany.companyName
          : typeof offerCompany.name === 'string' ? offerCompany.name
          : undefined,
        status: typeof r.status === 'string' ? r.status : 'pending',
        appliedAt: typeof r.appliedAt === 'string' ? r.appliedAt
          : typeof r.createdAt === 'string' ? r.createdAt
          : typeof r.created_at === 'string' ? r.created_at : undefined,
      };
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[fetchApplications] error:', err);
    }
    return [];
  }
}

async function fetchOffers(programId: string, token: string): Promise<ProgramOffer[]> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/universities/me/programs/${programId}/offers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const nestedOffers = (data as Record<string, unknown> | null)?.offers;
    const raw = Array.isArray(nestedOffers)
      ? nestedOffers
      : unwrapCollection<unknown>(nestedOffers, ['offers', 'data']).length > 0
        ? unwrapCollection<unknown>(nestedOffers, ['offers', 'data'])
        : unwrapCollection<unknown>(data, ['offers', 'data']);
    return raw.map((item: unknown) => {
      const r = item as Record<string, unknown>;
      const company = (r.company ?? {}) as Record<string, unknown>;
      const offer = (r.offer ?? {}) as Record<string, unknown>;
      // The endpoint returns ProgramOffer junction records:
      // top-level id = programOfferId; nested offer.id = actual offer id
      const programOfferId = String(resolveProgramOfferId(r) ?? r.id ?? r._id ?? '');
      const offerId = String(resolveJobOfferId(r, offer) ?? r.id ?? r._id ?? '');
      return {
        id: offerId,
        programOfferId,
        title: String(offer.title ?? r.title ?? r.name ?? ''),
        description: typeof (offer.description ?? r.description) === 'string' ? String(offer.description ?? r.description) : undefined,
        companyName: typeof r.companyName === 'string'
          ? r.companyName
          : typeof company.name === 'string' ? company.name
          : typeof (offer.company as Record<string,unknown>)?.name === 'string' ? String((offer.company as Record<string,unknown>).name) : undefined,
        companyId: typeof r.companyId === 'string' ? r.companyId : undefined,
        location: typeof r.location === 'string' ? r.location : undefined,
        contractType: typeof r.contractType === 'string'
          ? r.contractType
          : typeof r.contract_type === 'string' ? r.contract_type : undefined,
        workMode: typeof r.workMode === 'string'
          ? r.workMode
          : typeof r.work_mode === 'string' ? r.work_mode : undefined,
        status: typeof r.status === 'string' ? r.status.toUpperCase() : 'PENDING',
        createdAt: typeof r.createdAt === 'string' ? r.createdAt : typeof r.created_at === 'string' ? r.created_at : undefined,
        updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : typeof r.updated_at === 'string' ? r.updated_at : undefined,
      };
    });
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function UniversityProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const token = await getToken();
  const [program, companies, applications, offers, t, locale] = await Promise.all([
    fetchProgram(programId, token),
    fetchCompanies(programId, token),
    fetchApplications(programId, token),
    fetchOffers(programId, token),
    getTranslations('intranet'),
    getLocale(),
  ]);

  if (!program) notFound();

  return (
    <ProgramDetailClient
      program={program}
      initialCompanies={companies}
      initialApplications={applications}
      initialOffers={offers}
      locale={locale}
      backLabel={t('university.programs.backToPrograms')}
      editLabel={t('university.programs.editBtn')}
    />
  );
}

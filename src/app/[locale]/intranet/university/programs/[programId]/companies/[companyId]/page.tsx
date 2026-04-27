import { cookies } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import CompanyDetailClient from './company-detail-client';
import type {
  ProgramCompanyDetail,
  CompanyOfferEntry,
  CompanyProfileData,
} from '../../../types';
import { normalizeCompanyProfile, resolveJobOfferId, resolveProgramId, resolveProgramOfferId, unwrapCollection } from '@/lib/frontend/contracts';

/*
 * ENDPOINT REAL:
 *   GET {NEXT_PUBLIC_API_URL}/api/universities/me/programs/{programId}/companies/{companyId}
 *
 * Respuesta esperada: { programCompany, company, offers, activity }
 */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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

const API = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function parseCompany(raw: Record<string, unknown>, fallbackId: string): ProgramCompanyDetail {
  const normalized = normalizeCompanyProfile(raw, fallbackId);
  if (!normalized) {
    return { id: fallbackId, companyName: '', name: '' };
  }

  return {
    id: normalized.companyId,
    companyName: normalized.companyName,
    name: normalized.companyName,
    logoUrl: normalized.logoUrl,
    location: normalized.location,
    description: normalized.description,
    verified: normalized.verified,
    approvedOffersCount: normalized.approvedOffersCount,
    website: normalized.website,
    email: normalized.email,
    industry: normalized.industry,
    companySize: normalized.companySize,
    foundedYear: normalized.foundedYear ? Number(normalized.foundedYear) : null,
    linkedinUrl: normalized.linkedinUrl,
    descriptionLong: normalized.description,
    contactPerson: normalized.contactPerson,
    contactEmail: normalized.contactEmail,
    contactPhone: normalized.contactPhone,
    workModes: normalized.workModes,
    vacancyTypes: normalized.vacancyTypes,
    workingLanguages: normalized.workingLanguages,
    participatesInInternships: normalized.participatesInInternships,
  };
}

function parseOffers(raw: unknown): CompanyOfferEntry[] {
  const items = unwrapCollection<Record<string, unknown>>(raw, []);
  return items.map((o, idx: number) => {
    const programOfferId = resolveProgramOfferId(o) ?? undefined;
    const jobOfferId = resolveJobOfferId(o) ?? undefined;
    const rawId = o.id != null && String(o.id) !== '' ? String(o.id) : undefined;
    const title = String(o.title ?? '');
    const createdAt = typeof o.createdAt === 'string' ? o.createdAt
      : typeof o.created_at === 'string' ? (o.created_at as string) : undefined;
    const programId = resolveProgramId(o) ?? undefined;

    // Robust unique id: prefer real ids, fallback to composite
    const id = rawId
      ?? programOfferId
      ?? jobOfferId
      ?? `${programId ?? 'np'}-${title}-${createdAt ?? idx}`;

    return {
      id,
      programOfferId,
      jobOfferId,
      title,
      programTitle: typeof o.programTitle === 'string' ? o.programTitle
        : typeof o.program_title === 'string' ? (o.program_title as string) : undefined,
      programId,
      status: String(o.status ?? 'pending'),
      location: typeof o.location === 'string' ? o.location : null,
      contractType: typeof o.contractType === 'string' ? o.contractType
        : typeof o.contract_type === 'string' ? (o.contract_type as string) : null,
      workMode: typeof o.workMode === 'string' ? o.workMode
        : typeof o.work_mode === 'string' ? (o.work_mode as string) : null,
      createdAt,
    };
  });
}

async function fetchCompanyProfile(
  programId: string,
  companyId: string,
  token: string,
): Promise<CompanyProfileData | null> {
  try {
    const base = API();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const endpoint = `${base}/api/universities/me/programs/${programId}/companies/${companyId}`;
    const res = await fetch(endpoint, { headers, cache: 'no-store' });

    if (!res.ok) return null;

    const data = await res.json();

    // Respuesta: { programCompany, company, offers, activity }
    const root = (data ?? {}) as Record<string, unknown>;

    // company viene en root.company (prioritario) o fallback a root.programCompany / root
    const companyRaw = (root.company ?? root.programCompany ?? root.data ?? root) as Record<string, unknown>;
    const company = parseCompany(companyRaw, companyId);

    // offers viene en root.offers
    const offersRaw = root.offers ?? companyRaw.offers
      ?? (root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>).offers : undefined);
    const offers = parseOffers(offersRaw);

    return { company, programs: [], activity: [], offers };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ programId: string; companyId: string }>;
}) {
  const { programId, companyId } = await params;
  const token = await getToken();
  const [profileData, t, locale] = await Promise.all([
    fetchCompanyProfile(programId, companyId, token),
    getTranslations('intranet'),
    getLocale(),
  ]);

  if (!profileData) notFound();

  return (
    <CompanyDetailClient
      company={profileData.company}
      offers={profileData.offers}
      programId={programId}
      locale={locale}
    />
  );
}

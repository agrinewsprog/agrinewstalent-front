import { cookies } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import OfferDetailClient from './offer-detail-client';
import type { ProgramOffer } from '../../../types';

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

async function fetchOffer(
  programId: string,
  programOfferId: string,
  token: string,
): Promise<ProgramOffer | null> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // Try dedicated endpoint first, fall back to listing all offers
    const directRes = await fetch(
      `${API}/api/universities/me/programs/${programId}/offers/${programOfferId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      },
    );
    if (directRes.ok) {
      const data = await directRes.json();
      const r = (data?.programOffer ?? data?.data ?? data) as Record<string, unknown>;
      return mapRawToOffer(r, programOfferId);
    }

    // Fallback: fetch all offers for the program and find the one
    const listRes = await fetch(
      `${API}/api/universities/me/programs/${programId}/offers`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      },
    );
    if (!listRes.ok) return null;
    const listData = await listRes.json();
    const raw: unknown[] = Array.isArray(listData)
      ? listData
      : Array.isArray(listData?.offers) ? listData.offers
      : Array.isArray(listData?.data) ? listData.data
      : [];
    const match = raw.find((item) => {
      const r = item as Record<string, unknown>;
      const pOId = String(r.programOfferId ?? r.program_offer_id ?? r.id ?? r._id ?? '');
      return pOId === programOfferId;
    });
    if (!match) return null;
    return mapRawToOffer(match as Record<string, unknown>, programOfferId);
  } catch {
    return null;
  }
}

function mapRawToOffer(r: Record<string, unknown>, fallbackPOId: string): ProgramOffer {
  const company = (r.company ?? {}) as Record<string, unknown>;
  const innerOffer = (r.offer ?? {}) as Record<string, unknown>;
  const pOId = String(r.programOfferId ?? r.program_offer_id ?? r.id ?? r._id ?? fallbackPOId);
  const oId = String(innerOffer.id ?? r.offerId ?? r.offer_id ?? r.id ?? r._id ?? '');
  return {
    id: oId,
    programOfferId: pOId,
    title: String(innerOffer.title ?? r.title ?? r.name ?? ''),
    description: typeof (innerOffer.description ?? r.description) === 'string'
      ? String(innerOffer.description ?? r.description)
      : undefined,
    companyName: typeof r.companyName === 'string'
      ? r.companyName
      : typeof company.name === 'string' ? String(company.name)
      : typeof (innerOffer.company as Record<string, unknown>)?.name === 'string'
        ? String((innerOffer.company as Record<string, unknown>).name)
        : undefined,
    companyId: typeof r.companyId === 'string' ? r.companyId : undefined,
    location: typeof r.location === 'string' ? r.location
      : typeof innerOffer.location === 'string' ? String(innerOffer.location) : undefined,
    contractType: typeof r.contractType === 'string'
      ? r.contractType
      : typeof r.contract_type === 'string' ? r.contract_type
      : typeof innerOffer.contractType === 'string' ? String(innerOffer.contractType) : undefined,
    workMode: typeof r.workMode === 'string'
      ? r.workMode
      : typeof r.work_mode === 'string' ? r.work_mode
      : typeof innerOffer.workMode === 'string' ? String(innerOffer.workMode) : undefined,
    status: typeof r.status === 'string' ? r.status.toUpperCase() : 'PENDING',
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : typeof r.created_at === 'string' ? r.created_at : undefined,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : typeof r.updated_at === 'string' ? r.updated_at : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ programId: string; programOfferId: string }>;
}) {
  const { programId, programOfferId } = await params;
  const token = await getToken();
  const [offer, t, locale] = await Promise.all([
    fetchOffer(programId, programOfferId, token),
    getTranslations('intranet'),
    getLocale(),
  ]);

  if (!offer) notFound();

  return (
    <OfferDetailClient
      offer={offer}
      programId={programId}
      locale={locale}
      backLabel={t('university.programDetail.offerReview.backToProgram')}
    />
  );
}

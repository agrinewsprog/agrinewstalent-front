'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { buildCompanyOfferApplicationsHref, buildCompanyOfferHref, buildCompanyProgramOfferEditHref } from '@/lib/utils';
import {
  PlusCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

/* ------------------------------------------------------------------ */
/*  Local type for program offers (status may differ from global Offer)*/
/* ------------------------------------------------------------------ */
interface ProgramOffer {
  id: string;
  programOfferId?: string;
  jobOfferId?: string;
  program?: { title?: string; programId?: string | number };
  university?: { name?: string | null };
  title: string;
  description?: string;
  location?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  programId?: string;
  companyId?: string;
  applicationsCount?: number;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Offer status → Badge variant                                       */
/* ------------------------------------------------------------------ */
const offerStatusVariant: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  pending: 'warning',
  APPROVED: 'success',
  approved: 'success',
  PUBLISHED: 'success',
  published: 'success',
  REJECTED: 'danger',
  rejected: 'danger',
  DRAFT: 'default',
  draft: 'default',
  CLOSED: 'default',
  closed: 'default',
};

/* ------------------------------------------------------------------ */
/*  Unwrap helpers                                                     */
/* ------------------------------------------------------------------ */
function unwrapOffersList(json: unknown): ProgramOffer[] {
  if (!json || typeof json !== 'object') return [];
  if (Array.isArray(json)) return json;
  const obj = json as Record<string, unknown>;
  const inner = obj.offers ?? obj.programOffers ?? obj.data;
  if (Array.isArray(inner)) return inner;
  return [];
}

function formatSafeDate(value: string | null | undefined, locale: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(locale);
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const obj = payload as { message?: unknown; error?: { message?: unknown } };
  if (typeof obj.error?.message === 'string' && obj.error.message.trim()) return obj.error.message;
  if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
  return fallback;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface CompanyProgramActionsProps {
  programId: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function CompanyProgramActions({
  programId,
}: CompanyProgramActionsProps) {
  const router = useRouter();
  const t = useTranslations('intranet');
  const locale = useLocale();
  const { success, error: showError } = useToast();
  const [deletingProgramOfferId, setDeletingProgramOfferId] = useState<string | null>(null);

  /* ---------- Fetch my program offers ---------- */
  const [programOffers, setProgramOffers] = useState<ProgramOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const fetchOffers = useCallback(async () => {
    setLoadingOffers(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const progRes = await fetch(`${API}/api/programs/companies/me/offers?programId=${programId}`, {
        credentials: 'include',
      });
      if (!progRes.ok) throw new Error(`HTTP ${progRes.status}`);
      const json = await progRes.json();
      const list = unwrapOffersList(json);
      setProgramOffers(
        list.filter((offer) => Boolean(offer.programOfferId ?? offer.id)).map((offer) => ({
          ...offer,
          programId: offer.programId ?? String(offer.program?.programId ?? programId),
        })),
      );
    } catch {
      showError(t('common.error'));
      setProgramOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  }, [programId, showError, t]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleDeleteProgramOffer = async (offer: ProgramOffer) => {
    const canonicalProgramOfferId = offer.programOfferId ?? offer.id;
    if (!canonicalProgramOfferId || deletingProgramOfferId) return;
    if (!window.confirm(`${t('common.confirm')}: ${offer.title}`)) return;

    setDeletingProgramOfferId(canonicalProgramOfferId);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API}/api/companies/me/programs/${programId}/offers/${canonicalProgramOfferId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        showError(extractErrorMessage(payload, t('common.error')));
        return;
      }

      success(extractErrorMessage(payload, t('common.feedback.deleted')));
      setProgramOffers((prev) => prev.filter((item) => (item.programOfferId ?? item.id) !== canonicalProgramOfferId));
      router.refresh();
    } catch {
      showError(t('common.error'));
    } finally {
      setDeletingProgramOfferId(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Offer status label (i18n)                                          */
  /* ------------------------------------------------------------------ */
  function offerStatusLabel(status?: string): string {
    const s = (status ?? '').toUpperCase();
    switch (s) {
      case 'PENDING':    return t('company.programDetail.myOffers.pending');
      case 'APPROVED':   return t('company.programDetail.myOffers.approved');
      case 'PUBLISHED':  return t('company.programDetail.myOffers.published');
      case 'REJECTED':   return t('company.programDetail.myOffers.rejected');
      case 'DRAFT':      return t('company.programDetail.myOffers.draft');
      case 'CLOSED':     return t('company.programDetail.myOffers.closed');
      default:           return status ?? '';
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="space-y-6">
      {/* ── Create / Add offer ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{t('company.programs.addOfferTitle')}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('company.programs.addOfferSubtitle')}
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Create new offer button — goes to dedicated new-offer page */}
            <Link href={`/${locale}/intranet/company/programs/${programId}/new-offer`}>
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <PlusCircleIcon className="h-5 w-5" />
                {t('company.programs.createOfferForProgram')}
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* ── My offers in this program ────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{t('company.programDetail.myOffers.title')}</h2>
        </CardHeader>
        <CardBody>
          {loadingOffers ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">{t('common.feedback.loading')}</p>
            </div>
          ) : programOffers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {t('company.programDetail.myOffers.empty')}
            </p>
          ) : (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 space-y-3">
              {programOffers.map((offer) => {
                const rawStatus = (offer.status ?? '').toLowerCase();
                const variant = offerStatusVariant[rawStatus] ?? 'default';
                const canonicalProgramOfferId = offer.programOfferId ?? offer.id;
                const realOfferId = offer.jobOfferId ?? null;
                const canEdit = Boolean(canonicalProgramOfferId);
                const canViewDetail = Boolean(realOfferId && canonicalProgramOfferId);
                const canViewApplications = Boolean(realOfferId && canonicalProgramOfferId);
                const canDelete = Boolean(canonicalProgramOfferId);
                const editHref = canEdit ? buildCompanyProgramOfferEditHref(locale, programId, canonicalProgramOfferId) : null;
                const viewHref = canViewDetail ? buildCompanyOfferHref(locale, realOfferId!, programId, canonicalProgramOfferId) : null;
                const applicationsHref = canViewApplications ? buildCompanyOfferApplicationsHref(locale, realOfferId!, programId, canonicalProgramOfferId) : null;

                return (
                  <div
                    key={canonicalProgramOfferId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-100 bg-white px-4 py-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium text-gray-900 truncate">{offer.title}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        {offer.location && (
                          <span>{offer.location}</span>
                        )}
                        {offer.createdAt && (
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            {formatSafeDate(offer.createdAt, locale)}
                          </span>
                        )}
                        {typeof offer.applicationsCount === 'number' && (
                          <span>{offer.applicationsCount}</span>
                        )}
                        {offer.program?.title && (
                          <span>{offer.program.title}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Badge variant={variant}>{offerStatusLabel(offer.status)}</Badge>
                      {editHref ? (
                        <Link
                          href={editHref}
                          className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                          title={t('company.programDetail.myOffers.editOffer')}
                        >
                          {t('company.offers.editOffer')}
                        </Link>
                      ) : null}
                      {viewHref ? (
                        <Link
                          href={viewHref}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                          title={t('company.programDetail.myOffers.viewDetail')}
                        >
                          {t('company.programDetail.myOffers.viewDetail')}
                        </Link>
                      ) : (
                        <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400">
                          {t('company.programDetail.myOffers.viewDetail')}
                        </span>
                      )}
                      {applicationsHref ? (
                        <Link
                          href={applicationsHref}
                          className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                          title={t('company.offers.viewCandidates')}
                        >
                          {t('company.offers.viewCandidates')}
                        </Link>
                      ) : (
                        <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400">
                          {t('company.offers.viewCandidates')}
                        </span>
                      )}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteProgramOffer(offer)}
                          disabled={deletingProgramOfferId === canonicalProgramOfferId}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                          title={t('common.delete')}
                        >
                          {t('common.delete')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

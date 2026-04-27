'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const API = process.env.NEXT_PUBLIC_API_URL || '';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ProgramOfferPending {
  id: string;
  programOfferId: string;
  title: string;
  description?: string;
  location?: string;
  createdAt?: string;
  companyName?: string;
  companyId?: string;
  programId: string;
  programTitle: string;
}

interface ProgramSummary {
  id: string;
  title?: string;
  name?: string;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.offers)) return d.offers as T[];
    if (Array.isArray(d.data)) return d.data as T[];
    if (Array.isArray(d.items)) return d.items as T[];
    if (Array.isArray(d.results)) return d.results as T[];
  }
  return [];
}

function unwrapPrograms(data: unknown): ProgramSummary[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.programs)) return d.programs;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.results)) return d.results;
  }
  return [];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function PendingProgramOffers() {
  const t = useTranslations('intranet');

  const [offers, setOffers] = useState<ProgramOfferPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; type: 'success' | 'error'; msg: string } | null>(null);

  /* ---- Fetch all pending offers across programs -------------------- */
  const fetchPendingOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get all programs for this university
      const progsRes = await fetch(`${API}/api/universities/me/programs`, {
        credentials: 'include',
      });
      if (!progsRes.ok) throw new Error(`programs ${progsRes.status}`);
      const progsData = await progsRes.json();
      const programs = unwrapPrograms(progsData);

      // 2. For each program, fetch offers and filter PENDING
      const pending: ProgramOfferPending[] = [];

      await Promise.all(
        programs.map(async (prog) => {
          try {
            const offersRes = await fetch(`${API}/api/programs/${prog.id}/offers`, {
              credentials: 'include',
            });
            if (!offersRes.ok) return;
            const offersData = await offersRes.json();
            const offersList = unwrapList<Record<string, unknown>>(offersData);

            for (const o of offersList) {
              const status = (typeof o.status === 'string' ? o.status : '').toUpperCase();
              if (status === 'PENDING') {
                const innerOffer = (o.offer ?? {}) as Record<string, unknown>;
                const programOfferId = String(
                  o.programOfferId ?? o.program_offer_id ?? o.id ?? o._id ?? ''
                );
                const offerId = String(
                  (innerOffer as Record<string,unknown>).id ?? o.offerId ?? o.offer_id ?? o.id ?? o._id ?? ''
                );
                pending.push({
                  id: offerId,
                  programOfferId,
                  title: String(innerOffer.title ?? o.title ?? o.name ?? ''),
                  description: typeof (innerOffer.description ?? o.description) === 'string' ? String(innerOffer.description ?? o.description) : undefined,
                  location: typeof (o.location ?? innerOffer.location) === 'string' ? String(o.location ?? innerOffer.location) : undefined,
                  createdAt: typeof o.createdAt === 'string' ? o.createdAt : undefined,
                  companyName: typeof o.companyName === 'string'
                    ? o.companyName
                    : typeof (o.company as Record<string, unknown>)?.name === 'string'
                      ? String((o.company as Record<string, unknown>).name)
                      : undefined,
                  companyId: typeof o.companyId === 'string' ? o.companyId : undefined,
                  programId: String(prog.id),
                  programTitle: String(prog.title ?? prog.name ?? ''),
                });
              }
            }
          } catch {
            // skip failed program fetches silently
          }
        }),
      );

      // Sort by createdAt descending
      pending.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setOffers(pending);
    } catch {
      setError(t('university.profile.pendingOffers.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchPendingOffers(); }, [fetchPendingOffers]);

  /* ---- Approve / Reject ------------------------------------------- */
  const handleAction = useCallback(
    async (offer: ProgramOfferPending, action: 'APPROVED' | 'REJECTED') => {
      const poId = offer.programOfferId;

      if (!poId) {
        console.error('[PendingProgramOffers] Missing programOfferId for offer', offer);
        setFeedback({ id: offer.id, type: 'error', msg: t('university.profile.pendingOffers.actionError') });
        return;
      }

      setProcessingId(poId);
      setFeedback(null);
      try {
        const res = await fetch(
          `${API}/api/programs/${offer.programId}/offers/${poId}/status`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action }),
          },
        );
        if (!res.ok) throw new Error(`status ${res.status}`);

        // Remove from local list
        setOffers((prev) => prev.filter((o) => o.programOfferId !== offer.programOfferId));
        setFeedback({
          id: offer.programOfferId,
          type: 'success',
          msg: action === 'APPROVED'
            ? t('university.profile.pendingOffers.approveSuccess')
            : t('university.profile.pendingOffers.rejectSuccess'),
        });
      } catch {
        setFeedback({
          id: offer.programOfferId,
          type: 'error',
          msg: t('university.profile.pendingOffers.actionError'),
        });
      } finally {
        setProcessingId(null);
      }
    },
    [t],
  );

  /* ---- Render ----------------------------------------------------- */

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-sm">
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
            {t('university.profile.pendingOffers.loading')}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ExclamationCircleIcon className="h-8 w-8 text-red-400 mb-2" />
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchPendingOffers}>
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              {t('university.profile.pendingOffers.retry')}
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">
            {t('university.profile.pendingOffers.title')}
          </h2>
        </div>
        {offers.length > 0 && (
          <Badge variant="warning">{offers.length}</Badge>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success'
            ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
            : <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* Empty state */}
      {offers.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-6 text-sm">
              {t('university.profile.pendingOffers.empty')}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Offer cards */}
      {offers.map((offer) => (
        <Card key={offer.programOfferId}>
          <CardBody>
            <div className="flex items-start justify-between gap-4">
              {/* Offer info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="warning">
                    {t('university.profile.pendingOffers.pending')}
                  </Badge>
                </div>

                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {offer.title}
                </h3>

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  {offer.companyName && (
                    <p className="flex items-center gap-1.5">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{t('university.profile.pendingOffers.company')}:</span>{' '}
                      {offer.companyName}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium">{t('university.profile.pendingOffers.program')}:</span>{' '}
                    {offer.programTitle}
                  </p>
                  {offer.location && (
                    <p className="flex items-center gap-1.5">
                      <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {offer.location}
                    </p>
                  )}
                  {offer.createdAt && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CalendarDaysIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      {t('university.profile.pendingOffers.submittedOn', {
                        date: new Date(offer.createdAt).toLocaleDateString(),
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleAction(offer, 'APPROVED')}
                  isLoading={processingId === offer.programOfferId}
                  disabled={processingId !== null}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {t('university.profile.pendingOffers.approve')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleAction(offer, 'REJECTED')}
                  isLoading={processingId === offer.programOfferId}
                  disabled={processingId !== null}
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {t('university.profile.pendingOffers.reject')}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

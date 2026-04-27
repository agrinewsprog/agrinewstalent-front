'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api/client';
import type { ProgramOffer } from '../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtDate(iso: string | undefined, locale: string) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(
      locale === 'en' ? 'en-GB' : locale === 'pt' ? 'pt-PT' : 'es-ES',
      { day: '2-digit', month: 'short', year: 'numeric' },
    ).format(new Date(iso));
  } catch {
    return iso;
  }
}

const statusColors: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  REJECTED: 'bg-red-100 text-red-800 ring-1 ring-red-200',
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  offer: ProgramOffer;
  programId: string;
  locale: string;
  backLabel: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function OfferDetailClient({ offer: initial, programId, locale, backLabel }: Props) {
  const t = useTranslations('intranet');
  const loc = useLocale();
  const [offer, setOffer] = useState(initial);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const statusLabel = t(
    `university.programDetail.offers.status${offer.status.charAt(0) + offer.status.slice(1).toLowerCase()}` as Parameters<typeof t>[0],
  );

  const translateContractType = (ct: string | undefined) => {
    if (!ct) return null;
    return t(`university.programDetail.offers.contractTypes.${ct}` as Parameters<typeof t>[0]);
  };

  const translateWorkMode = (wm: string | undefined) => {
    if (!wm) return null;
    return t(`university.programDetail.offers.workModes.${wm}` as Parameters<typeof t>[0]);
  };

  const handleAction = useCallback(async (newStatus: 'APPROVED' | 'REJECTED') => {
    const poId = offer.programOfferId;
    if (!poId) return;
    setLoadingAction(newStatus);
    setFeedback(null);
    try {
      await api.patch(`/api/programs/${programId}/offers/${poId}/status`, { status: newStatus });
      setOffer(prev => ({ ...prev, status: newStatus }));
      setFeedback({
        type: 'success',
        msg: t(newStatus === 'APPROVED'
          ? 'university.programDetail.offerReview.approveSuccess'
          : 'university.programDetail.offerReview.rejectSuccess'),
      });
    } catch {
      setFeedback({
        type: 'error',
        msg: t('university.programDetail.offerReview.actionError'),
      });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  }, [offer.programOfferId, programId, t]);

  const backHref = `/${loc}/intranet/university/programs/${programId}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {backLabel}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{offer.title}</h1>
            <p className="text-xs text-gray-500 mt-1">
              {t('university.programDetail.offerReview.title')}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium shrink-0 ${statusColors[offer.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {statusLabel}
          </span>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Meta grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {offer.companyName && (
            <div className="flex items-start gap-2">
              <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('university.programDetail.offerReview.company')}</p>
                <p className="text-gray-900">{offer.companyName}</p>
              </div>
            </div>
          )}

          {offer.location && (
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('university.programDetail.offerReview.location')}</p>
                <p className="text-gray-900">{offer.location}</p>
              </div>
            </div>
          )}

          {offer.contractType && (
            <div className="flex items-start gap-2">
              <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('university.programDetail.offerReview.contractType')}</p>
                <p className="text-gray-900">{translateContractType(offer.contractType)}</p>
              </div>
            </div>
          )}

          {offer.workMode && (
            <div className="flex items-start gap-2">
              <BriefcaseIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('university.programDetail.offerReview.workMode')}</p>
                <p className="text-gray-900">{translateWorkMode(offer.workMode)}</p>
              </div>
            </div>
          )}

          {offer.createdAt && (
            <div className="flex items-start gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('university.programDetail.offerReview.submittedOn', { date: '' }).replace(/\s*$/, '')}</p>
                <p className="text-gray-900">{fmtDate(offer.createdAt, locale)}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500">{t('university.programDetail.offerReview.status')}</p>
              <p className="text-gray-900">{statusLabel}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {t('university.programDetail.offerReview.description')}
          </h2>
          {offer.description ? (
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {offer.description}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {t('university.programDetail.offerReview.noDescription')}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3 border-t border-gray-100 pt-4">
          {(offer.status === 'PENDING' || offer.status === 'REJECTED') && (
            <button
              disabled={loadingAction !== null}
              onClick={() => handleAction('APPROVED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {loadingAction === 'APPROVED' ? '…' : t('university.programDetail.offerReview.approve')}
            </button>
          )}
          {(offer.status === 'PENDING' || offer.status === 'APPROVED') && (
            <button
              disabled={loadingAction !== null}
              onClick={() => handleAction('REJECTED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <XCircleIcon className="w-4 h-4" />
              {loadingAction === 'REJECTED' ? '…' : t('university.programDetail.offerReview.reject')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

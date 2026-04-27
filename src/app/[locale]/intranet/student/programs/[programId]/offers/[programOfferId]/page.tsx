'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  getDisplayInitial,
  resolveProgramOfferId,
  toAbsoluteAssetUrl,
  unwrapEntity,
} from '@/lib/frontend/contracts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface OfferDetail {
  id: string;
  programOfferId?: string;
  jobOfferId?: string;
  title: string;
  description?: string;
  companyName?: string;
  company?: { companyName?: string; name?: string; id?: string; logoUrl?: string; logo?: string };
  companyId?: string;
  location?: string;
  contractType?: string;
  workMode?: string;
  status?: string;
  hasApplied?: boolean;
  applied?: boolean;
  requirements?: string;
  responsibilities?: string;
  salary?: string;
  vacancies?: number;
  createdAt?: string;
  companyLogoUrl?: string;
  alreadyApplied?: boolean;
  canApply?: boolean;
  application?: { applicationId?: string; status?: string; appliedAt?: string } | null;
}

function unwrapOffer(data: unknown): OfferDetail | null {
  return unwrapEntity<OfferDetail>(data, ['offer', 'programOffer', 'data']);
}

function readErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) return record.message;
  const error = record.error;
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return null;
}

export default function StudentOfferDetailPage() {
  const t = useTranslations('intranet');
  const locale = useLocale();
  const params = useParams<{ programId: string; programOfferId: string }>();
  const { programId, programOfferId } = params;

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const base = `/${locale}/intranet/student/programs/${programId}`;

  const fetchOffer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${API}/api/students/me/programs/${programId}/offers/${programOfferId}`;

      const res = await fetch(endpoint, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      setOffer(unwrapOffer(json));
    } catch (err) {
      console.error('[offerDetail] fetch error', err);
      setError(t('common.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [programId, programOfferId, t]);

  useEffect(() => { fetchOffer(); }, [fetchOffer]);

  const handleApply = async () => {
    const canonicalProgramOfferId = resolveProgramOfferId(offer);
    if (!canonicalProgramOfferId) {
      setError(t('common.errors.generic'));
      return;
    }
    setApplying(true);
    try {
      const endpoint = `${API}/api/students/me/programs/${programId}/offers/${canonicalProgramOfferId}/apply`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      let body: unknown = null;
      try { body = await res.json(); } catch { /* empty */ }

      if (res.status === 409) {
        await fetchOffer();
        return;
      }

      if (!res.ok) throw new Error(readErrorMessage(body) ?? `HTTP ${res.status}`);
      await fetchOffer();
    } catch (err) {
      console.error('[offerDetail] apply error', err);
      setError(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">{t('common.feedback.loading')}</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Link href={base} className="text-sm text-blue-600 hover:underline">
          {t('student.offerDetail.backToProgram')}
        </Link>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600">{error ?? t('student.offerDetail.notFound')}</p>
          <button onClick={fetchOffer} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('student.programDetail.retry')}
          </button>
        </div>
      </div>
    );
  }

  const cName = offer.companyName ?? offer.company?.companyName ?? offer.company?.name ?? '';
  const logo = toAbsoluteAssetUrl(offer.companyLogoUrl ?? offer.company?.logoUrl ?? offer.company?.logo, API);
  const isApplied = Boolean(offer.hasApplied || offer.applied || offer.alreadyApplied || offer.application);
  const ct = offer.contractType ? (t(`common.contractType.${offer.contractType}` as Parameters<typeof t>[0]) ?? offer.contractType) : null;
  const wm = offer.workMode ? (t(`common.workMode.${offer.workMode}` as Parameters<typeof t>[0]) ?? offer.workMode) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Back */}
      <Link href={base} className="inline-flex items-center text-sm text-blue-600 hover:underline">
        {t('student.offerDetail.backToProgram')}
      </Link>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        {/* Title + company */}
        <div className="flex items-start gap-4">
          {logo ? (
            <img src={logo} alt={cName} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
              {getDisplayInitial(cName, offer.title)}
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">{offer.title}</h1>
            {cName && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <BuildingOfficeIcon className="h-4 w-4" /> {cName}
              </p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {offer.location && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <MapPinIcon className="h-4 w-4" /> {offer.location}
            </span>
          )}
          {ct && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <BriefcaseIcon className="h-4 w-4" /> {ct}
            </span>
          )}
          {wm && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <BuildingOfficeIcon className="h-4 w-4" /> {wm}
            </span>
          )}
          {offer.salary && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              💰 {offer.salary}
            </span>
          )}
          {offer.vacancies !== undefined && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              {t('student.offerDetail.vacancies')}: {offer.vacancies}
            </span>
          )}
          {offer.createdAt && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <CalendarDaysIcon className="h-4 w-4" /> {new Date(offer.createdAt).toLocaleDateString(locale)}
            </span>
          )}
        </div>

        {/* Apply button */}
        <div className="pt-2">
          {isApplied ? (
            <span className="inline-flex items-center gap-2 text-base font-medium text-green-700 bg-green-50 px-5 py-2.5 rounded-xl">
              <CheckBadgeIcon className="h-5 w-5" />
              {t('student.programDetail.applied')}
            </span>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || offer.canApply === false}
              className="px-6 py-2.5 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors"
            >
              {applying ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : t('student.programDetail.apply')}
            </button>
          )}
        </div>

        {/* Description */}
        {offer.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <DocumentTextIcon className="h-4 w-4" />
              {t('student.offerDetail.description')}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{offer.description}</p>
          </div>
        )}

        {/* Requirements */}
        {offer.requirements && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              {t('student.offerDetail.requirements')}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{offer.requirements}</p>
          </div>
        )}

        {/* Responsibilities */}
        {offer.responsibilities && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              {t('student.offerDetail.responsibilities')}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{offer.responsibilities}</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  LanguageIcon,
  CalendarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import OfferApplicationsSection from './OfferApplicationsSection';
import { resolveJobOfferId, resolveProgramOfferId as resolveCanonicalProgramOfferId } from '@/lib/frontend/contracts';
import { buildCompanyOfferApplicationsHref, buildCompanyProgramOfferEditHref, buildCompanyProgramsHref } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const isDev = process.env.NODE_ENV === 'development';

/* ------------------------------------------------------------------ */
/*  Raw API shape — keeps ALL fields the backend may return            */
/* ------------------------------------------------------------------ */
interface RawOffer {
  id?: number | string;
  jobOfferId?: number | string;
  offerId?: number | string;
  programOfferId?: number | string;
  title?: string;
  description?: string;
  requirements?: string | null;
  location?: string | null;
  salary?: string | null;
  workMode?: string | null;
  contractType?: string | null;
  schedule?: string | null;
  language?: string | null;
  status?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  companyName?: string | null;
  company?: { companyName?: string; name?: string; city?: string; country?: string };
  offer?: RawOffer;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Normalised detail used by the UI                                   */
/* ------------------------------------------------------------------ */
interface OfferDetail {
  realOfferId: string;
  programOfferId: string | null;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  workMode: string;
  contractType: string;
  schedule: string;
  language: string;
  offerStatus: string;
  companyName: string;
  publishedAt: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Resolve the REAL offer id from any shape the API returns           */
/* ------------------------------------------------------------------ */
function resolveRealOfferId(raw: RawOffer, paramId: string): string {
  return resolveJobOfferId(raw, raw.offer) ?? paramId;
}

function resolveProgramOfferId(raw: RawOffer): string | null {
  return resolveCanonicalProgramOfferId(raw);
}

/* ------------------------------------------------------------------ */
/*  Normalise raw API response into a clean OfferDetail                */
/* ------------------------------------------------------------------ */
function normalise(raw: RawOffer, paramId: string): OfferDetail {
  const src = raw.offer && typeof raw.offer === 'object'
    ? { ...raw.offer, ...raw, offer: undefined }
    : raw;

  return {
    realOfferId: resolveRealOfferId(raw, paramId),
    programOfferId: resolveProgramOfferId(raw),
    title: (src.title ?? '') as string,
    description: (src.description ?? '') as string,
    requirements: (src.requirements ?? '') as string,
    location: (src.location ?? '') as string,
    salary: (src.salary ?? '') as string,
    workMode: (src.workMode ?? '') as string,
    contractType: (src.contractType ?? '') as string,
    schedule: (src.schedule ?? '') as string,
    language: (src.language ?? '') as string,
    offerStatus: (src.status ?? '') as string,
    companyName: (src.companyName ?? src.company?.companyName ?? src.company?.name ?? '') as string,
    publishedAt: (src.publishedAt ?? '') as string,
    createdAt: (src.createdAt ?? '') as string,
  };
}

/* ------------------------------------------------------------------ */
/*  Tag pill                                                           */
/* ------------------------------------------------------------------ */
function TagPill({ label, variant = 'default' }: { label: string; variant?: 'green' | 'blue' | 'yellow' | 'gray' | 'red' | 'default' }) {
  const classes: Record<string, string> = {
    green:   'bg-green-100 text-green-800 border border-green-200',
    blue:    'bg-blue-100 text-blue-800 border border-blue-200',
    yellow:  'bg-yellow-100 text-yellow-800 border border-yellow-200',
    red:     'bg-red-100 text-red-800 border border-red-200',
    gray:    'bg-gray-100 text-gray-800 border border-gray-200',
    default: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${classes[variant]}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function CompanyOfferDetailPage() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const locale       = useLocale();
  const t            = useTranslations('intranet');

  const paramId          = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const qsProgramId      = searchParams.get('programId') || null;
  const qsProgramOfferId = searchParams.get('programOfferId') || null;

  const [detail,      setDetail]      = useState<OfferDetail | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [loadError,   setLoadError]   = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Fetch                                                            */
  /* ---------------------------------------------------------------- */
  const fetchOffer = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    setNotFound(false);

    try {
      const res = await fetch(`${API_BASE}/api/offers/${paramId}`, { credentials: 'include' });

      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok)            { setLoadError(true); return; }

      const raw: RawOffer = await res.json();

      const d = normalise(raw, paramId);

      setDetail(d);
    } catch (err) {
      if (isDev) console.error('[offerDetail] fetch error', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [paramId, locale]);

  useEffect(() => { fetchOffer(); }, [fetchOffer]);

  /* ---------------------------------------------------------------- */
  /*  i18n display helpers                                             */
  /* ---------------------------------------------------------------- */
  const displayWorkMode = (raw: string): string => {
    const key = raw.toUpperCase().replace('-', '_');
    const map: Record<string, string> = {
      REMOTE: t('status.remote'), HYBRID: t('status.hybrid'),
      ONSITE: t('status.onsite'), ON_SITE: t('status.onsite'),
    };
    return map[key] ?? raw ?? '—';
  };

  const displayContractType = (raw: string): string => {
    const key = raw.toUpperCase().replace('-', '_');
    const map: Record<string, string> = {
      FULL_TIME: t('common.contractType.FULL_TIME'), PART_TIME: t('common.contractType.PART_TIME'),
      INTERNSHIP: t('common.contractType.INTERNSHIP'), FREELANCE: t('common.contractType.FREELANCE'),
      PERMANENT: t('common.contractType.PERMANENT'), TEMPORARY: t('common.contractType.TEMPORARY'),
    };
    return map[key] ?? raw ?? '—';
  };

  const displaySchedule = (raw: string): string => {
    const key = raw.toUpperCase().replace('-', '_');
    const map: Record<string, string> = {
      FULL_TIME: t('status.fullTime'), PART_TIME: t('status.partTime'), FLEXIBLE: t('status.flexible'),
    };
    return map[key] ?? raw ?? '—';
  };

  const displayOfferStatus = (raw: string): { label: string; variant: 'green' | 'yellow' | 'gray' | 'red' } => {
    switch (raw.toUpperCase()) {
      case 'PUBLISHED': return { label: t('company.offerStatus.PUBLISHED'), variant: 'green' };
      case 'DRAFT':     return { label: t('company.offerStatus.DRAFT'),     variant: 'yellow' };
      case 'CLOSED':    return { label: t('company.offerStatus.CLOSED'),    variant: 'red' };
      default:          return { label: raw || '—',                          variant: 'gray' };
    }
  };

  const displayCategory = (ct: string): string => {
    const key = ct.toUpperCase().replace('-', '_');
    return key === 'INTERNSHIP' ? t('status.internship') : t('status.employment');
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading                                                          */
  /* ---------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        <span className="ml-3 text-gray-500 text-sm">{t('common.loading')}</span>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Not found                                                        */
  /* ---------------------------------------------------------------- */
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BriefcaseIcon className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-800">{t('company.offerDetail.notFound')}</h2>
        <p className="text-gray-500 text-sm">{t('company.offerDetail.notFoundDesc')}</p>
        <Link
          href={`/${locale}/intranet/company/offers`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('company.offerDetail.backToOffers')}
        </Link>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Error                                                            */
  /* ---------------------------------------------------------------- */
  if (loadError || !detail) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600 font-medium">{t('company.offerDetail.errorLoading')}</p>
        <button
          onClick={fetchOffer}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('company.offerDetail.retry')}
        </button>
        <Link
          href={`/${locale}/intranet/company/offers`}
          className="flex items-center gap-2 text-sm text-green-600 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('company.offerDetail.backToOffers')}
        </Link>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Derived display values                                           */
  /* ---------------------------------------------------------------- */
  const statusInfo  = displayOfferStatus(detail.offerStatus);
  const editHref = qsProgramId && qsProgramOfferId
    ? buildCompanyProgramOfferEditHref(locale, qsProgramId, qsProgramOfferId)
    : `/${locale}/intranet/company/offers/${detail.realOfferId}/edit`;
  const dateDisplay = detail.publishedAt ? formatDate(detail.publishedAt) : formatDate(detail.createdAt);
  const scheduleStr = detail.schedule
    ? displaySchedule(detail.schedule)
    : (detail.contractType ? displaySchedule(detail.contractType) : '—');

  const backHref = qsProgramId
    ? buildCompanyProgramsHref(locale, qsProgramId)
    : `/${locale}/intranet/company/offers`;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {qsProgramId ? t('company.programDetail.backToProgram') : t('company.offerDetail.backToOffers')}
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                <BriefcaseIcon className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{detail.companyName || '—'}</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{detail.title || '—'}</h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 gap-2">
              <button
                onClick={() => router.push(editHref)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4" />
                {t('company.offers.editOffer')}
              </button>
              <Link
                href={buildCompanyOfferApplicationsHref(
                  locale,
                  detail.realOfferId,
                  qsProgramId,
                  qsProgramOfferId ?? detail.programOfferId,
                )}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-600 text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors"
              >
                <BriefcaseIcon className="h-4 w-4" />
                {t('company.offers.viewCandidates')}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <TagPill label={statusInfo.label} variant={statusInfo.variant} />
            {detail.contractType && (
              <TagPill label={displayCategory(detail.contractType)} variant="blue" />
            )}
            {detail.workMode && (
              <TagPill label={displayWorkMode(detail.workMode)} />
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm">
          {detail.location && (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPinIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <span>{detail.location}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-gray-600">
            <ClockIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>{scheduleStr}</span>
          </div>
          {detail.language && (
            <div className="flex items-start gap-2 text-gray-600">
              <LanguageIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <span>{detail.language}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-gray-600">
            <CalendarIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>{t('company.offerDetail.postedOn')} {dateDisplay}</span>
          </div>
          {detail.salary && (
            <div className="flex items-start gap-2 text-gray-600">
              <BanknotesIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <span>{detail.salary}</span>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">{t('common.conditions')}</p>
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('common.contract')}</p>
              <p className="font-semibold text-gray-800">{detail.contractType ? displayContractType(detail.contractType) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('common.schedule')}</p>
              <p className="font-semibold text-gray-800">{scheduleStr}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('common.language')}</p>
              <p className="font-semibold text-gray-800">{detail.language || '—'}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">{t('common.description')}</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {detail.description || '—'}
          </p>
        </div>

        {/* Requirements */}
        {detail.requirements && (
          <div className="px-6 py-5">
            <p className="text-sm font-bold text-gray-800 mb-3">{t('common.requirements')}</p>
            <ul className="space-y-2">
              {detail.requirements.split('\n').filter(Boolean).map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {line.replace(/^[-•]\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Applications section — uses the REAL offer ID */}
      <OfferApplicationsSection
        offerId={detail.realOfferId}
        locale={locale}
        programId={qsProgramId ?? (detail.programOfferId ? null : null)}
        programOfferId={qsProgramOfferId ?? detail.programOfferId}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';
import {
  UserCircleIcon,
  MapPinIcon,
  AcademicCapIcon,
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import {
  getDisplayInitial,
  normalizeApplicationStatus,
  resolveApplicationId,
  resolveApplicationSource,
  resolveCandidateId,
  unwrapCollection,
} from '@/lib/frontend/contracts';
import { resolveMediaUrl } from '@/lib/frontend/business';
import { buildCompanyCandidatesHref, buildCompanyOfferApplicationsHref } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ApplicationFromAPI {
  id: string;
  status: string;
  createdAt: string;
  cvUrl?: string | null;
  student?: {
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    avatar?: string;
    city?: string;
    country?: string;
    location?: string;
    universityName?: string;
    university_name?: string;
    university?: string;
    type?: string; // 'student' | 'professional'
  };
  /* Program-offer endpoint returns "candidate" instead of "student" */
  candidate?: {
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    avatar?: string;
    city?: string;
    country?: string;
    location?: string;
    cvUrl?: string | null;
    universityName?: string;
    university_name?: string;
    university?: string;
    type?: string;
  };
  offerId?: string | number;
  jobOfferId?: string | number;
  offer?: {
    id?: string | number;
    title?: string;
    jobOfferId?: string | number;
    offerId?: string | number;
  };
}

interface Candidate {
  applicationId: string;
  applicationSource: 'job' | 'program' | null;
  candidateId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  location: string;
  universityName: string | null;
  status: string;
  createdAt: string;
  cvUrl: string | null;
  type: 'student' | 'professional';
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function buildAvatarUrl(raw?: string | null): string | null {
  return resolveMediaUrl(raw, API_BASE);
}

function buildCvUrl(raw?: string | null): string | null {
  return resolveMediaUrl(raw, API_BASE);
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  HIRED:     'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-600',
};

/** Normalise legacy backend values to the 4 final statuses */
function normalizeStatus(raw: string): string {
  return normalizeApplicationStatus(raw);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function OfferApplicationsSection({
  offerId,
  locale,
  programId,
  programOfferId,
}: {
  offerId: string;
  locale: string;
  programId?: string | null;
  programOfferId?: string | null;
}) {
  const t = useTranslations('intranet');
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      /* ---- choose endpoint ---- */
      const isProgramOffer = !!(programId && programOfferId);
      const endpoint = isProgramOffer
        ? `${API_BASE}/api/companies/me/programs/${programId}/offers/${programOfferId}/applications`
        : `${API_BASE}/api/companies/me/offers/${offerId}/applications`;


      const res = await fetch(endpoint, { credentials: 'include' });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const allApps = unwrapCollection<ApplicationFromAPI>(data, ['applications', 'data']);

      /* For the generic endpoint we must filter client-side;
         for the program endpoint the backend already scopes the results */
      const filtered = allApps;


      const mapped: Candidate[] = filtered.map((app) => {
        /* The program endpoint may return "candidate" instead of "student" */
        const s = app.student ?? app.candidate;
        const candidateId = resolveCandidateId(app, s) ?? app.id;
        const firstName = s?.firstName ?? '';
        const lastName = s?.lastName ?? '';
        const fullName =
          s?.fullName
          ?? (firstName || lastName ? `${firstName} ${lastName}`.trim() : null)
          ?? s?.name
          ?? s?.email
          ?? '—';
        const location = s?.location
          ?? ([s?.city, s?.country].filter(Boolean).join(', ') || '');
        const universityName = s?.universityName ?? s?.university_name ?? s?.university ?? null;
        const type: 'student' | 'professional' =
          s?.type === 'professional' ? 'professional' : 'student';

        return {
          applicationId: String(resolveApplicationId(app) ?? app.id),
          applicationSource: isProgramOffer ? 'program' : (resolveApplicationSource(app, app.offer) ?? 'job'),
          candidateId: String(candidateId),
          fullName,
          email: s?.email ?? '',
          avatarUrl: buildAvatarUrl(s?.avatarUrl ?? s?.avatar),
          location,
          universityName,
          status: normalizeStatus(app.status ?? 'PENDING'),
          createdAt: app.createdAt,
          cvUrl: buildCvUrl(app.cvUrl ?? app.candidate?.cvUrl),
          type,
        };
      });

      setCandidates(mapped);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [offerId, programId, programOfferId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  /* ----- status translation -------------------------------- */
  const statusLabel = (status: string): string => {
    const normalized = normalizeStatus(status);
    const key = `company.applicationStatus.${normalized}` as Parameters<typeof t>[0];
    try {
      const result = t(key);
      if (typeof result === 'string' && result.includes('applicationStatus.')) return status;
      return result;
    } catch { return status; }
  };

  /* ----- date formatting ----------------------------------- */
  const formatDate = (iso: string) => {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /* ----- loading ------------------------------------------- */
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-gray-400" />
          {t('company.offerDetail.applications.title')}
        </h2>
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
          <span className="ml-3 text-gray-400 text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  /* ----- error --------------------------------------------- */
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-gray-400" />
          {t('company.offerDetail.applications.title')}
        </h2>
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{t('company.offerDetail.applications.error')}</p>
          <button
            onClick={fetchApplications}
            className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {t('company.offerDetail.retry')}
          </button>
        </div>
      </div>
    );
  }

  /* ----- render -------------------------------------------- */
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-gray-400" />
          {t('company.offerDetail.applications.title')}
          {candidates.length > 0 && (
            <span className="ml-1 text-xs text-gray-400 font-normal">
              ({candidates.length})
            </span>
          )}
        </h2>
        {candidates.length > 0 && (
          <Link
            href={buildCompanyOfferApplicationsHref(locale, offerId, programId, programOfferId)}
            className="text-xs text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
          >
            {t('company.offerDetail.applications.viewAll')}
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <UserCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {t('company.offerDetail.applications.empty')}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {candidates.map((c) => (
              <li key={c.applicationId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {c.avatarUrl ? (
                    <img
                      src={c.avatarUrl}
                      alt={c.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-gray-500">
                        {getDisplayInitial(c.fullName, '?')}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={buildCompanyCandidatesHref(locale, c.candidateId)}
                        className="text-sm font-semibold text-gray-900 hover:text-green-700 truncate transition-colors"
                      >
                        {c.fullName}
                      </Link>
                      <ApplicationStatusChanger
                        applicationId={c.applicationId}
                        currentStatus={c.status}
                        applicationSource={c.applicationSource}
                        onStatusChanged={(id, newStatus) => {
                          setCandidates(prev => prev.map(x =>
                            x.applicationId === id ? { ...x, status: newStatus } : x
                          ));
                          router.refresh();
                        }}
                      />
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                      {c.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPinIcon className="w-3 h-3" />
                          {c.location}
                        </span>
                      )}
                      {c.universityName && (
                        <span className="flex items-center gap-0.5">
                          <AcademicCapIcon className="w-3 h-3" />
                          {c.universityName}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        {c.type === 'student'
                          ? t('company.offerDetail.applications.student')
                          : t('company.offerDetail.applications.professional')}
                      </span>
                      <span>
                        {t('company.offerDetail.applications.appliedOn')}{' '}
                        {formatDate(c.createdAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-2">
                      <Link
                        href={buildCompanyCandidatesHref(locale, c.candidateId)}
                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        {t('company.offerDetail.applications.viewCandidate')}
                      </Link>
                      {c.cvUrl && (
                        <a
                          href={c.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <DocumentArrowDownIcon className="w-3 h-3" />
                          {t('company.offerDetail.applications.downloadCV')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

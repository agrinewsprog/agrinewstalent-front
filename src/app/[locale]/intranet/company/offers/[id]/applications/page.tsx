'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';
import {
  getDisplayInitial,
  normalizeApplicationStatus,
  resolveApplicationId,
  resolveApplicationSource,
  resolveCandidateId,
  resolveJobOfferId,
  resolveJobOfferCandidates,
  toAbsoluteAssetUrl,
  unwrapCollection,
} from '@/lib/frontend/contracts';
import { buildCompanyCandidatesHref, buildCompanyOfferHref } from '@/lib/utils';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  MapPinIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ApplicationFromAPI {
  id: string;
  status: string;
  createdAt: string;
  cvUrl?: string | null;
  /* top-level offer reference (some backends return this) */
  offerId?: string | number;
  jobOfferId?: string | number;
  student?: CandidateRaw;
  candidate?: CandidateRaw;
  offer?: {
    id?: string | number;
    title?: string;
    jobOfferId?: string | number;
    offerId?: string | number;
  };
}

interface CandidateRaw {
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
  cvUrl?: string | null;
  type?: string;
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
const isDev = process.env.NODE_ENV === 'development';

function buildUrl(raw?: string | null): string | null {
  return toAbsoluteAssetUrl(raw, API_BASE);
}

/** Extract ApplicationFromAPI[] from any backend response shape */
function extractApps(data: unknown): ApplicationFromAPI[] {
  const direct = unwrapCollection<ApplicationFromAPI>(data, ['applications', 'data']);
  if (direct.length > 0) return direct;
  if (data && typeof data === 'object') {
    return unwrapCollection<ApplicationFromAPI>((data as Record<string, unknown>).data, ['applications']);
  }
  return [];
}

/**
 * Check if an application belongs to a given offerId.
 * Checks: app.offer.id, app.offer.jobOfferId, app.offer.offerId,
 *         app.offerId, app.jobOfferId  (all stringified)
 */
function appMatchesOffer(app: ApplicationFromAPI, targetId: string): boolean {
  if (!targetId) return false;
  return resolveJobOfferCandidates(app, app.offer).includes(targetId);
}

/**
 * Resolve the REAL offer id from any shape the API returns.
 * Same logic used by the offer detail page.
 */
function resolveRealOfferId(raw: Record<string, any>, fallback: string): string {
  return resolveJobOfferId(raw, raw.offer) ?? fallback;
}

function normalizeStatus(raw: string): string {
  return normalizeApplicationStatus(raw);
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function OfferApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('intranet');

  const searchParams = useSearchParams();

  const offerId = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const qsProgramId = searchParams.get('programId') || null;
  const qsProgramOfferId = searchParams.get('programOfferId') || null;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offerTitle, setOfferTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ---- Fetch applications for this offer ---- */
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const isProgramOffer = !!(qsProgramId && qsProgramOfferId);

      /* ==============================================================
       *  STEP 0: Resolve the REAL offer ID via the offer detail endpoint.
       *  The URL param might be the raw `id` from the list API, but the
       *  applications endpoints and the generic-endpoint filter need the
       *  actual jobOfferId / offerId the backend uses internally.
       *  This is the same resolution the offer detail page does.
       * ============================================================== */
      let resolvedId = offerId;
      if (!isProgramOffer) {
        try {
          const resolveRes = await fetch(`${API_BASE}/api/offers/${offerId}`, { credentials: 'include' });
          if (resolveRes.ok) {
            const rawOffer = await resolveRes.json();
            resolvedId = resolveRealOfferId(rawOffer, offerId);
            // Also grab the title
            const title = rawOffer?.title ?? rawOffer?.offer?.title ?? '';
            if (title) setOfferTitle(title);
          } else {
            if (isDev) console.warn('[OfferAppsPage] STEP 0 resolve failed HTTP', resolveRes.status, '→ using offerId as-is');
          }
        } catch (e) {
          if (isDev) console.warn('[OfferAppsPage] STEP 0 resolve error:', e, '→ using offerId as-is');
        }
      }

      let apps: ApplicationFromAPI[] = [];

      if (isProgramOffer) {
        /* ---- Program offer: scoped endpoint ---- */
        const endpoint = `${API_BASE}/api/companies/me/programs/${qsProgramId}/offers/${qsProgramOfferId}/applications`;
        const res = await fetch(endpoint, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        apps = extractApps(data);
        if ((data as any)?.offer?.title) setOfferTitle((data as any).offer.title);
        else if (apps.length > 0 && apps[0].offer?.title) setOfferTitle(apps[0].offer.title);
      } else {
        /* ============================================================
         *  NORMAL OFFER — Strategy (using resolvedId):
         *    1. Primary: GET /api/companies/me/offers/:resolvedId/applications
         *    2. Fallback: GET /api/applications/companies/me + client filter
         *  Uses resolvedId from STEP 0 for both steps.
         * ============================================================ */

        /* --- Step 1: per-offer endpoint --- */
        const perOfferUrl = `${API_BASE}/api/companies/me/offers/${resolvedId}/applications`;
        let step1Done = false;
        try {
          const res = await fetch(perOfferUrl, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            const parsed = extractApps(data);
            if (parsed.length > 0) {
              apps = parsed;
              step1Done = true;
              if ((data as any)?.offer?.title) setOfferTitle((data as any).offer.title);
              else if (parsed[0]?.offer?.title) setOfferTitle(parsed[0].offer.title);
            }
          }
        } catch {
        }

        /* --- Step 2: fallback — same endpoint OfferApplicationsSection uses --- */
        if (!step1Done) {
          const genericUrl = `${API_BASE}/api/applications/companies/me`;
          const res = await fetch(genericUrl, { credentials: 'include' });
          if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
          const data = await res.json();
          const allApps = extractApps(data);

          // Filter by resolvedId AND original offerId — match against all possible ID fields
          apps = allApps.filter((app) =>
            appMatchesOffer(app, resolvedId) || (resolvedId !== offerId && appMatchesOffer(app, offerId)),
          );

          if (apps.length > 0 && apps[0].offer?.title) {
            setOfferTitle(apps[0].offer.title);
          }

          // If still 0, log diagnostic
          if (isDev && apps.length === 0 && allApps.length > 0) {
            console.warn(
              '[OfferAppsPage] ⚠ 0 apps matched resolvedId="' + resolvedId + '" or offerId="' + offerId + '".',
              'The backend returned', allApps.length, 'apps but none have a matching offer ID.',
              'This likely means the backend needs to be checked or the offerId in the URL is wrong.',
            );
          }
        }
      }

      setCandidates(apps.map(mapCandidate));
    } catch (err) {
      if (isDev) console.error('[OfferAppsPage] ERROR:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [offerId, qsProgramId, qsProgramOfferId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  /* ---- Offer title is now resolved in STEP 0 of fetchApplications ---- */

  /* ---- Map raw API data → Candidate ---- */
  function mapCandidate(app: ApplicationFromAPI): Candidate {
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
      applicationSource: qsProgramId && qsProgramOfferId ? 'program' : (resolveApplicationSource(app, app.offer) ?? 'job'),
      candidateId: String(candidateId),
      fullName,
      email: s?.email ?? '',
      avatarUrl: buildUrl(s?.avatarUrl ?? s?.avatar),
      location,
      universityName,
      status: normalizeStatus(app.status ?? 'PENDING'),
      createdAt: app.createdAt,
      cvUrl: buildUrl(app.cvUrl ?? s?.cvUrl),
      type,
    };
  }

  /* ---- Date formatting ---- */
  const formatDate = (iso: string) => {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString(locale, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  /* ---- Status label ---- */
  const statusLabel = (status: string): string => {
    const normalized = normalizeStatus(status);
    try {
      const result = t(`company.applicationStatus.${normalized}` as any);
      if (typeof result === 'string' && result.includes('applicationStatus.')) return normalized;
      return result;
    } catch { return normalized; }
  };

  /* ---- Back href: program context → back to program; else → back to offer ---- */
  const backHref = buildCompanyOfferHref(locale, offerId, qsProgramId, qsProgramOfferId);

  /* ================================================================ */
  /*  Loading                                                          */
  /* ================================================================ */
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          <span className="ml-3 text-gray-500 text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Error                                                            */
  /* ================================================================ */
  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('company.offerApplications.backToOffer')}
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center gap-4">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
          <p className="text-sm text-red-600 font-medium">{t('company.offerApplications.loadError')}</p>
          <button
            onClick={fetchApplications}
            className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {t('company.offerApplications.retry')}
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('company.offerApplications.backToOffer')}
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('company.offerApplications.title')}
        </h1>
        {offerTitle && (
          <p className="text-sm text-gray-500 mt-1">{offerTitle}</p>
        )}
      </div>

      {/* Empty state */}
      {candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center gap-4">
          <UserCircleIcon className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 text-sm">{t('company.offerApplications.noCandidates')}</p>
        </div>
      ) : (
        /* Candidates list */
        <div className="space-y-3">
          {candidates.map((c) => (
            <div
              key={c.applicationId}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                {c.avatarUrl ? (
                  <img
                    src={c.avatarUrl}
                    alt={c.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-gray-600">
                      {getDisplayInitial(c.fullName, c.email)}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: name + status changer */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{c.fullName}</h3>
                    <ApplicationStatusChanger
                      applicationId={c.applicationId}
                      currentStatus={c.status}
                      applicationSource={c.applicationSource}
                      onStatusChanged={(id, newStatus) => {
                        setCandidates((prev) =>
                          prev.map((x) =>
                            x.applicationId === id ? { ...x, status: normalizeStatus(newStatus) } : x,
                          ),
                        );
                        // Re-fetch to stay synced with backend
                        fetchApplications();
                      }}
                    />
                  </div>

                  {/* Row 2: meta info */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                    {c.email && (
                      <span className="flex items-center gap-1">
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                        {c.email}
                      </span>
                    )}
                    {c.location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        {c.location}
                      </span>
                    )}
                    {c.universityName && (
                      <span className="flex items-center gap-1">
                        <AcademicCapIcon className="w-3.5 h-3.5" />
                        {c.universityName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {t('company.offerApplications.appliedOn')} {formatDate(c.createdAt)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {c.type === 'student'
                        ? t('company.offerApplications.student')
                        : t('company.offerApplications.professional')}
                    </span>
                  </div>

                  {/* Row 3: action links */}
                  <div className="flex gap-4 mt-3">
                    <Link
                      href={buildCompanyCandidatesHref(locale, c.candidateId)}
                      className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      {t('company.offerApplications.viewCandidate')}
                    </Link>
                    {c.cvUrl && (
                      <a
                        href={c.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                        {t('company.offerApplications.downloadCV')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  AcademicCapIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  resolveCompanyId,
  resolveProgramId,
  resolveProgramOfferId,
  unwrapCollection,
  unwrapEntity,
} from '@/lib/frontend/contracts';
import {
  buildStudentProgramCompanyHref,
  buildStudentProgramHref,
  buildStudentProgramOfferHref,
} from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ProgramDetail {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  rules?: string | null;
  status?: string;
  universityName?: string;
  university?: { universityName?: string; name?: string };
  approvedCompaniesCount?: number;
  approvedOffersCount?: number;
  companiesCount?: number;
  offersCount?: number;
  isEnrolled?: boolean;
  requiresCourseId?: string | number | null;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

interface ProgramOffer {
  id: string;
  programOfferId?: string;
  jobOfferId?: string;
  offerId?: string;
  title: string;
  description?: string;
  companyName?: string;
  company?: { companyName?: string; name?: string; id?: string };
  companyId?: string;
  location?: string;
  contractType?: string;
  workMode?: string;
  status?: string;
  hasApplied?: boolean;
  applied?: boolean;
  alreadyApplied?: boolean;
  canApply?: boolean;
  applicationStatus?: string | null;
  application?: { applicationId?: string; status?: string; appliedAt?: string } | null;
  createdAt?: string;
  offer?: { id?: string; title?: string };
}

interface ProgramCompany {
  id: string;
  companyId?: string;
  companyName?: string;
  name?: string;
  logoUrl?: string;
  logo?: string;
  location?: string;
  sector?: string;
  description?: string;
  approvedOffersCount?: number;
  offersCount?: number;
  company?: { id?: string; companyName?: string; name?: string };
}

/* ------------------------------------------------------------------ */
/*  Unwrappers                                                         */
/* ------------------------------------------------------------------ */
function unwrapDetail(data: unknown): ProgramDetail | null {
  return unwrapEntity<ProgramDetail>(data, ['program', 'data']);
}

function unwrapOffers(data: unknown): ProgramOffer[] {
  return unwrapCollection<ProgramOffer>(data, ['offers', 'data']);
}

function unwrapCompanies(data: unknown): ProgramCompany[] {
  return unwrapCollection<ProgramCompany>(data, ['companies', 'data']);
}

/* ------------------------------------------------------------------ */
/*  ID Resolution helpers                                              */
/* ------------------------------------------------------------------ */
/** ID for navigating to the offer detail sub-page */
function resolveNavOfferId(o: ProgramOffer): string {
  return resolveProgramOfferId(o) ?? o.programOfferId ?? o.id;
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

function isAppliedToProgramOffer(offer: ProgramOffer): boolean {
  return Boolean(offer.hasApplied || offer.applied || offer.alreadyApplied || offer.application);
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const statusColor: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  draft: 'bg-amber-100 text-amber-700',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function StudentProgramDetailPage() {
  const t = useTranslations('intranet');
  const locale = useLocale();
  const params = useParams<{ programId: string }>();
  const programId = params.programId;

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [offers, setOffers] = useState<ProgramOffer[]>([]);
  const [companies, setCompanies] = useState<ProgramCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'offers' | 'companies'>('offers');
  const [enrolling, setEnrolling] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const base = `/${locale}/intranet/student/programs`;

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      const [detailRes, offersRes, companiesRes] = await Promise.all([
        fetch(`${API}/api/students/me/programs/${programId}`, { credentials: 'include', headers }),
        fetch(`${API}/api/students/me/programs/${programId}/offers`, { credentials: 'include', headers }),
        fetch(`${API}/api/students/me/programs/${programId}/companies`, { credentials: 'include', headers }),
      ]);


      if (!detailRes.ok) throw new Error(`Program: HTTP ${detailRes.status}`);

      const detailJson = await detailRes.json();
      const offersJson = offersRes.ok ? await offersRes.json() : [];
      const companiesJson = companiesRes.ok ? await companiesRes.json() : [];


      setProgram(unwrapDetail(detailJson));
      setOffers(unwrapOffers(offersJson));
      setCompanies(unwrapCompanies(companiesJson));
    } catch (err) {
      console.error('[programDetail] fetch error', err);
      setError(t('common.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [programId, t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Enroll ── */
  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch(`${API}/api/students/me/programs/${programId}/enroll`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProgram((prev) => prev ? { ...prev, isEnrolled: true } : prev);
    } catch (err) {
      console.error('[programDetail] enroll error', err);
    } finally {
      setEnrolling(false);
    }
  };

  /* ── Apply to offer ── */
  const handleApply = async (offer: ProgramOffer) => {
    const resolvedProgramOfferId = resolveProgramOfferId(offer);
    if (!resolvedProgramOfferId) {
      setError(t('common.errors.generic'));
      return;
    }
    const endpoint = `${API}/api/students/me/programs/${programId}/offers/${resolvedProgramOfferId}/apply`;
    setApplyingId(offer.id);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      let body: unknown = null;
      try { body = await res.json(); } catch { /* empty */ }

      if (res.status === 409) {
        await fetchAll();
        return;
      }

      if (!res.ok) {
        throw new Error(readErrorMessage(body) ?? `HTTP ${res.status}`);
      }

      await fetchAll();
    } catch (err) {
      console.error('[programDetail] apply error', err);
      setError(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    } finally {
      setApplyingId(null);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">{t('common.feedback.loading')}</p>
      </div>
    );
  }

  /* ── Error / Not found ── */
  if (error || !program) {
    return (
      <div className="space-y-6">
        <Link href={base} className="text-sm text-blue-600 hover:underline">
          {t('student.programDetail.backToPrograms')}
        </Link>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600">{error ?? t('student.programDetail.notFound')}</p>
          <button
            onClick={fetchAll}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('student.programDetail.retry')}
          </button>
        </div>
      </div>
    );
  }

  /* ── Helpers ── */
  const programTitle = program.title || program.name || '—';
  const statusKey = (program.status ?? 'ACTIVE').toUpperCase();
  const uniName = program.universityName ??
    program.university?.universityName ??
    program.university?.name;
  const offersTotal = program.approvedOffersCount ?? program.offersCount ?? offers.length;
  const companiesTotal = program.approvedCompaniesCount ?? program.companiesCount ?? companies.length;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Back */}
      <Link href={base} className="inline-flex items-center text-sm text-blue-600 hover:underline">
        {t('student.programDetail.backToPrograms')}
      </Link>

      {/* Header — compact */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 truncate">{programTitle}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[statusKey] ?? 'bg-gray-100 text-gray-600'}`}>
                {t(`student.programs.statusLabels.${statusKey}` as Parameters<typeof t>[0]) ?? program.status}
              </span>
              {program.isEnrolled && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckBadgeIcon className="h-3.5 w-3.5" />
                  {t('student.programs.enrolled')}
                </span>
              )}
            </div>

            {uniName && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <AcademicCapIcon className="h-4 w-4 shrink-0" /> {uniName}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="h-3.5 w-3.5" />
                {offersTotal} {t('student.programDetail.metricOffers')}
              </span>
              <span className="flex items-center gap-1">
                <BuildingOfficeIcon className="h-3.5 w-3.5" />
                {companiesTotal} {t('student.programDetail.metricCompanies')}
              </span>
              {program.startDate && (
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  {t('student.programDetail.startDate')}: {new Date(program.startDate).toLocaleDateString(locale)}
                </span>
              )}
              {program.endDate && (
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  {t('student.programDetail.endDate')}: {new Date(program.endDate).toLocaleDateString(locale)}
                </span>
              )}
              {program.requiresCourseId && (
                <span className="flex items-center gap-1 text-purple-600">
                  <BookOpenIcon className="h-3.5 w-3.5" />
                  {t('student.programDetail.requiresCourse')}
                </span>
              )}
            </div>
          </div>

          {!program.isEnrolled && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors shrink-0"
            >
              {enrolling ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : t('student.programs.enroll')}
            </button>
          )}
        </div>

        {(program.description || program.rules) && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm text-gray-700">
            {program.description && (
              <div>
                <span className="font-medium text-gray-900">{t('student.programDetail.descriptionLabel')}: </span>
                <span className="whitespace-pre-line">{program.description}</span>
              </div>
            )}
            {program.rules && (
              <div>
                <span className="font-medium text-gray-900">{t('student.programDetail.rulesLabel')}: </span>
                <span className="whitespace-pre-line">{program.rules}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs — integrated */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => setTab('offers')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'offers' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('student.programDetail.tabOffers')} ({offers.length})
        </button>
        <button
          onClick={() => setTab('companies')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'companies' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('student.programDetail.tabCompanies')} ({companies.length})
        </button>
      </div>

      {/* ----- Offers tab ----- */}
      {tab === 'offers' && (
        <div className="space-y-2">
          {offers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-12 gap-2">
              <BriefcaseIcon className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">{t('student.programDetail.noOffers')}</p>
            </div>
          ) : (
            offers.map((offer) => {
              const cName = offer.companyName ?? offer.company?.companyName ?? offer.company?.name ?? '';
              const isApplied = isAppliedToProgramOffer(offer);
              const ct = offer.contractType
                ? (t(`common.contractType.${offer.contractType}` as Parameters<typeof t>[0]) ?? offer.contractType)
                : null;
              const wm = offer.workMode
                ? (t(`common.workMode.${offer.workMode}` as Parameters<typeof t>[0]) ?? offer.workMode)
                : null;
              const navId = resolveNavOfferId(offer);

              return (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={buildStudentProgramOfferHref(locale, programId, navId)}
                        className="text-base font-semibold text-gray-900 hover:text-blue-700 transition-colors line-clamp-1"
                      >
                        {offer.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        {cName && (
                          <span className="flex items-center gap-1">
                            <BuildingOfficeIcon className="h-3.5 w-3.5" /> {cName}
                          </span>
                        )}
                        {offer.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" /> {offer.location}
                          </span>
                        )}
                        {ct && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{ct}</span>}
                        {wm && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{wm}</span>}
                        {offer.createdAt && (
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            {new Date(offer.createdAt).toLocaleDateString(locale)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={buildStudentProgramOfferHref(locale, programId, navId)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        {t('student.programDetail.viewOffer')}
                      </Link>
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                          <CheckBadgeIcon className="h-3.5 w-3.5" />
                          {t('student.programDetail.applied')}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(offer)}
                          disabled={applyingId === offer.id || offer.canApply === false}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                        >
                          {applyingId === offer.id ? (
                            <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            t('student.programDetail.apply')
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ----- Companies tab ----- */}
      {tab === 'companies' && (
        <div className="space-y-2">
          {companies.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-12 gap-2">
              <BuildingOfficeIcon className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">{t('student.programDetail.noCompanies')}</p>
            </div>
          ) : (
            companies.map((company) => {
              const cName = company.companyName ?? company.company?.companyName ?? company.company?.name ?? company.name ?? '—';
              const logo = company.logoUrl ?? company.logo;
              const oCount = company.approvedOffersCount ?? company.offersCount;
              const resolvedCompanyId = resolveCompanyId(company, company.company) ?? company.id;

              return (
                <div key={company.id} className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <img src={logo.startsWith('http') ? logo : `${API}${logo}`} alt={cName} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {cName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{cName}</h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                        {company.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" /> {company.location}
                          </span>
                        )}
                        {company.sector && (
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{company.sector}</span>
                        )}
                        {oCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="h-3.5 w-3.5" />
                            {oCount} {t('student.programDetail.metricOffers').toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={buildStudentProgramCompanyHref(locale, programId, resolvedCompanyId)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                    >
                      {t('student.programDetail.viewCompany')}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

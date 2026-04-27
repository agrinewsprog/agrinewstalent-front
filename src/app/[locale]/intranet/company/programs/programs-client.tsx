'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  AcademicCapIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';
import type { CompanyProgram } from './page';

/* ------------------------------------------------------------------ */
/*  Normalizer (client-side)                                           */
/* ------------------------------------------------------------------ */
function normalize(raw: Record<string, unknown>): CompanyProgram {
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown) => (v !== undefined && v !== null ? Number(v) || 0 : undefined);

  return {
    id: String(raw.id ?? raw._id ?? ''),
    title: str(raw.title) ?? str(raw.name) ?? '',
    description: str(raw.description) ?? null,
    rules: str(raw.rules) ?? null,
    status: str(raw.status) ?? 'ACTIVE',
    universityName:
      str(raw.universityName) ??
      str((raw.university as Record<string, unknown>)?.universityName) ??
      str((raw.university as Record<string, unknown>)?.name) ??
      undefined,
    companiesCount: num(raw.companiesCount),
    approvedCompaniesCount: num(raw.approvedCompaniesCount),
    applicationsCount: num(raw.applicationsCount),
    offersCount: num(raw.offersCount),
    requiresCourse: raw.requiresCourseId != null,
    requiresCourseId: raw.requiresCourseId as string | number | null | undefined ?? null,
    interestStatus: str(raw.interestStatus) ?? str(raw.interest_status) ?? str(raw.companyInterestStatus) ?? 'NONE',
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
  };
}

function unwrapList(data: unknown): CompanyProgram[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map((d) => normalize(d));
  const obj = data as Record<string, unknown>;
  const inner = obj.programs ?? obj.data ?? obj;
  if (Array.isArray(inner)) return inner.map((d) => normalize(d));
  return [];
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
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  serverPrograms: CompanyProgram[];
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function CompanyProgramsClient({ serverPrograms }: Props) {
  const t = useTranslations('intranet');
  const locale = useLocale();

  const [programs, setPrograms] = useState<CompanyProgram[]>(serverPrograms);
  const [loading, setLoading] = useState(serverPrograms.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API}/api/companies/me/programs`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPrograms(unwrapList(json));
    } catch (err) {
      console.error('[company/programs] client fetch error', err);
      setError(t('common.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (serverPrograms.length === 0) {
      fetchClient();
    }
  }, [serverPrograms, fetchClient]);

  const base = `/${locale}/intranet/company/programs`;

  /* ---------- Loading ---------- */
  if (loading && programs.length === 0) {
    return (
      <div className="space-y-6">
        <Header t={t} />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">{t('common.feedback.loading')}</p>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error && programs.length === 0) {
    return (
      <div className="space-y-6">
        <Header t={t} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchClient}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('company.programDetail.retry')}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (programs.length === 0) {
    return (
      <div className="space-y-6">
        <Header t={t} />
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 gap-3">
          <FolderOpenIcon className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500 text-sm">{t('company.programs.empty')}</p>
        </div>
      </div>
    );
  }

  /* ---------- List ---------- */
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Header t={t} count={programs.length} />

      <div className="grid grid-cols-1 gap-4">
        {programs.map((p) => {
          const statusKey = (p.status ?? 'ACTIVE').toUpperCase();
          const statusLabel =
            t(`company.programs.statusLabels.${statusKey}` as Parameters<typeof t>[0]) ??
            p.status ??
            '';

          return (
            <Link
              key={String(p.id)}
              href={`${base}/${p.id}`}
              className="block bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                      {p.title || p.name || '—'}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[statusKey] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {p.universityName && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <AcademicCapIcon className="h-4 w-4 flex-shrink-0" />
                      {p.universityName}
                    </p>
                  )}

                  {p.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                  )}

                  {/* Metrics row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500 pt-1">
                    {p.companiesCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <BuildingOfficeIcon className="h-3.5 w-3.5" />
                        {p.companiesCount} {t('company.programs.metricCompanies')}
                      </span>
                    )}
                    {p.applicationsCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <DocumentTextIcon className="h-3.5 w-3.5" />
                        {p.applicationsCount} {t('company.programs.metricApplications')}
                      </span>
                    )}
                    {p.offersCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <BriefcaseIcon className="h-3.5 w-3.5" />
                        {p.offersCount} {t('company.programs.metricOffers')}
                      </span>
                    )}
                    {p.createdAt && (
                      <span className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-3.5 w-3.5" />
                        {new Date(p.createdAt).toLocaleDateString(locale)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right arrow */}
                <svg
                  className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared header                                                      */
/* ------------------------------------------------------------------ */
function Header({ t, count }: { t: ReturnType<typeof useTranslations>; count?: number }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('company.programs.title')}</h1>
      <p className="text-gray-500 text-sm mt-1">
        {t('company.programs.subtitle')}
        {count !== undefined && count > 0 && (
          <span className="ml-2 text-gray-400">({count})</span>
        )}
      </p>
    </div>
  );
}

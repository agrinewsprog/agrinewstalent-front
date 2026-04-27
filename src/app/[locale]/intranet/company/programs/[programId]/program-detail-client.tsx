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
  ArrowLeftIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import type { CompanyProgram } from '../page';
import { CompanyProgramActions } from './program-actions';

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
    requiresCourseId: (raw.requiresCourseId as string | number | null | undefined) ?? null,
    interestStatus: str(raw.interestStatus) ?? str(raw.interest_status) ?? str(raw.companyInterestStatus) ?? 'NONE',
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
  };
}

function unwrapProgram(data: unknown): CompanyProgram | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const inner = obj.program ?? obj.data ?? obj;
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return null;
  return normalize(inner as Record<string, unknown>);
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
  serverProgram: CompanyProgram | null;
  programId: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function CompanyProgramDetailClient({ serverProgram, programId }: Props) {
  const t = useTranslations('intranet');
  const locale = useLocale();

  const [program, setProgram] = useState<CompanyProgram | null>(serverProgram);
  const [loading, setLoading] = useState(!serverProgram);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API}/api/programs/${programId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const parsed = unwrapProgram(json);
      if (parsed) {
        setProgram(parsed);
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      console.error('[company/programs/detail] client fetch error', err);
      setError(t('common.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [programId, t]);

  useEffect(() => {
    if (!serverProgram) {
      fetchClient();
    }
  }, [serverProgram, fetchClient]);

  const base = `/${locale}/intranet/company/programs`;

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">{t('common.feedback.loading')}</p>
      </div>
    );
  }

  /* ---------- Error / Not found ---------- */
  if (error || !program) {
    return (
      <div className="space-y-6">
        <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeftIcon className="h-4 w-4" />
          {t('company.programDetail.backToPrograms')}
        </Link>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600">{error ?? t('company.programDetail.notFound')}</p>
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

  /* ---------- Main render ---------- */
  const statusKey = (program.status ?? 'ACTIVE').toUpperCase();
  const statusLabel =
    t(`company.programs.statusLabels.${statusKey}` as Parameters<typeof t>[0]) ??
    program.status ??
    '';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Back link */}
      <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
        <ArrowLeftIcon className="h-4 w-4" />
        {t('company.programDetail.backToPrograms')}
      </Link>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {program.title || program.name || '—'}
            </h1>
            {program.universityName && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <AcademicCapIcon className="h-4 w-4 flex-shrink-0" />
                {program.universityName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[statusKey] ?? 'bg-gray-100 text-gray-600'}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            icon={BuildingOfficeIcon}
            value={program.companiesCount ?? 0}
            label={t('company.programDetail.metricCompanies')}
            color="text-teal-600 bg-teal-50"
          />
          <MetricCard
            icon={DocumentTextIcon}
            value={program.applicationsCount ?? 0}
            label={t('company.programDetail.metricApplications')}
            color="text-amber-600 bg-amber-50"
          />
          <MetricCard
            icon={BriefcaseIcon}
            value={program.offersCount ?? 0}
            label={t('company.programDetail.metricOffers')}
            color="text-blue-600 bg-blue-50"
          />
        </div>

        {/* Dates */}
        {(program.startDate || program.endDate || program.createdAt) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
            {program.startDate && (
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3.5 w-3.5" />
                {t('company.programDetail.startDate')}: {new Date(program.startDate).toLocaleDateString(locale)}
              </span>
            )}
            {program.endDate && (
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3.5 w-3.5" />
                {t('company.programDetail.endDate')}: {new Date(program.endDate).toLocaleDateString(locale)}
              </span>
            )}
            {program.createdAt && (
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3.5 w-3.5" />
                {t('company.programDetail.createdAt')}: {new Date(program.createdAt).toLocaleDateString(locale)}
              </span>
            )}
          </div>
        )}

        {/* Requires course */}
        {program.requiresCourse && (
          <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
            <BookOpenIcon className="h-4 w-4 flex-shrink-0" />
            {t('company.programDetail.requiresCourse')}
          </div>
        )}
      </div>

      {/* Description */}
      {program.description && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {t('company.programDetail.descriptionLabel')}
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{program.description}</p>
        </div>
      )}

      {/* Rules */}
      {program.rules && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {t('company.programDetail.rulesLabel')}
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{program.rules}</p>
        </div>
      )}

      {/* Actions (create offer, list offers) */}
      <CompanyProgramActions
        programId={String(program.id)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricCard helper                                                  */
/* ------------------------------------------------------------------ */
function MetricCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: number;
  label: string;
  color: string;
}) {
  const [bg, text] = color.split(' ').reduce(
    (acc, c) => {
      if (c.startsWith('bg-')) acc[0] = c;
      else if (c.startsWith('text-')) acc[1] = c;
      return acc;
    },
    ['bg-gray-50', 'text-gray-600'],
  );

  return (
    <div className={`${bg} rounded-xl p-3 flex items-center gap-3`}>
      <Icon className={`h-5 w-5 ${text} flex-shrink-0`} />
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  PlusIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
  KeyIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { UniversityProgram } from './types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  initialPrograms: UniversityProgram[];
  locale: string;
  pageTitle: string;
  pageSubtitle: string;
}

/* ------------------------------------------------------------------ */
/*  Normalize helper                                                   */
/* ------------------------------------------------------------------ */
function normalizeProgram(item: unknown): UniversityProgram {
  const r = item as Record<string, unknown>;
  return {
    id: String(r.id ?? ''),
    title: String(r.title ?? r.name ?? ''),
    description: typeof r.description === 'string' ? r.description : null,
    rules: typeof r.rules === 'string' ? r.rules : null,
    requiresCourseId:
      typeof r.requiresCourseId === 'number' ? r.requiresCourseId :
      typeof r.require_course_id === 'number' ? r.require_course_id : null,
    status: typeof r.status === 'string' ? r.status.toUpperCase() : 'ACTIVE',
    companiesCount: Number(r.companiesCount ?? r.companies_count ?? 0),
    approvedCompaniesCount: Number(r.approvedCompaniesCount ?? r.approved_companies_count ?? 0),
    offersCount: Number(r.offersCount ?? r.offers_count ?? 0),
    applicationsCount: Number(r.applicationsCount ?? r.applications_count ?? 0),
    createdAt:
      typeof r.createdAt === 'string' ? r.createdAt :
      typeof r.created_at === 'string' ? r.created_at : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtDate(iso: string | undefined, locale: string) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'pt' ? 'pt-PT' : 'es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  } catch { return iso; }
}

function statusColors(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 ring-1 ring-green-200';
    case 'CLOSED': return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
    default:       return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
  }
}

/* ------------------------------------------------------------------ */
/*  Program card                                                       */
/* ------------------------------------------------------------------ */
function ProgramCard({ program, locale, onDelete }: { program: UniversityProgram; locale: string; onDelete: (p: UniversityProgram) => void }) {
  const t = useTranslations('intranet');
  const statusKey = `university.programs.statusLabels.${program.status}` as Parameters<typeof t>[0];
  const statusLabel = t(statusKey);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
    <Link
      href={`/${locale}/intranet/university/programs/${program.id}`}
      className="block"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
          <AcademicCapIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
              {program.title}
            </h3>
            <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors(program.status)}`}>
              {statusLabel}
            </span>
          </div>
          {program.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{program.description}</p>
          )}
          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-3.5 h-3.5" />
              {t('university.programs.colCompanies')}: <strong className="text-gray-700">{program.companiesCount ?? 0}</strong>
              {(program.approvedCompaniesCount ?? 0) > 0 && (
                <span className="text-green-600 flex items-center gap-0.5">
                  <CheckBadgeIcon className="w-3 h-3" />
                  {program.approvedCompaniesCount}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <BriefcaseIcon className="w-3.5 h-3.5" />
              {t('university.programs.colOffers')}: <strong className="text-gray-700">{program.offersCount ?? 0}</strong>
            </span>
            <span className="flex items-center gap-1">
              <UserGroupIcon className="w-3.5 h-3.5" />
              {t('university.programs.colApplications')}: <strong className="text-gray-700">{program.applicationsCount ?? 0}</strong>
            </span>
            {program.createdAt && (
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                {fmtDate(program.createdAt, locale)}
              </span>
            )}
          </div>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-400 mt-1 shrink-0 transition-colors" />
      </div>
    </Link>
      {/* Delete button */}
      <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(program); }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          title={t('university.programs.deleteBtn')}
        >
          <TrashIcon className="w-3.5 h-3.5" />
          {t('university.programs.deleteBtn')}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary bar                                                        */
/* ------------------------------------------------------------------ */
function SummaryBar({ programs }: { programs: UniversityProgram[] }) {
  const t = useTranslations('intranet');
  const total    = programs.length;
  const active   = programs.filter(p => p.status.toUpperCase() === 'ACTIVE').length;
  const closed   = programs.filter(p => p.status.toUpperCase() === 'CLOSED').length;
  const totalApps = programs.reduce((acc, p) => acc + (p.applicationsCount ?? 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: t('university.programs.summaryTotal'),    value: total,    color: 'text-gray-900' },
        { label: t('university.programs.summaryActive'),   value: active,   color: 'text-green-700' },
        { label: t('university.programs.summaryClosed'),   value: closed,   color: 'text-red-700' },
        { label: t('university.programs.summaryApps'),     value: totalApps, color: 'text-blue-700' },
      ].map(s => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */
function EmptyState({ locale }: { locale: string }) {
  const t = useTranslations('intranet');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('university.programs.empty')}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{t('university.programs.emptySubtitle')}</p>
      <Link
        href={`/${locale}/intranet/university/programs/new`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        {t('university.programs.createFirst')}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
export default function UniversityProgramsClient({ initialPrograms, locale, pageTitle, pageSubtitle }: Props) {
  const t = useTranslations('intranet');

  const [programs, setPrograms]   = useState<UniversityProgram[]>(initialPrograms);
  const [loading, setLoading]     = useState(initialPrograms.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter]       = useState<'all' | 'ACTIVE' | 'CLOSED'>('all');
  const [banner, setBanner]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UniversityProgram | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Client-side GET /api/universities/me/programs                    */
  /* ---------------------------------------------------------------- */
  const fetchPrograms = useCallback(async (): Promise<UniversityProgram[]> => {
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${API}/api/universities/me/programs`;

    const res = await fetch(url, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.message ?? `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    // Backend may return { programs: [...] }, { data: [...] }, or a plain array
    const raw: unknown = data?.programs ?? data?.data ?? data;
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeProgram);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Auto-fetch on mount when server-side returned empty              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (initialPrograms.length > 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetchPrograms()
      .then((list) => {
        if (!cancelled) {
          setPrograms(list);
          setLoadError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [initialPrograms, fetchPrograms]);

  /* ---------------------------------------------------------------- */
  /*  DELETE + refetch                                                  */
  /* ---------------------------------------------------------------- */
  const handleDelete = useCallback(
    async (program: UniversityProgram) => {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `${API}/api/universities/me/programs/${program.id}`;

      try {
        const res = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }

        // Refetch from backend — single source of truth
        const freshList = await fetchPrograms();
        setPrograms(freshList);
        setBanner({ type: 'success', msg: t('university.programs.deleteSuccess') });
      } catch (err: unknown) {
        setBanner({
          type: 'error',
          msg: err instanceof Error ? err.message : t('university.programs.deleteError'),
        });
      } finally {
        setDeleteTarget(null);
        setTimeout(() => setBanner(null), 5000);
      }
    },
    [fetchPrograms, t],
  );

  /* ---------------------------------------------------------------- */
  /*  Retry handler                                                    */
  /* ---------------------------------------------------------------- */
  const handleRetry = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetchPrograms()
      .then((list) => {
        setPrograms(list);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [fetchPrograms]);

  /* ---------------------------------------------------------------- */
  /*  Derived                                                          */
  /* ---------------------------------------------------------------- */
  const filtered = filter === 'all' ? programs : programs.filter(p => p.status.toUpperCase() === filter);

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all',     label: t('university.programs.filterAll') },
    { key: 'ACTIVE',  label: t('university.programs.filterActive') },
    { key: 'CLOSED',  label: t('university.programs.filterClosed') },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-500 mt-1 text-sm">{pageSubtitle}</p>
        </div>
        <Link
          href={`/${locale}/intranet/university/programs/new`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          {t('university.programs.newProgram')}
        </Link>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrashIcon className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('university.programs.deleteTitle')}
                </h2>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-gray-600">
                {t('university.programs.deleteConfirm')}
              </p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <AcademicCapIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {deleteTarget.title}
                </span>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('university.programs.cancelBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {t('university.programs.confirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      {banner && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
            banner.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {banner.type === 'success' ? (
            <CheckIcon className="w-5 h-5 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
          )}
          {banner.msg}
          <button onClick={() => setBanner(null)} className="ml-auto">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-gray-500">
            {t('university.programs.loadingPrograms')}
          </p>
        </div>
      )}

      {/* Load error */}
      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <ExclamationCircleIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t('university.programs.loadError')}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mb-5">{loadError}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {t('university.programs.retry')}
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !loadError && (
        <>
          {/* Summary */}
          {programs.length > 0 && <SummaryBar programs={programs} />}

          {/* Filter tabs */}
          {programs.length > 0 && (
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* List / Empty */}
          {programs.length === 0 ? (
            <EmptyState locale={locale} />
          ) : filtered.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
              {t('university.programs.noResults')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map(program => (
                <ProgramCard key={program.id} program={program} locale={locale} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

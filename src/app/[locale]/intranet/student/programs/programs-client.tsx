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
  BookOpenIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { StudentUniversityLinkCard } from '@/components/university/StudentUniversityLinkCard';
import type { StudentProgram, LinkedUniversity } from './page';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const isDev = process.env.NODE_ENV === 'development';

/* ------------------------------------------------------------------ */
/*  Normalizer (client-side)                                           */
/* ------------------------------------------------------------------ */
function normalize(raw: Record<string, unknown>): StudentProgram {
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
    approvedOffersCount: num(raw.approvedOffersCount),
    requiresCourse: raw.requiresCourseId != null,
    requiresCourseId: (raw.requiresCourseId as string | number | null | undefined) ?? null,
    isEnrolled: raw.isEnrolled === true || raw.enrolled === true,
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
  };
}

function unwrapList(data: unknown): StudentProgram[] {
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
  serverPrograms: StudentProgram[];
  serverUniversity: LinkedUniversity | null;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function StudentProgramsClient({ serverPrograms, serverUniversity }: Props) {
  const t = useTranslations('intranet');
  const locale = useLocale();

  const [university, setUniversity] = useState<LinkedUniversity | null>(serverUniversity);
  const [programs, setPrograms] = useState<StudentProgram[]>(serverPrograms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  /* ── fetch programs ── */
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    const endpoint = `${API}/api/students/me/programs`;
    try {
      const res = await fetch(endpoint, {
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.text();
        if (isDev) console.error('[student/programs] client error body:', body);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      setPrograms(unwrapList(json));
    } catch (err) {
      console.error('[student/programs] client fetch error', err);
      setError(t('common.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  /* Refetch programs on client if server returned empty but university exists */
  useEffect(() => {
    if (serverUniversity && serverPrograms.length === 0) {
      fetchPrograms();
    }
  }, [serverUniversity, serverPrograms, fetchPrograms]);

  /* ── enroll in program ── */
  const enrollInProgram = useCallback(async (programId: string | number) => {
    const id = String(programId);
    setEnrollingId(id);
    const endpoint = `${API}/api/students/me/programs/${id}/enroll`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const body = await res.text();
        if (isDev) console.error('[student/programs] enroll error body:', body);
        throw new Error(`HTTP ${res.status}`);
      }

      // Optimistically mark as enrolled, then refetch
      setPrograms((prev) =>
        prev.map((p) => (String(p.id) === id ? { ...p, isEnrolled: true } : p)),
      );
      await fetchPrograms();
    } catch (err) {
      console.error('[student/programs] enroll error', err);
      setError(t('student.programs.enrollError'));
    } finally {
      setEnrollingId(null);
    }
  }, [t, fetchPrograms]);

  /* Called by the shared card after successfully linking a university */
  const handleLinked = useCallback(async (uni: LinkedUniversity) => {
    setUniversity(uni);
    await fetchPrograms();
  }, [fetchPrograms]);

  const base = `/${locale}/intranet/student/programs`;

  /* ================================================================ */
  /*  RENDER: No university linked — show shared card with form       */
  /* ================================================================ */
  if (!university) {
    return (
      <div className="space-y-6">
        <Header t={t} />
        <div className="max-w-lg mx-auto">
          <StudentUniversityLinkCard initialUniversity={null} onLinked={handleLinked} />
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER: University linked — show university card + programs     */
  /* ================================================================ */
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Header t={t} />

      {/* University card (shared) */}
      <StudentUniversityLinkCard initialUniversity={university} />

      {/* Loading programs */}
      {loading && programs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">{t('common.feedback.loading')}</p>
        </div>
      )}

      {/* Error loading programs */}
      {error && programs.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchPrograms}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('student.programs.retry')}
          </button>
        </div>
      )}

      {/* Empty programs */}
      {!loading && !error && programs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 gap-3">
          <FolderOpenIcon className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500 text-sm">{t('student.programs.empty')}</p>
        </div>
      )}

      {/* Programs list */}
      {programs.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            {t('student.programs.programsSubheading')}
            <span className="ml-1 text-gray-400">({programs.length})</span>
          </p>

          <div className="grid grid-cols-1 gap-4">
            {programs.map((p) => {
              const statusKey = (p.status ?? 'ACTIVE').toUpperCase();
              const statusLabel =
                t(`student.programs.statusLabels.${statusKey}` as Parameters<typeof t>[0]) ??
                p.status ??
                '';
              const isEnrolling = enrollingId === String(p.id);

              return (
                <div
                  key={String(p.id)}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`${base}/${p.id}`}
                      className="flex-1 min-w-0 space-y-2"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {p.title || p.name || '—'}
                        </h3>
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[statusKey] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {statusLabel}
                        </span>
                        {p.isEnrolled && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                            <CheckBadgeIcon className="h-3.5 w-3.5" />
                            {t('student.programs.enrolled')}
                          </span>
                        )}
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

                      {p.requiresCourse && (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          <BookOpenIcon className="h-3.5 w-3.5" />
                          {t('student.programs.requiresCourse')}
                        </span>
                      )}

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500 pt-1">
                        {(p.approvedCompaniesCount ?? p.companiesCount) !== undefined && (
                          <span className="flex items-center gap-1">
                            <BuildingOfficeIcon className="h-3.5 w-3.5" />
                            {p.approvedCompaniesCount ?? p.companiesCount} {t('student.programs.metricCompanies')}
                          </span>
                        )}
                        {(p.approvedOffersCount ?? p.offersCount) !== undefined && (
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="h-3.5 w-3.5" />
                            {p.approvedOffersCount ?? p.offersCount} {t('student.programs.metricOffers')}
                          </span>
                        )}
                        {p.createdAt && (
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            {new Date(p.createdAt).toLocaleDateString(locale)}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {p.isEnrolled ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                          <CheckBadgeIcon className="h-5 w-5" />
                          {t('student.programs.enrolled')}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            enrollInProgram(p.id);
                          }}
                          disabled={isEnrolling}
                          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors"
                        >
                          {isEnrolling ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            t('student.programs.enroll')
                          )}
                        </button>
                      )}
                      <Link href={`${base}/${p.id}`}>
                        <svg
                          className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared header                                                      */
/* ------------------------------------------------------------------ */
function Header({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('student.programs.title')}</h1>
      <p className="text-gray-500 text-sm mt-1">{t('student.programs.subtitle')}</p>
    </div>
  );
}

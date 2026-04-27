'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  AcademicCapIcon,
  UserGroupIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { EmptyStateCard, MetricCard, PageHeader, PageShell, SectionCard } from '@/components/ui/intranet-page';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface DashboardData {
  totalStudents: number;
  activeStudents: number;
  totalPrograms: number;
  activePrograms: number;
  totalInvites: number;
  activeInvites: number;
  totalApplicationsInPrograms: number;
  totalCompaniesInPrograms: number;
  pendingCompaniesInPrograms: number;
  pendingProgramOffers: number;
}

const EMPTY: DashboardData = {
  totalStudents: 0,
  activeStudents: 0,
  totalPrograms: 0,
  activePrograms: 0,
  totalInvites: 0,
  activeInvites: 0,
  totalApplicationsInPrograms: 0,
  totalCompaniesInPrograms: 0,
  pendingCompaniesInPrograms: 0,
  pendingProgramOffers: 0,
};

/* ------------------------------------------------------------------ */
/*  Normalizer – adapts any backend shape to DashboardData             */
/* ------------------------------------------------------------------ */
export function normalizeDashboard(raw: Record<string, unknown>): DashboardData {
  const summary =
    raw.summary && typeof raw.summary === 'object'
      ? (raw.summary as Record<string, unknown>)
      : raw;
  const num = (keys: string[]): number => {
    for (const k of keys) {
      const v = summary[k] ?? raw[k];
      if (v !== undefined && v !== null) return Number(v) || 0;
    }
    return 0;
  };

  return {
    totalStudents:               num(['totalStudents', 'total_students', 'studentsCount', 'students']),
    activeStudents:              num(['activeStudents', 'active_students', 'activeStudentsCount']),
    totalPrograms:               num(['totalPrograms', 'total_programs', 'programsCount', 'programs']),
    activePrograms:              num(['activePrograms', 'active_programs', 'activeProgramsCount']),
    totalInvites:                num(['totalInvites', 'total_invites', 'invitesCount', 'invites']),
    activeInvites:               num(['activeInvites', 'active_invites', 'activeInvitesCount']),
    totalApplicationsInPrograms: num(['totalApplicationsInPrograms', 'total_applications_in_programs', 'applicationsCount', 'applications']),
    totalCompaniesInPrograms:    num(['totalCompaniesInPrograms', 'total_companies_in_programs', 'companiesCount', 'companies']),
    pendingCompaniesInPrograms:  num(['pendingCompaniesInPrograms', 'pending_companies_in_programs', 'pendingCompaniesCount', 'pendingCompanies']),
    pendingProgramOffers:         num(['pendingProgramOffers', 'pending_program_offers', 'pendingOffersCount', 'pendingOffers']),
  };
}

/** Unwrap the API envelope */
export function unwrapDashboard(data: unknown): DashboardData | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const inner = obj.dashboard ?? obj.data ?? obj;
  if (!inner || typeof inner !== 'object') return null;
  return normalizeDashboard(inner as Record<string, unknown>);
}

/* ------------------------------------------------------------------ */
/*  StatCard with enhanced styling                                     */
/* ------------------------------------------------------------------ */
type CardColor = 'blue' | 'green' | 'purple' | 'amber' | 'rose' | 'teal';

const palette: Record<CardColor, { card: string; ring: string; icon: string; sub: string }> = {
  blue:   { card: 'bg-white border-blue-100',   ring: 'bg-blue-100',   icon: 'text-blue-600',   sub: 'text-blue-600' },
  green:  { card: 'bg-white border-green-100',  ring: 'bg-green-100',  icon: 'text-green-600',  sub: 'text-green-600' },
  purple: { card: 'bg-white border-purple-100', ring: 'bg-purple-100', icon: 'text-purple-600', sub: 'text-purple-600' },
  amber:  { card: 'bg-white border-amber-100',  ring: 'bg-amber-100',  icon: 'text-amber-600',  sub: 'text-amber-600' },
  rose:   { card: 'bg-white border-rose-100',   ring: 'bg-rose-100',   icon: 'text-rose-600',   sub: 'text-rose-600' },
  teal:   { card: 'bg-white border-teal-100',   ring: 'bg-teal-100',   icon: 'text-teal-600',   sub: 'text-teal-600' },
};

function StatCard({
  label,
  value,
  sub,
  subLabel,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  sub?: number;
  subLabel?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: CardColor;
}) {
  const c = palette[color];
  return (
    <div
      className={`${c.card} border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className={`${c.ring} rounded-xl p-3 flex-shrink-0`}>
        <Icon className={`h-6 w-6 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub !== undefined && subLabel && (
          <p className={`text-xs font-medium ${c.sub}`}>
            {sub} {subLabel}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QuickLink card                                                     */
/* ------------------------------------------------------------------ */
function QuickLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-green-400 hover:shadow-md transition-all"
    >
      <div className="bg-green-50 group-hover:bg-green-100 rounded-xl p-2.5 transition-colors flex-shrink-0">
        <Icon className="h-5 w-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main client component                                              */
/* ------------------------------------------------------------------ */
interface Props {
  serverData: DashboardData | null;
  userName: string;
}

export default function UniversityDashboardClient({ serverData, userName }: Props) {
  const t = useTranslations('intranet');
  const locale = useLocale();

  const [stats, setStats] = useState<DashboardData>(serverData ?? EMPTY);
  const [offline, setOffline] = useState(!serverData);
  const [loading, setLoading] = useState(!serverData);
  const [error, setError] = useState<string | null>(null);
  const isGettingStarted =
    stats.totalStudents === 0 &&
    stats.totalPrograms === 0 &&
    stats.totalInvites === 0 &&
    stats.totalApplicationsInPrograms === 0;

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API}/api/universities/me/dashboard`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const parsed = unwrapDashboard(json);
      if (parsed) {
        setStats(parsed);
        setOffline(false);
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      console.error('[dashboard] client fetch error', err);
      setError(
        err instanceof Error ? err.message : t('university.dashboard.errorLoad'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!serverData) {
      fetchClient();
    }
  }, [serverData, fetchClient]);

  const base = `/${locale}/intranet/university`;

  /* ---------- Loading state ---------- */
  if (loading && !serverData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ArrowPathIcon className="h-8 w-8 text-green-500 animate-spin" />
        <p className="text-sm text-gray-500">{t('university.dashboard.loading')}</p>
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (error && !serverData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
        <p className="text-sm text-red-600">{t('university.dashboard.errorLoad')}</p>
        <button
          onClick={fetchClient}
          className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {t('university.dashboard.retry')}
        </button>
      </div>
    );
  }

  /* ---------- Main render ---------- */
  return (
    <PageShell wide className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t('university.dashboard.welcome', { name: userName })}
        subtitle={t('university.dashboard.subtitle')}
        actions={offline && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            {t('university.dashboard.offlineMode')}
          </span>
        )}
      />

      {/* Pending offers alert */}
      {stats.pendingProgramOffers > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="bg-amber-100 rounded-xl p-3 flex-shrink-0">
              <ExclamationCircleIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {t('university.dashboard.pendingOffers.title')}
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                {t('university.dashboard.pendingOffers.message', { count: stats.pendingProgramOffers })}
              </p>
            </div>
          </div>
          <Link
            href={`${base}/programs`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors flex-shrink-0"
          >
            {t('university.dashboard.pendingOffers.reviewNow')}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
          <div className="bg-green-100 rounded-lg p-1.5 flex-shrink-0">
            <BriefcaseIcon className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-green-700">
            {t('university.dashboard.pendingOffers.none')}
          </p>
        </div>
      )}

      {isGettingStarted && (
        <EmptyStateCard
          className="border-blue-100 bg-blue-50 text-left"
          title={t('university.programs.empty')}
          description={t('university.dashboard.subtitle')}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`${base}/programs/new`}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                {t('university.programs.newProgram')}
              </Link>
              <Link
                href={`${base}/invites`}
                className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                {t('university.nav.invites')}
              </Link>
            </div>
          }
        />
      )}

      {/* Main metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          label={t('university.dashboard.statTotalStudents')}
          value={stats.totalStudents}
          accentClassName="bg-blue-100 text-blue-600"
          icon={<UserGroupIcon className="h-6 w-6" />}
          className="min-h-[96px]"
        />
        <MetricCard
          label={t('university.dashboard.statTotalPrograms')}
          value={stats.totalPrograms}
          accentClassName="bg-green-100 text-green-600"
          icon={<AcademicCapIcon className="h-6 w-6" />}
          className="min-h-[96px]"
        />
        <MetricCard
          label={t('university.dashboard.statTotalInvites')}
          value={stats.totalInvites}
          accentClassName="bg-purple-100 text-purple-600"
          icon={<EnvelopeIcon className="h-6 w-6" />}
          className="min-h-[96px]"
        />
        <MetricCard
          label={t('university.dashboard.statApplications')}
          value={stats.totalApplicationsInPrograms}
          accentClassName="bg-amber-100 text-amber-600"
          icon={<BriefcaseIcon className="h-6 w-6" />}
          className="min-h-[96px]"
        />
        <MetricCard
          label={t('university.dashboard.statCompanies')}
          value={stats.totalCompaniesInPrograms}
          accentClassName="bg-teal-100 text-teal-600"
          icon={<BuildingOfficeIcon className="h-6 w-6" />}
          className="min-h-[96px]"
        />
      </div>

      {/* Bottom row: quick links + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-green-600" />
            {t('university.dashboard.quickLinks')}
          </h2>
          <div className="space-y-3">
            <QuickLink
              href={`${base}/profile`}
              icon={AcademicCapIcon}
              label={t('university.nav.profile')}
              desc={t('university.dashboard.qlProfileDesc')}
            />
            <QuickLink
              href={`${base}/students`}
              icon={UserGroupIcon}
              label={t('university.nav.students')}
              desc={t('university.dashboard.qlStudentsDesc', { count: stats.totalStudents })}
            />
            <QuickLink
              href={`${base}/invites`}
              icon={EnvelopeIcon}
              label={t('university.nav.invites')}
              desc={t('university.dashboard.qlInvitesDesc', { count: stats.totalInvites })}
            />
            <QuickLink
              href={`${base}/programs`}
              icon={BriefcaseIcon}
              label={t('university.nav.programs')}
              desc={t('university.dashboard.qlProgramsDesc', { count: stats.totalPrograms })}
            />
          </div>
        </div>

        {/* Activity summary */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-green-600" />
            {t('university.dashboard.activity')}
          </h2>
          <SectionCard className="divide-y divide-gray-100">
            <ActivityRow color="bg-amber-400" label={t('university.dashboard.activityApplications')} value={stats.totalApplicationsInPrograms} />
            <ActivityRow color="bg-teal-400" label={t('university.dashboard.activityCompanies')} value={stats.totalCompaniesInPrograms} />
            <ActivityRow color="bg-blue-400" label={t('university.dashboard.activityActiveStudents')} value={stats.activeStudents} />
            <ActivityRow color="bg-green-400" label={t('university.dashboard.activityActivePrograms')} value={stats.activePrograms} />
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity row helper                                                */
/* ------------------------------------------------------------------ */
function ActivityRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

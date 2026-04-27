import { getSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import { PromotionsBanner } from '@/components/promotions/promotions-banner';
import { Promotion } from '@/types';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import {
  getDisplayInitial,
  hasProgramOfferContext,
  normalizeApplicationStatus,
  resolveApplicationId,
  resolveApplicationSource,
  resolveAvatarUrl,
  resolveCandidateId,
  resolveJobOfferId,
  resolveProgramId,
  resolveProgramOfferId,
  resolveStudentId,
  resolveStudentDisplayName,
  toAbsoluteAssetUrl,
  unwrapCollection,
  unwrapEntity,
} from '@/lib/frontend/contracts';
import { buildCompanyCandidateProfileHref, buildCompanyOfferHref, buildCompanyProgramsHref } from '@/lib/utils';
import { DashboardRecentApplications } from './DashboardRecentApplications';
import { DashboardProgramApplications } from './DashboardProgramApplications';
import { ProgramMetricValue } from './ProgramMetricValue';
import { EmptyStateCard, MetricCard, PageHeader, PageShell, SectionCard } from '@/components/ui/intranet-page';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

async function safeFetch(url: string, headers: Record<string, string>) {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch {
    return null;
  }
}

type TFunc = (key: string, values?: Record<string, string | number>) => string;

function relativeDate(value: string | null | undefined, t: TFunc): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const diff = Math.ceil((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return t('student.relativeDate.today');
  if (diff === 1) return t('student.relativeDate.yesterday');
  if (diff < 7) return t('student.relativeDate.daysAgo', { days: diff });
  if (diff < 30) return t('student.relativeDate.weeksAgo', { weeks: Math.floor(diff / 7) });
  return t('student.relativeDate.monthsAgo', { months: Math.floor(diff / 30) });
}

/* Helper: resolve real applications count from any shape the API may return */
function resolveAppCount(o: unknown): number {
  const record = typeof o === 'object' && o !== null ? (o as Record<string, unknown>) : null;
  const programOffers = Array.isArray(record?.programOffers) ? record.programOffers : [];
  return (
    (record?.applicationsCount as number | undefined)
    ?? (record?.applications_count as number | undefined)
    ?? ((record?._count as { applications?: number } | undefined)?.applications)
    ?? (Array.isArray(record?.applications) ? record.applications.length : undefined)
    ?? programOffers.reduce((sum, programOffer) => {
      const po = typeof programOffer === 'object' && programOffer !== null ? (programOffer as Record<string, unknown>) : null;
      return sum + Number(
        po?.applicationsCount
        ?? po?.applications_count
        ?? ((po?._count as { applications?: number } | undefined)?.applications)
        ?? 0,
      );
    }, 0)
    ?? 0
  );
}

async function getDashboardData() {
  const authHeader = await getAuthHeader();

  const [applicationsData, offersData, promotionsData, dashboardData] = await Promise.all([
    safeFetch(`${API}/api/applications/companies/me`, authHeader),
    safeFetch(`${API}/api/offers/companies/me`, authHeader),
    safeFetch(`${API}/api/promotions/active`, authHeader),
    safeFetch(`${API}/api/companies/me/dashboard`, authHeader),
  ]);

  const applications: any[] = Array.isArray(applicationsData)
    ? applicationsData
    : unwrapCollection<any>(applicationsData, ['applications', 'data']);
  const allOffers: any[] = Array.isArray(offersData)
    ? offersData
    : unwrapCollection<any>(offersData, ['data', 'offers']);

  const activeOffers = allOffers.filter((o: any) => o.status === 'PUBLISHED');
  const fallbackStatusCounts = applications.reduce(
    (acc, application: any) => {
      const normalizedStatus = normalizeApplicationStatus(application.status);
      if (normalizedStatus in acc) {
        acc[normalizedStatus as keyof typeof acc] += 1;
      }
      return acc;
    },
    {
      PENDING: 0,
      INTERVIEW: 0,
      HIRED: 0,
      REJECTED: 0,
    },
  );

  const topOffers = [...activeOffers]
    .sort((a, b) => resolveAppCount(b) - resolveAppCount(a))
    .slice(0, 5);

  const promotions = unwrapCollection<Promotion>(promotionsData, ['data', 'promotions']);

  /* ---- Program applications from /api/companies/me/dashboard ---- */
  const dashRaw = dashboardData ?? {};



  /* The API may wrap in { data: … } or { dashboard: … } or return flat */
  const dash = unwrapEntity<Record<string, unknown>>(dashRaw, ['data', 'dashboard']) ?? {};

  const totalProgramApplications: number =
    dash.totalProgramApplications
    ?? dashRaw.totalProgramApplications
    ?? 0;

  const pendingProgramApplications: number =
    dash.pendingProgramApplications
    ?? dashRaw.pendingProgramApplications
    ?? 0;

  const dashSummary = unwrapEntity<Record<string, unknown>>(dash.summary, []) ?? {};
  const dashMeta = unwrapEntity<Record<string, unknown>>(dash.meta, []) ?? {};
  const canonicalActiveJobOffers = unwrapCollection<any>(dash.activeJobOffers ?? dashRaw.activeJobOffers, []);
  const canonicalActiveProgramOffers = unwrapCollection<any>(dash.activeProgramOffers ?? dashRaw.activeProgramOffers, []);
  const statusCounts = {
    PENDING: Number(dashSummary.pendingApplications ?? fallbackStatusCounts.PENDING),
    INTERVIEW: Number(dashSummary.interviewApplications ?? fallbackStatusCounts.INTERVIEW),
    HIRED: Number(dashSummary.hiredApplications ?? fallbackStatusCounts.HIRED),
    REJECTED: Number(dashSummary.rejectedApplications ?? fallbackStatusCounts.REJECTED),
  };
  const newApps = statusCounts.PENDING;
  const interviews = statusCounts.INTERVIEW;

  const dashboardRecentApplications = unwrapCollection<any>(dash.recentApplications ?? dashRaw.recentApplications, []);
  const recentApplications = (dashboardRecentApplications.length > 0
    ? dashboardRecentApplications
    : [...applications]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()))
    .filter((application: any) => (resolveApplicationSource(application, application.offer) ?? 'job') === 'job')
    .slice(0, 5);

  const dashProgramOffers = unwrapCollection<any>(dash.programOffers ?? dashRaw.programOffers, []);

  const hasPublishedProgramOffers: boolean =
    dash.hasPublishedProgramOffers
    ?? dashRaw.hasPublishedProgramOffers
    ?? false;

  /* latestProgramApplications may arrive under several keys */
  const rawLatestProgApps: any[] = (() => {
    const candidates = [
      dash.latestProgramApplications,
      dash.programApplications,
      dash.latestApplications,
      dashRaw.latestProgramApplications,
      dashRaw.programApplications,
      dashRaw.latestApplications,
    ];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) return c.slice(0, 5);
    }
    if (dashboardRecentApplications.length > 0) {
      return dashboardRecentApplications
        .filter((application: any) => resolveApplicationSource(application, application.offer) === 'program')
        .slice(0, 5);
    }
    return [];
  })();



  /* Normalise each program-application item so the template can rely on flat fields */
  const latestProgramApplications = rawLatestProgApps.map((app: any) => {
    const c = app.candidate ?? app.student;
    const candidateName =
      app.candidateName
      ?? app.studentName
      ?? c?.fullName
      ?? c?.name
      ?? ((c?.firstName || c?.lastName) ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() : null)
      ?? c?.email
      ?? '';
    const avatarUrl = app.avatarUrl ?? c?.avatarUrl ?? c?.avatar ?? null;

    /* ── offer may be the program-offer (junction) with a nested real offer ── */
    const rawOffer = app.offer ?? app.programOffer;
    const nestedOffer = rawOffer?.offer ?? rawOffer?.jobOffer; // nested real offer inside junction

    const offerTitle =
      app.offerTitle
      ?? nestedOffer?.title
      ?? rawOffer?.title
      ?? '';

    const programTitle =
      app.programTitle
      ?? app.program?.title
      ?? rawOffer?.program?.title
      ?? '';

    /* Detect if rawOffer is a program-offer junction record (not the real offer) */
    const isJunction = rawOffer != null && (rawOffer.programId != null || rawOffer.jobOfferId != null);

    /* programId — from top-level, nested program, or the offer's programId */
    const programId = resolveProgramId(app, rawOffer) ?? null;

    /* programOfferId — the junction-table id (NOT the real offer) */
    const programOfferId = resolveProgramOfferId(app, rawOffer) ?? (isJunction ? String(rawOffer.id) : null);

    /* offerId — MUST be the REAL job-offer id, never the junction id */
    const offerId =
      resolveJobOfferId(app, nestedOffer, rawOffer, app.jobOffer, rawOffer?.jobOffer)
      ?? (!isJunction ? (rawOffer?.id ?? null) : null)
      ?? null;

    /* candidateId */
    const c2 = app.user ?? app.applicant;
    const candidateId = resolveCandidateId(app, c, c2) ?? null;

    /* applicationId — the REAL application record id for status changes.
       The dashboard endpoint may nest applications inside program-offer objects,
       so app.id may actually be the junction id. We must resolve carefully. */
    const applicationId: string =
      resolveApplicationId(app)
      ?? (app.id != null && !isJunction ? String(app.id) : null)
      ?? '';



    return {
      ...app,
      _candidateName: candidateName,
      _avatarUrl: avatarUrl,
      _offerTitle: offerTitle,
      _programTitle: programTitle,
      _programId: programId,
      _programOfferId: programOfferId,
      _offerId: offerId,
      _candidateId: candidateId,
      _applicationId: applicationId,
    };
  });

  /* ── Cross-reference: build per-offerId application count from all sources ── */
  const appCountByOfferId = new Map<string, number>();
  // count from generic applications
  for (const a of applications) {
    const oid = String(resolveJobOfferId(a, a.offer) ?? '');
    if (oid) appCountByOfferId.set(oid, (appCountByOfferId.get(oid) ?? 0) + 1);
  }
  // count from latestProgramApplications (may contain offers not in generic list)
  for (const pa of latestProgramApplications) {
    const oid = String(pa._offerId ?? '');
    if (oid) appCountByOfferId.set(oid, (appCountByOfferId.get(oid) ?? 0) + 1);
  }


  /* ── Cross-reference: build per-offerId program context ── */
  const programContextByOfferId = new Map<string, { programId: string; programOfferId: string }>();
  // from latestProgramApplications (most reliable source)
  for (const pa of latestProgramApplications) {
    const oid = String(pa._offerId ?? '');
    if (oid && pa._programId && pa._programOfferId) {
      programContextByOfferId.set(oid, { programId: String(pa._programId), programOfferId: String(pa._programOfferId) });
    }
  }
  // from dashboard.programOffers if available
  if (dashProgramOffers.length > 0) {
    for (const dpo of dashProgramOffers) {
      const oid = String(resolveJobOfferId(dpo, dpo.offer) ?? '');
      const pid = String(resolveProgramId(dpo) ?? '');
      const poid = String(resolveProgramOfferId(dpo) ?? '');
      if (oid && pid && poid) {
        programContextByOfferId.set(oid, { programId: pid, programOfferId: poid });
      }
    }
  }
  // from allOffers[].programOffers if the API includes them
  for (const o of allOffers) {
    const canonicalOfferId = String(resolveJobOfferId(o, o.offer) ?? o.id ?? '');
    const po = o.programOffers?.[0];
    if (po) {
        const pid = String(resolveProgramId(po) ?? '');
        const poid = String(resolveProgramOfferId(po) ?? '');
      if (canonicalOfferId && pid && poid) {
        programContextByOfferId.set(canonicalOfferId, { programId: pid, programOfferId: poid });
      }
    }
  }


  /* ── Separate normal offers from program offers ── */
  const normalOffers = allOffers.filter((o: any) => {
    const canonicalOfferId = String(resolveJobOfferId(o, o.offer) ?? o.id ?? '');
    return !programContextByOfferId.has(canonicalOfferId) && !hasProgramOfferContext(o, o.offer, ...(o.programOffers ?? []));
  });
  const normalActive = canonicalActiveJobOffers.length > 0
    ? canonicalActiveJobOffers
    : normalOffers.filter((o: any) => o.status === 'PUBLISHED');
  const normalDraft  = normalOffers.filter((o: any) => o.status === 'DRAFT');
  const activeProgramOffers = canonicalActiveProgramOffers.length > 0
    ? canonicalActiveProgramOffers
    : dashProgramOffers;
  const dashboardOffers = [
    ...normalActive.map((offer: any) => ({
      ...offer,
      _jobOfferId: String(resolveJobOfferId(offer, offer.offer) ?? offer.jobOfferId ?? offer.id),
      _programId: null,
      _programOfferId: null,
      _applicationsCount: Number(
        offer.applicationsCount
        ?? offer._count?.applications
        ?? resolveAppCount(offer)
        ?? 0,
      ),
    })),
    ...activeProgramOffers.map((offer: any) => ({
      ...offer,
      _jobOfferId: String(resolveJobOfferId(offer, offer.offer, offer.jobOffer) ?? offer.jobOfferId ?? offer.offerId ?? offer.id),
      _programId: String(resolveProgramId(offer, offer.program) ?? offer.program?.programId ?? offer.programId ?? ''),
      _programOfferId: String(resolveProgramOfferId(offer, offer.programOffer) ?? offer.programOfferId ?? offer.id ?? ''),
      _applicationsCount: Number(
        offer.applicationsCount
        ?? offer._count?.applications
        ?? resolveAppCount(offer)
        ?? 0,
      ),
    })),
  ];
  const normalTopOffers = [...dashboardOffers]
    .sort((a: any, b: any) => (b._applicationsCount ?? 0) - (a._applicationsCount ?? 0))
    .slice(0, 5);

  const hasProgramData =
    hasPublishedProgramOffers ||
    Boolean(dashMeta.hasActiveProgramOffers) ||
    totalProgramApplications > 0 ||
    pendingProgramApplications > 0 ||
    latestProgramApplications.length > 0 ||
    activeProgramOffers.length > 0;



  return {
    applications,
    totalApplications: applications.length,
    newApps,
    interviews,
    activeOffersCount: Number(
      dashSummary.activeJobOffersCount
      ?? normalActive.length,
    ) + Number(
      dashSummary.activeProgramOffersCount
      ?? activeProgramOffers.length,
    ),
    draftCount: normalDraft.length,
    recentApplications,
    topOffers: normalTopOffers,
    allOffers: dashboardOffers,
    statusCounts,
    promotions,
    totalProgramApplications,
    pendingProgramApplications,
    latestProgramApplications,
    hasPublishedProgramOffers: hasProgramData,
    appCountByOfferId,
    programContextByOfferId,
  };
}

function AvatarFallback({ name, avatarUrl, size = 'md' }: { name?: string; avatarUrl?: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const src = toAbsoluteAssetUrl(avatarUrl, API);
  if (src) {
    return <img src={src} alt={name ?? ''} className={`${sz} rounded-full object-cover border border-gray-200 shrink-0`} />;
  }
  return (
    <div className={`${sz} rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold shrink-0`}>
      {getDisplayInitial(name)}
    </div>
  );
}

export default async function CompanyDashboard() {
  const user = await getSession();
  const locale = await getLocale();
  const t = await getTranslations('intranet');
  const {
    totalApplications,
    newApps,
    interviews,
    activeOffersCount,
    draftCount,
    recentApplications,
    topOffers,
    allOffers,
    statusCounts,
    promotions,
    totalProgramApplications,
    pendingProgramApplications,
    latestProgramApplications,
    hasPublishedProgramOffers,
    appCountByOfferId,
    programContextByOfferId,
  } = await getDashboardData();

  const hour = new Date().getHours();
  const greetingKey = hour < 13 ? 'morning' : hour < 20 ? 'afternoon' : 'evening';
  const greeting = t(`greeting.${greetingKey}`);
  const companyName = (user as any)?.companyName ?? user?.name ?? '';

  const applicationStatusColors: Record<string, string> = {
    PENDING:   'bg-yellow-100 text-yellow-700',
    INTERVIEW: 'bg-purple-100 text-purple-700',
    HIRED:     'bg-green-100 text-green-700',
    REJECTED:  'bg-red-100 text-red-600',
  };

  const offerStatusColors: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT:     'bg-gray-100 text-gray-500',
    CLOSED:    'bg-red-100 text-red-600',
  };
  const getOfferStatusLabel = (status: string | null | undefined): string => {
    const normalized = String(status ?? '').toUpperCase();
    if (!normalized) return '';

    const keys = [
      `company.offerStatus.${normalized}`,
      `company.programDetail.myOffers.${normalized.toLowerCase()}`,
    ] as const;

    for (const key of keys) {
      const translated = t(key as Parameters<typeof t>[0]);
      if (
        typeof translated === 'string' &&
        translated !== key &&
        !translated.startsWith('intranet.')
      ) {
        return translated;
      }
    }

    return normalized;
  };
  const isGettingStarted =
    activeOffersCount === 0 &&
    draftCount === 0 &&
    totalApplications === 0 &&
    !hasPublishedProgramOffers;

  return (
    <PageShell wide className="space-y-8">

      <PageHeader
        title={companyName}
        subtitle={
          <>
            <span className="block text-sm text-gray-400">{greeting}</span>
            <span>{new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </>
        }
        actions={
          <Link
            href={`/${locale}/intranet/company/offers/new`}
            className="shrink-0 rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            {t('company.dashboard.publishOffer')}
          </Link>
        }
      />

      {promotions.length > 0 && <PromotionsBanner promotions={promotions} />}

      {isGettingStarted && (
        <EmptyStateCard
          className="border-green-100 bg-green-50 text-left"
          title={t('company.dashboard.noApplications')}
          description={t('company.dashboard.noActiveOffers')}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/intranet/company/offers/new`}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                {t('company.dashboard.publishOffer')}
              </Link>
              <Link
                href={`/${locale}/intranet/company/profile`}
                className="rounded-xl border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
              >
                {t('company.dashboard.myCompany')}
              </Link>
            </div>
          }
        />
      )}

      <div className={`grid grid-cols-2 sm:grid-cols-3 ${hasPublishedProgramOffers ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-3`}>
        {[
          { label: t('company.dashboard.activeOffers'),      value: activeOffersCount, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-green-600 bg-green-50' },
          { label: t('company.dashboard.applications'),      value: totalApplications, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-600 bg-blue-50' },
          { label: t('company.dashboard.pending'),           value: newApps,           icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'text-amber-600 bg-amber-50' },
          { label: t('company.dashboard.interviews'),        value: interviews,        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-purple-600 bg-purple-50' },
          ...(hasPublishedProgramOffers ? [
            { label: t('company.dashboard.programApplications.total'),   value: <ProgramMetricValue initialValue={totalProgramApplications} metricKey="totalProgramApplications" />,   icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-indigo-600 bg-indigo-50' },
            { label: t('company.dashboard.programApplications.pending'), value: <ProgramMetricValue initialValue={pendingProgramApplications} metricKey="pendingProgramApplications" />, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-rose-600 bg-rose-50' },
          ] : []),
        ].map(stat => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            accentClassName={stat.color}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
              </svg>
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">

        <div className="space-y-6">

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('company.dashboard.recentApplications')}</h2>
              <Link href={`/${locale}/intranet/company/candidates`} className="text-xs text-green-600 hover:text-green-700 font-medium">{t('company.dashboard.viewAll')} </Link>
            </div>

            {(() => {
              const items = recentApplications.map((app: any) => {
                const candidate = app.candidate ?? app.student;
                const studentId = resolveStudentId(candidate, app);
                const applicationId = resolveApplicationId(app) ?? app.id;
                const studentName = resolveStudentDisplayName(candidate, app);
                const avatarUrl = resolveAvatarUrl(candidate, app);
                const offerTitle = app.offer?.title ?? app.offerTitle ?? '';
                const _appPo = app.offer?.programOffers?.[0] ?? app.offer;
                const _appProgramId = resolveProgramId(app, _appPo, app.program) ?? null;
                const _appProgramOfferId = resolveProgramOfferId(app, _appPo) ?? null;
                const realOfferId = resolveJobOfferId(app, app.offer);
                const offerHref = realOfferId
                  ? buildCompanyOfferHref(locale, realOfferId, _appProgramId, _appProgramOfferId)
                  : null;
                return {
                  id: String(applicationId ?? app.id),
                  status: normalizeApplicationStatus(app.status ?? 'PENDING'),
                  applicationSource: resolveApplicationSource(app, app.offer) ?? 'job',
                  createdAt: app.createdAt ?? '',
                  studentName,
                  avatarUrl,
                  offerTitle,
                  candidateHref: buildCompanyCandidateProfileHref(locale, studentId, applicationId),
                  offerHref,
                };
              });
              return (
                <DashboardRecentApplications
                  applications={items}
                  emptyMessage={t('company.dashboard.noApplications')}
                  publishLabel={t('company.dashboard.publishFirstOffer')}
                  publishHref={`/${locale}/intranet/company/offers/new`}
                />
              );
            })()}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('company.dashboard.myActiveOffers')}</h2>
              <Link href={`/${locale}/intranet/company/offers`} className="text-xs text-green-600 hover:text-green-700 font-medium">{t('company.dashboard.viewAll')} </Link>
            </div>

            {topOffers.length === 0 ? (
              <EmptyStateCard
                title={t('company.dashboard.noActiveOffers')}
                action={
                  <Link href={`/${locale}/intranet/company/offers/new`} className="text-xs font-medium text-green-600 hover:text-green-700">
                    {t('company.dashboard.createOffer')}
                  </Link>
                }
              />
            ) : (
              <SectionCard className="overflow-hidden border-gray-100">
                {topOffers.map((offer: any, i: number) => {
                  const color = offerStatusColors[offer.status] ?? 'bg-gray-100 text-gray-500';
                  const offerStatusText = getOfferStatusLabel(offer.status);

                  /* Use the highest known count: resolveAppCount vs cross-referenced map */
                  const countFromOffer = resolveAppCount(offer);
                  const canonicalOfferId = String(resolveJobOfferId(offer, offer.offer) ?? offer.id);
                  const countFromMap = appCountByOfferId.get(canonicalOfferId) ?? 0;
                  const appCount: number = Math.max(countFromOffer, countFromMap);

                  /* Detect if this offer belongs to a program via cross-referenced map */
                  const ctx = programContextByOfferId.get(canonicalOfferId);
                  const _programId = ctx?.programId ?? null;
                  const _programOfferId = ctx?.programOfferId ?? null;
                  const offerHref = buildCompanyOfferHref(locale, canonicalOfferId, _programId, _programOfferId);

                  return (
                    <Link
                      key={offer.id}
                      href={offerHref}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{offer.title}</p>
                        <p className="text-xs text-gray-400">{relativeDate(offer.publishedAt ?? offer.createdAt, t as TFunc)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {appCount}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{offerStatusText}</span>
                      </div>
                    </Link>
                  );
                })}
              </SectionCard>
            )}
          </section>

          {/* ── Program Applications ─────────────────────────────── */}
          {hasPublishedProgramOffers && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('company.dashboard.programApplications.title')}</h2>
              <Link href={`/${locale}/intranet/company/programs`} className="text-xs text-green-600 hover:text-green-700 font-medium">{t('company.dashboard.programApplications.viewAll')}</Link>
            </div>

            {(() => {
              const items = latestProgramApplications.map((app: any) => {
                const studentId = resolveStudentId(app.candidate, app.student, app);
                const applicationId = String(app._applicationId ?? resolveApplicationId(app) ?? app.id ?? '');
                const candidateHref = buildCompanyCandidateProfileHref(locale, studentId, applicationId);
                const offerHref = app._offerId
                  ? buildCompanyOfferHref(locale, app._offerId, app._programId, app._programOfferId)
                  : null;
                return {
                  id: app.id,
                  applicationId,
                  applicationSource: resolveApplicationSource(app, app.offer) ?? 'program',
                  status: normalizeApplicationStatus(app.status ?? 'PENDING'),
                  createdAt: app.createdAt ?? '',
                  candidateName: app._candidateName ?? '',
                  avatarUrl: app._avatarUrl ?? null,
                  offerTitle: app._offerTitle ?? '',
                  programTitle: app._programTitle ?? '',
                  candidateHref,
                  offerHref,
                  programHref: app._programId ? buildCompanyProgramsHref(locale, app._programId) : null,
                };
              });
              return (
                <DashboardProgramApplications
                  applications={items}
                  emptyMessage={t('company.dashboard.programApplications.empty')}
                  programsLabel={t('company.dashboard.programsLabel')}
                  programsHref={`/${locale}/intranet/company/programs`}
                />
              );
            })()}
          </section>
          )}

        </div>

        <div className="space-y-6">

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('company.dashboard.offersStatus')}</h2>
            <SectionCard className="space-y-3 p-5">
              {[
                { label: t('company.offerStatus.PUBLISHED'), value: activeOffersCount, color: 'bg-green-500',  href: `/${locale}/intranet/company/offers?status=PUBLISHED` },
                { label: t('company.offerStatus.DRAFT'),     value: draftCount,        color: 'bg-gray-300',   href: `/${locale}/intranet/company/offers?status=DRAFT` },
                { label: t('company.dashboard.total'),       value: allOffers.length,  color: 'bg-blue-400',   href: `/${locale}/intranet/company/offers` },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </Link>
              ))}
            </SectionCard>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('company.dashboard.applicationsByStatus')}</h2>
            <SectionCard className="space-y-3 p-5">
              {[
                { key: 'PENDING',    color: 'bg-yellow-400' },
                { key: 'INTERVIEW',  color: 'bg-purple-400' },
                { key: 'HIRED',      color: 'bg-green-500' },
                { key: 'REJECTED',   color: 'bg-red-400' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-700">{t(`company.dashboard.applicationStatus.${item.key}`)}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {statusCounts[item.key as keyof typeof statusCounts] ?? 0}
                  </span>
                </div>
              ))}
            </SectionCard>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('company.dashboard.quickLinks')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: `/${locale}/intranet/company/offers/new`,  label: t('company.dashboard.newOffer'),    icon: 'M12 4v16m8-8H4', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                { href: `/${locale}/intranet/company/candidates`,  label: t('company.dashboard.candidates'),  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                ...(hasPublishedProgramOffers ? [{ href: `/${locale}/intranet/company/programs`, label: t('company.dashboard.programsLabel'), icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' }] : []),
                { href: `/${locale}/intranet/company/profile`,     label: t('company.dashboard.myCompany'),   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
                { href: `/${locale}/intranet/company/offers`,      label: t('company.dashboard.myOffers'),    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-xs font-semibold transition-colors ${item.color}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </PageShell>
  );
}

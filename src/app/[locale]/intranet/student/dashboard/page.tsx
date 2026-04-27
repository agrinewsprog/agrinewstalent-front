import { getSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import { PromotionsBanner } from '@/components/promotions/promotions-banner';
import { Promotion } from '@/types';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import {
  toAbsoluteAssetUrl,
  resolveApplicationId,
  resolveApplicationKey,
  resolveApplicationSource,
  getDisplayInitial,
  resolveCompanyLogoUrl,
  resolveCompanyName,
  normalizeApplicationStatus,
  resolveJobOfferId,
  resolveProgramId,
  resolveProgramOfferId,
  unwrapCollection,
  unwrapEntity,
} from '@/lib/frontend/contracts';
import {
  buildLocaleHref,
  buildStudentOfferHref,
  buildStudentProgramHref,
  buildStudentProgramOfferHref,
} from '@/lib/utils';
import { EmptyStateCard, MetricCard, PageHeader, PageShell, SectionCard } from '@/components/ui/intranet-page';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function normalizeStatus(raw: string): string {
  return normalizeApplicationStatus(raw);
}

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
    const res = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json', ...headers } });
    if (!res.ok) return null;
    return res.json();
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

async function getDashboardData() {
  const authHeader = await getAuthHeader();

  const [dashboardData, applicationsData, offersData, savedData, promotionsData, universityData, programsData] = await Promise.all([
    safeFetch(`${API}/api/students/me/dashboard`, authHeader),
    safeFetch(`${API}/api/applications/students/me`, authHeader),
    safeFetch(`${API}/api/offers`, authHeader),
    safeFetch(`${API}/api/saved-offers`, authHeader),
    safeFetch(`${API}/api/promotions/active`, authHeader),
    safeFetch(`${API}/api/students/me/university`, authHeader),
    safeFetch(`${API}/api/students/me/programs`, authHeader),
  ]);

  const dashboard = unwrapEntity<Record<string, any>>(dashboardData, ['dashboard', 'data']);
  const allApplications = unwrapCollection<any>(applicationsData, ['applications', 'data']);
  const applications =
    unwrapCollection<any>(dashboard?.recentApplications, []).length > 0
      ? unwrapCollection<any>(dashboard?.recentApplications, [])
      : allApplications;
  const totalApplications: number =
    dashboard?.summary?.totalApplications
    ?? applicationsData?.total
    ?? applications.length;
  const interviews = allApplications.filter((a: any) => {
    const s = (a.status ?? '').toUpperCase();
    return s === 'INTERVIEW' || s === 'INTERVIEW_REQUESTED';
  }).length;

  const allOffers = unwrapCollection<any>(offersData, ['data', 'offers']);

  const featuredOffers = allOffers.filter((o: any) => o.featured || o.promoted).slice(0, 4);
  const recentOffers = allOffers
    .sort((a: any, b: any) => new Date(b.publishedAt ?? b.createdAt ?? 0).getTime() - new Date(a.publishedAt ?? a.createdAt ?? 0).getTime())
    .slice(0, 4);

  const savedOffers = unwrapCollection<any>(savedData, ['savedOffers', 'data']);
  const promotions = unwrapCollection<Promotion>(promotionsData, ['data', 'promotions']);
  const dashboardUniversity = unwrapEntity<Record<string, any>>(dashboard?.university, []);
  const university = dashboardUniversity ?? unwrapEntity<Record<string, any>>(universityData, ['university', 'data']);
  const programs = unwrapCollection<any>(programsData, ['programs', 'data']);
  const hasUniversity =
    typeof dashboard?.meta?.hasUniversity === 'boolean'
      ? dashboard.meta.hasUniversity
      : Boolean(university);
  const availableProgramsCount =
    typeof dashboard?.summary?.availableProgramsCount === 'number'
      ? dashboard.summary.availableProgramsCount
      : programs.length;
  const hasAvailablePrograms =
    typeof dashboard?.meta?.hasAvailablePrograms === 'boolean'
      ? dashboard.meta.hasAvailablePrograms
      : availableProgramsCount > 0;

  return {
    applications,
    totalApplications,
    interviews,
    offersCount: allOffers.length,
    savedCount: savedOffers.length,
    featuredOffers,
    recentOffers,
    promotions,
    university,
    programs,
    hasUniversity,
    hasAvailablePrograms,
    availableProgramsCount,
  };
}

function OfferCard({ offer, featured = false, t, locale }: { offer: any; featured?: boolean; t: TFunc; locale: string }) {
  const contractType = offer.contractType ?? offer.type ?? '';
  const companyName = resolveCompanyName(offer, offer.company);
  const city = offer.company?.city ?? offer.location ?? '';
  const dateLabel = relativeDate(offer.publishedAt ?? offer.createdAt, t);
  const logoUrl = toAbsoluteAssetUrl(resolveCompanyLogoUrl(offer, offer.company), API);
  const jobOfferId = resolveJobOfferId(offer, offer.offer) ?? offer.id;
  const offerHref = jobOfferId
    ? buildStudentOfferHref(locale, jobOfferId)
    : buildLocaleHref(locale, '/intranet/student/offers');

  return (
    <Link
      href={offerHref}
      className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all hover:shadow-md ${
        featured
          ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200 hover:border-amber-300'
          : 'bg-white border-gray-100 hover:border-green-200'
      }`}
    >
      <div className="shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-base">
            {getDisplayInitial(companyName, offer.title)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 text-sm leading-snug truncate group-hover:text-green-700 transition-colors">
            {offer.title}
          </h4>
          {featured && (
            <span className="shrink-0 flex items-center gap-0.5 text-amber-600 text-xs font-medium bg-amber-100 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t('student.dashboard.featuredBadge')}
            </span>
          )}
        </div>

        {companyName && <p className="text-xs text-gray-500 mt-0.5 truncate">{companyName}</p>}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {city && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {city}
            </span>
          )}
          {contractType && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
              {t(`student.contractTypes.${contractType}`)}
            </span>
          )}
          {offer.salary && (
            <span className="text-xs font-medium text-green-600">{offer.salary}</span>
          )}
          {dateLabel && <span className="text-xs text-gray-400 ml-auto">{dateLabel}</span>}
        </div>
      </div>
    </Link>
  );
}

export default async function StudentDashboard() {
  const user = await getSession();
  const locale = await getLocale();
  const t = await getTranslations('intranet');
  const {
    applications,
    totalApplications,
    interviews,
    offersCount,
    savedCount,
    featuredOffers,
    recentOffers,
    promotions,
    university,
    programs,
    hasUniversity,
    hasAvailablePrograms,
    availableProgramsCount,
  } = await getDashboardData();

  const hour = new Date().getHours();
  const greetingKey = hour < 13 ? 'morning' : hour < 20 ? 'afternoon' : 'evening';
  const greeting = t(`greeting.${greetingKey}`);
  const firstName = user?.firstName ?? user?.name?.split(' ')[0] ?? '';

  const STATUS_COLORS: Record<string, string> = {
    PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    INTERVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
    HIRED:     'bg-green-100  text-green-700  border-green-200',
    REJECTED:  'bg-red-100    text-red-600    border-red-200',
  };
  const STATUS_DOT: Record<string, string> = {
    PENDING:   'bg-yellow-500',
    INTERVIEW: 'bg-purple-500',
    HIRED:     'bg-green-500',
    REJECTED:  'bg-red-500',
  };
  const isGettingStarted = totalApplications === 0 && offersCount === 0 && savedCount === 0;
  /** Safe i18n status label — never shows raw enums */
  const safeStatusLabel = (raw: string): string => {
    const nk = normalizeStatus(raw);
    try {
      const label = t(`student.applicationStatus.${nk}` as any);
      if (typeof label === 'string' && !label.includes('student.applicationStatus.')) return label;
    } catch {}
    return t('common.status.PENDING');
  };

  return (
    <PageShell wide className="space-y-8">

      <PageHeader
        title={firstName}
        subtitle={
          <>
            <span className="block text-sm text-gray-400">{greeting}</span>
            <span>{new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </>
        }
        actions={
          <Link
            href={`/${locale}/intranet/student/offers`}
            className="shrink-0 rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            {t('student.dashboard.viewOffers')}
          </Link>
        }
      />

      {promotions.length > 0 && <PromotionsBanner promotions={promotions} />}

      {isGettingStarted && (
        <EmptyStateCard
          className="border-blue-100 bg-blue-50 text-left"
          title={t('student.dashboard.noOffers')}
          description={t('student.dashboard.noApplications')}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/intranet/student/offers`}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                {t('student.dashboard.viewOffers')}
              </Link>
              <Link
                href={`/${locale}/intranet/student/profile`}
                className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                {t('student.dashboard.profileLabel')}
              </Link>
            </div>
          }
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('student.dashboard.statApplications'), value: totalApplications, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-blue-600 bg-blue-50' },
          { label: t('student.dashboard.statInterviews'), value: interviews, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-purple-600 bg-purple-50' },
          { label: t('student.dashboard.statActiveOffers'), value: offersCount, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-green-600 bg-green-50' },
          { label: t('student.dashboard.statSaved'), value: savedCount, icon: 'M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z', color: 'text-amber-600 bg-amber-50' },
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

          {featuredOffers.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {t('student.dashboard.featured')}
                </h2>
                <Link href={`/${locale}/intranet/student/offers`} className="text-xs text-green-600 hover:text-green-700 font-medium">{t('student.dashboard.viewAll')} </Link>
              </div>
              <div className="space-y-2">
                {featuredOffers.map((offer: any) => (
                  <OfferCard key={offer.id} offer={offer} featured t={t as TFunc} locale={locale} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('student.dashboard.latestOffers')}</h2>
              <Link href={`/${locale}/intranet/student/offers`} className="text-xs text-green-600 hover:text-green-700 font-medium">{t('student.dashboard.viewAll')} </Link>
            </div>
            {recentOffers.length === 0 ? (
              <EmptyStateCard title={t('student.dashboard.noOffers')} />
            ) : (
              <div className="space-y-2">
                {recentOffers.map((offer: any) => (
                  <OfferCard key={offer.id} offer={offer} t={t as TFunc} locale={locale} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('student.dashboard.programsLabel')}</h2>
              <Link href={buildLocaleHref(locale, '/intranet/student/programs')} className="text-xs text-green-600 hover:text-green-700 font-medium">{t('student.dashboard.viewAll')}</Link>
            </div>

            {!hasUniversity ? (
              <EmptyStateCard
                title={t('student.dashboard.profileLabel')}
                description={t('student.universityLink.empty.noUniversity')}
                action={
                  <Link href={buildLocaleHref(locale, '/intranet/student/profile')} className="text-xs font-medium text-green-600 hover:text-green-700">
                    {t('student.dashboard.profileLabel')}
                  </Link>
                }
                className="px-6 py-8"
              />
            ) : !hasAvailablePrograms ? (
              <EmptyStateCard
                title={university?.name ?? university?.universityName ?? t('student.dashboard.programsLabel')}
                description={t('student.programs.emptySubtitle')}
                className="px-6 py-8"
              />
            ) : (
              <SectionCard className="overflow-hidden border-gray-100">
                <div className="border-b border-gray-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-800">{university?.name ?? university?.universityName ?? t('student.dashboard.programsLabel')}</p>
                  {(university?.location || university?.description) && (
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{university?.location ?? university?.description}</p>
                  )}
                </div>
                {programs.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-gray-500">
                    {t('student.programs.emptySubtitle')}
                    {availableProgramsCount > 0 && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({availableProgramsCount})
                      </span>
                    )}
                  </div>
                ) : programs.slice(0, 3).map((program: any, index: number) => {
                  const programId = resolveProgramId(program);
                  const programHref = programId
                    ? buildStudentProgramHref(locale, programId)
                    : buildLocaleHref(locale, '/intranet/student/programs');
                  return (
                    <div
                      key={programId ?? `${program.title ?? program.name ?? 'program'}-${index}`}
                      className={`px-4 py-3 ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={programHref} className="text-sm font-medium text-gray-900 hover:text-green-700 truncate">
                            {program.title ?? program.name ?? t('student.dashboard.programsLabel')}
                          </Link>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {(program.approvedOffersCount ?? program.offersCount ?? 0)} {t('student.programDetail.metricOffers')}
                          </p>
                        </div>
                        {program.isEnrolled && (
                          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                            {t('student.programs.enrolled')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </SectionCard>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('student.dashboard.myApplications')}</h2>
              <Link href={`/${locale}/intranet/student/applications`} className="text-xs text-green-600 hover:text-green-700 font-medium">{t('student.dashboard.viewAll')} </Link>
            </div>

            {applications.length === 0 ? (
              <EmptyStateCard
                title={t('student.dashboard.noApplications')}
                action={
                  <Link href={`/${locale}/intranet/student/offers`} className="text-xs font-medium text-green-600 hover:text-green-700">
                    {t('student.dashboard.searchOffers')}
                  </Link>
                }
                className="px-6 py-8"
              />
            ) : (
              <SectionCard className="overflow-hidden border-gray-100">
                {applications.slice(0, 5).map((app: any, i: number) => {
                  const nk = normalizeStatus(app.status);
                  const color = STATUS_COLORS[nk] ?? 'bg-gray-100 text-gray-600 border-gray-200';
                  const dotColor = STATUS_DOT[nk] ?? 'bg-gray-400';
                  const statusText = safeStatusLabel(app.status);
                  const appSource = resolveApplicationSource(app) ?? 'application';

                  const rawOffer = app.offer ?? {};
                  const nestedProgram = rawOffer.program ?? app.program ?? null;
                  const programId = resolveProgramId(app, nestedProgram, rawOffer);
                  const programOfferId = resolveProgramOfferId(app, rawOffer, app.programOffer ?? rawOffer.programOffer);
                  const isProgram = !!(programId && programOfferId);

                  const offerTitle =
                    app.offerTitle
                    || rawOffer.title
                    || app.jobOffer?.title
                    || t('student.dashboard.untitledOffer');

                  const companyName = resolveCompanyName(
                    app,
                    app.company,
                    rawOffer,
                    app.jobOffer,
                    nestedProgram,
                  );

                  const logoUrl = toAbsoluteAssetUrl(resolveCompanyLogoUrl(
                    app,
                    app.company,
                    rawOffer,
                    app.jobOffer,
                    nestedProgram,
                  ), API);

                  const initial = getDisplayInitial(companyName, offerTitle);

                  const programTitle = isProgram
                    ? (nestedProgram?.title || nestedProgram?.name || app.programTitle || '')
                    : '';

                  const resolvedOfferId = resolveJobOfferId(app, rawOffer, app.jobOffer);
                  const appHref = isProgram && programId && programOfferId
                    ? buildStudentProgramOfferHref(locale, programId, programOfferId)
                    : resolvedOfferId
                      ? buildStudentOfferHref(locale, resolvedOfferId)
                      : buildLocaleHref(locale, '/intranet/student/applications');
                  const applicationKey =
                    resolveApplicationKey(app)
                    ?? `${appSource}:${resolveApplicationId(app) ?? i}`;

                  return (
                    <div
                      key={applicationKey}
                      className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt={companyName} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                          {initial}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={appHref}
                            className="text-sm font-medium text-gray-900 hover:text-green-700 truncate"
                          >
                            {offerTitle}
                          </Link>
                          {isProgram && (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                              {t('student.applications.programBadge')}
                            </span>
                          )}
                        </div>
                        {companyName && <p className="text-xs text-gray-400 truncate">{companyName}</p>}
                        {programTitle && (
                          <p className="text-[11px] text-indigo-500 truncate">{programTitle}</p>
                        )}
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              </SectionCard>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('student.dashboard.quickLinks')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: `/${locale}/intranet/student/profile`, label: t('student.dashboard.profileLabel'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { href: `/${locale}/intranet/student/programs`, label: t('student.dashboard.programsLabel'), icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { href: `/${locale}/intranet/student/saved-offers`, label: t('student.dashboard.savedLabel'), icon: 'M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                { href: `/${locale}/intranet/student/applications`, label: t('student.dashboard.applicationsLabel'), icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
                { href: `/${locale}/intranet/student/offers`, label: t('student.dashboard.exploreLabel'), icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shadow-sm flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-xs font-semibold transition-colors ${item.color}`}
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

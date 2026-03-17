import { getSession } from '@/src/lib/auth/session';
import { cookies } from 'next/headers';
import { PromotionsBanner } from '@/src/components/promotions/promotions-banner';
import { Promotion } from '@/src/types';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

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

  const [applicationsData, offersData, promotionsData] = await Promise.all([
    safeFetch(`${API}/api/applications/companies/me`, authHeader),
    safeFetch(`${API}/api/offers/companies/me`, authHeader),
    safeFetch(`${API}/api/promotions/active`, authHeader),
  ]);

  const applications: any[] = applicationsData?.applications ?? applicationsData?.data ?? [];
  const allOffers: any[] = Array.isArray(offersData)
    ? offersData
    : (offersData?.data ?? offersData?.offers ?? []);

  const activeOffers = allOffers.filter((o: any) => o.status === 'PUBLISHED');
  const draftOffers  = allOffers.filter((o: any) => o.status === 'DRAFT');
  const newApps      = applications.filter((a: any) => a.status === 'SUBMITTED').length;
  const interviews   = applications.filter((a: any) => a.status === 'INTERVIEW_REQUESTED').length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  const topOffers = [...activeOffers]
    .sort((a, b) => (b._count?.applications ?? 0) - (a._count?.applications ?? 0))
    .slice(0, 5);

  const promotions: Promotion[] = promotionsData?.data ?? promotionsData?.promotions ?? [];

  const statusCounts = {
    SUBMITTED:           applications.filter((a: any) => a.status === 'SUBMITTED').length,
    VIEWED:              applications.filter((a: any) => a.status === 'VIEWED').length,
    INTERVIEW_REQUESTED: applications.filter((a: any) => a.status === 'INTERVIEW_REQUESTED').length,
    HIRED:               applications.filter((a: any) => a.status === 'HIRED').length,
    REJECTED:            applications.filter((a: any) => a.status === 'REJECTED').length,
  };

  return {
    applications,
    totalApplications: applications.length,
    newApps,
    interviews,
    activeOffersCount: activeOffers.length,
    draftCount: draftOffers.length,
    recentApplications,
    topOffers,
    allOffers,
    statusCounts,
    promotions,
  };
}

function AvatarFallback({ name, avatarUrl, size = 'md' }: { name?: string; avatarUrl?: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const src = avatarUrl && !avatarUrl.startsWith('http') ? `${API}${avatarUrl}` : avatarUrl;
  if (src) {
    return <img src={src} alt={name ?? ''} className={`${sz} rounded-full object-cover border border-gray-200 shrink-0`} />;
  }
  return (
    <div className={`${sz} rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold shrink-0`}>
      {(name ?? '?')[0].toUpperCase()}
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
  } = await getDashboardData();

  const hour = new Date().getHours();
  const greetingKey = hour < 13 ? 'morning' : hour < 20 ? 'afternoon' : 'evening';
  const greeting = t(`greeting.${greetingKey}`);
  const companyName = (user as any)?.companyName ?? user?.name ?? '';

  const applicationStatusColors: Record<string, string> = {
    SUBMITTED:           'bg-blue-100 text-blue-700',
    VIEWED:              'bg-gray-100 text-gray-600',
    INTERVIEW_REQUESTED: 'bg-purple-100 text-purple-700',
    HIRED:               'bg-green-100 text-green-700',
    REJECTED:            'bg-red-100 text-red-600',
  };

  const offerStatusColors: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT:     'bg-gray-100 text-gray-500',
    CLOSED:    'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-7">

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-400 mb-1">{greeting} </p>
          <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/intranet/company/offers/new"
          className="shrink-0 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {t('company.dashboard.publishOffer')}
        </Link>
      </div>

      {promotions.length > 0 && <PromotionsBanner promotions={promotions} />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('company.dashboard.activeOffers'),      value: activeOffersCount, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-green-600 bg-green-50' },
          { label: t('company.dashboard.applications'),      value: totalApplications, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-600 bg-blue-50' },
          { label: t('company.dashboard.pending'),           value: newApps,           icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'text-amber-600 bg-amber-50' },
          { label: t('company.dashboard.interviews'),        value: interviews,        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-purple-600 bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-3 space-y-6">

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('company.dashboard.recentApplications')}</h2>
              <Link href="/intranet/company/candidates" className="text-xs text-green-600 hover:text-green-700 font-medium">{t('company.dashboard.viewAll')} </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">{t('company.dashboard.noApplications')}</p>
                <Link href="/intranet/company/offers/new" className="mt-2 inline-block text-xs text-green-600 font-medium hover:text-green-700">
                  {t('company.dashboard.publishFirstOffer')} 
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {recentApplications.map((app: any, i: number) => {
                  const color = applicationStatusColors[app.status] ?? 'bg-gray-100 text-gray-600';
                  const statusText = t(`company.applicationStatus.${app.status}`) || app.status;
                  const studentName = app.student?.name ?? app.student?.firstName
                    ? `${app.student.firstName ?? ''} ${app.student.lastName ?? ''}`.trim()
                    : (app.student?.email ?? '');
                  const avatarUrl = app.student?.avatarUrl;
                  const offerTitle = app.offer?.title ?? '';

                  return (
                    <Link
                      key={app.id}
                      href={`/intranet/company/candidates/${app.student?.id ?? app.student?.userId ?? app.id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      <AvatarFallback name={studentName} avatarUrl={avatarUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{studentName}</p>
                        <p className="text-xs text-gray-400 truncate">{offerTitle}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{statusText}</span>
                        <span className="text-xs text-gray-300">{relativeDate(app.createdAt, t as TFunc)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('company.dashboard.myActiveOffers')}</h2>
              <Link href="/intranet/company/offers" className="text-xs text-green-600 hover:text-green-700 font-medium">{t('company.dashboard.viewAll')} </Link>
            </div>

            {topOffers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">{t('company.dashboard.noActiveOffers')}</p>
                <Link href="/intranet/company/offers/new" className="mt-2 inline-block text-xs text-green-600 font-medium hover:text-green-700">
                  {t('company.dashboard.createOffer')} 
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {topOffers.map((offer: any, i: number) => {
                  const color = offerStatusColors[offer.status] ?? 'bg-gray-100 text-gray-500';
                  const offerStatusText = t(`company.offerStatus.${offer.status}`) || offer.status;
                  const appCount = offer._count?.applications ?? 0;
                  return (
                    <Link
                      key={offer.id}
                      href={`/intranet/company/offers/${offer.id}`}
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
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('company.dashboard.offersStatus')}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              {[
                { label: t('company.offerStatus.PUBLISHED'), value: activeOffersCount, color: 'bg-green-500',  href: '/intranet/company/offers?status=PUBLISHED' },
                { label: t('company.offerStatus.DRAFT'),     value: draftCount,        color: 'bg-gray-300',   href: '/intranet/company/offers?status=DRAFT' },
                { label: t('company.dashboard.total'),       value: allOffers.length,  color: 'bg-blue-400',   href: '/intranet/company/offers' },
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
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('company.dashboard.applicationsByStatus')}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              {[
                { key: 'SUBMITTED',           color: 'bg-blue-400' },
                { key: 'VIEWED',               color: 'bg-gray-300' },
                { key: 'INTERVIEW_REQUESTED',  color: 'bg-purple-400' },
                { key: 'HIRED',                color: 'bg-green-500' },
                { key: 'REJECTED',             color: 'bg-red-400' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-700">{t(`company.applicationStatus.${item.key}`)}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {statusCounts[item.key as keyof typeof statusCounts] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('company.dashboard.quickLinks')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/intranet/company/offers/new',  label: t('company.dashboard.newOffer'),    icon: 'M12 4v16m8-8H4', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                { href: '/intranet/company/candidates',  label: t('company.dashboard.candidates'),  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { href: '/intranet/company/profile',     label: t('company.dashboard.myCompany'),   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { href: '/intranet/company/offers',      label: t('company.dashboard.myOffers'),    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
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
    </div>
  );
}
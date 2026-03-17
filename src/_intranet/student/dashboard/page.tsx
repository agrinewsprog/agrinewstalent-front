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

  const [applicationsData, offersData, savedData, promotionsData] = await Promise.all([
    safeFetch(`${API}/api/applications/students/me`, authHeader),
    safeFetch(`${API}/api/offers`, authHeader),
    safeFetch(`${API}/api/saved-offers`, authHeader),
    safeFetch(`${API}/api/promotions/active`, authHeader),
  ]);

  const applications: any[] = applicationsData?.applications ?? applicationsData?.data ?? [];
  const totalApplications: number = applicationsData?.total ?? applications.length;
  const interviews = applications.filter((a: any) => a.status === 'INTERVIEW_REQUESTED').length;

  const allOffers: any[] = Array.isArray(offersData)
    ? offersData
    : (offersData?.data ?? offersData?.offers ?? []);

  const featuredOffers = allOffers.filter((o: any) => o.featured || o.promoted).slice(0, 4);
  const recentOffers = allOffers
    .sort((a: any, b: any) => new Date(b.publishedAt ?? b.createdAt ?? 0).getTime() - new Date(a.publishedAt ?? a.createdAt ?? 0).getTime())
    .slice(0, 4);

  const savedOffers: any[] = savedData?.savedOffers ?? savedData?.data ?? [];
  const promotions: Promotion[] = promotionsData?.data ?? promotionsData?.promotions ?? [];

  return {
    applications,
    totalApplications,
    interviews,
    offersCount: allOffers.length,
    savedCount: savedOffers.length,
    featuredOffers,
    recentOffers,
    promotions,
  };
}

function OfferCard({ offer, featured = false, t }: { offer: any; featured?: boolean; t: TFunc }) {
  const contractType = offer.contractType ?? offer.type ?? '';
  const companyName = offer.company?.companyName ?? offer.company?.name ?? '';
  const city = offer.company?.city ?? offer.location ?? '';
  const dateLabel = relativeDate(offer.publishedAt ?? offer.createdAt, t);
  const logoUrl = offer.company?.logoUrl;

  return (
    <Link
      href={`/intranet/student/offers/${offer.id}`}
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
            {(companyName || offer.title || '?')[0].toUpperCase()}
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
  } = await getDashboardData();

  const hour = new Date().getHours();
  const greetingKey = hour < 13 ? 'morning' : hour < 20 ? 'afternoon' : 'evening';
  const greeting = t(`greeting.${greetingKey}`);
  const firstName = user?.firstName ?? user?.name?.split(' ')[0] ?? '';

  const statusColors: Record<string, string> = {
    SUBMITTED:           'bg-gray-100 text-gray-600',
    VIEWED:              'bg-blue-100 text-blue-700',
    INTERVIEW_REQUESTED: 'bg-purple-100 text-purple-700',
    HIRED:               'bg-green-100 text-green-700',
    REJECTED:            'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-7">

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{greeting} </p>
          <h1 className="text-3xl font-bold text-gray-900">{firstName}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/intranet/student/offers"
          className="shrink-0 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {t('student.dashboard.viewOffers')}
        </Link>
      </div>

      {promotions.length > 0 && <PromotionsBanner promotions={promotions} />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('student.dashboard.statApplications'), value: totalApplications, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-blue-600 bg-blue-50' },
          { label: t('student.dashboard.statInterviews'), value: interviews, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-purple-600 bg-purple-50' },
          { label: t('student.dashboard.statActiveOffers'), value: offersCount, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-green-600 bg-green-50' },
          { label: t('student.dashboard.statSaved'), value: savedCount, icon: 'M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z', color: 'text-amber-600 bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-3 space-y-6">

          {featuredOffers.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {t('student.dashboard.featured')}
                </h2>
                <Link href="/intranet/student/offers" className="text-xs text-green-600 hover:text-green-700 font-medium">{t('student.dashboard.viewAll')} </Link>
              </div>
              <div className="space-y-2">
                {featuredOffers.map((offer: any) => (
                  <OfferCard key={offer.id} offer={offer} featured t={t as TFunc} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('student.dashboard.latestOffers')}</h2>
              <Link href="/intranet/student/offers" className="text-xs text-green-600 hover:text-green-700 font-medium">{t('student.dashboard.viewAll')} </Link>
            </div>
            {recentOffers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">{t('student.dashboard.noOffers')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOffers.map((offer: any) => (
                  <OfferCard key={offer.id} offer={offer} t={t as TFunc} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">{t('student.dashboard.myApplications')}</h2>
              <Link href="/intranet/student/applications" className="text-xs text-green-600 hover:text-green-700 font-medium">{t('student.dashboard.viewAll')} </Link>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">{t('student.dashboard.noApplications')}</p>
                <Link href="/intranet/student/offers" className="mt-2 inline-block text-xs text-green-600 font-medium hover:text-green-700">
                  {t('student.dashboard.searchOffers')} 
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {applications.slice(0, 5).map((app: any, i: number) => {
                  const color = statusColors[app.status] ?? 'bg-gray-100 text-gray-600';
                  const statusText = t(`student.applicationStatus.${app.status}`) || app.status;
                  const company = app.offer?.company?.companyName ?? app.offer?.company?.name ?? '';
                  const logoUrl = app.offer?.company?.logoUrl;
                  const initial = (company || app.offer?.title || '?')[0].toUpperCase();
                  return (
                    <div
                      key={app.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt={company} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                          {initial}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/intranet/student/offers/${app.offerId ?? app.offer?.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-green-700 truncate block"
                        >
                          {app.offer?.title ?? 'Oferta'}
                        </Link>
                        {company && <p className="text-xs text-gray-400 truncate">{company}</p>}
                      </div>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-3">{t('student.dashboard.quickLinks')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/intranet/student/profile', label: t('student.dashboard.profileLabel'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { href: '/intranet/student/saved-offers', label: t('student.dashboard.savedLabel'), icon: 'M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                { href: '/intranet/student/applications', label: t('student.dashboard.applicationsLabel'), icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { href: '/intranet/student/offers', label: t('student.dashboard.exploreLabel'), icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
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
    </div>
  );
}
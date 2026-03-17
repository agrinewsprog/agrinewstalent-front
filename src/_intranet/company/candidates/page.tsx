import { cookies } from 'next/headers';
import Link from 'next/link';
import { UserCircleIcon, EnvelopeIcon, DocumentTextIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { getTranslations } from 'next-intl/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function safeFetch(url: string, token: string) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function buildAvatarUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) return raw;
  return `${API}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

interface ApplicationFromAPI {
  id: string;
  status: string;
  createdAt: string;
  student?: {
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    avatar?: string;
    city?: string;
    country?: string;
  };
  offer?: {
    id?: string;
    title?: string;
    contractType?: string;
  };
}

interface CandidateForCard {
  applicationId: string;
  candidateId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  location: string;
  status: string;
}

interface GroupedOffer {
  offerId: string;
  offerTitle: string;
  contractType?: string;
  candidates: CandidateForCard[];
}

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  VIEWED: 'bg-gray-100 text-gray-600',
  INTERVIEW_REQUESTED: 'bg-purple-100 text-purple-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

function CandidateCard({ candidate, statusLabel }: { candidate: CandidateForCard; statusLabel: string }) {
  const avatar = buildAvatarUrl(candidate.avatarUrl);
  const statusColor = STATUS_COLOR[candidate.status] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="bg-gradient-to-b from-green-50 to-white pt-6 pb-4 flex flex-col items-center gap-3 px-5">
        {avatar ? (
          <img src={avatar} alt={candidate.name} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-white shadow flex items-center justify-center">
            <UserCircleIcon className="w-12 h-12 text-green-500" />
          </div>
        )}
        <div className="text-center">
          <Link href={`/intranet/company/candidates/${candidate.candidateId}`} className="font-semibold text-gray-900 hover:text-green-700 transition-colors text-base block">
            {candidate.name}
          </Link>
          {candidate.location && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <MapPinIcon className="w-3 h-3" />{candidate.location}
            </p>
          )}
        </div>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
      </div>

      <div className="px-5 pb-5 pt-3 flex flex-col gap-2 mt-auto">
        <Link href={`/intranet/company/candidates/${candidate.candidateId}`} className="flex items-center justify-center gap-1.5 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          <DocumentTextIcon className="w-4 h-4" />
          CV
        </Link>
        <a href={`mailto:${candidate.email}`} className="flex items-center justify-center gap-1.5 w-full border border-gray-200 hover:border-green-400 hover:text-green-700 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors">
          <EnvelopeIcon className="w-4 h-4" />
          Email
        </a>
      </div>
    </div>
  );
}

export default async function CompanyCandidatesPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('access_token')?.value ??
    cookieStore.get('accessToken')?.value ??
    cookieStore.get('token')?.value ??
    '';

  const t = await getTranslations('intranet');

  const STATUS_LABEL: Record<string, string> = {
    SUBMITTED: t('company.applicationStatus.SUBMITTED'),
    VIEWED: t('company.applicationStatus.VIEWED'),
    INTERVIEW_REQUESTED: t('company.applicationStatus.INTERVIEW_REQUESTED'),
    HIRED: t('company.applicationStatus.HIRED'),
    REJECTED: t('company.applicationStatus.REJECTED'),
  };

  const data = await safeFetch(`${API}/api/applications/companies/me`, token);
  const applications: ApplicationFromAPI[] = data?.applications ?? data?.data ?? [];

  const offerMap = new Map<string, GroupedOffer>();

  for (const app of applications) {
    const offerId = app.offer?.id ?? 'unknown';
    const offerTitle = app.offer?.title ?? t('company.candidates.unknownOffer');
    const candidateId = app.student?.id ?? app.student?.userId ?? app.id;
    const firstName = app.student?.firstName ?? '';
    const lastName = app.student?.lastName ?? '';
    const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (app.student?.name ?? app.student?.email ?? 'Candidato');
    const location = [app.student?.city, app.student?.country].filter(Boolean).join(', ');

    const candidate: CandidateForCard = {
      applicationId: app.id,
      candidateId,
      name,
      email: app.student?.email ?? '',
      avatarUrl: app.student?.avatarUrl ?? app.student?.avatar ?? null,
      location,
      status: app.status,
    };

    if (!offerMap.has(offerId)) {
      offerMap.set(offerId, { offerId, offerTitle, contractType: app.offer?.contractType, candidates: [] });
    }
    offerMap.get(offerId)!.candidates.push(candidate);
  }

  const groupedOffers = Array.from(offerMap.values());
  const totalCandidates = applications.length;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('company.candidates.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCandidates} {t(`company.candidates.${totalCandidates !== 1 ? 'applications' : 'application'}`)} {t('common.in')} {groupedOffers.length} {t(`company.candidates.${groupedOffers.length !== 1 ? 'offerPlural' : 'offerSingular'}`)}
          </p>
        </div>
        <Link href="/intranet/company/offers/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('company.offers.newOffer')}
        </Link>
      </div>

      {groupedOffers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('common.noData')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('company.candidates.subtitle')}</p>
          <Link href="/intranet/company/offers/new" className="mt-5 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">{t('common.publish')}</Link>
        </div>
      )}

      {groupedOffers.map(group => (
        <section key={group.offerId}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{group.offerTitle}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {group.candidates.length} {t(`company.candidates.${group.candidates.length !== 1 ? 'candidatePlural' : 'candidateSingular'}`)}
                {group.contractType && <> &middot; {group.contractType}</>}
              </p>
            </div>
            {group.candidates.length > 3 && (
              <Link href={`/intranet/company/offers/${group.offerId}/candidates`} className="text-sm font-medium text-green-700 hover:text-green-900 transition-colors">
                {t('common.viewMore')} &rarr;
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.candidates.slice(0, 3).map(candidate => (
              <CandidateCard key={candidate.applicationId} candidate={candidate} statusLabel={STATUS_LABEL[candidate.status] ?? candidate.status} />
            ))}
          </div>

          {group.candidates.length > 3 && (
            <div className="mt-4 text-center">
              <Link href={`/intranet/company/offers/${group.offerId}/candidates`} className="inline-flex items-center gap-2 border border-green-200 text-green-700 hover:bg-green-50 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
                {t('common.viewAll')} ({group.candidates.length})
              </Link>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

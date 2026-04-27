import { cookies } from 'next/headers';
import Link from 'next/link';
import { UserCircleIcon, EnvelopeIcon, DocumentTextIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { getTranslations, getLocale } from 'next-intl/server';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';
import {
  getDisplayInitial,
  normalizeApplicationStatus,
  resolveApplicationId,
  resolveApplicationSource,
  resolveAvatarUrl,
  resolveJobOfferId,
  resolveResumeUrl,
  resolveStudentDisplayName,
  resolveStudentId,
  toAbsoluteAssetUrl,
  unwrapCollection,
} from '@/lib/frontend/contracts';
import {
  buildCompanyCandidateProfileHref,
  buildCompanyOfferCandidatesHref,
  buildLocaleHref,
} from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function safeFetch(url: string, token: string) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface CandidateForCard {
  applicationId: string;
  applicationSource: 'job' | 'program' | null;
  studentId: string | null;
  candidateHref: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
  location: string | null;
  status: string;
}

interface GroupedOffer {
  jobOfferId: string;
  offerTitle: string;
  contractType?: string | null;
  candidates: CandidateForCard[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

function CandidateCard({
  candidate,
}: {
  candidate: CandidateForCard;
}) {
  const avatar = toAbsoluteAssetUrl(candidate.avatarUrl, API);
  const cvUrl = toAbsoluteAssetUrl(candidate.resumeUrl, API);
  const normalized = normalizeApplicationStatus(candidate.status);
  const statusColor = STATUS_COLOR[normalized] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="bg-gradient-to-b from-green-50 to-white pt-6 pb-4 flex flex-col items-center gap-3 px-5">
        {avatar ? (
          <img src={avatar} alt={candidate.name} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-white shadow flex items-center justify-center text-green-700 font-bold text-xl">
            {getDisplayInitial(candidate.name, candidate.email)}
          </div>
        )}
        <div className="text-center">
          <Link href={candidate.candidateHref} className="font-semibold text-gray-900 hover:text-green-700 transition-colors text-base block">
            {candidate.name}
          </Link>
          {candidate.location && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              {candidate.location}
            </p>
          )}
        </div>
        <ApplicationStatusChanger
          applicationId={candidate.applicationId}
          currentStatus={candidate.status}
          applicationSource={candidate.applicationSource}
        />
      </div>

      <div className="px-5 pb-5 pt-3 flex flex-col gap-2 mt-auto">
        {cvUrl ? (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4" />
            CV
          </a>
        ) : (
          <span className="flex items-center justify-center gap-1.5 w-full border border-gray-200 text-gray-400 text-sm font-medium py-2 rounded-lg">
            <DocumentTextIcon className="w-4 h-4" />
            CV
          </span>
        )}
        {candidate.email ? (
          <a href={`mailto:${candidate.email}`} className="flex items-center justify-center gap-1.5 w-full border border-gray-200 hover:border-green-400 hover:text-green-700 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors">
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </a>
        ) : (
          <span className="flex items-center justify-center gap-1.5 w-full border border-gray-200 text-gray-400 text-sm font-medium py-2 rounded-lg">
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </span>
        )}
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

  const [t, locale] = await Promise.all([
    getTranslations('intranet'),
    getLocale(),
  ]);

  const data = await safeFetch(`${API}/api/applications/companies/me`, token);
  const applications = unwrapCollection<any>(data, ['applications', 'data']);

  const offerMap = new Map<string, GroupedOffer>();

  for (const app of applications) {
    const jobOfferId = resolveJobOfferId(app, app.offer);
    if (!jobOfferId) continue;

    const applicationId = resolveApplicationId(app) ?? `${jobOfferId}-${offerMap.size}`;
    const studentId = resolveStudentId(app, app.student);
    const name = resolveStudentDisplayName(app.student, app) || 'Candidate';
    const email = app.student?.email ?? app.student?.user?.email ?? '';
    const location = [app.student?.city, app.student?.country].filter(Boolean).join(', ') || null;
    const candidate: CandidateForCard = {
      applicationId,
      applicationSource: resolveApplicationSource(app, app.offer),
      studentId,
      candidateHref: buildCompanyCandidateProfileHref(locale, studentId, applicationId),
      name,
      email,
      avatarUrl: resolveAvatarUrl(app.student, app),
      resumeUrl: resolveResumeUrl(app.student, app),
      location,
      status: app.status ?? 'PENDING',
    };

    if (!offerMap.has(jobOfferId)) {
      offerMap.set(jobOfferId, {
        jobOfferId,
        offerTitle: app.offer?.title ?? t('company.candidates.unknownOffer'),
        contractType: app.offer?.contractType ?? null,
        candidates: [],
      });
    }

    offerMap.get(jobOfferId)?.candidates.push(candidate);
  }

  const groupedOffers = Array.from(offerMap.values());
  const totalCandidates = applications.length;
  const candidatesIndexHref = buildLocaleHref(locale, '/intranet/company/candidates');
  const newOfferHref = buildLocaleHref(locale, '/intranet/company/offers/new');

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('company.candidates.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCandidates} {t(`company.candidates.${totalCandidates !== 1 ? 'applications' : 'application'}`)} {t('common.in')} {groupedOffers.length} {t(`company.candidates.${groupedOffers.length !== 1 ? 'offerPlural' : 'offerSingular'}`)}
          </p>
        </div>
        <Link href={newOfferHref} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
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
          <Link href={newOfferHref} className="mt-5 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            {t('common.publish')}
          </Link>
        </div>
      )}

      {groupedOffers.map((group) => (
        <section key={group.jobOfferId}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{group.offerTitle}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {group.candidates.length} {t(`company.candidates.${group.candidates.length !== 1 ? 'candidatePlural' : 'candidateSingular'}`)}
                {group.contractType && <> &middot; {group.contractType}</>}
              </p>
            </div>
            {group.candidates.length > 3 && (
              <Link href={buildCompanyOfferCandidatesHref(locale, group.jobOfferId)} className="text-sm font-medium text-green-700 hover:text-green-900 transition-colors">
                {t('common.viewMore')}
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.candidates.slice(0, 3).map((candidate) => (
              <CandidateCard
                key={`${candidate.applicationId}-${candidate.studentId ?? 'candidate'}`}
                candidate={candidate}
              />
            ))}
          </div>

          {group.candidates.length > 3 && (
            <div className="mt-4 text-center">
              <Link href={buildCompanyOfferCandidatesHref(locale, group.jobOfferId)} className="inline-flex items-center gap-2 border border-green-200 text-green-700 hover:bg-green-50 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
                {t('common.viewAll')} ({group.candidates.length})
              </Link>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

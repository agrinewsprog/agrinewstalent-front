import { cookies } from 'next/headers';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';
import {
  UserCircleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { getLocale } from 'next-intl/server';
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
  buildCompanyOfferHref,
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

export default async function OfferCandidatesPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const [t, locale] = await Promise.all([
    getTranslations('intranet'),
    getLocale(),
  ]);

  const cookieStore = await cookies();
  const token =
    cookieStore.get('access_token')?.value ??
    cookieStore.get('accessToken')?.value ??
    cookieStore.get('token')?.value ??
    '';

  const data = await safeFetch(`${API}/api/applications/companies/me`, token);
  const applications = unwrapCollection<any>(data, ['applications', 'data']);

  const filtered = applications.filter((app) => resolveJobOfferId(app, app.offer) === id);
  const first = filtered[0];
  const offerTitle = first?.offer?.title ?? 'Oferta';
  const offerLocation = first?.offer?.location ?? '';
  const contractType = first?.offer?.contractType ?? '';

  const candidates = filtered.map((app) => {
    const applicationId = resolveApplicationId(app) ?? app.id ?? `${id}-candidate`;
    const studentId = resolveStudentId(app, app.student);
    const name = resolveStudentDisplayName(app.student, app) || 'Candidato';
    const email = app.student?.email ?? app.student?.user?.email ?? '';
    const location = [app.student?.city, app.student?.country].filter(Boolean).join(', ') || null;
    return {
      applicationId: String(applicationId),
      applicationSource: resolveApplicationSource(app, app.offer),
      studentId,
      profileHref: buildCompanyCandidateProfileHref(locale, studentId, applicationId),
      name,
      email,
      avatarUrl: resolveAvatarUrl(app.student, app),
      resumeUrl: resolveResumeUrl(app.student, app),
      location,
      status: normalizeApplicationStatus(app.status),
      createdAt: app.createdAt,
    };
  });

  const counts = candidates.reduce(
    (acc, candidate) => {
      if (candidate.status in acc) {
        acc[candidate.status as keyof typeof acc] += 1;
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

  const candidatesIndexHref = buildLocaleHref(locale, '/intranet/company/candidates');
  const offerHref = buildCompanyOfferHref(locale, id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        href={candidatesIndexHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {t('company.applicationDetail.backToCandidates')}
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{offerTitle}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {contractType && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-medium">
                  {contractType}
                </span>
              )}
              {offerLocation && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {offerLocation}
                </span>
              )}
            </div>
          </div>
          <Link
            href={offerHref}
            className="text-sm text-green-700 hover:text-green-900 font-medium transition-colors whitespace-nowrap"
          >
            Ver oferta
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            { key: 'PENDING', color: 'text-yellow-600' },
            { key: 'INTERVIEW', color: 'text-purple-600' },
            { key: 'HIRED', color: 'text-green-600' },
            { key: 'REJECTED', color: 'text-red-500' },
          ].map((item) => (
            <div key={item.key} className="text-center">
              <p className={`text-2xl font-bold ${item.color}`}>
                {counts[item.key as keyof typeof counts]}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {t(`company.applicationStatus.${item.key}` as never)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {candidates.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Todavía no hay candidatos para esta oferta</p>
        </div>
      )}

      {candidates.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => {
              const avatar = toAbsoluteAssetUrl(candidate.avatarUrl, API);
              const cvUrl = toAbsoluteAssetUrl(candidate.resumeUrl, API);
              return (
                <div
                  key={`${candidate.applicationId}-${candidate.studentId ?? 'candidate'}`}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  <div className="bg-gradient-to-b from-green-50 to-white pt-6 pb-4 flex flex-col items-center gap-3 px-5">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={candidate.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-white shadow flex items-center justify-center text-green-700 font-bold text-xl">
                        {getDisplayInitial(candidate.name, candidate.email)}
                      </div>
                    )}
                    <div className="text-center">
                      <Link
                        href={candidate.profileHref}
                        className="font-semibold text-gray-900 hover:text-green-700 transition-colors text-base block"
                      >
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
                        Ver currículum
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 w-full border border-gray-200 text-gray-400 text-sm font-medium py-2 rounded-lg">
                        <DocumentTextIcon className="w-4 h-4" />
                        Ver currículum
                      </span>
                    )}
                    {candidate.email ? (
                      <a
                        href={`mailto:${candidate.email}`}
                        className="flex items-center justify-center gap-1.5 w-full border border-gray-200 hover:border-green-400 hover:text-green-700 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                        Enviar mensaje
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 w-full border border-gray-200 text-gray-400 text-sm font-medium py-2 rounded-lg">
                        <EnvelopeIcon className="w-4 h-4" />
                        Enviar mensaje
                      </span>
                    )}
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

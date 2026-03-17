import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  UserCircleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

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
    location?: string;
  };
}

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Sin revisar',
  VIEWED: 'Vista',
  INTERVIEW_REQUESTED: 'Entrevista',
  HIRED: 'Contratado',
  REJECTED: 'Rechazado',
};

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  VIEWED: 'bg-gray-100 text-gray-600',
  INTERVIEW_REQUESTED: 'bg-purple-100 text-purple-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default async function OfferCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: offerId } = await params;

  const cookieStore = await cookies();
  const token =
    cookieStore.get('access_token')?.value ??
    cookieStore.get('accessToken')?.value ??
    cookieStore.get('token')?.value ??
    '';

  const data = await safeFetch(`${API}/api/applications/companies/me`, token);
  const applications: ApplicationFromAPI[] = data?.applications ?? data?.data ?? [];

  const filtered = applications.filter((app) => app.offer?.id === offerId);
  const offerTitle = filtered[0]?.offer?.title ?? 'Oferta';
  const offerLocation = filtered[0]?.offer?.location ?? '';
  const contractType = filtered[0]?.offer?.contractType ?? '';

  const candidates = filtered.map((app) => {
    const candidateId = app.student?.id ?? app.student?.userId ?? app.id;
    const firstName = app.student?.firstName ?? '';
    const lastName = app.student?.lastName ?? '';
    const name =
      firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : app.student?.name ?? app.student?.email ?? 'Candidato';
    const location = [app.student?.city, app.student?.country]
      .filter(Boolean)
      .join(', ');
    return {
      applicationId: app.id,
      candidateId,
      name,
      email: app.student?.email ?? '',
      avatarUrl: app.student?.avatarUrl ?? app.student?.avatar ?? null,
      location,
      status: app.status,
      createdAt: app.createdAt,
    };
  });

  const counts = {
    SUBMITTED: candidates.filter((c) => c.status === 'SUBMITTED').length,
    VIEWED: candidates.filter((c) => c.status === 'VIEWED').length,
    INTERVIEW_REQUESTED: candidates.filter((c) => c.status === 'INTERVIEW_REQUESTED').length,
    HIRED: candidates.filter((c) => c.status === 'HIRED').length,
    REJECTED: candidates.filter((c) => c.status === 'REJECTED').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Volver */}
      <Link
        href="/intranet/company/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Volver a candidatos
      </Link>

      {/* Cabecera oferta */}
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
            href={`/intranet/company/offers/${offerId}/edit`}
            className="text-sm text-green-700 hover:text-green-900 font-medium transition-colors whitespace-nowrap"
          >
            Ver oferta →
          </Link>
        </div>

        {/* Stats por estado */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            { key: 'SUBMITTED', label: 'Sin revisar', color: 'text-blue-600' },
            { key: 'VIEWED', label: 'Vistas', color: 'text-gray-600' },
            { key: 'INTERVIEW_REQUESTED', label: 'Entrevista', color: 'text-purple-600' },
            { key: 'HIRED', label: 'Contratados', color: 'text-green-600' },
            { key: 'REJECTED', label: 'Rechazados', color: 'text-red-500' },
          ].map((item) => (
            <div key={item.key} className="text-center">
              <p className={`text-2xl font-bold ${item.color}`}>
                {counts[item.key as keyof typeof counts]}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sin candidatos */}
      {candidates.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            Todavía no hay candidatos para esta oferta
          </p>
        </div>
      )}

      {/* Grid de candidatos */}
      {candidates.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => {
              const avatar = buildAvatarUrl(candidate.avatarUrl);
              const statusLabel = STATUS_LABEL[candidate.status] ?? candidate.status;
              const statusColor =
                STATUS_COLOR[candidate.status] ?? 'bg-gray-100 text-gray-600';

              return (
                <div
                  key={candidate.applicationId}
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
                      <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-white shadow flex items-center justify-center">
                        <UserCircleIcon className="w-12 h-12 text-green-500" />
                      </div>
                    )}
                    <div className="text-center">
                      <Link
                        href={`/intranet/company/candidates/${candidate.candidateId}`}
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
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="px-5 pb-5 pt-3 flex flex-col gap-2 mt-auto">
                    <Link
                      href={`/intranet/company/candidates/${candidate.candidateId}`}
                      className="flex items-center justify-center gap-1.5 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      Ver currículum
                    </Link>
                    <a
                      href={`mailto:${candidate.email}`}
                      className="flex items-center justify-center gap-1.5 w-full border border-gray-200 hover:border-green-400 hover:text-green-700 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      Enviar mensaje
                    </a>
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

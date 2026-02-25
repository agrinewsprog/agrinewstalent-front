import { Offer } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ApplyButton } from './apply-button';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('token')?.value;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

async function getOffer(id: string): Promise<any | null> {
  try {
    const authHeader = await getAuthHeader();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/offers/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.offer ?? data.data ?? data;
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
}

async function getAlreadyApplied(offerId: string): Promise<boolean> {
  try {
    const authHeader = await getAuthHeader();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/applications/students/me`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader },
    });
    if (!res.ok) return false;
    const data = await res.json();
    const apps: { offerId?: number | string; offer?: { id?: number | string } }[] =
      data.applications ?? data.data ?? [];
    return apps.some(a => String(a.offerId ?? a.offer?.id) === String(offerId));
  } catch {
    return false;
  }
}

const contractTypeLabels: Record<string, string> = {
  'full-time': 'Tiempo completo',
  'part-time': 'Media jornada',
  internship: 'Prácticas',
  freelance: 'Freelance',
  FULL_TIME: 'Tiempo completo',
  PART_TIME: 'Media jornada',
  INTERNSHIP: 'Prácticas',
  FREELANCE: 'Freelance',
  REMOTE: 'Remoto',
  CONTRACT: 'Contrato',
};

const workModeLabels: Record<string, string> = {
  onsite: 'Presencial',
  remote: 'Remoto',
  hybrid: 'Híbrido',
  ONSITE: 'Presencial',
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
};

const experienceLevelLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Intermedio',
  senior: 'Senior',
  JUNIOR: 'Junior',
  MID: 'Intermedio',
  SENIOR: 'Senior',
};

export default async function OfferDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [offer, alreadyApplied] = await Promise.all([
    getOffer(id),
    getAlreadyApplied(id),
  ]);

  if (!offer) {
    notFound();
  }

  const contractType = offer.contractType ?? offer.type;
  const company = offer.company;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/intranet/student/offers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a ofertas
        </Link>
      </div>

      {/* Cabecera */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-4">
            {/* Logo empresa */}
            <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {(company?.companyName ?? 'E').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{offer.title}</h1>
                  <p className="text-gray-600 mt-0.5 font-medium">{company?.companyName ?? 'Empresa confidencial'}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {contractType && (
                    <Badge variant="default">{contractTypeLabels[contractType] ?? contractType}</Badge>
                  )}
                  {offer.workMode && (
                    <Badge variant="success">{workModeLabels[offer.workMode] ?? offer.workMode}</Badge>
                  )}
                </div>
              </div>

              {/* Datos rápidos */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                {(offer.location ?? (company?.city && `${company.city}${company.country ? ', ' + company.country : ''}`)) && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {offer.location ?? `${company?.city ?? ''}${company?.country ? ', ' + company.country : ''}`}
                  </span>
                )}
                {offer.salary && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {offer.salary}
                  </span>
                )}
                {offer.experienceLevel && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {experienceLevelLabels[offer.experienceLevel] ?? offer.experienceLevel}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Publicada: {new Date(offer.publishedAt ?? offer.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {offer._count?.applications != null && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {offer._count.applications} {offer._count.applications === 1 ? 'candidato' : 'candidatos'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Descripción */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">Descripción del puesto</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{offer.description}</p>
            </CardBody>
          </Card>

          {/* Requisitos */}
          {offer.requirements && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-800">Requisitos</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{offer.requirements}</p>
              </CardBody>
            </Card>
          )}

          {/* Botón aplicar */}
          <div className="pb-2">
            <ApplyButton offerId={String(offer.id)} alreadyApplied={alreadyApplied} />
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-800">Detalles del puesto</h2>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3 text-sm">
                {contractType && (
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Tipo de contrato</dt>
                    <dd className="text-gray-800 font-medium">{contractTypeLabels[contractType] ?? contractType}</dd>
                  </div>
                )}
                {offer.workMode && (
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Modalidad</dt>
                    <dd className="text-gray-800 font-medium">{workModeLabels[offer.workMode] ?? offer.workMode}</dd>
                  </div>
                )}
                {offer.experienceLevel && (
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Experiencia</dt>
                    <dd className="text-gray-800 font-medium">{experienceLevelLabels[offer.experienceLevel] ?? offer.experienceLevel}</dd>
                  </div>
                )}
                {offer.salary && (
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Salario</dt>
                    <dd className="text-gray-800 font-medium">{offer.salary}</dd>
                  </div>
                )}
                {(offer.location ?? company?.city) && (
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Ubicación</dt>
                    <dd className="text-gray-800 font-medium">
                      {offer.location ?? [company?.city, company?.country].filter(Boolean).join(', ')}
                    </dd>
                  </div>
                )}
                {offer.expiresAt && (
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Fecha límite</dt>
                    <dd className="text-gray-800 font-medium">{new Date(offer.expiresAt).toLocaleDateString('es-ES')}</dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Sobre la empresa */}
          {company && (
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-800">Sobre la empresa</h2>
              </CardHeader>
              <CardBody>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">
                        {(company.companyName ?? 'E').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800">{company.companyName}</p>
                </div>
                {company.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{company.description}</p>
                )}
                <dl className="space-y-1.5 text-sm">
                  {(company.city || company.country) && (
                    <div className="flex gap-2">
                      <dt className="text-gray-400 shrink-0">📍</dt>
                      <dd className="text-gray-700">{[company.city, company.country].filter(Boolean).join(', ')}</dd>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex gap-2">
                      <dt className="text-gray-400 shrink-0">🌐</dt>
                      <dd>
                        <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}




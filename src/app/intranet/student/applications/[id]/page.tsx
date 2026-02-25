import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApplicationTimeline } from '@/src/components/applications/application-timeline';

async function getApplication(id: string): Promise<Application | null> {
  try {
    const response = await api.get<any>(`/applications/${id}`);
    return (response.application ?? response.data ?? response) as Application;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}

function formatDate(value: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-ES', opts ?? { year: 'numeric', month: 'long', day: 'numeric' });
}

const statusLabels: Record<Application['status'], string> = {
  pending: 'Pendiente',
  reviewing: 'En revisión',
  interview: 'Entrevista',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

const statusVariants: Record<Application['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  reviewing: 'info',
  interview: 'default',
  accepted: 'success',
  rejected: 'danger',
};

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/intranet/student/applications"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Volver a aplicaciones
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {application.offer?.title || 'Sin título'}
              </h1>
              <p className="text-gray-600 mt-2">
                {application.offer?.company?.companyName || 'Empresa confidencial'}
              </p>
            </div>
            <Badge variant={statusVariants[application.status]}>
              {statusLabels[application.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Información de la aplicación</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Enviada: {formatDate(application.createdAt)}</p>
                <p>Última actualización: {formatDate(application.updatedAt)}</p>
              </div>
            </div>

            {application.coverLetter && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Carta de presentación</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {application.offer && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Sobre la oferta</h2>
                <p className="text-gray-700">
                  {application.offer.description}
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  <p>📍 {application.offer.location}</p>
                  {application.offer.salary && <p>💰 {application.offer.salary}</p>}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/intranet/student/offers/${application.offer.id ?? application.offerId}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 border border-green-600 hover:border-green-700 rounded-lg px-4 py-2 transition-colors"
                  >
                    Ver oferta completa
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {application.timeline && application.timeline.length > 0 && (
        <ApplicationTimeline timeline={application.timeline} />
      )}
    </div>
  );
}

'use client';

import { Application } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';

interface ApplicationsListProps {
  applications: Application[];
  showOffer?: boolean;
  showStudent?: boolean;
  onStatusChange?: (applicationId: string, status: Application['status']) => void;
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

export function ApplicationsList({
  applications,
  showOffer = true,
  showStudent = false,
  onStatusChange,
}: ApplicationsListProps) {
  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              No hay aplicaciones
            </p>
          </CardBody>
        </Card>
      ) : (
        applications.map((application) => (
          <Card key={application.id}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {showOffer && application.offer && (
                      <Link
                        href={`/intranet/student/applications/${application.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {application.offer.title}
                      </Link>
                    )}
                    {showStudent && application.student && (
                      <Link
                        href={`/intranet/company/applications/${application.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {application.student.name}
                      </Link>
                    )}
                  </div>

                  {showOffer && application.offer?.company && (
                    <p className="text-gray-600">
                      {application.offer.company.companyName}
                    </p>
                  )}

                  {showStudent && application.student?.university && (
                    <p className="text-gray-600">
                      {application.student.university.universityName}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Enviada: {new Date(application.createdAt).toLocaleDateString('es-ES')}
                    </span>
                    {application.timeline && application.timeline.length > 0 && (
                      <span>
                        Última actualización:{' '}
                        {new Date(
                          application.timeline[application.timeline.length - 1].createdAt
                        ).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>

                  {application.coverLetter && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Carta de presentación:
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col items-end gap-2">
                  <Badge variant={statusVariants[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>

                  {onStatusChange && (
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      value={application.status}
                      onChange={(e) =>
                        onStatusChange(application.id, e.target.value as Application['status'])
                      }
                    >
                      <option value="pending">Pendiente</option>
                      <option value="reviewing">En revisión</option>
                      <option value="interview">Entrevista</option>
                      <option value="accepted">Aceptada</option>
                      <option value="rejected">Rechazada</option>
                    </select>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}

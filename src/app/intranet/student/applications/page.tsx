import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Application } from '@/src/types';
import Link from 'next/link';

export default async function StudentApplications() {
  // Aquí irá la llamada a la API para obtener las aplicaciones del estudiante
  const applications: Application[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Aplicaciones</h1>
        <p className="text-gray-600 mt-2">
          Seguimiento de tus postulaciones
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {applications.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-600 py-8">
                No has aplicado a ninguna oferta todavía
              </p>
              <div className="text-center mt-4">
                <Link
                  href="/intranet/student/offers"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver ofertas disponibles →
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/intranet/student/applications/${application.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {application.offer?.title ?? 'Sin título'}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {application.offer?.company?.companyName ?? 'Sin empresa'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Enviada el{' '}
                      {new Date(application.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <Badge variant="warning">En revisión</Badge>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

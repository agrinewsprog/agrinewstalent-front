import { Card, CardBody } from '@/src/components/ui/card';
import { Application } from '@/src/types';
import Link from 'next/link';
import { api } from '@/src/lib/api/client';
import { ApplicationsList } from '@/src/components/applications/applications-list';

async function getApplications(): Promise<Application[]> {
  try {
    const response = await api.get<{ data: Application[] }>('/applications/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export default async function StudentApplications() {
  const applications = await getApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Aplicaciones</h1>
        <p className="text-gray-600 mt-2">
          Seguimiento de tus postulaciones
        </p>
      </div>

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
        <ApplicationsList applications={applications} showOffer={true} />
      )}
    </div>
  );
}

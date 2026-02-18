import { Card, CardBody } from '@/src/components/ui/card';
import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { ApplicationsListCompany } from './applications-list-company';

async function getApplications(): Promise<Application[]> {
  try {
    const response = await api.get<{ data: Application[] }>('/applications/company');
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export default async function CompanyApplications() {
  const applications = await getApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aplicaciones</h1>
        <p className="text-gray-600 mt-2">
          Revisa las candidaturas recibidas
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              No hay aplicaciones todavía
            </p>
          </CardBody>
        </Card>
      ) : (
        <ApplicationsListCompany applications={applications} />
      )}
    </div>
  );
}

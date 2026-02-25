import { Card, CardBody } from '@/src/components/ui/card';
import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { ApplicationsListCompany } from './applications-list-company';
import { cookies } from 'next/headers';

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

async function getApplications(): Promise<Application[]> {
  try {
    const authHeader = await getAuthHeader();
    const response = await api.get<{ applications?: Application[]; data?: Application[] }>(
      '/applications/companies/me',
      { headers: authHeader }
    );
    return response.applications ?? response.data ?? [];
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

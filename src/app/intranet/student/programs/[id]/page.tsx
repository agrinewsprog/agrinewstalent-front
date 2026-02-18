import { api } from '@/src/lib/api/client';
import { Program, Offer, Company } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StudentProgramDetail } from './program-detail-client';

async function getProgram(id: string): Promise<Program | null> {
  try {
    const response = await api.get<{ data: Program }>(`/programs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching program:', error);
    return null;
  }
}

async function getProgramOffers(id: string): Promise<Offer[]> {
  try {
    const response = await api.get<{ data: Offer[] }>(`/programs/${id}/offers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

async function getProgramCompanies(id: string): Promise<Company[]> {
  try {
    const response = await api.get<{ data: Company[] }>(`/programs/${id}/companies`);
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  closed: 'Cerrado',
};

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'warning',
  active: 'success',
  closed: 'default',
};

export default async function StudentProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [program, offers, companies] = await Promise.all([
    getProgram(params.id),
    getProgramOffers(params.id),
    getProgramCompanies(params.id),
  ]);

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/intranet/student/programs"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Volver a programas
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
              {program.university && (
                <p className="text-gray-600 mt-2">{program.university.universityName}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>
                  📅 {new Date(program.startDate).toLocaleDateString('es-ES')} - {' '}
                  {new Date(program.endDate).toLocaleDateString('es-ES')}
                </span>
                <Badge variant={statusVariants[program.status]}>
                  {statusLabels[program.status]}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-gray-700 whitespace-pre-line">{program.description}</p>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{offers.length}</p>
              <p className="text-sm text-gray-600 mt-1">Ofertas disponibles</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{companies.length}</p>
              <p className="text-sm text-gray-600 mt-1">Empresas participantes</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <StudentProgramDetail 
        programId={program.id}
        offers={offers}
        companies={companies}
      />
    </div>
  );
}

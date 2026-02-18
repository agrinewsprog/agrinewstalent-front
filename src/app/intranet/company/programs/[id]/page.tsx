import { api } from '@/src/lib/api/client';
import { Program, Offer } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CompanyProgramActions } from './program-actions';

async function getProgram(id: string): Promise<Program | null> {
  try {
    const response = await api.get<{ data: Program }>(`/programs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching program:', error);
    return null;
  }
}

async function getMyOffers(): Promise<Offer[]> {
  try {
    const response = await api.get<{ data: Offer[] }>('/offers/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
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

export default async function CompanyProgramDetail({
  params,
}: {
  params: { id: string };
}) {
  const [program, myOffers] = await Promise.all([
    getProgram(params.id),
    getMyOffers(),
  ]);

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/intranet/company/programs"
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

      <CompanyProgramActions 
        programId={program.id}
        myOffers={myOffers}
      />
    </div>
  );
}

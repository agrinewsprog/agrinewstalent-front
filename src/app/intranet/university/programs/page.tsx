import { api } from '@/src/lib/api/client';
import { Program } from '@/src/types';
import { ProgramsList } from '@/src/components/programs/programs-list';
import { Button } from '@/src/components/ui/button';
import { Card, CardBody } from '@/src/components/ui/card';
import Link from 'next/link';

async function getPrograms(): Promise<Program[]> {
  try {
    const response = await api.get<{ data: Program[] }>('/programs/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
}

export default async function UniversityPrograms() {
  const programs = await getPrograms();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los programas de empleo de tu universidad
          </p>
        </div>
        <Link href="/intranet/university/programs/new">
          <Button>Nuevo Programa</Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay programas creados
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primer programa para conectar estudiantes con empresas
              </p>
              <Link href="/intranet/university/programs/new">
                <Button>Crear primer programa</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <ProgramsList programs={programs} role="university" />
      )}
    </div>
  );
}

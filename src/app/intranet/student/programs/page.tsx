import { api } from '@/src/lib/api/client';
import { Program } from '@/src/types';
import { ProgramsList } from '@/src/components/programs/programs-list';
import { Card, CardBody } from '@/src/components/ui/card';

async function getPrograms(): Promise<Program[]> {
  try {
    const response = await api.get<{ data: Program[] }>('/programs/university');
    return response.data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
}

export default async function StudentPrograms() {
  const programs = await getPrograms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Programas</h1>
        <p className="text-gray-600 mt-2">
          Programas de prácticas de tu universidad
        </p>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              No hay programas disponibles
            </p>
          </CardBody>
        </Card>
      ) : (
        <ProgramsList programs={programs} role="student" />
      )}
    </div>
  );
}

import { Card, CardBody, CardHeader } from '@/src/components/ui/card';

export default async function StudentPrograms() {
  const programs = [];

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
      ) : null}
    </div>
  );
}

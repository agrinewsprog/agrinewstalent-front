import { Card, CardBody } from '@/src/components/ui/card';

export default async function UniversityStudents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
        <p className="text-gray-600 mt-2">
          Gestiona los estudiantes de tu universidad
        </p>
      </div>

      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">
            Lista de estudiantes
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

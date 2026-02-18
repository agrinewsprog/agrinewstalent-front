import { Card, CardBody } from '@/src/components/ui/card';

export default async function UniversityInvites() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invitaciones</h1>
        <p className="text-gray-600 mt-2">
          Invita estudiantes a unirse a tu universidad
        </p>
      </div>

      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">
            No hay invitaciones enviadas
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

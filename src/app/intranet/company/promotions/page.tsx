import { Card, CardBody } from '@/src/components/ui/card';

export default async function CompanyPromotions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tus campañas promocionales
        </p>
      </div>

      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">
            No hay promociones activas
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

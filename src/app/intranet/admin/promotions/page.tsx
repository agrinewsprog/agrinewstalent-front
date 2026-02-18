import { Card, CardBody } from '@/src/components/ui/card';

export default async function AdminPromotions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
        <p className="text-gray-600 mt-2">Gestión de promociones del sistema</p>
      </div>

      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">Lista de promociones</p>
        </CardBody>
      </Card>
    </div>
  );
}

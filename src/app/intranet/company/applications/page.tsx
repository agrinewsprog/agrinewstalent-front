import { Card, CardBody } from '@/src/components/ui/card';

export default async function CompanyApplications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aplicaciones</h1>
        <p className="text-gray-600 mt-2">
          Revisa las candidaturas recibidas
        </p>
      </div>

      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">
            No hay aplicaciones todavía
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

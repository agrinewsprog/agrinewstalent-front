import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { getSession } from '@/src/lib/auth/session';

export default async function CompanyProfile() {
  const user = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil de Empresa</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la información de tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Información de la empresa</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <p className="text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

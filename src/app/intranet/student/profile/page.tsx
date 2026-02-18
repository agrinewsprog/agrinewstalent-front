import { getSession } from '@/src/lib/auth/session';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';

export default async function StudentProfile() {
  const user = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu información personal y profesional
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Información personal</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <p className="text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <p className="text-gray-900">-</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <p className="text-gray-900">-</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Formación académica</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">
            Completa tu perfil académico para mejorar tus oportunidades
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Experiencia profesional</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">
            Añade tu experiencia laboral relevante
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

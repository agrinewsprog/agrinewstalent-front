import { Card, CardBody } from '@/src/components/ui/card';
import { getSession } from '@/src/lib/auth/session';

export default async function UniversityProfile() {
  const user = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil de Universidad</h1>
      </div>

      <Card>
        <CardBody>
          <p className="text-gray-900">{user?.name}</p>
          <p className="text-gray-600">{user?.email}</p>
        </CardBody>
      </Card>
    </div>
  );
}

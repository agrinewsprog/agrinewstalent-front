import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

export default async function StudentNotifications() {
  const notifications = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
        <p className="text-gray-600 mt-2">
          Mantente al día con tus actividades
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              No tienes notificaciones nuevas
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

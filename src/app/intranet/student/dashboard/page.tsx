import { getSession } from '@/src/lib/auth/session';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { PromotionsBanner } from '@/src/components/promotions/promotions-banner';
import { Promotion } from '@/src/types';
import Link from 'next/link';

async function getPromotions(): Promise<Promotion[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promotions/active`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }
}

export default async function StudentDashboard() {
  const user = await getSession();
  const promotions = await getPromotions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* Promotions Banner */}
      {promotions.length > 0 && <PromotionsBanner promotions={promotions} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Aplicaciones activas</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Entrevistas</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Nuevas ofertas</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Aplicaciones recientes</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Ingeniero Agrónomo Junior</h3>
                <p className="text-sm text-gray-600">Empresa Agro S.A.</p>
              </div>
              <Badge variant="warning">En revisión</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Técnico de Campo</h3>
                <p className="text-sm text-gray-600">AgroTech Solutions</p>
              </div>
              <Badge variant="success">Entrevista programada</Badge>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/intranet/student/applications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

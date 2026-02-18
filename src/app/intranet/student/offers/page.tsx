import { api } from '@/src/lib/api/client';
import { Offer, CourseEnrollment } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { OffersPageClient } from './page.client';
import Link from 'next/link';

// Ejemplo de llamada a API desde server component
async function getOffers(): Promise<Offer[]> {
  try {
    const response = await api.get<{ data: Offer[] }>('/offers');
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

async function getEnrollments(): Promise<CourseEnrollment[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/enrollments`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
}

export default async function StudentOffers() {
  const [offers, enrollments] = await Promise.all([
    getOffers(),
    getEnrollments(),
  ]);

  // Check if user has completed all required courses
  const requiredCourses = enrollments.filter((e) => e.course?.required);
  const completedRequiredCourses = requiredCourses.filter(
    (e) => e.status === 'completed'
  );
  const hasAccessToOffers = requiredCourses.length === 0 || requiredCourses.length === completedRequiredCourses.length;

  // If required courses not completed, show gating message
  if (!hasAccessToOffers) {
    const pendingCount = requiredCourses.length - completedRequiredCourses.length;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ofertas de empleo</h1>
          <p className="text-gray-600 mt-2">
            Completa los cursos obligatorios para acceder
          </p>
        </div>

        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="mb-6">
                <span className="text-6xl">🔒</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Acceso restringido
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Para acceder a la bolsa de empleos, primero debes completar{' '}
                <span className="font-semibold text-gray-900">
                  {pendingCount} curso{pendingCount > 1 ? 's' : ''} obligatorio{pendingCount > 1 ? 's' : ''}
                </span>
                .
              </p>

              {/* List of pending required courses */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center justify-center gap-2">
                  <span>⚠️</span>
                  Cursos pendientes
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {requiredCourses
                    .filter((e) => e.status !== 'completed')
                    .map((enrollment) => (
                      <li key={enrollment.id} className="flex items-center justify-center gap-2">
                        <span>•</span>
                        {enrollment.course?.title}
                      </li>
                    ))}
                </ul>
              </div>

              <Link
                href="/intranet/student/courses"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Ir a mis cursos
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ofertas de empleo</h1>
        <p className="text-gray-600 mt-2">
          Explora las últimas oportunidades disponibles
        </p>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              No hay ofertas disponibles en este momento
            </p>
          </CardBody>
        </Card>
      ) : (
        <OffersPageClient initialOffers={offers} />
      )}
    </div>
  );
}

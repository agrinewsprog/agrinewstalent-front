import { getTranslations } from 'next-intl/server';
import { api } from '@/src/lib/api/client';
import { Offer, CourseEnrollment } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { OffersPageClient } from './page.client';
import Link from 'next/link';
import { cookies } from 'next/headers';

// Lee el token de las cookies para pasarlo en SSR
async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('token')?.value;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

async function getOffers(): Promise<Offer[]> {
  try {
    const authHeader = await getAuthHeader();
    const response = await api.get<{ data?: Offer[]; offers?: Offer[] } | Offer[]>('/offers', {
      headers: authHeader,
    });
    // La API puede devolver: array directo, { data: [...] } o { offers: [...] }
    if (Array.isArray(response)) return response;
    const wrapped = response as { data?: Offer[]; offers?: Offer[] };
    return wrapped.data ?? wrapped.offers ?? [];
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

async function getEnrollments(): Promise<CourseEnrollment[]> {
  try {
    const authHeader = await getAuthHeader();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${API}/api/courses/enrollments`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
}

async function getSavedOfferIds(): Promise<string[]> {
  try {
    const authHeader = await getAuthHeader();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/saved-offers`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const saved: { offerId?: number | string; offer?: { id?: number | string } }[] =
      data.savedOffers ?? data.data ?? [];
    return saved
      .map(s => String(s.offerId ?? s.offer?.id ?? ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function getAppliedOfferIds(): Promise<string[]> {
  try {
    const authHeader = await getAuthHeader();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/applications/students/me`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const apps: { offerId?: number | string; offer?: { id?: number | string } }[] =
      data.applications ?? data.data ?? [];
    return apps
      .map(a => String(a.offerId ?? a.offer?.id ?? ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function StudentOffers() {
  const t = await getTranslations('intranet');
  const [offers, enrollments, appliedOfferIds, savedOfferIds] = await Promise.all([
    getOffers(),
    getEnrollments(),
    getAppliedOfferIds(),
    getSavedOfferIds(),
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
          <h1 className="text-3xl font-bold text-gray-900">{t('student.offers.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('student.offers.locked.subtitle')}
          </p>
        </div>

        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="mb-6">
                <span className="text-6xl">🔒</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('student.offers.locked.title')}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('student.offers.locked.descBefore')}{' '}
                <span className="font-semibold text-gray-900">
                  {pendingCount === 1
                    ? t('student.offers.locked.coursesSingular')
                    : t('student.offers.locked.coursesPlural', { count: pendingCount })}
                </span>
                .
              </p>

              {/* List of pending required courses */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center justify-center gap-2">
                  <span>⚠️</span>
                  {t('student.offers.locked.pendingCourses')}
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
                {t('student.offers.locked.goToCourses')}
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
        <h1 className="text-3xl font-bold text-gray-900">{t('student.offers.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('student.offers.subtitle')}
        </p>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              {t('student.offers.empty')}
            </p>
          </CardBody>
        </Card>
      ) : (
        <OffersPageClient initialOffers={offers} initialAppliedIds={appliedOfferIds} initialSavedIds={savedOfferIds} />
      )}
    </div>
  );
}

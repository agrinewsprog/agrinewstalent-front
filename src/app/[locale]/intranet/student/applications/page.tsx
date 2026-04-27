import { Card, CardBody } from '@/components/ui/card';
import Link from 'next/link';
import { ApplicationsList } from '@/components/applications/applications-list';
import { cookies } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import {
  unwrapCollection,
} from '@/lib/frontend/contracts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

async function safeFetch(url: string, headers: Record<string, string>) {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface NormalizedApplication {
  id: string;
  applicationId: string;
  source: 'job' | 'program' | 'application';
  offerId: string;
  offerTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyCity: string | null;
  status: string;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string | null;
  description: string | null;
  /** if non-null the application belongs to a program */
  programContext: { programId: string; programOfferId: string; programTitle: string } | null;
  /** keep original for detail panel */
  _raw: any;
}

async function getCanonicalApplications(authHeader: Record<string, string>): Promise<Record<string, unknown>[]> {
  const appsData = await safeFetch(`${API}/api/applications/students/me`, authHeader);
  return unwrapCollection<Record<string, unknown>>(appsData, ['applications', 'data']);
}

export default async function StudentApplications() {
  const authHeader = await getAuthHeader();
  const applications = await getCanonicalApplications(authHeader);
  const t = await getTranslations('intranet');
  const locale = await getLocale();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('student.applications.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('student.applications.subtitle')}
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              {t('student.applications.empty')}
            </p>
            <div className="text-center mt-4">
              <Link
                href={`/${locale}/intranet/student/offers`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('student.applications.browseOffers')}
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <ApplicationsList applications={applications} showOffer={true} locale={locale} />
      )}
    </div>
  );
}

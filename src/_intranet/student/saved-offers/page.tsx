import { cookies } from 'next/headers';
import { Card, CardBody } from '@/src/components/ui/card';
import Link from 'next/link';
import { SavedOffersClient } from './saved-offers-client';
import { getTranslations } from 'next-intl/server';

interface JobOffer {
  id: number;
  title: string;
  description?: string;
  location?: string;
  jobType?: string;
  salary?: string;
  status: string;
  company?: { name?: string; logoUrl?: string };
}

export interface SavedOfferItem {
  id: number;
  offerId: number;
  createdAt: string;
  offer: JobOffer;
}

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

async function getSavedOffers(): Promise<SavedOfferItem[]> {
  try {
    const authHeader = await getAuthHeader();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/saved-offers`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.savedOffers ?? [];
  } catch {
    return [];
  }
}

async function getAppliedOfferIds(): Promise<number[]> {
  try {
    const authHeader = await getAuthHeader();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/applications/students/me`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeader },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const apps: { offerId?: number; offer?: { id?: number } }[] = data.applications ?? data.data ?? [];
    return apps.map(a => a.offerId ?? a.offer?.id).filter(Boolean) as number[];
  } catch {
    return [];
  }
}

export default async function SavedOffersPage() {
  const [savedOffers, appliedOfferIds] = await Promise.all([
    getSavedOffers(),
    getAppliedOfferIds(),
  ]);
  const t = await getTranslations('intranet');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('student.savedOffers.title')}</h1>
        <p className="text-gray-600 mt-2">{t('student.savedOffers.subtitle')}</p>
      </div>

      {savedOffers.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              {t('student.savedOffers.empty')}
            </p>
            <div className="text-center mt-4">
              <Link
                href="/intranet/student/offers"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('student.savedOffers.explore')}
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <SavedOffersClient initialItems={savedOffers} initialAppliedIds={appliedOfferIds} />
      )}
    </div>
  );
}

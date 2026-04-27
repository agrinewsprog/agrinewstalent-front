'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../../_components/OfferFormUI';

interface RawOffer {
  id: number | string;
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  workMode?: string;
  contractType?: string;
  [key: string]: unknown;
}

function mapOfferToFormValues(offer: RawOffer): Partial<OfferFormValues> {
  const workMode = offer.workMode ?? 'ON_SITE';
  const contractType = offer.contractType ?? 'FULL_TIME';
  return {
    titulo: (offer.title as string) ?? '',
    pais: (offer.location as string) ?? 'España',
    modalidad: workMode as string,
    tipoContrato: contractType as string,
    jornada: contractType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME',
    categoria: contractType === 'INTERNSHIP' ? 'INTERNSHIP' : 'EMPLOYMENT',
    descripcion: (offer.description as string) ?? '',
    requisitos: (offer.requirements as string) ?? '',
  };
}

export default function EditOfferPage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('intranet');

  const offerId = params.id;

  const [offer, setOffer] = useState<RawOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!offerId) return;
    (async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || '';
        const url = `${API}/api/offers/${offerId}`;

        const res = await fetch(url, { credentials: 'include' });

        if (!res.ok) {
          setFetchError(true);
          setLoading(false);
          return;
        }

        const json = await res.json();

        // Backend may wrap: { data: {...} }, { offer: {...} }, or flat
        const raw: RawOffer = json?.data ?? json?.offer ?? json;
        setOffer(raw);
      } catch (err) {
        console.error('[edit-offer] fetch error', err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [offerId]);

  const handleSubmit = async (values: OfferFormValues) => {
    const body = formToApiBody(values);
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${API}/api/offers/${offerId}`;

    const res = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? `HTTP ${res.status}`);
    }

    router.push(`/${locale}/intranet/company/offers`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (fetchError || !offer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
        <p className="text-lg font-medium">{t('company.offerFormUI.errorOccurred')}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-green-600 hover:underline"
        >
          ← {t('company.offerFormUI.cancel')}
        </button>
      </div>
    );
  }

  return (
    <OfferFormUI
      title={`${t('company.offerFormUI.editTitle')} > ${offer.title ?? ''}`}
      initialValues={mapOfferToFormValues(offer)}
      onSubmit={handleSubmit}
    />
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../../../../../offers/_components/OfferFormUI';
import { useToast } from '@/hooks/use-toast';
import { buildCompanyOfferHref, buildCompanyProgramsHref } from '@/lib/utils';

type ProgramOfferPayload = {
  programOfferId?: number | string;
  programId?: number | string;
  jobOfferId?: number | string | null;
  title?: string | null;
  description?: string | null;
  requirements?: string | null;
  location?: string | null;
  workMode?: string | null;
  contractType?: string | null;
  program?: { title?: string | null } | null;
};

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const obj = payload as { message?: unknown; error?: { message?: unknown } };
  if (typeof obj.error?.message === 'string' && obj.error.message.trim()) return obj.error.message;
  if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
  return fallback;
}

function mapOfferToFormValues(offer: ProgramOfferPayload): Partial<OfferFormValues> {
  const contractType = offer.contractType ?? 'FULL_TIME';
  return {
    titulo: offer.title ?? '',
    pais: offer.location ?? 'Espana',
    modalidad: offer.workMode ?? 'ON_SITE',
    tipoContrato: contractType,
    jornada: contractType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME',
    categoria: contractType === 'INTERNSHIP' ? 'INTERNSHIP' : 'EMPLOYMENT',
    descripcion: offer.description ?? '',
    requisitos: offer.requirements ?? '',
  };
}

export default function EditProgramOfferPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('intranet');
  const { success, error: showError } = useToast();
  const params = useParams<{ programId: string; programOfferId: string }>();

  const programId = params.programId;
  const programOfferId = params.programOfferId;

  const [programOffer, setProgramOffer] = useState<ProgramOfferPayload | null>(null);
  const [programName, setProgramName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId || !programOfferId) return;

    (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/programs/companies/me/offers?programId=${programId}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => null);
          throw new Error(extractErrorMessage(errorPayload, t('company.offerFormUI.errorOccurred')));
        }

        const json = await res.json();
        const list = json?.offers ?? json?.programOffers ?? json?.data ?? [];
        const rawOffer = Array.isArray(list)
          ? list.find((item) => String(item?.programOfferId ?? item?.id) === String(programOfferId))
          : null;

        if (!rawOffer) {
          throw new Error(t('company.offerFormUI.errorOccurred'));
        }

        setProgramOffer(rawOffer);
        const nextProgramName =
          rawOffer?.program?.title ??
          rawOffer?.programTitle ??
          undefined;
        if (nextProgramName) setProgramName(nextProgramName);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('company.offerFormUI.errorOccurred');
        setFetchError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [programId, programOfferId, t]);

  const handleSubmit = async (values: OfferFormValues) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const body = formToApiBody(values);

    const res = await fetch(`${apiUrl}/api/companies/me/programs/${programId}/offers/${programOfferId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(extractErrorMessage(payload, t('company.offerFormUI.errorOccurred')));
    }

    const updatedProgramOffer = payload?.programOffer ?? null;
    const nextProgramId = String(updatedProgramOffer?.programId ?? programId);
    const nextProgramOfferId = updatedProgramOffer?.programOfferId != null
      ? String(updatedProgramOffer.programOfferId)
      : String(programOfferId);
    const nextJobOfferId = updatedProgramOffer?.jobOfferId != null
      ? String(updatedProgramOffer.jobOfferId)
      : (programOffer?.jobOfferId != null ? String(programOffer.jobOfferId) : null);

    success(extractErrorMessage(payload, t('common.feedback.saved')));

    if (nextJobOfferId) {
      router.push(buildCompanyOfferHref(locale, nextJobOfferId, nextProgramId, nextProgramOfferId));
    } else {
      router.push(buildCompanyProgramsHref(locale, nextProgramId));
    }
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
      </div>
    );
  }

  if (!programOffer || fetchError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-gray-500">
        <p className="text-lg font-medium">{fetchError ?? t('company.offerFormUI.errorOccurred')}</p>
        <button
          onClick={() => {
            showError(fetchError ?? t('company.offerFormUI.errorOccurred'));
            router.push(buildCompanyProgramsHref(locale, programId));
          }}
          className="mt-4 text-green-600 hover:underline"
        >
          {t('company.programOffers.backToProgram')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={buildCompanyProgramsHref(locale, programId)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('company.programOffers.backToProgram')}
      </Link>

      <OfferFormUI
        title={`${t('company.offerFormUI.editTitle')} > ${programOffer.title ?? ''}`}
        initialValues={mapOfferToFormValues(programOffer)}
        onSubmit={handleSubmit}
        programId={programId}
        programName={programName}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../../../offers/_components/OfferFormUI';
import { useToast } from '@/hooks/use-toast';
import { buildCompanyOfferHref, buildCompanyProgramsHref } from '@/lib/utils';

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const obj = payload as { message?: unknown; error?: { message?: unknown } };
  if (typeof obj.error?.message === 'string' && obj.error.message.trim()) return obj.error.message;
  if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
  return fallback;
}

export default function NewOfferForProgramPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('intranet');
  const params = useParams<{ programId: string }>();
  const programId = params.programId;
  const { success, error: showError } = useToast();

  const [programName, setProgramName] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${API}/api/programs/${programId}`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const json = await res.json();
        const prog = json?.program ?? json?.data ?? json;
        const name = prog?.title ?? prog?.name ?? '';
        if (name) setProgramName(name);
      } catch {
        /* ignore – banner will just say "this program" */
      }
    })();
  }, [programId]);

  const handleSubmit = async (values: OfferFormValues) => {
    const body = formToApiBody(values);
    const API = process.env.NEXT_PUBLIC_API_URL || '';

    const res = await fetch(`${API}/api/companies/me/programs/${programId}/offers`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(extractErrorMessage(payload, t('company.offerFormUI.errorOccurred')));
    }

    const programOffer = payload?.programOffer ?? null;
    const nextProgramId = String(programOffer?.programId ?? programId);
    const nextProgramOfferId = programOffer?.programOfferId != null
      ? String(programOffer.programOfferId)
      : null;
    const nextJobOfferId = programOffer?.jobOfferId != null
      ? String(programOffer.jobOfferId)
      : null;

    success(extractErrorMessage(payload, t('company.programOffers.offerSentForReview')));

    if (nextJobOfferId && nextProgramOfferId) {
      router.push(buildCompanyOfferHref(locale, nextJobOfferId, nextProgramId, nextProgramOfferId));
    } else {
      router.push(buildCompanyProgramsHref(locale, nextProgramId));
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Link
        href={buildCompanyProgramsHref(locale, programId)}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('company.programOffers.backToProgram')}
      </Link>

      <OfferFormUI
        title={t('company.programOffers.title')}
        onSubmit={handleSubmit}
        programId={programId}
        programName={programName}
      />
    </div>
  );
}

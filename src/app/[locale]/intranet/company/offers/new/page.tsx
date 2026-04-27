'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../_components/OfferFormUI';

export default function NewOfferPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('intranet');
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId') ?? undefined;

  const [programName, setProgramName] = useState<string | undefined>(undefined);

  /* Fetch program name when programId is present */
  useEffect(() => {
    if (!programId) return;
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
        /* silently ignore – the banner will just say "this program" */
      }
    })();
  }, [programId]);

  const handleSubmit = async (values: OfferFormValues) => {
    const body = formToApiBody(values);
    const API = process.env.NEXT_PUBLIC_API_URL || '';

    if (programId) {
      /* Create offer directly inside the program */
      const res = await fetch(`${API}/api/programs/${programId}/offers`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      router.push(`/${locale}/intranet/company/programs/${programId}`);
    } else {
      /* Normal offer creation */
      const res = await fetch(`${API}/api/offers`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      router.push(`/${locale}/intranet/company/offers`);
    }
  };

  const title = programId
    ? t('company.offerFormUI.createTitleForProgram')
    : t('company.offerFormUI.createTitle');

  return (
    <OfferFormUI
      title={title}
      onSubmit={handleSubmit}
      programId={programId}
      programName={programName}
    />
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/src/lib/api/client';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../_components/OfferFormUI';

export default function NewOfferPage() {
  const router = useRouter();
  const t = useTranslations('intranet');

  const handleSubmit = async (values: OfferFormValues) => {
    const body = formToApiBody(values);
    await api.post('/offers', body);
    router.push('/intranet/company/offers');
  };

  return (
    <OfferFormUI
      title={t('company.offerFormUI.createTitle')}
      onSubmit={handleSubmit}
    />
  );
}

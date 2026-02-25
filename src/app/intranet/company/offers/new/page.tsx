'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../_components/OfferFormUI';

export default function NewOfferPage() {
  const router = useRouter();

  const handleSubmit = async (values: OfferFormValues) => {
    const body = formToApiBody(values);
    await api.post('/offers', body);
    router.push('/intranet/company/offers');
  };

  return (
    <OfferFormUI
      title="Publicar una vacante"
      onSubmit={handleSubmit}
    />
  );
}

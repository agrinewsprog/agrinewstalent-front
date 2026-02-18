import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';
import { notFound } from 'next/navigation';
import { EditOfferClient } from './edit-client';

async function getOffer(id: string): Promise<Offer | null> {
  try {
    const response = await api.get<{ data: Offer }>(`/offers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
}

export default async function EditOfferPage({
  params,
}: {
  params: { id: string };
}) {
  const offer = await getOffer(params.id);

  if (!offer) {
    notFound();
  }

  return <EditOfferClient offer={offer} />;
}

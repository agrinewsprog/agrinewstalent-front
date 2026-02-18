'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';
import { OffersList } from '@/src/components/offers/offers-list';
import { useToast } from '@/src/hooks/use-toast';

interface OffersPageClientProps {
  initialOffers: Offer[];
}

export function OffersPageClient({ initialOffers }: OffersPageClientProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [savedOffers, setSavedOffers] = useState<string[]>([]);

  const handleApply = async (offerId: string) => {
    try {
      await api.post(`/applications`, { offerId });
      success('¡Aplicación enviada correctamente!');
      router.push('/intranet/student/applications');
    } catch (err) {
      showError('Error al enviar la aplicación');
      console.error(err);
    }
  };

  const handleSave = async (offerId: string) => {
    try {
      if (savedOffers.includes(offerId)) {
        // Unsave
        await api.delete(`/saved-offers/${offerId}`);
        setSavedOffers((prev) => prev.filter((id) => id !== offerId));
        success('Oferta eliminada de guardadas');
      } else {
        // Save
        await api.post(`/saved-offers`, { offerId });
        setSavedOffers((prev) => [...prev, offerId]);
        success('Oferta guardada correctamente');
      }
    } catch (err) {
      showError('Error al guardar la oferta');
      console.error(err);
    }
  };

  return (
    <OffersList
      offers={initialOffers}
      onApply={handleApply}
      onSave={handleSave}
      savedOffers={savedOffers}
    />
  );
}

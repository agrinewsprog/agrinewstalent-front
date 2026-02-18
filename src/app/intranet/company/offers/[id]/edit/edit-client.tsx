'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';
import { OfferForm, OfferFormData } from '@/src/components/offers/offer-form';
import { useToast } from '@/src/hooks/use-toast';

interface EditOfferClientProps {
  offer: Offer;
}

export function EditOfferClient({ offer }: EditOfferClientProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const handleSubmit = async (data: OfferFormData) => {
    try {
      await api.put(`/offers/${offer.id}`, data);
      success('Oferta actualizada correctamente');
      router.push('/intranet/company/offers');
    } catch (err) {
      showError('Error al actualizar la oferta');
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Oferta</h1>
        <p className="text-gray-600 mt-2">
          Modifica los detalles de la oferta
        </p>
      </div>

      <OfferForm
        offer={offer}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

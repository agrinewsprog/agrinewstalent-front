'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { OfferForm, OfferFormData } from '@/src/components/offers/offer-form';
import { useToast } from '@/src/hooks/use-toast';

export default function NewOfferPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const handleSubmit = async (data: OfferFormData) => {
    try {
      await api.post('/offers', data);
      success('Oferta creada correctamente');
      router.push('/intranet/company/offers');
    } catch (err) {
      showError('Error al crear la oferta');
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Oferta</h1>
        <p className="text-gray-600 mt-2">
          Publica una nueva oferta de empleo
        </p>
      </div>

      <OfferForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

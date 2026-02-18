'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Offer } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';
import { api } from '@/src/lib/api/client';
import { useToast } from '@/src/hooks/use-toast';
import { Badge } from '@/src/components/ui/badge';

interface CompanyProgramActionsProps {
  programId: string;
  myOffers: Offer[];
}

export function CompanyProgramActions({ programId, myOffers }: CompanyProgramActionsProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOffer = async () => {
    if (!selectedOfferId) {
      showError('Selecciona una oferta');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/programs/${programId}/offers`, { offerId: selectedOfferId });
      success('Oferta añadida al programa correctamente');
      setSelectedOfferId('');
      router.refresh();
    } catch (err: any) {
      if (err.message?.includes('already')) {
        showError('Esta oferta ya está en el programa');
      } else {
        showError('Error al añadir la oferta');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishedOffers = myOffers.filter(o => o.status === 'published');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Añadir oferta al programa</h2>
          <p className="text-sm text-gray-600 mt-1">
            Vincula tus ofertas publicadas a este programa
          </p>
        </CardHeader>
        <CardBody>
          {publishedOffers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No tienes ofertas publicadas para añadir
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/intranet/company/offers/new')}
              >
                Crear oferta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Select
                label="Selecciona una oferta"
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                options={[
                  { value: '', label: 'Selecciona...' },
                  ...publishedOffers.map((offer) => ({
                    value: offer.id,
                    label: offer.title,
                  })),
                ]}
              />

              <Button
                onClick={handleAddOffer}
                isLoading={isSubmitting}
                disabled={!selectedOfferId}
              >
                Añadir al programa
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Mis ofertas en este programa</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {myOffers
              .filter(o => o.programId === programId)
              .map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{offer.title}</p>
                    <p className="text-sm text-gray-600">{offer.location}</p>
                  </div>
                  <Badge variant="success">En programa</Badge>
                </div>
              ))}
            {myOffers.filter(o => o.programId === programId).length === 0 && (
              <p className="text-center text-gray-600 py-8">
                No tienes ofertas en este programa
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

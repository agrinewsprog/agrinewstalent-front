'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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

export function CompanyProgramActions({ programId, myOffers = [] }: CompanyProgramActionsProps) {
  const router = useRouter();
  const t = useTranslations('intranet');
  const { success, error: showError } = useToast();
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOffer = async () => {
    if (!selectedOfferId) {
      showError(t('company.programs.selectOfferLabel'));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/programs/${programId}/offers`, { offerId: selectedOfferId });
      success(t('company.programs.offerAdded'));
      setSelectedOfferId('');
      router.refresh();
    } catch (err: any) {
      if (err.message?.includes('already')) {
        showError(t('company.programs.errorAlreadyIn'));
      } else {
        showError(t('company.programs.errorAdd'));
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishedOffers = (myOffers ?? []).filter(o => o.status === 'published');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{t('company.programs.addOfferTitle')}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('company.programs.addOfferSubtitle')}
          </p>
        </CardHeader>
        <CardBody>
          {publishedOffers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {t('company.programs.noPublished')}
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/intranet/company/offers/new')}
              >
                {t('company.programs.createOffer')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Select
                label={t('company.programs.selectOfferLabel')}
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                options={[
                  { value: '', label: t('company.programs.selectOfferPlaceholder') },
                  ...(publishedOffers ?? []).map((offer) => ({
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
                {t('company.programs.addToProgram')}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{t('company.programs.myOffersTitle')}</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {(myOffers ?? [])
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
                  <Badge variant="success">{t('company.programs.inProgram')}</Badge>
                </div>
              ))}
            {(myOffers ?? []).filter(o => o.programId === programId).length === 0 && (
              <p className="text-center text-gray-600 py-8">
                {t('company.programs.noOffersInProgram')}
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

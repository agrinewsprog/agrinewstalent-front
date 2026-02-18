'use client';

import { Offer } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';

interface ProgramOffersListProps {
  offers: Offer[];
  role: 'student' | 'company' | 'university';
  onApply?: (offerId: string) => void;
  onRemove?: (offerId: string) => void;
}

const offerTypeLabels = {
  'full-time': 'Tiempo completo',
  'part-time': 'Medio tiempo',
  'internship': 'Prácticas',
  'freelance': 'Freelance',
};

export function ProgramOffersList({ offers, role, onApply, onRemove }: ProgramOffersListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {offers.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              No hay ofertas en este programa
            </p>
          </CardBody>
        </Card>
      ) : (
        offers.map((offer) => (
          <Card key={offer.id}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/intranet/${role}/offers/${offer.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {offer.title}
                  </Link>
                  <p className="text-gray-600 mt-1">
                    {offer.company?.companyName || 'Empresa'}
                  </p>
                  <p className="text-gray-700 mt-2 line-clamp-2">
                    {offer.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span>📍 {offer.location}</span>
                    {offer.salary && <span>💰 {offer.salary}</span>}
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-end gap-2">
                  <Badge>{offerTypeLabels[offer.type]}</Badge>
                  {role === 'student' && onApply && (
                    <Button size="sm" onClick={() => onApply(offer.id)}>
                      Aplicar
                    </Button>
                  )}
                  {role === 'company' && onRemove && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRemove(offer.id)}
                    >
                      Quitar del programa
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}

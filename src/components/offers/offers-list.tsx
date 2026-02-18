'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Offer } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';

interface OffersListProps {
  offers: Offer[];
  onApply?: (offerId: string) => void;
  onSave?: (offerId: string) => void;
  savedOffers?: string[];
}

const offerTypeLabels = {
  'full-time': 'Tiempo completo',
  'part-time': 'Medio tiempo',
  'internship': 'Prácticas',
  'freelance': 'Freelance',
};

export function OffersList({ offers, onApply, onSave, savedOffers = [] }: OffersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Extraer ubicaciones únicas
  const locations = Array.from(new Set(offers.map(o => o.location)));

  // Filtrar ofertas
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || offer.type === filterType;
    const matchesLocation = filterLocation === 'all' || offer.location === filterLocation;

    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar ofertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los tipos' },
                { value: 'full-time', label: 'Tiempo completo' },
                { value: 'part-time', label: 'Medio tiempo' },
                { value: 'internship', label: 'Prácticas' },
                { value: 'freelance', label: 'Freelance' },
              ]}
            />
            <Select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              options={[
                { value: 'all', label: 'Todas las ubicaciones' },
                ...locations.map(loc => ({ value: loc, label: loc })),
              ]}
            />
          </div>
        </CardBody>
      </Card>

      {/* Resultados */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredOffers.length} de {offers.length} ofertas
      </div>

      {/* Lista de ofertas */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOffers.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-600 py-8">
                No se encontraron ofertas
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredOffers.map((offer) => (
            <Card key={offer.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/intranet/student/offers/${offer.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {offer.title}
                      </Link>
                      {savedOffers.includes(offer.id) && (
                        <span className="text-yellow-500" title="Guardada">
                          ⭐
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {offer.company?.companyName || 'Empresa confidencial'}
                    </p>
                    <p className="text-gray-700 mt-2 line-clamp-2">
                      {offer.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {offer.location}
                      </span>
                      {offer.salary && <span>💰 {offer.salary}</span>}
                      <span className="text-xs text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col items-end gap-2">
                    <Badge>{offerTypeLabels[offer.type]}</Badge>
                    {onApply && (
                      <Button
                        size="sm"
                        onClick={() => onApply(offer.id)}
                      >
                        Aplicar
                      </Button>
                    )}
                    {onSave && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSave(offer.id)}
                      >
                        {savedOffers.includes(offer.id) ? '★ Guardada' : '☆ Guardar'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

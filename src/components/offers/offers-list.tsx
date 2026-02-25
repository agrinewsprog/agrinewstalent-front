'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Offer } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';

interface OffersListProps {
  offers: Offer[];
  onApply?: (offerId: string) => void;
  onSave?: (offerId: string) => void;
  savedOffers?: string[];
  appliedOffers?: string[];
}

const contractTypeLabels: Record<string, string> = {
  'full-time': 'Tiempo completo',
  'part-time': 'Media jornada',
  internship: 'Prácticas',
  freelance: 'Freelance',
  FULL_TIME: 'Tiempo completo',
  PART_TIME: 'Media jornada',
  INTERNSHIP: 'Prácticas',
  FREELANCE: 'Freelance',
};

const workModeLabels: Record<string, string> = {
  onsite: 'Presencial',
  remote: 'Remoto',
  hybrid: 'Híbrido',
  ONSITE: 'Presencial',
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
};

function relativeDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const diff = Math.ceil((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
  return `Hace ${Math.floor(diff / 30)} meses`;
}

function CompanyLogo({ logoUrl, name }: { logoUrl?: string | null; name?: string }) {
  if (logoUrl) {
    return (
      <img src={logoUrl} alt={name ?? 'Empresa'}
        className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0" />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
      {(name ?? '?')[0].toUpperCase()}
    </div>
  );
}

// ── Panel de detalle ──────────────────────────────────────────────────────────
function OfferDetailPanel({
  offer,
  onClose,
  onApply,
  onSave,
  isApplied,
  isSaved,
}: {
  offer: any | null;
  onClose: () => void;
  onApply?: (id: string) => void;
  onSave?: (id: string) => void;
  isApplied: boolean;
  isSaved: boolean;
}) {
  if (!offer) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center sticky top-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">Selecciona una oferta</h3>
        <p className="text-sm text-gray-400">Haz clic en una oferta para ver los detalles</p>
      </div>
    );
  }

  const contractType = offer.contractType ?? offer.type ?? '';
  const workMode = offer.workMode ?? '';
  const company = offer.company;
  const dateLabel = relativeDate(offer.publishedAt ?? offer.createdAt);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-4">
      {/* Header verde */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-1.5">
            {contractType && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                contractType.toLowerCase().includes('intern') || contractType.toLowerCase().includes('practic')
                  ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {contractTypeLabels[contractType] ?? contractType}
              </span>
            )}
            {workMode && (
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                {workModeLabels[workMode] ?? workMode}
              </span>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <h2 className="text-xl font-bold mb-1">{offer.title}</h2>
        {company?.companyName && (
          <div className="flex items-center gap-1.5 text-green-100 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {company.companyName}
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-green-100">
          {offer.location && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {offer.location}
            </span>
          )}
          {dateLabel && <span>{dateLabel}</span>}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 max-h-[calc(100vh-360px)] overflow-y-auto space-y-5">
        {/* Condiciones */}
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-gray-100">
          {contractType && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Contrato</p>
              <p className="text-sm font-semibold text-gray-800">{contractTypeLabels[contractType] ?? contractType}</p>
            </div>
          )}
          {workMode && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Modalidad</p>
              <p className="text-sm font-semibold text-gray-800">{workModeLabels[workMode] ?? workMode}</p>
            </div>
          )}
          {offer.salary && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Salario</p>
              <p className="text-sm font-semibold text-green-700">{offer.salary}</p>
            </div>
          )}
          {offer.experienceLevel && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Experiencia</p>
              <p className="text-sm font-semibold text-gray-800">{offer.experienceLevel}</p>
            </div>
          )}
        </div>

        {/* Descripción */}
        {offer.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Descripción del puesto</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-6">{offer.description}</p>
          </div>
        )}

        {/* Requisitos */}
        {offer.requirements && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Requisitos</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-4">{offer.requirements}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
        <Link
          href={`/intranet/student/offers/${offer.id}`}
          className="block w-full text-center py-2.5 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Ver oferta completa
        </Link>
        {onApply && (
          isApplied ? (
            <div className="flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ya aplicado
            </div>
          ) : (
            <button
              onClick={() => onApply(String(offer.id))}
              className="w-full py-2.5 px-4 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Aplicar ahora
            </button>
          )
        )}
        {onSave && (
          <button
            onClick={() => onSave(String(offer.id))}
            className={`w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              isSaved
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isSaved ? '⭐ Guardada' : 'Guardar oferta'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Lista principal ───────────────────────────────────────────────────────────
export function OffersList({ offers = [], onApply, onSave, savedOffers = [], appliedOffers = [] }: OffersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);

  const filteredOffers = useMemo(() => {
    return (offers ?? []).filter(offer => {
      const contractType = (offer as any).contractType ?? offer.type ?? '';
      const matchesSearch =
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.company?.companyName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || contractType === filterType || offer.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [offers, searchTerm, filterType]);

  // Destacadas primero
  const sortedOffers = useMemo(() => {
    return [...filteredOffers].sort((a, b) => {
      const aFeat = (a as any).featured || (a as any).promoted ? 1 : 0;
      const bFeat = (b as any).featured || (b as any).promoted ? 1 : 0;
      return bFeat - aFeat;
    });
  }, [filteredOffers]);

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Buscar por puesto, empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los tipos' },
                { value: 'full-time', label: 'Tiempo completo' },
                { value: 'part-time', label: 'Media jornada' },
                { value: 'internship', label: 'Prácticas' },
                { value: 'freelance', label: 'Freelance' },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <p className="text-sm text-gray-500">
        {sortedOffers.length} {sortedOffers.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
      </p>

      {/* Layout dividido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lista - 2 columnas */}
        <div className="lg:col-span-2 space-y-3">
          {sortedOffers.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center text-gray-500 py-8">No se encontraron ofertas</p>
              </CardBody>
            </Card>
          ) : (
            sortedOffers.map((offer) => {
              const contractType = (offer as any).contractType ?? offer.type ?? '';
              const workMode = (offer as any).workMode ?? '';
              const isFeatured = (offer as any).featured || (offer as any).promoted;
              const isSaved = savedOffers.includes(String(offer.id));
              const isApplied = appliedOffers.includes(String(offer.id));
              const isSelected = selectedOffer?.id === offer.id;
              const dateLabel = relativeDate((offer as any).publishedAt ?? offer.createdAt);

              return (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className={`bg-white rounded-xl border-2 transition-all cursor-pointer p-4 ${
                    isSelected
                      ? 'border-green-500 shadow-md'
                      : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                  }`}
                >
                  {isFeatured && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 w-fit mb-2">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Destacada
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <CompanyLogo logoUrl={(offer as any).company?.logoUrl} name={offer.company?.companyName} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{offer.title}</h3>
                          {offer.company?.companyName && (
                            <p className="text-xs text-gray-500 mt-0.5">{offer.company.companyName}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {contractType && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              contractType.toLowerCase().includes('intern') || contractType.toLowerCase().includes('practic')
                                ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {contractTypeLabels[contractType] ?? contractType}
                            </span>
                          )}
                          {workMode && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                              {workModeLabels[workMode] ?? workMode}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                        {offer.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {offer.location}
                          </span>
                        )}
                        {offer.salary && <span className="text-green-600 font-medium">{offer.salary}</span>}
                        {dateLabel && <span>{dateLabel}</span>}
                        {isSaved && <span className="text-yellow-500">⭐</span>}
                        {isApplied && (
                          <span className="text-green-600 font-medium flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Aplicado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel de detalle - 1 columna */}
        <div className={`lg:col-span-1 ${selectedOffer ? 'block' : 'hidden lg:block'}`}>
          <OfferDetailPanel
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
            onApply={onApply}
            onSave={onSave}
            isApplied={selectedOffer ? appliedOffers.includes(String(selectedOffer.id)) : false}
            isSaved={selectedOffer ? savedOffers.includes(String(selectedOffer.id)) : false}
          />
        </div>
      </div>
    </div>
  );
}

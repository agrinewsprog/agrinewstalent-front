'use client';

import { useState, useMemo } from 'react';
import JobFilters from './JobFilters';
import JobCard, { type JobOffer } from './JobCard';
import JobDetail from './JobDetail';

interface JobsListProps {
  initialOffers: JobOffer[];
}

export default function JobsList({ initialOffers }: JobsListProps) {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'empleo' | 'practicas'>('all');
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);

  // Filtrar y buscar ofertas
  const filteredOffers = useMemo(() => {
    let filtered = initialOffers;

    // Filtrar por tipo
    if (activeFilter !== 'all') {
      filtered = filtered.filter((offer) => offer.type === activeFilter);
    }

    // Buscar por texto
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(search) ||
          offer.company.toLowerCase().includes(search) ||
          offer.location.toLowerCase().includes(search) ||
          offer.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [initialOffers, activeFilter, searchValue]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Título de la página */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Empleo y Prácticas
        </h1>
        <p className="text-lg text-gray-600">
          Encuentra oportunidades laborales y prácticas profesionales
        </p>
      </div>

      {/* Filtros y buscador */}
      <div className="mb-8">
        <JobFilters
          onSearchChange={setSearchValue}
          onFilterChange={setActiveFilter}
          searchValue={searchValue}
          activeFilter={activeFilter}
        />
      </div>

      {/* Grid de ofertas y detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listado de ofertas - 2 columnas en desktop */}
        <div className="lg:col-span-2">
          {filteredOffers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No se encontraron ofertas
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros o la búsqueda
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {filteredOffers.length} {filteredOffers.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
              </div>
              <div className="space-y-4">
                {filteredOffers.map((offer) => (
                  <JobCard
                    key={offer.id}
                    offer={offer}
                    isSelected={selectedOffer?.id === offer.id}
                    onClick={() => setSelectedOffer(offer)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Panel de detalle - 1 columna en desktop, oculto en mobile si no hay selección */}
        <div className={`lg:col-span-1 ${selectedOffer ? 'block' : 'hidden lg:block'}`}>
          <JobDetail
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
          />
        </div>
      </div>
    </div>
  );
}

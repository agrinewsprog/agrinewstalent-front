'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type FilterType = 'all' | 'empleo' | 'practicas';

interface JobFiltersProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filter: FilterType) => void;
  searchValue: string;
  activeFilter: FilterType;
}

export default function JobFilters({
  onSearchChange,
  onFilterChange,
  searchValue,
  activeFilter,
}: JobFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todo' },
    { value: 'empleo', label: 'Empleo' },
    { value: 'practicas', label: 'Prácticas' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Buscador */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar ofertas por título, empresa, ubicación..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === filter.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

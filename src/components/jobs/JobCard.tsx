'use client';

import { MapPinIcon, BuildingOfficeIcon, ClockIcon } from '@heroicons/react/24/outline';

export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'empleo' | 'practicas';
  tags: string[];
  salary?: string;
  workMode?: 'Remoto' | 'Presencial' | 'Híbrido';
  publishedAt?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
}

interface JobCardProps {
  offer: JobOffer;
  isSelected: boolean;
  onClick: () => void;
}

export default function JobCard({ offer, isSelected, onClick }: JobCardProps) {
  const getTypeLabel = (type: 'empleo' | 'practicas') => {
    return type === 'empleo' ? 'Empleo' : 'Prácticas';
  };

  const getTypeBadgeColor = (type: 'empleo' | 'practicas') => {
    return type === 'empleo'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffTime = Math.abs(now.getTime() - published.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-green-500 shadow-md'
          : 'border-gray-200 hover:border-green-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-green-600 transition-colors">
            {offer.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{offer.company}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
            offer.type
          )}`}
        >
          {getTypeLabel(offer.type)}
        </span>
      </div>

      {/* Ubicación y modo de trabajo */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>{offer.location}</span>
        </div>
        {offer.workMode && (
          <div className="flex items-center">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
              {offer.workMode}
            </span>
          </div>
        )}
        {offer.publishedAt && (
          <div className="flex items-center text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">{formatDate(offer.publishedAt)}</span>
          </div>
        )}
      </div>

      {/* Salario si está disponible */}
      {offer.salary && (
        <div className="mb-4">
          <span className="text-green-700 font-semibold text-sm">
            {offer.salary}
          </span>
        </div>
      )}

      {/* Tags */}
      {offer.tags && offer.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {offer.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {offer.tags.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
              +{offer.tags.length - 4} más
            </span>
          )}
        </div>
      )}

      {/* Botón */}
      <button
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isSelected
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSelected ? 'Ver detalle' : 'Ver detalle'}
      </button>
    </div>
  );
}

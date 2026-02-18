'use client';

import { useState } from 'react';
import { XMarkIcon, MapPinIcon, BuildingOfficeIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { JobOffer } from './JobCard';
import ApplyModal from './ApplyModal';

interface JobDetailProps {
  offer: JobOffer | null;
  onClose: () => void;
}

export default function JobDetail({ offer, onClose }: JobDetailProps) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleEditProfile = () => {
    setIsApplyModalOpen(false);
    // TODO: Redirigir a la página de edición de perfil
    window.location.href = '/intranet/student/profile/edit';
  };

  const handleApply = () => {
    setIsApplyModalOpen(false);
    // TODO: Implementar lógica de postulación (llamada a API)
    console.log('Postulando a oferta:', offer?.id);
    alert('¡Postulación enviada con éxito! Pronto recibirás noticias.');
  };

  if (!offer) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <BuildingOfficeIcon className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Selecciona una oferta
        </h3>
        <p className="text-gray-500 text-sm">
          Haz clic en una oferta de la lista para ver los detalles completos
        </p>
      </div>
    );
  }

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
              offer.type
            )}`}
          >
            {getTypeLabel(offer.type)}
          </span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Cerrar detalle"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-2">{offer.title}</h2>
        
        <div className="flex items-center mb-3">
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          <span className="font-semibold text-lg">{offer.company}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{offer.location}</span>
          </div>
          {offer.publishedAt && (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(offer.publishedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
          {offer.workMode && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Modalidad</p>
              <p className="font-semibold text-gray-900">{offer.workMode}</p>
            </div>
          )}
          {offer.salary && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Salario</p>
              <p className="font-semibold text-green-700">{offer.salary}</p>
            </div>
          )}
        </div>

        {/* Descripción */}
        {offer.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Descripción
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {offer.description}
            </p>
          </div>
        )}

        {/* Responsabilidades */}
        {offer.responsibilities && offer.responsibilities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Responsabilidades
            </h3>
            <ul className="space-y-2">
              {offer.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requisitos */}
        {offer.requirements && offer.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Requisitos
            </h3>
            <ul className="space-y-2">
              {offer.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {offer.tags && offer.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Habilidades requeridas
            </h3>
            <div className="flex flex-wrap gap-2">
              {offer.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-md border border-green-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer con botón de postulación */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
        >
          Quiero postularme
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Al postularte, tu perfil será compartido con {offer.company}
        </p>
      </div>

      {/* Modal de postulación */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        offer={offer}
        onEditProfile={handleEditProfile}
        onApply={handleApply}
      />
    </div>
  );
}

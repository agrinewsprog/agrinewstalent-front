'use client';

import { BriefcaseIcon, PencilIcon, EyeIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { type Offer } from './OfferForm';

interface CompanyOffersListProps {
  offers: Offer[];
  onEdit: (offer: Offer) => void;
}

export default function CompanyOffersList({ offers, onEdit }: CompanyOffersListProps) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <BriefcaseIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes vacantes publicadas
        </h3>
        <p className="text-gray-600 mb-6">
          Comienza publicando tu primera oferta para atraer talento
        </p>
      </div>
    );
  }

  const getEstadoBadge = (estado?: string) => {
    const badges = {
      Abierta: 'bg-green-100 text-green-800 border-green-200',
      Cerrada: 'bg-gray-100 text-gray-800 border-gray-200',
      Borrador: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return badges[estado as keyof typeof badges] || badges.Abierta;
  };

  const getCategoriaColor = (categoria: string) => {
    return categoria === 'Empleo'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'Reciente';
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Contenido principal */}
            <div className="flex-1">
              {/* Header con título y badges */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {offer.titulo}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(
                        offer.estado
                      )}`}
                    >
                      {offer.estado || 'Abierta'}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoriaColor(
                        offer.categoria
                      )}`}
                    >
                      {offer.categoria}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                  <span>{offer.jornada}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <span>{offer.modalidad}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span>{formatFecha(offer.fechaPublicacion)}</span>
                </div>
                {offer.ubicacion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <span>{offer.ubicacion}</span>
                  </div>
                )}
              </div>

              {/* Descripción corta */}
              <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                {offer.descripcion}
              </p>

              {/* Estadísticas */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  <span className="font-medium">0</span> vistas
                </span>
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-4 w-4" />
                  <span className="font-medium">0</span> postulaciones
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onEdit(offer)}
                className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg font-medium transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
                Editar
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <EyeIcon className="h-5 w-5" />
                Ver
              </button>
            </div>
          </div>

          {/* Barra de progreso (si está disponible) */}
          {offer.estado === 'Abierta' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Progreso de contratación</span>
                <span className="font-medium">0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

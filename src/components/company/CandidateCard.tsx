'use client';

import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  EnvelopeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export interface Candidate {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  foto?: string;
  ubicacion?: string;
  fechaRegistro?: string;
  ultimaFormacion?: string;
  ultimaExperiencia?: string;
  idiomas?: string[];
  ofertaPostulada?: string;
  estado?: 'Nuevo' | 'Revisado' | 'Contactado' | 'Descartado';
}

interface CandidateCardProps {
  candidate: Candidate;
  onViewCV?: (candidate: Candidate) => void;
  onSendMessage?: (candidate: Candidate) => void;
}

export default function CandidateCard({ candidate, onViewCV, onSendMessage }: CandidateCardProps) {
  const getEstadoBadge = (estado?: string) => {
    const badges = {
      Nuevo: 'bg-blue-100 text-blue-800 border-blue-200',
      Revisado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Contactado: 'bg-green-100 text-green-800 border-green-200',
      Descartado: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[estado as keyof typeof badges] || badges.Nuevo;
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
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/intranet/company/candidates/${candidate.id}`}>
          <div className="flex-shrink-0 cursor-pointer">
            {candidate.foto ? (
              <img
                src={candidate.foto}
                alt={`${candidate.nombre} ${candidate.apellidos}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-2 border-gray-200">
                <UserCircleIcon className="w-12 h-12 text-green-600" />
              </div>
            )}
          </div>
        </Link>

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          {/* Header con nombre y estado */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <Link href={`/intranet/company/candidates/${candidate.id}`}>
                <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors cursor-pointer">
                  {candidate.nombre} {candidate.apellidos}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">{candidate.email}</span>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getEstadoBadge(
                candidate.estado
              )}`}
            >
              {candidate.estado || 'Nuevo'}
            </span>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {candidate.ubicacion && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{candidate.ubicacion}</span>
              </div>
            )}
            {candidate.fechaRegistro && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>Registrado {formatFecha(candidate.fechaRegistro)}</span>
              </div>
            )}
            {candidate.ultimaFormacion && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AcademicCapIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{candidate.ultimaFormacion}</span>
              </div>
            )}
            {candidate.ultimaExperiencia && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BriefcaseIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{candidate.ultimaExperiencia}</span>
              </div>
            )}
          </div>

          {/* Idiomas */}
          {candidate.idiomas && candidate.idiomas.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <LanguageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {candidate.idiomas.slice(0, 3).map((idioma, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700"
                  >
                    {idioma}
                  </span>
                ))}
                {candidate.idiomas.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{candidate.idiomas.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Oferta postulada */}
          {candidate.ofertaPostulada && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-green-700">
                <span className="font-medium">Postulado a:</span> {candidate.ofertaPostulada}
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => onViewCV?.(candidate)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Ver curriculum
            </button>
            <button
              onClick={() => onSendMessage?.(candidate)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-700 bg-white rounded-lg hover:bg-green-50 font-medium transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5" />
              Enviar mensaje
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

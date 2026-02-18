'use client';

import { Fragment } from 'react';
import { XMarkIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { JobOffer } from './JobCard';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: JobOffer;
  onEditProfile: () => void;
  onApply: () => void;
}

export default function ApplyModal({
  isOpen,
  onClose,
  offer,
  onEditProfile,
  onApply,
}: ApplyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <CheckCircleIcon className="h-12 w-12" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              Postulación a oferta
            </h2>
            <p className="text-green-100 text-center text-sm">
              {offer.title} - {offer.company}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-8">
            {/* Mensaje principal */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <UserCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Tienes todos tus datos actualizados en tu perfil?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Es importante que tu información esté completa y actualizada para
                aumentar tus posibilidades de éxito en esta postulación.
              </p>
            </div>

            {/* Checklist visual */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Verifica que tienes:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>Datos personales y de contacto completos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>CV actualizado o experiencia laboral detallada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>Formación académica y certificaciones</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  <span>Habilidades y competencias relevantes</span>
                </li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onEditProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-green-600 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                <UserCircleIcon className="h-5 w-5" />
                Editar perfil
              </button>

              <button
                onClick={onApply}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Postularme ahora
              </button>
            </div>

            {/* Nota adicional */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Al postularte, tu perfil completo será compartido con {offer.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

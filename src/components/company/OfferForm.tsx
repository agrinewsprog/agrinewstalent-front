'use client';

import { useState } from 'react';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';

const offerSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  categoria: z.enum(['Empleo', 'Prácticas']),
  jornada: z.enum(['Completa', 'Parcial', 'Flexible', 'Intensiva']),
  modalidad: z.enum(['Presencial', 'Remoto', 'Híbrido']),
  descripcion: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  requisitos: z.string().min(20, 'Los requisitos deben tener al menos 20 caracteres'),
});

export type Offer = z.infer<typeof offerSchema> & {
  id?: string;
  empresa?: string;
  ubicacion?: string;
  salario?: string;
  fechaPublicacion?: string;
  estado?: 'Abierta' | 'Cerrada' | 'Borrador';
};

interface OfferFormProps {
  initialOffer?: Offer;
  onSave: (offer: Offer) => Promise<void>;
  onCancel: () => void;
}

export default function OfferForm({ initialOffer, onSave, onCancel }: OfferFormProps) {
  const [formData, setFormData] = useState<Omit<Offer, 'id'>>({
    titulo: initialOffer?.titulo || '',
    categoria: initialOffer?.categoria || 'Empleo',
    jornada: initialOffer?.jornada || 'Completa',
    modalidad: initialOffer?.modalidad || 'Presencial',
    descripcion: initialOffer?.descripcion || '',
    requisitos: initialOffer?.requisitos || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = offerSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        ...(initialOffer?.id && { id: initialOffer.id }),
      });
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error al guardar la oferta');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {initialOffer?.id ? 'Editar vacante' : 'Publicar nueva vacante'}
          </h2>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título de la vacante <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Desarrollador Full Stack Junior"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Fila: Categoría, Jornada, Modalidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categoría */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.categoria ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Empleo">Empleo</option>
                <option value="Prácticas">Prácticas</option>
              </select>
              {errors.categoria && (
                <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
              )}
            </div>

            {/* Jornada */}
            <div>
              <label htmlFor="jornada" className="block text-sm font-medium text-gray-700 mb-2">
                Jornada <span className="text-red-500">*</span>
              </label>
              <select
                id="jornada"
                name="jornada"
                value={formData.jornada}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.jornada ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Completa">Completa</option>
                <option value="Parcial">Parcial</option>
                <option value="Flexible">Flexible</option>
                <option value="Intensiva">Intensiva</option>
              </select>
              {errors.jornada && (
                <p className="text-red-500 text-sm mt-1">{errors.jornada}</p>
              )}
            </div>

            {/* Modalidad */}
            <div>
              <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700 mb-2">
                Modalidad <span className="text-red-500">*</span>
              </label>
              <select
                id="modalidad"
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.modalidad ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
              {errors.modalidad && (
                <p className="text-red-500 text-sm mt-1">{errors.modalidad}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la vacante <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe las responsabilidades, objetivos y detalles del puesto..."
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.descripcion.length} / 50 caracteres mínimo
            </p>
          </div>

          {/* Requisitos */}
          <div>
            <label htmlFor="requisitos" className="block text-sm font-medium text-gray-700 mb-2">
              Requisitos y habilidades <span className="text-red-500">*</span>
            </label>
            <textarea
              id="requisitos"
              name="requisitos"
              value={formData.requisitos}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.requisitos ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Lista los requisitos técnicos, experiencia necesaria, idiomas, etc..."
            />
            {errors.requisitos && (
              <p className="text-red-500 text-sm mt-1">{errors.requisitos}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.requisitos.length} / 20 caracteres mínimo
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">💡 Consejos para una buena oferta</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Sé específico en el título para atraer candidatos adecuados</li>
              <li>• Incluye información sobre el equipo y cultura de la empresa</li>
              <li>• Detalla las oportunidades de crecimiento y desarrollo</li>
              <li>• Menciona beneficios adicionales si los hay</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : initialOffer?.id ? 'Guardar cambios' : 'Publicar vacante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

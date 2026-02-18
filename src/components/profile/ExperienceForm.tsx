'use client';

import { useState } from 'react';
import { z } from 'zod';
import { PlusIcon, TrashIcon, BriefcaseIcon, CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const experienceSchema = z.object({
  company: z.string().min(2, 'El nombre de la empresa es obligatorio'),
  position: z.string().min(2, 'El cargo es obligatorio'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().optional(),
});

export type Experience = z.infer<typeof experienceSchema> & { id?: string };

interface ExperienceFormProps {
  initialExperience?: Experience[];
  onSave: (experience: Experience[]) => Promise<void>;
}

export default function ExperienceForm({ initialExperience = [], onSave }: ExperienceFormProps) {
  const [experienceList, setExperienceList] = useState<Experience[]>(initialExperience);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Experience>>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Experience, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof Experience]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setFormData({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
    setErrors({});
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsAdding(false);
    setFormData(experienceList[index]);
    setErrors({});
  };

  const handleSaveItem = () => {
    setErrors({});

    const result = experienceSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Experience, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof Experience;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const newExperience = [...experienceList];

    if (editingIndex !== null) {
      newExperience[editingIndex] = { ...result.data, id: experienceList[editingIndex].id };
    } else {
      newExperience.push({ ...result.data, id: `temp-${Date.now()}` });
    }

    setExperienceList(newExperience);
    setIsAdding(false);
    setEditingIndex(null);
    setFormData({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setFormData({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
    setErrors({});
  };

  const handleDelete = (index: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta experiencia?')) {
      const newExperience = experienceList.filter((_, i) => i !== index);
      setExperienceList(newExperience);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave(experienceList);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BriefcaseIcon className="h-7 w-7 text-green-600" />
          Experiencia Laboral
        </h2>
        {!isAdding && editingIndex === null && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar experiencia
          </button>
        )}
      </div>

      {/* Lista de experiencias */}
      <div className="space-y-4">
        {experienceList.map((exp, index) => (
          <div
            key={exp.id || index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                <div className="flex items-center gap-2 text-green-600 font-medium mt-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <p>{exp.company}</p>
                </div>
                {exp.location && (
                  <p className="text-gray-600 text-sm mt-1">{exp.location}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {exp.startDate} - {exp.current ? 'Actualidad' : exp.endDate || 'No especificado'}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-sm mt-3 whitespace-pre-line">{exp.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {experienceList.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay experiencia laboral registrada</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Agregar tu primera experiencia
            </button>
          </div>
        )}
      </div>

      {/* Formulario de edición/creación */}
      {(isAdding || editingIndex !== null) && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingIndex !== null ? 'Editar experiencia' : 'Nueva experiencia'}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre de la empresa"
                />
                {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tu cargo o puesto"
                />
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación (opcional)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ciudad, País"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio *
                </label>
                <input
                  type="month"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="month"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formData.current}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formData.current ? 'bg-gray-100' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="current"
                  checked={formData.current || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Trabajo aquí actualmente</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de responsabilidades (opcional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe tus responsabilidades, logros y proyectos destacados..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guardar todos los cambios */}
      {experienceList.length > 0 && !isAdding && editingIndex === null && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  );
}

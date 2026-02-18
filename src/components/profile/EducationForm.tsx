'use client';

import { useState } from 'react';
import { z } from 'zod';
import { PlusIcon, TrashIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/react/24/outline';

const educationSchema = z.object({
  institution: z.string().min(2, 'El nombre de la institución es obligatorio'),
  degree: z.string().min(2, 'El título o grado es obligatorio'),
  fieldOfStudy: z.string().min(2, 'El campo de estudio es obligatorio'),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().optional(),
});

export type Education = z.infer<typeof educationSchema> & { id?: string };

interface EducationFormProps {
  initialEducation?: Education[];
  onSave: (education: Education[]) => Promise<void>;
}

export default function EducationForm({ initialEducation = [], onSave }: EducationFormProps) {
  const [educationList, setEducationList] = useState<Education[]>(initialEducation);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Education>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Education, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof Education]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
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
    setFormData(educationList[index]);
    setErrors({});
  };

  const handleSaveItem = () => {
    setErrors({});

    const result = educationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Education, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof Education;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const newEducation = [...educationList];

    if (editingIndex !== null) {
      newEducation[editingIndex] = { ...result.data, id: educationList[editingIndex].id };
    } else {
      newEducation.push({ ...result.data, id: `temp-${Date.now()}` });
    }

    setEducationList(newEducation);
    setIsAdding(false);
    setEditingIndex(null);
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
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
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
    setErrors({});
  };

  const handleDelete = (index: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este estudio?')) {
      const newEducation = educationList.filter((_, i) => i !== index);
      setEducationList(newEducation);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave(educationList);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AcademicCapIcon className="h-7 w-7 text-green-600" />
          Formación Académica
        </h2>
        {!isAdding && editingIndex === null && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar estudio
          </button>
        )}
      </div>

      {/* Lista de estudios */}
      <div className="space-y-4">
        {educationList.map((edu, index) => (
          <div
            key={edu.id || index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-green-600 font-medium">{edu.institution}</p>
                <p className="text-gray-600 text-sm mt-1">{edu.fieldOfStudy}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {edu.startDate} - {edu.current ? 'Actualidad' : edu.endDate || 'No especificado'}
                  </span>
                </div>
                {edu.description && (
                  <p className="text-gray-700 text-sm mt-3">{edu.description}</p>
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

        {educationList.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay estudios registrados</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Agregar tu primer estudio
            </button>
          </div>
        )}
      </div>

      {/* Formulario de edición/creación */}
      {(isAdding || editingIndex !== null) && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingIndex !== null ? 'Editar estudio' : 'Nuevo estudio'}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institución *
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.institution ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Universidad de..."
                />
                {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título o Grado *
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.degree ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Grado en..."
                />
                {errors.degree && <p className="mt-1 text-sm text-red-600">{errors.degree}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campo de estudio *
              </label>
              <input
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.fieldOfStudy ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingeniería Agronómica, Biología, etc."
              />
              {errors.fieldOfStudy && <p className="mt-1 text-sm text-red-600">{errors.fieldOfStudy}</p>}
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
                <span className="ml-2 text-sm text-gray-700">Estoy estudiando actualmente</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe tus logros, proyectos destacados, etc."
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
      {educationList.length > 0 && !isAdding && editingIndex === null && (
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

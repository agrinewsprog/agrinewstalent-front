'use client';

import { useState } from 'react';
import { z } from 'zod';
import { PlusIcon, TrashIcon, LanguageIcon } from '@heroicons/react/24/outline';

const languageSchema = z.object({
  language: z.string().min(2, 'El idioma es obligatorio'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'] as const),
});

export type Language = z.infer<typeof languageSchema> & { id?: string };

interface LanguagesFormProps {
  initialLanguages?: Language[];
  onSave: (languages: Language[]) => Promise<void>;
}

const languageLevelLabels: Record<string, string> = {
  A1: 'A1 - Principiante',
  A2: 'A2 - Elemental',
  B1: 'B1 - Intermedio',
  B2: 'B2 - Intermedio Alto',
  C1: 'C1 - Avanzado',
  C2: 'C2 - Dominio',
  Nativo: 'Nativo',
};

const commonLanguages = [
  'Español',
  'Inglés',
  'Portugués',
  'Francés',
  'Alemán',
  'Italiano',
  'Catalán',
  'Gallego',
  'Euskera',
  'Chino',
  'Japonés',
  'Árabe',
];

export default function LanguagesForm({ initialLanguages = [], onSave }: LanguagesFormProps) {
  const [languagesList, setLanguagesList] = useState<Language[]>(initialLanguages);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Language>>({
    language: '',
    level: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Language, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof Language]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setFormData({
      language: '',
      level: undefined,
    });
    setErrors({});
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsAdding(false);
    setFormData(languagesList[index]);
    setErrors({});
  };

  const handleSaveItem = () => {
    setErrors({});

    const result = languageSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Language, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof Language;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const newLanguages = [...languagesList];

    if (editingIndex !== null) {
      newLanguages[editingIndex] = { ...result.data, id: languagesList[editingIndex].id };
    } else {
      newLanguages.push({ ...result.data, id: `temp-${Date.now()}` });
    }

    setLanguagesList(newLanguages);
    setIsAdding(false);
    setEditingIndex(null);
    setFormData({
      language: '',
      level: undefined,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setFormData({
      language: '',
      level: undefined,
    });
    setErrors({});
  };

  const handleDelete = (index: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este idioma?')) {
      const newLanguages = languagesList.filter((_, i) => i !== index);
      setLanguagesList(newLanguages);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave(languagesList);
    } finally {
      setIsSaving(false);
    }
  };

  const getLevelBadgeColor = (level: string): string => {
    const colors: Record<string, string> = {
      A1: 'bg-gray-100 text-gray-700',
      A2: 'bg-gray-100 text-gray-700',
      B1: 'bg-blue-100 text-blue-700',
      B2: 'bg-blue-100 text-blue-700',
      C1: 'bg-green-100 text-green-700',
      C2: 'bg-green-100 text-green-700',
      Nativo: 'bg-purple-100 text-purple-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LanguageIcon className="h-7 w-7 text-green-600" />
          Idiomas
        </h2>
        {!isAdding && editingIndex === null && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar idioma
          </button>
        )}
      </div>

      {/* Lista de idiomas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languagesList.map((lang, index) => (
          <div
            key={lang.id || index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{lang.language}</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getLevelBadgeColor(
                    lang.level
                  )}`}
                >
                  {languageLevelLabels[lang.level]}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {languagesList.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <LanguageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay idiomas registrados</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Agregar tu primer idioma
            </button>
          </div>
        )}
      </div>

      {/* Formulario de edición/creación */}
      {(isAdding || editingIndex !== null) && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingIndex !== null ? 'Editar idioma' : 'Nuevo idioma'}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma *
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  list="common-languages"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.language ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Español, Inglés..."
                />
                <datalist id="common-languages">
                  {commonLanguages.map((lang) => (
                    <option key={lang} value={lang} />
                  ))}
                </datalist>
                {errors.language && <p className="mt-1 text-sm text-red-600">{errors.language}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel *
                </label>
                <select
                  name="level"
                  value={formData.level || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.level ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona un nivel</option>
                  {Object.entries(languageLevelLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
              </div>
            </div>

            {/* Referencia de niveles */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Referencia de niveles (MCER):</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><strong>A1-A2:</strong> Usuario básico</li>
                <li><strong>B1-B2:</strong> Usuario independiente</li>
                <li><strong>C1-C2:</strong> Usuario competente</li>
                <li><strong>Nativo:</strong> Lengua materna</li>
              </ul>
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
      {languagesList.length > 0 && !isAdding && editingIndex === null && (
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

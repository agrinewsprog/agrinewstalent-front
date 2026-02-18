'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  AcademicCapIcon,
  GlobeAltIcon,
  MapPinIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

// Schema de validación con Zod
const universitySchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  pais: z.string().min(1, 'Debe seleccionar un país'),
  ciudad: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  web: z.string().url('Debe ser una URL válida').min(1, 'La web es obligatoria'),
  emailContacto: z.string().email('Email inválido'),
});

type UniversityFormData = z.infer<typeof universitySchema>;

interface RegisterUniversityFormProps {
  onSuccess?: () => void;
}

export default function RegisterUniversityForm({ onSuccess }: RegisterUniversityFormProps) {
  const [formData, setFormData] = useState<Partial<UniversityFormData>>({
    nombre: '',
    pais: '',
    ciudad: '',
    web: '',
    emailContacto: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UniversityFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof UniversityFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // Validar con Zod
    const result = universitySchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UniversityFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof UniversityFormData;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'university',
          ...result.data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar universidad');
      }

      const data = await response.json();
      console.log('Registro exitoso:', data);

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirigir a login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      setSubmitError(error instanceof Error ? error.message : 'Error al registrar universidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Información sobre el registro */}
      <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Registro de universidades:</strong> Al completar este formulario, tu solicitud
          será enviada para revisión. Un administrador se pondrá en contacto contigo para
          completar el proceso de registro.
        </p>
      </div>

      {/* Nombre de la universidad */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la universidad *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AcademicCapIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Universidad de..."
          />
        </div>
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
      </div>

      {/* País */}
      <div>
        <label htmlFor="pais" className="block text-sm font-medium text-gray-700 mb-2">
          País *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="pais"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.pais ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona un país</option>
            <option value="ES">España</option>
            <option value="MX">México</option>
            <option value="AR">Argentina</option>
            <option value="CO">Colombia</option>
            <option value="PE">Perú</option>
            <option value="CL">Chile</option>
            <option value="EC">Ecuador</option>
            <option value="UY">Uruguay</option>
            <option value="VE">Venezuela</option>
            <option value="BR">Brasil</option>
            <option value="PT">Portugal</option>
          </select>
        </div>
        {errors.pais && <p className="mt-1 text-sm text-red-600">{errors.pais}</p>}
      </div>

      {/* Ciudad */}
      <div>
        <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
          Ciudad *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.ciudad ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Madrid"
          />
        </div>
        {errors.ciudad && <p className="mt-1 text-sm text-red-600">{errors.ciudad}</p>}
      </div>

      {/* Web */}
      <div>
        <label htmlFor="web" className="block text-sm font-medium text-gray-700 mb-2">
          Sitio web *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            id="web"
            name="web"
            value={formData.web}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.web ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://www.universidad.edu"
          />
        </div>
        {errors.web && <p className="mt-1 text-sm text-red-600">{errors.web}</p>}
      </div>

      {/* Email de contacto */}
      <div>
        <label htmlFor="emailContacto" className="block text-sm font-medium text-gray-700 mb-2">
          Email de contacto *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="emailContacto"
            name="emailContacto"
            value={formData.emailContacto}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.emailContacto ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="info@universidad.edu"
          />
        </div>
        {errors.emailContacto && <p className="mt-1 text-sm text-red-600">{errors.emailContacto}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Recibirás las credenciales de acceso en este email tras la aprobación
        </p>
      </div>

      {/* Botón de registro */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {isSubmitting ? 'Enviando solicitud...' : 'Enviar solicitud de registro'}
      </button>

      {/* Link a login */}
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}

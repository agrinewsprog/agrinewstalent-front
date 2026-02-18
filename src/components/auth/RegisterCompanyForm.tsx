'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  GlobeAltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

// Schema de validación con Zod
const companySchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  telefono: z.string().min(9, 'El teléfono debe tener al menos 9 caracteres'),
  razonSocial: z.string().min(3, 'La razón social debe tener al menos 3 caracteres'),
  cif: z.string().min(5, 'El CIF debe tener al menos 5 caracteres'),
  pais: z.string().min(1, 'Debe seleccionar un país'),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  codigoPostal: z.string().min(4, 'El código postal debe tener al menos 4 caracteres'),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface RegisterCompanyFormProps {
  onSuccess?: () => void;
}

export default function RegisterCompanyForm({ onSuccess }: RegisterCompanyFormProps) {
  const [formData, setFormData] = useState<Partial<CompanyFormData>>({
    email: '',
    password: '',
    telefono: '',
    razonSocial: '',
    cif: '',
    pais: '',
    direccion: '',
    codigoPostal: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof CompanyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // Validar con Zod
    const result = companySchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CompanyFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof CompanyFormData;
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
          role: 'company',
          ...result.data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar empresa');
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
      setSubmitError(error instanceof Error ? error.message : 'Error al registrar empresa');
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

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email corporativo *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="contacto@empresa.com"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+34 912 345 678"
          />
        </div>
        {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
      </div>

      {/* Razón Social */}
      <div>
        <label htmlFor="razonSocial" className="block text-sm font-medium text-gray-700 mb-2">
          Razón Social *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="razonSocial"
            name="razonSocial"
            value={formData.razonSocial}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.razonSocial ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Mi Empresa S.L."
          />
        </div>
        {errors.razonSocial && <p className="mt-1 text-sm text-red-600">{errors.razonSocial}</p>}
      </div>

      {/* CIF */}
      <div>
        <label htmlFor="cif" className="block text-sm font-medium text-gray-700 mb-2">
          CIF / NIF *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IdentificationIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="cif"
            name="cif"
            value={formData.cif}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.cif ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="B12345678"
          />
        </div>
        {errors.cif && <p className="mt-1 text-sm text-red-600">{errors.cif}</p>}
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

      {/* Dirección */}
      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
          Dirección *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.direccion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Calle Principal, 123"
          />
        </div>
        {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
      </div>

      {/* Código Postal */}
      <div>
        <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 mb-2">
          Código Postal *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="codigoPostal"
            name="codigoPostal"
            value={formData.codigoPostal}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.codigoPostal ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="28001"
          />
        </div>
        {errors.codigoPostal && <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>}
      </div>

      {/* Botón de registro */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {isSubmitting ? 'Registrando...' : 'Crear cuenta de empresa'}
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

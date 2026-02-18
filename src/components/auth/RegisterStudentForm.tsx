'use client';

import { useState } from 'react';
import { z } from 'zod';
import { UserIcon, EnvelopeIcon, LockClosedIcon, CalendarIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

// Schema de validación con Zod
const studentSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  repeatPassword: z.string(),
  pais: z.string().min(1, 'Debe seleccionar un país'),
  aceptarTerminos: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar los términos y condiciones',
  }),
}).refine((data) => data.password === data.repeatPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['repeatPassword'],
});

type StudentFormData = z.infer<typeof studentSchema>;

interface RegisterStudentFormProps {
  onSuccess?: () => void;
}

export default function RegisterStudentForm({ onSuccess }: RegisterStudentFormProps) {
  const [formData, setFormData] = useState<Partial<StudentFormData>>({
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    email: '',
    password: '',
    repeatPassword: '',
    pais: '',
    aceptarTerminos: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof StudentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // Validar con Zod
    const result = studentSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof StudentFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof StudentFormData;
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
          role: 'student',
          ...result.data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar usuario');
      }

      const data = await response.json();
      console.log('Registro exitoso:', data);

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirigir a login o dashboard
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      setSubmitError(error instanceof Error ? error.message : 'Error al registrar usuario');
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

      {/* Nombre y Apellidos en grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
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
              placeholder="Juan"
            />
          </div>
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>

        <div>
          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.apellidos ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="García López"
            />
          </div>
          {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>}
        </div>
      </div>

      {/* Fecha de nacimiento */}
      <div>
        <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de nacimiento *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email *
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
            placeholder="tu@email.com"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Contraseña y repetir contraseña */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Repetir contraseña *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="repeatPassword"
              name="repeatPassword"
              value={formData.repeatPassword}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.repeatPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.repeatPassword && <p className="mt-1 text-sm text-red-600">{errors.repeatPassword}</p>}
        </div>
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

      {/* Términos y condiciones */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            name="aceptarTerminos"
            checked={formData.aceptarTerminos || false}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
          />
          <span className="ml-2 text-sm text-gray-700">
            Acepto los{' '}
            <a href="/terminos" className="text-green-600 hover:text-green-700 font-medium">
              términos y condiciones
            </a>{' '}
            y la{' '}
            <a href="/privacidad" className="text-green-600 hover:text-green-700 font-medium">
              política de privacidad
            </a>
          </span>
        </label>
        {errors.aceptarTerminos && <p className="mt-1 text-sm text-red-600">{errors.aceptarTerminos}</p>}
      </div>

      {/* Botón de registro */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {isSubmitting ? 'Registrando...' : 'Crear cuenta de estudiante'}
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

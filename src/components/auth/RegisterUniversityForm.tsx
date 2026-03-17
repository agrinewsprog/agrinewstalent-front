'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  AcademicCapIcon,
  GlobeAltIcon,
  MapPinIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/src/lib/api/client';

interface RegisterUniversityFormProps {
  onSuccess?: () => void;
}

export default function RegisterUniversityForm({ onSuccess }: RegisterUniversityFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.registerForm');

  const universitySchema = z
    .object({
      universityName: z.string().min(3, t('errors.universityNameMin')),
      country: z.string().min(1, t('errors.countryRequired')),
      city: z.string().min(2, t('errors.cityMin')),
      website: z
        .string()
        .url(t('errors.invalidUrl'))
        .min(1, t('errors.urlRequired')),
      email: z.string().email(t('errors.invalidEmail')),
      password: z.string().min(6, t('errors.passwordMinSix')),
      confirmPassword: z.string().min(1, t('errors.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('errors.passwordsMismatch'),
      path: ['confirmPassword'],
    });
  type UniversityFormData = z.infer<typeof universitySchema>;

  const [formData, setFormData] = useState<Partial<UniversityFormData>>({
    universityName: '',
    country: '',
    city: '',
    website: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UniversityFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof UniversityFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    const result = universitySchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UniversityFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof UniversityFormData;
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Enviamos los campos que la API espera; confirmPassword no va al servidor
      const { confirmPassword: _, ...apiPayload } = result.data;
      await api.post('/api/auth/register', {
        role: 'UNIVERSITY',
        ...apiPayload,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/intranet/university/dashboard`);
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      // La API devuelve { error: { message, code, details? } }
      const apiMessage =
        error?.data?.error?.message ||
        error?.message ||
        t('errors.registrationError');
      setSubmitError(apiMessage);
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
          <strong>{t('universityInfoTitle')}:</strong> {t('universityInfoText')}
        </p>
      </div>

      {/* Nombre de la universidad */}
      <div>
        <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-2">
          {t('universityName')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AcademicCapIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="universityName"
            name="universityName"
            value={formData.universityName}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.universityName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('universityNamePlaceholder')}
          />
        </div>
        {errors.universityName && <p className="mt-1 text-sm text-red-600">{errors.universityName}</p>}
      </div>

      {/* País */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
          {t('country')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('countryPlaceholder')}</option>
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
        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
      </div>

      {/* Ciudad */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          {t('city')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('cityPlaceholder')}
          />
        </div>
        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
      </div>

      {/* Web */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
          {t('website')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('websitePlaceholder')}
          />
        </div>
        {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
      </div>

      {/* Email de contacto */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('accessEmail')} *
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
            placeholder={t('accessEmailPlaceholder')}
            autoComplete="email"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        <p className="mt-1 text-xs text-gray-500">
          {t('accessEmailHint')}
        </p>
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('password')} *
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
            autoComplete="new-password"
          />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* Confirmar contraseña */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          {t('confirmPassword')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('confirmPasswordPlaceholder')}
            autoComplete="new-password"
          />
        </div>
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>

      {/* Botón de registro */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {isSubmitting ? t('submittingUniversity') : t('submitUniversity')}
      </button>

      {/* Link a login */}
      <p className="text-center text-sm text-gray-600">
        {t('alreadyHaveAccount')}{' '}
        <a href={`/${locale}/login`} className="text-green-600 hover:text-green-700 font-medium">
          {t('signIn')}
        </a>
      </p>
    </form>
  );
}

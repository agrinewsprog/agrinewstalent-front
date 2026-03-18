'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CalendarIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/src/lib/api/client';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface RegisterStudentFormProps {
  onSuccess?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function RegisterStudentForm({ onSuccess }: RegisterStudentFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.registerForm');

  /* ---- Zod schema ------------------------------------------------ */
  const studentSchema = z
    .object({
      nombre: z.string().min(2, t('errors.nameMin')),
      apellidos: z.string().min(2, t('errors.lastNameMin')),
      fechaNacimiento: z.string().min(1, t('errors.dateRequired')),
      email: z.string().email(t('errors.invalidEmail')),
      password: z.string().min(8, t('errors.passwordMin')),
      repeatPassword: z.string(),
      pais: z.string().min(1, t('errors.countryRequired')),
      isStudent: z.boolean(),
      universidad: z.string().optional(),
      inviteCode: z.string().optional(),
      aceptarTerminos: z
        .boolean()
        .refine((v) => v === true, { message: t('errors.termsRequired') }),
    })
    .refine((d) => d.password === d.repeatPassword, {
      message: t('errors.passwordsMismatch'),
      path: ['repeatPassword'],
    });

  type StudentFormData = z.infer<typeof studentSchema>;

  /* ---- State ---------------------------------------------------- */
  const [formData, setFormData] = useState<Partial<StudentFormData>>({
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    email: '',
    password: '',
    repeatPassword: '',
    pais: '',
    isStudent: true,
    universidad: '',
    inviteCode: '',
    aceptarTerminos: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* ---- Handlers ------------------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof StudentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProfileTypeChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, isStudent: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const result = studentSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof StudentFormData, string>> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const key = issue.path[0] as keyof StudentFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email: result.data.email,
        password: result.data.password,
        firstName: result.data.nombre,
        lastName: result.data.apellidos,
        dateOfBirth: result.data.fechaNacimiento,
        country: result.data.pais,
        isStudent: result.data.isStudent,
        isActiveStudent: result.data.isStudent,
        university: result.data.universidad || undefined,
        inviteCode: result.data.inviteCode || undefined,
        role: 'STUDENT' as const,
      };

      await api.post('/api/auth/register', payload);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/intranet`);
      }
    } catch {
      setSubmitError(t('errors.registrationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- Countries list ------------------------------------------- */
  const countries = [
    'España',
    'Portugal',
    'Francia',
    'Italia',
    'Alemania',
    'Reino Unido',
    'Países Bajos',
    'Bélgica',
    'Marruecos',
    'México',
    'Colombia',
    'Argentina',
    'Chile',
    'Perú',
    'Brasil',
  ];

  /* ---- Reusable text-input renderer ----------------------------- */
  const renderField = (
    name: keyof StudentFormData,
    label: string,
    placeholder: string,
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    type: string = 'text',
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={name}
          name={name}
          type={type}
          value={(formData[name] as string) ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  /* ---- Render --------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {submitError}
        </div>
      )}

      {/* Profile type selector */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          {t('situationQuestion')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleProfileTypeChange(true)}
            className={`flex flex-col items-center gap-1 p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
              formData.isStudent
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <AcademicCapIcon className="h-5 w-5" />
            {t('imStudent')}
            <span className="text-xs font-normal opacity-70">{t('currentlyStudying')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleProfileTypeChange(false)}
            className={`flex flex-col items-center gap-1 p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
              !formData.isStudent
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <UserIcon className="h-5 w-5" />
            {t('lookingForJob')}
            <span className="text-xs font-normal opacity-70">{t('professional')}</span>
          </button>
        </div>
      </div>

      {/* First name */}
      {renderField('nombre', t('firstName'), t('firstNamePlaceholder'), UserIcon)}

      {/* Last name */}
      {renderField('apellidos', t('lastName'), t('lastNamePlaceholder'), UserIcon)}

      {/* Date of birth */}
      {renderField('fechaNacimiento', t('dateOfBirth'), '', CalendarIcon, 'date')}

      {/* Email */}
      {renderField('email', t('email'), t('emailPlaceholder'), EnvelopeIcon, 'email')}

      {/* Password */}
      {renderField('password', t('password'), '••••••••', LockClosedIcon, 'password')}

      {/* Repeat password */}
      {renderField('repeatPassword', t('repeatPassword'), '••••••••', LockClosedIcon, 'password')}

      {/* Country */}
      <div>
        <label htmlFor="pais" className="block text-sm font-medium text-gray-700 mb-1">
          {t('country')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="pais"
            name="pais"
            value={(formData.pais as string) ?? ''}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.pais ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">{t('countryPlaceholder')}</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {errors.pais && <p className="mt-1 text-xs text-red-600">{errors.pais}</p>}
      </div>

      {/* University (shown only when isStudent) */}
      {formData.isStudent && (
        <div>
          <label htmlFor="universidad" className="block text-sm font-medium text-gray-700 mb-1">
            {t('university')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AcademicCapIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="universidad"
              name="universidad"
              type="text"
              value={formData.universidad ?? ''}
              onChange={handleChange}
              placeholder={t('universityPlaceholder')}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">{t('universityHint')}</p>
        </div>
      )}

      {/* Invite code (shown only when isStudent) */}
      {formData.isStudent && (
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
            {t('inviteCode')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={formData.inviteCode ?? ''}
              onChange={handleChange}
              placeholder={t('inviteCodePlaceholder')}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="flex items-start gap-2">
        <input
          id="aceptarTerminos"
          name="aceptarTerminos"
          type="checkbox"
          checked={!!formData.aceptarTerminos}
          onChange={handleChange}
          className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor="aceptarTerminos" className="text-sm text-gray-600">
          {t('termsAccept')}{' '}
          <a href="/terms" className="text-green-600 hover:underline">
            {t('terms')}
          </a>{' '}
          {t('termsAnd')}{' '}
          <a href="/privacy" className="text-green-600 hover:underline">
            {t('privacy')}
          </a>
        </label>
      </div>
      {errors.aceptarTerminos && (
        <p className="text-xs text-red-600">{errors.aceptarTerminos}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('submitting') : t('submitStudent')}
      </button>

      {/* Link to login */}
      <p className="text-center text-sm text-gray-600">
        {t('alreadyHaveAccount')}{' '}
        <a href={`/${locale}/login`} className="text-green-600 hover:underline font-medium">
          {t('signIn')}
        </a>
      </p>
    </form>
  );
}

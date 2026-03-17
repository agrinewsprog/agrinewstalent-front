'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { UserIcon, EnvelopeIcon, LockClosedIcon, CalendarIcon, GlobeAltIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { api } from '@/src/lib/api/client';

interface RegisterStudentFormProps {
  onSuccess?: () => void;
}

export default function RegisterStudentForm({ onSuccess }: RegisterStudentFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.registerForm');

  // Schema de validación con Zod - condicional según isStudent
  const createStudentSchema = (isStudent: boolean) => {
    const baseSchema = z.object({
      nombre:           z.string().min(2, t('errors.nameMin')),
      apellidos:        z.string().min(2, t('errors.lastNameMin')),
      fechaNacimiento:  z.string().min(1, t('errors.dateRequired')),
      email:            z.string().email(t('errors.invalidEmail')),
      password:         z.string().min(8, t('errors.passwordMin')),
      repeatPassword:   z.string(),
      pais:             z.string().min(1, t('errors.countryRequired')),
      isStudent:        z.boolean(),
      universidad:      isStudent ? z.string().optional() : z.string().optional(),
      inviteCode:       isStudent ? z.string().optional() : z.string().optional(),
      aceptarTerminos:  z.boolean().refine((val) => val === true, { message: t('errors.termsRequired') }),
    });
    return baseSchema.refine((data) => data.password === data.repeatPassword, {
      message: t('errors.passwordsMismatch'),
      path: ['repeatPassword'],
    });
  };

  type StudentFormData = z.infer<ReturnType<typeof createStudentSchema>>;

  const [formData, setFormData] = useState<Partial<StudentFormData>>({
    nombre: '', apellidos: '', fechaNacimiento: '', email: '',
    password: '', repeatPassword: '', pais: '',
    isStudent: true, universidad: '', inviteCode: '', aceptarTerminos: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name as keyof StudentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProfileTypeChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, isStudent: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    const studentSchema = createStudentSchema(formData.isStudent ?? true);
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
      const payload = {
        role:                 'STUDENT',
        firstName:            result.data.nombre,
        lastName:             result.data.apellidos,
        dateOfBirth:          result.data.fechaNacimiento,
        email:                result.data.email,
        password:             result.data.password,
        country:              result.data.pais,
        isStudent:            result.data.isStudent,
        isActiveStudent:      result.data.isStudent,
        universityInviteCode: result.data.inviteCode,
      };
      await api.post('/api/auth/register', payload);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/intranet/student/dashboard`);
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      setSubmitError(error?.data?.error?.message ?? error?.message ?? t('errors.registrationError'));
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

      {/* Selector: Busco empleo vs Soy estudiante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('situationQuestion')} *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleProfileTypeChange(false)}
            className={`p-4 border-2 rounded-lg transition-all ${
              !formData.isStudent ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <UserIcon className={`h-8 w-8 mb-2 ${!formData.isStudent ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">{t('lookingForJob')}</span>
              <span className="text-xs text-gray-500 mt-1">{t('professional')}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleProfileTypeChange(true)}
            className={`p-4 border-2 rounded-lg transition-all ${
              formData.isStudent ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <AcademicCapIcon className={`h-8 w-8 mb-2 ${formData.isStudent ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">{t('imStudent')}</span>
              <span className="text-xs text-gray-500 mt-1">{t('currentlyStudying')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Nombre y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            {t('firstName')} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('firstNamePlaceholder')}
            />
          </div>
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>
        <div>
          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
            {t('lastName')} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.apellidos ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('lastNamePlaceholder')}
            />
          </div>
          {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>}
        </div>
      </div>

      {/* Fecha de nacimiento */}
      <div>
        <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-2">
          {t('dateOfBirth')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date" id="fechaNacimiento" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        {errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('email')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email" id="email" name="email" value={formData.email} onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('emailPlaceholder')}
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Contraseña y repetir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {t('password')} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password" id="password" name="password" value={formData.password} onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {t('repeatPassword')} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password" id="repeatPassword" name="repeatPassword" value={formData.repeatPassword} onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.repeatPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
            />
          </div>
          {errors.repeatPassword && <p className="mt-1 text-sm text-red-600">{errors.repeatPassword}</p>}
        </div>
      </div>

      {/* País */}
      <div>
        <label htmlFor="pais" className="block text-sm font-medium text-gray-700 mb-2">
          {t('country')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="pais" name="pais" value={formData.pais} onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.pais ? 'border-red-500' : 'border-gray-300'}`}
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
        {errors.pais && <p className="mt-1 text-sm text-red-600">{errors.pais}</p>}
      </div>

      {/* Campos condicionales para estudiantes */}
      {formData.isStudent && (
        <>
          <div>
            <label htmlFor="universidad" className="block text-sm font-medium text-gray-700 mb-2">
              {t('university')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AcademicCapIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text" id="universidad" name="universidad" value={formData.universidad} onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder={t('universityPlaceholder')}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('universityHint')}</p>
          </div>
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
              {t('inviteCode')}
            </label>
            <input
              type="text" id="inviteCode" name="inviteCode" value={formData.inviteCode} onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder={t('inviteCodePlaceholder')}
            />
          </div>
        </>
      )}

      {/* Términos y condiciones */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox" name="aceptarTerminos"
            checked={formData.aceptarTerminos || false} onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
          />
          <span className="ml-2 text-sm text-gray-700">
            {t('termsAccept')}{' '}
            <a href={`/${locale}/terminos`} className="text-green-600 hover:text-green-700 font-medium">
              {t('terms')}
            </a>{' '}
            {t('termsAnd')}{' '}
            <a href={`/${locale}/privacidad`} className="text-green-600 hover:text-green-700 font-medium">
              {t('privacy')}
            </a>
          </span>
        </label>
        {errors.aceptarTerminos && <p className="mt-1 text-sm text-red-600">{errors.aceptarTerminos}</p>}
      </div>

      {/* Botón de registro */}
      <button
        type="submit" disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {isSubmitting ? t('submitting') : t('submitStudent')}
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

// Schema de validación con Zod - condicional según isStudent
const createStudentSchema = (isStudent: boolean) => {
  const baseSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
    fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    repeatPassword: z.string(),
    pais: z.string().min(1, 'Debe seleccionar un país'),
    isStudent: z.boolean(),
    universidad: isStudent ? z.string().optional() : z.string().optional(),
    inviteCode: isStudent ? z.string().optional() : z.string().optional(),
    aceptarTerminos: z.boolean().refine((val) => val === true, {
      message: 'Debe aceptar los términos y condiciones',
    }),
  });
  
  return baseSchema.refine((data) => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword'],
  });
};

type StudentFormData = z.infer<ReturnType<typeof createStudentSchema>>;

interface RegisterStudentFormProps {
  onSuccess?: () => void;
}

export default function RegisterStudentForm({ onSuccess }: RegisterStudentFormProps) {
  const router = useRouter();
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

  const handleProfileTypeChange = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isStudent: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // Validar con Zod
    const studentSchema = createStudentSchema(formData.isStudent ?? true);
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
      const payload = {
        role: 'STUDENT',
        firstName:            result.data.nombre,
        lastName:             result.data.apellidos,
        dateOfBirth:          result.data.fechaNacimiento,
        email:                result.data.email,
        password:             result.data.password,
        country:              result.data.pais,
        isStudent:            result.data.isStudent,
        isActiveStudent:      result.data.isStudent,
        universityInviteCode: result.data.inviteCode,
      };

      await api.post('/api/auth/register', payload);

      // Redirigir a dashboard de estudiante
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/intranet/student/dashboard');
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      const apiMessage =
        error?.data?.error?.message ||
        error?.message ||
        'Error al registrar usuario';
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

      {/* Selector: Busco empleo vs Soy estudiante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ¿Cuál es tu situación? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleProfileTypeChange(false)}
            className={`p-4 border-2 rounded-lg transition-all ${
              !formData.isStudent
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <UserIcon className={`h-8 w-8 mb-2 ${!formData.isStudent ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">Busco empleo</span>
              <span className="text-xs text-gray-500 mt-1">Profesional</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleProfileTypeChange(true)}
            className={`p-4 border-2 rounded-lg transition-all ${
              formData.isStudent
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <AcademicCapIcon className={`h-8 w-8 mb-2 ${formData.isStudent ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">Soy estudiante</span>
              <span className="text-xs text-gray-500 mt-1">Actualmente estudiando</span>
            </div>
          </button>
        </div>
      </div>

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

      {/* Campos condicionales para estudiantes */}
      {formData.isStudent && (
        <>
          <div>
            <label htmlFor="universidad" className="block text-sm font-medium text-gray-700 mb-2">
              Universidad (opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AcademicCapIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="universidad"
                name="universidad"
                value={formData.universidad}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Universidad de..."
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Indica tu universidad si deseas conectar con ofertas específicas
            </p>
          </div>

          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
              Código de invitación (opcional)
            </label>
            <input
              type="text"
              id="inviteCode"
              name="inviteCode"
              value={formData.inviteCode}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Código proporcionado por tu universidad"
            />
          </div>
        </>
      )}

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
        {isSubmitting ? 'Registrando...' : 'Crear mi cuenta'}
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

'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  IdentificationIcon,
  GlobeAltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/src/lib/api/client';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface RegisterCompanyFormProps {
  onSuccess?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function RegisterCompanyForm({ onSuccess }: RegisterCompanyFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.registerForm');

  /* ---- Zod schema (uses translated error messages) --------------- */
  const companySchema = z
    .object({
      email: z.string().email(t('errors.invalidEmail')),
      password: z.string().min(8, t('errors.passwordMin')),
      repeatPassword: z.string(),
      telefono: z.string().min(9, t('errors.phoneMin')),
      razonSocial: z.string().min(3, t('errors.companyNameMin')),
      cif: z.string().min(5, t('errors.taxIdMin')),
      pais: z.string().min(1, t('errors.countryRequired')),
      direccion: z.string().min(5, t('errors.addressMin')),
      codigoPostal: z.string().min(4, t('errors.postalCodeMin')),
      aceptarTerminos: z
        .boolean()
        .refine((v) => v === true, { message: t('errors.termsRequired') }),
    })
    .refine((d) => d.password === d.repeatPassword, {
      message: t('errors.passwordsMismatch'),
      path: ['repeatPassword'],
    });

  type CompanyFormData = z.infer<typeof companySchema>;

  /* ---- State ----------------------------------------------------- */
  const [formData, setFormData] = useState<Partial<CompanyFormData>>({
    email: '',
    password: '',
    repeatPassword: '',
    telefono: '',
    razonSocial: '',
    cif: '',
    pais: '',
    direccion: '',
    codigoPostal: '',
    aceptarTerminos: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* ---- Handlers -------------------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof CompanyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const result = companySchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CompanyFormData, string>> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const key = issue.path[0] as keyof CompanyFormData;
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
        phone: result.data.telefono,
        companyName: result.data.razonSocial,
        taxId: result.data.cif,
        country: result.data.pais,
        address: result.data.direccion,
        postalCode: result.data.codigoPostal,
        role: 'COMPANY' as const,
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

  /* ---- Reusable field renderer ----------------------------------- */
  const renderField = (
    name: keyof CompanyFormData,
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

  /* ---- Countries list -------------------------------------------- */
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

  /* ---- Render ---------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {submitError}
        </div>
      )}

      {/* Email */}
      {renderField('email', t('corporateEmail'), t('corporateEmailPlaceholder'), EnvelopeIcon, 'email')}

      {/* Password */}
      {renderField('password', t('password'), '••••••••', LockClosedIcon, 'password')}

      {/* Repeat password */}
      {renderField('repeatPassword', t('repeatPassword'), '••••••••', LockClosedIcon, 'password')}

      {/* Phone */}
      {renderField('telefono', t('phone'), t('phonePlaceholder'), PhoneIcon)}

      {/* Company name */}
      {renderField('razonSocial', t('companyName'), t('companyNamePlaceholder'), BuildingOffice2Icon)}

      {/* Tax ID */}
      {renderField('cif', t('taxId'), t('taxIdPlaceholder'), IdentificationIcon)}

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

      {/* Address */}
      {renderField('direccion', t('address'), t('addressPlaceholder'), MapPinIcon)}

      {/* Postal code */}
      {renderField('codigoPostal', t('postalCode'), t('postalCodePlaceholder'), MapPinIcon)}

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
        {isSubmitting ? t('submitting') : t('submitCompany')}
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { api, ApiClientError } from '@/src/lib/api/client';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'estudiante' | 'empresa'>('empresa');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<LoginFormData>>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const p = err.path[0] as keyof LoginFormData;
        fieldErrors[p] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const loginResponse = await api.post<{
        token?: string;
        accessToken?: string;
        user?: { role?: string };
        role?: string;
      }>('/api/auth/login', result.data);

      const token = loginResponse?.token ?? loginResponse?.accessToken ?? '';
      const roleFromLogin = loginResponse?.user?.role ?? loginResponse?.role ?? '';
      let role = roleFromLogin;

      if (!role) {
        try {
          const meData = await api.get<{ user?: { role?: string }; role?: string }>(
            '/api/auth/me',
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
          );
          role = meData?.user?.role ?? meData?.role ?? '';
        } catch (meErr) {
          const hint =
            meErr instanceof ApiClientError && meErr.status === 401
              ? 'Sesión no establecida. Verifica la configuración de cookies/CORS.'
              : 'Login correcto pero no se pudo verificar la sesión. Inténtalo de nuevo.';
          throw new Error(hint);
        }
      }

      if (token) {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }

      const dashboardByRole: Record<string, string> = {
        COMPANY:     '/intranet/company/dashboard',
        STUDENT:     '/intranet/student/dashboard',
        UNIVERSITY:  '/intranet/university/dashboard',
        SUPER_ADMIN: '/intranet/admin/dashboard',
        company:     '/intranet/company/dashboard',
        student:     '/intranet/student/dashboard',
        university:  '/intranet/university/dashboard',
        super_admin: '/intranet/admin/dashboard',
        admin:       '/intranet/admin/dashboard',
        ADMIN:       '/intranet/admin/dashboard',
      };

      router.push(dashboardByRole[role] ?? '/intranet');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Credenciales incorrectas. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Ondas decorativas verdes */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          viewBox="0 0 900 600"
          preserveAspectRatio="xMidYMid slice"
          className="absolute bottom-0 left-0 w-full h-full"
        >
          <path
            d="M0 420 C150 300 350 510 520 370 S760 210 900 330 L900 600 L0 600 Z"
            fill="#bbf7d0"
          />
          <path
            d="M0 460 C200 340 420 530 620 420 S820 300 900 390 L900 600 L0 600 Z"
            fill="#86efac"
          />
          <path
            d="M0 510 C250 400 430 570 680 470 S840 370 900 450 L900 600 L0 600 Z"
            fill="#4ade80"
            opacity="0.65"
          />
        </svg>
        <svg
          viewBox="0 0 700 500"
          preserveAspectRatio="xMidYMid slice"
          className="absolute -top-16 -right-16 w-1/2 h-1/2 opacity-40"
        >
          <ellipse cx="500" cy="150" rx="400" ry="260" fill="#dcfce7" />
        </svg>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-xl px-8 pt-7 pb-8">

          <h1 className="text-2xl font-bold text-center mb-4">Iniciar sesión</h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-center text-sm font-semibold text-gray-700 mb-1">
              Rellena tus datos
            </p>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            {/* Email */}
            <div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`block w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors placeholder-gray-400 ${
                  errors.email ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className={`block w-full px-4 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors placeholder-gray-400 ${
                    errors.password ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a
                href="/recuperar-password"
                className="text-xs text-gray-500 hover:text-green-600 transition-colors"
              >
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Registro */}
          <p className="mt-5 text-center text-xs text-gray-500">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="text-green-600 hover:text-green-700 font-semibold">
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

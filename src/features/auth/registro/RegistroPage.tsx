'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  UserIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import RegisterStudentForm from '@/src/components/auth/RegisterStudentForm';
import RegisterCompanyForm from '@/src/components/auth/RegisterCompanyForm';
import RegisterUniversityForm from '@/src/components/auth/RegisterUniversityForm';

type Role = 'student' | 'company' | 'university';

export default function RegistroPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const t = useTranslations('auth.register');

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const roles: { key: Role; icon: React.ElementType; label: string; desc: string }[] = [
    { key: 'student',    icon: UserIcon,           label: t('student'),    desc: t('studentDesc') },
    { key: 'company',    icon: BuildingOfficeIcon,  label: t('company'),    desc: t('companyDesc') },
    { key: 'university', icon: AcademicCapIcon,     label: t('university'), desc: t('universityDesc') },
  ];

  const handleSuccess = () => {
    // Each form already redirects to its dashboard; here as a fallback
    window.location.href = `/${locale}/intranet`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden py-10">
      {/* Decorative waves */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          viewBox="0 0 900 600"
          preserveAspectRatio="xMidYMid slice"
          className="absolute bottom-0 left-0 w-full h-full"
        >
          <path d="M0 420 C150 300 350 510 520 370 S760 210 900 330 L900 600 L0 600 Z" fill="#bbf7d0" />
          <path d="M0 460 C200 340 420 530 620 420 S820 300 900 390 L900 600 L0 600 Z" fill="#86efac" />
          <path d="M0 510 C250 400 430 570 680 470 S840 370 900 450 L900 600 L0 600 Z" fill="#4ade80" opacity="0.65" />
        </svg>
        <svg
          viewBox="0 0 700 500"
          preserveAspectRatio="xMidYMid slice"
          className="absolute -top-16 -right-16 w-1/2 h-1/2 opacity-40"
        >
          <ellipse cx="500" cy="150" rx="400" ry="260" fill="#dcfce7" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white rounded-2xl shadow-xl px-8 pt-7 pb-8">
          <h1 className="text-2xl font-bold text-center mb-6">{t('title')}</h1>

          {/* Role selector */}
          {!selectedRole && (
            <div className="space-y-3">
              {roles.map(({ key, icon: Icon, label, desc }) => (
                <button
                  key={key}
                  onClick={() => setSelectedRole(key)}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Icon className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Back button + form */}
          {selectedRole && (
            <>
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors mb-5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('title')}
              </button>

              {selectedRole === 'student' && (
                <RegisterStudentForm onSuccess={handleSuccess} />
              )}
              {selectedRole === 'company' && (
                <RegisterCompanyForm onSuccess={handleSuccess} />
              )}
              {selectedRole === 'university' && (
                <RegisterUniversityForm onSuccess={handleSuccess} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

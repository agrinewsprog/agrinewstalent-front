'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { UserCircleIcon, BuildingOfficeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import RegisterStudentForm from '@/src/components/auth/RegisterStudentForm';
import RegisterCompanyForm from '@/src/components/auth/RegisterCompanyForm';
import RegisterUniversityForm from '@/src/components/auth/RegisterUniversityForm';

type UserType = 'student' | 'company' | 'university';

interface TabOption {
  value: UserType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: TabOption[] = [
  {
    value: 'student',
    label: 'Soy estudiante',
    icon: UserCircleIcon,
    description: 'Encuentra prácticas y oportunidades laborales',
  },
  {
    value: 'company',
    label: 'Soy empresa',
    icon: BuildingOfficeIcon,
    description: 'Publica ofertas y encuentra talento',
  },
  {
    value: 'university',
    label: 'Soy universidad',
    icon: AcademicCapIcon,
    description: 'Gestiona programas y conecta con empresas',
  },
];

export default function RegistroPage() {
  const [activeTab, setActiveTab] = useState<UserType>('student');

  const renderForm = () => {
    switch (activeTab) {
      case 'student':
        return <RegisterStudentForm />;
      case 'company':
        return <RegisterCompanyForm />;
      case 'university':
        return <RegisterUniversityForm />;
      default:
        return <RegisterStudentForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 rounded-full p-3">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Únete a AgriNews Talent
          </h1>
          <p className="text-lg text-gray-600">
            Crea tu cuenta y accede a la plataforma líder en empleo agrícola
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-lg">
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative px-6 py-4 text-center transition-all ${
                      isActive
                        ? 'bg-green-50 border-b-4 border-green-600'
                        : 'bg-white hover:bg-gray-50 border-b-4 border-transparent'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Icon
                        className={`h-8 w-8 mb-2 transition-colors ${
                          isActive ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`font-semibold text-sm transition-colors ${
                          isActive ? 'text-green-700' : 'text-gray-600'
                        }`}
                      >
                        {tab.label}
                      </span>
                      <span
                        className={`text-xs mt-1 transition-colors ${
                          isActive ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {tab.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Container */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {tabs.find((t) => t.value === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mt-1">
                Completa el formulario para crear tu cuenta
              </p>
            </div>

            {/* Render active form */}
            {renderForm()}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Al registrarte, aceptas nuestros{' '}
            <a href="/terminos" className="text-green-600 hover:text-green-700 font-medium">
              Términos y Condiciones
            </a>{' '}
            y{' '}
            <a href="/privacidad" className="text-green-600 hover:text-green-700 font-medium">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

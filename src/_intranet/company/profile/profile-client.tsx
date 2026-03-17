'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User } from '@/src/types';

interface CompanyProfileClientProps {
  user: User | null;
}

export function CompanyProfileClient({ user }: CompanyProfileClientProps) {
  const t = useTranslations('intranet');
  const [description, setDescription] = useState(
    'Editorial especializada en el mundo ganadero y agroindustrial. Con presencia internacional y miles de visitas mensuales, agriNews difunde conocimiento técnico entre productores, técnicos y empresas del sector. También ofrece servicios de comunicación y marketing digital, formación online, eventos sectoriales y soluciones a medida para el agro.',
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const actions = [
    {
      href: '/intranet/company/offers/new',
      label: t('company.profile.publishVacancies'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      href: '/intranet/company/offers',
      label: t('company.profile.viewVacancies'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: '/intranet/company/candidates',
      label: t('company.profile.viewCandidates'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const companyName = user?.name ?? 'Mi Empresa';
  const companyEmail = user?.email ?? '';

  return (
    <div className="space-y-6 pb-8">
      {/* Banner + Logo */}
      <div className="relative">
        {/* Banner image */}
        <div className="w-full h-44 rounded-xl overflow-hidden relative bg-green-800">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80"
            alt="Banner empresa"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Logo circle */}
        <div className="absolute -bottom-10 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
            <div className="flex flex-col items-center leading-none select-none">
              {/* Leaf icon */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C10 4 5 9 5 15c0 3.5 1.8 6.5 4.5 8.5l1.2-3.5C9 18.5 8 17 8 15c0-4.4 3.6-8 8-8s8 3.6 8 8c0 2-.8 3.8-2 5.1l1.2 3.4C25.2 21.5 27 18.5 27 15c0-6-5-11-11-11z" fill="#16a34a"/>
                <circle cx="16" cy="15" r="3" fill="#16a34a"/>
                <line x1="16" y1="18" x2="16" y2="28" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-xs font-black text-gray-800 tracking-tight mt-0.5">
                agri<span className="text-green-600">News</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className="pt-10 px-1">
        <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            25 mayo 1987
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {companyEmail || 'example@gmail.com'}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            España
          </span>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3">{t('company.profile.description')}</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-100 text-green-700'
                : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-60'
            }`}
          >
            {saving ? t('company.profile.saving') : saved ? t('company.profile.saved') : t('company.profile.save')}
          </button>
        </div>
      </div>

      {/* Vacantes y Candidatos */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5">{t('company.profile.vacanciesTitle')}</h2>
        <div className="flex flex-wrap gap-6">
          {actions.map((action) => (
            <Link key={action.label} href={action.href} className="flex flex-col items-center gap-3 group">
              <div className="w-20 h-20 rounded-full bg-green-700 hover:bg-green-800 text-white flex items-center justify-center shadow transition-colors">
                {action.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-green-700 transition-colors text-center max-w-[80px]">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

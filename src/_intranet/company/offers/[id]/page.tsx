'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  UserGroupIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  LanguageIcon,
  CalendarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ApiOffer = {
  id: number;
  title: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  salary?: string | null;
  workMode?: 'remote' | 'hybrid' | 'onsite' | null;
  contractType?: 'full-time' | 'part-time' | 'internship' | 'freelance' | null;
  status?: string;
  createdAt?: string;
  company?: { companyName?: string; city?: string; country?: string };
};

type Offer = {
  id: string;
  titulo: string;
  categoria: 'Empleo' | 'Prácticas';
  jornada: 'Completa' | 'Parcial' | 'Flexible';
  modalidad: 'Presencial' | 'Remoto' | 'Híbrido';
  descripcion: string;
  requisitos: string;
  empresa: string;
  ubicacion: string;
  salario: string;
  fechaPublicacion: string;
  estado: 'Abierta' | 'Cerrada' | 'Borrador';
  idioma: string;
  contrato: string;
};

function apiOfferToOffer(a: ApiOffer): Offer {
  const workModeMap: Record<string, Offer['modalidad']> = {
    remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial',
  };
  const contractTypeToJornada: Record<string, Offer['jornada']> = {
    'full-time': 'Completa', 'part-time': 'Parcial',
    freelance: 'Flexible', internship: 'Completa',
  };
  const statusMap: Record<string, Offer['estado']> = {
    PUBLISHED: 'Abierta', CLOSED: 'Cerrada', DRAFT: 'Borrador',
  };
  return {
    id: String(a.id),
    titulo: a.title ?? '',
    categoria: a.contractType === 'internship' ? 'Prácticas' : 'Empleo',
    jornada: contractTypeToJornada[a.contractType ?? ''] ?? 'Completa',
    modalidad: workModeMap[a.workMode ?? ''] ?? 'Presencial',
    descripcion: a.description ?? '',
    requisitos: a.requirements ?? '',
    empresa: a.company?.companyName ?? '',
    ubicacion: a.location ?? '',
    salario: a.salary ?? '',
    fechaPublicacion: a.createdAt ?? new Date().toISOString(),
    estado: statusMap[a.status ?? ''] ?? 'Borrador',
    idioma: 'Español',
    contrato: a.contractType === 'internship' ? 'Prácticas' : 'Indefinido',
  };
}

/* ------------------------------------------------------------------ */
/*  Tag pill                                                           */
/* ------------------------------------------------------------------ */
function TagPill({ label, variant = 'default' }: { label: string; variant?: 'green' | 'blue' | 'yellow' | 'gray' | 'default' }) {
  const classes: Record<string, string> = {
    green:   'bg-green-100 text-green-800 border border-green-200',
    blue:    'bg-blue-100 text-blue-800 border border-blue-200',
    yellow:  'bg-yellow-100 text-yellow-800 border border-yellow-200',
    gray:    'bg-gray-100 text-gray-800 border border-gray-200',
    default: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${classes[variant]}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function CompanyOfferDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const locale  = useLocale();
  const t       = useTranslations('intranet');

  const offerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [offer,       setOffer]       = useState<Offer | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [loadError,   setLoadError]   = useState(false);

  const fetchOffer = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    setNotFound(false);

    try {
      const apiUrl  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res     = await fetch(`${apiUrl}/api/offers/${offerId}`, { credentials: 'include' });

      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok)            { setLoadError(true); return; }

      const data: ApiOffer = await res.json();
      setOffer(apiOfferToOffer(data));
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [offerId]);

  useEffect(() => { fetchOffer(); }, [fetchOffer]);

  /* ----- helpers ----------------------------------------- */
  const displayModalidad = (mod: Offer['modalidad']) =>
    mod === 'Remoto' ? t('status.remote') : mod === 'Híbrido' ? t('status.hybrid') : t('status.onsite');

  const displayEstado = (est: Offer['estado']) =>
    est === 'Abierta' ? t('status.open') : est === 'Cerrada' ? t('status.closed') : t('status.draft');

  const estatdoBadgeVariant = (est: Offer['estado']): 'green' | 'gray' | 'yellow' =>
    est === 'Abierta' ? 'green' : est === 'Cerrada' ? 'gray' : 'yellow';

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return iso; }
  };

  /* ----- loading ----------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        <span className="ml-3 text-gray-500 text-sm">{t('common.loading')}</span>
      </div>
    );
  }

  /* ----- not found ---------------------------------------- */
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BriefcaseIcon className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-800">{t('company.offerDetail.notFound')}</h2>
        <p className="text-gray-500 text-sm">{t('company.offerDetail.notFoundDesc')}</p>
        <Link
          href={`/${locale}/intranet/company/offers`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('company.offerDetail.backToOffers')}
        </Link>
      </div>
    );
  }

  /* ----- error ------------------------------------------- */
  if (loadError || !offer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600 font-medium">{t('company.offerDetail.errorLoading')}</p>
        <button
          onClick={fetchOffer}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('company.offerDetail.retry')}
        </button>
        <Link
          href={`/${locale}/intranet/company/offers`}
          className="flex items-center gap-2 text-sm text-green-600 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('company.offerDetail.backToOffers')}
        </Link>
      </div>
    );
  }

  /* ----- render ------------------------------------------ */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb / Back link */}
      <Link
        href={`/${locale}/intranet/company/offers`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('company.offerDetail.backToOffers')}
      </Link>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo placeholder */}
              <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                <BriefcaseIcon className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{offer.empresa || 'agriNews SL'}</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{offer.titulo}</h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <button
                onClick={() => router.push(`/${locale}/intranet/company/offers/${offer.id}/candidates`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserGroupIcon className="h-4 w-4" />
                {t('company.offerDetail.viewCandidates')}
              </button>
              <button
                onClick={() => router.push(`/${locale}/intranet/company/offers/${offer.id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4" />
                {t('company.offers.editOffer')}
              </button>
            </div>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <TagPill label={displayEstado(offer.estado)} variant={estatdoBadgeVariant(offer.estado)} />
            <TagPill
              label={offer.categoria === 'Prácticas' ? t('status.internship') : t('status.employment')}
              variant="blue"
            />
            <TagPill label={displayModalidad(offer.modalidad)} />
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm">
          {offer.ubicacion && (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPinIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <span>{offer.ubicacion}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-gray-600">
            <ClockIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>{offer.jornada === 'Completa' ? t('company.offerFormUI.scheduleFullTime') : offer.jornada === 'Parcial' ? t('company.offerFormUI.schedulePartTime') : t('company.offerFormUI.scheduleFlexible')}</span>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <LanguageIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>{offer.idioma || t('status.spanish')}</span>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <CalendarIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>{t('company.offerDetail.postedOn')} {formatDate(offer.fechaPublicacion)}</span>
          </div>
          {offer.salario && (
            <div className="flex items-start gap-2 text-gray-600">
              <BanknotesIcon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <span>{offer.salario}</span>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">{t('common.conditions')}</p>
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('common.contract')}</p>
              <p className="font-semibold text-gray-800">{offer.contrato}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('common.schedule')}</p>
              <p className="font-semibold text-gray-800">{offer.jornada}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('common.language')}</p>
              <p className="font-semibold text-gray-800">{offer.idioma || '—'}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">{t('common.description')}</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {offer.descripcion || '—'}
          </p>
        </div>

        {/* Requirements */}
        {offer.requisitos && (
          <div className="px-6 py-5">
            <p className="text-sm font-bold text-gray-800 mb-3">{t('common.requirements')}</p>
            <ul className="space-y-2">
              {offer.requisitos.split('\n').filter(Boolean).map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {line.replace(/^[-•]\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

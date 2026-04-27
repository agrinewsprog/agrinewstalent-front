'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// ─── Enums del backend ────────────────────────────────────────────────────────
const WORK_MODES = ['REMOTE', 'HYBRID', 'ON_SITE'] as const;
const CONTRACT_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE'] as const;

// ─── Tipos locales del formulario ─────────────────────────────────────────────
export interface OfferFormValues {
  titulo: string;
  pais: string;
  modalidad: string;      // backend enum: REMOTE | HYBRID | ON_SITE
  tipoContrato: string;   // backend enum: FULL_TIME | PART_TIME | INTERNSHIP | FREELANCE
  jornada: string;
  categoria: string;
  sector: string;
  idioma: string;
  descripcion: string;
  requisitos: string;
}

export const DEFAULT_FORM_VALUES: OfferFormValues = {
  titulo: '',
  pais: 'España',
  modalidad: 'ON_SITE',
  tipoContrato: 'FULL_TIME',
  jornada: 'FULL_TIME',
  categoria: 'EMPLOYMENT',
  sector: 'Avicultura',
  idioma: 'Español',
  descripcion: '',
  requisitos: '',
};

// ─── Mapeo al cuerpo de la API ────────────────────────────────────────────────
export function formToApiBody(v: OfferFormValues) {
  return {
    title: v.titulo,
    description: v.descripcion,
    requirements: v.requisitos || undefined,
    location: v.pais || undefined,
    workMode: v.modalidad,       // ya es el enum exacto del backend
    contractType: v.tipoContrato, // ya es el enum exacto del backend
  };
}

// ─── Opciones de UI ───────────────────────────────────────────────────────────
const PAISES = ['España', 'Portugal', 'México', 'Argentina', 'Colombia', 'Otro'];
const JORNADAS = ['FULL_TIME', 'PART_TIME', 'REDUCED', 'FLEXIBLE'] as const;
const CATEGORIAS = ['EMPLOYMENT', 'INTERNSHIP'] as const;
const SECTORES = ['Avicultura', 'Ganadería', 'Agrícola', 'Forestal', 'Veterinaria', 'Otro'];
const IDIOMAS = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Otro'];

// ─── Componente ───────────────────────────────────────────────────────────────
interface OfferFormUIProps {
  title: string;
  initialValues?: Partial<OfferFormValues>;
  onSubmit: (values: OfferFormValues) => Promise<void>;
  programId?: string;
  programName?: string;
}

export function OfferFormUI({ title, initialValues, onSubmit, programId, programName }: OfferFormUIProps) {
  const router = useRouter();
  const t = useTranslations('intranet');


  const [values, setValues] = useState<OfferFormValues>({
    ...DEFAULT_FORM_VALUES,
    ...initialValues,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof OfferFormValues, value: string) {
    setValues(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.titulo.trim()) { setError(t('company.offerFormUI.titleRequired')); return; }
    if (!values.descripcion.trim()) { setError(t('company.offerFormUI.descriptionRequired')); return; }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch {
      setError(t('company.offerFormUI.errorOccurred'));
    } finally {
      setLoading(false);
    }
  }

  const selectClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* Program context banner */}
      {programId && (
        <div className="mb-6 max-w-4xl mx-auto flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <div className="text-sm text-purple-800">
            <span className="font-medium">{t('company.offerFormUI.programBannerLabel')}</span>
            {programName ? (
              <span className="ml-1 font-semibold">{programName}</span>
            ) : (
              <span className="ml-1 text-purple-500">{t('company.offerFormUI.programBannerLoading')}</span>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-8 max-w-4xl mx-auto space-y-6"
      >
        {/* Fila 1: Título + País */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.titleLabel')}
            </label>
            <input
              type="text"
              value={values.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder={t('company.offerFormUI.titlePlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.countryLabel')}
            </label>
            <select value={values.pais} onChange={e => set('pais', e.target.value)} className={selectClass}>
              {PAISES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Fila 2: Modalidad + Tipo contrato + Jornada */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.modeLabel')}
            </label>
            <select value={values.modalidad} onChange={e => set('modalidad', e.target.value)} className={selectClass}>
              {WORK_MODES.map(wm => <option key={wm} value={wm}>{t(`company.offers.workMode.${wm}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.contractTypeLabel')}
            </label>
            <select value={values.tipoContrato} onChange={e => set('tipoContrato', e.target.value)} className={selectClass}>
              {CONTRACT_TYPES.map(ct => <option key={ct} value={ct}>{t(`company.offers.contractType.${ct}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.scheduleLabel')}
            </label>
            <select value={values.jornada} onChange={e => set('jornada', e.target.value)} className={selectClass}>
              {JORNADAS.map(j => <option key={j} value={j}>{t(`company.offers.schedule.${j}`)}</option>)}
            </select>
          </div>
        </div>

        {/* Fila 3: Categoría + Sector + Idioma */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.categoryLabel')}
            </label>
            <select value={values.categoria} onChange={e => set('categoria', e.target.value)} className={selectClass}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{t(`company.offers.category.${c}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.sectorLabel')}
            </label>
            <select value={values.sector} onChange={e => set('sector', e.target.value)} className={selectClass}>
              {SECTORES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.languageLabel')}
            </label>
            <select value={values.idioma} onChange={e => set('idioma', e.target.value)} className={selectClass}>
              {IDIOMAS.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* Textareas lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.descriptionLabel')}
            </label>
            <textarea
              value={values.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={10}
              placeholder={t('company.offerFormUI.descriptionPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.requirementsLabel')}
            </label>
            <textarea
              value={values.requisitos}
              onChange={e => set('requisitos', e.target.value)}
              rows={10}
              placeholder={t('company.offerFormUI.requirementsPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t('company.offerFormUI.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? t('company.offerFormUI.saving') : t('company.offerFormUI.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
}


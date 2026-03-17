'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// ─── Tipos locales del formulario ─────────────────────────────────────────────
export interface OfferFormValues {
  titulo: string;
  pais: string;
  modalidad: string;
  tipoContrato: string;
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
  modalidad: 'Presencial',
  tipoContrato: 'Temporal',
  jornada: 'Media jornada',
  categoria: 'Prácticas',
  sector: 'A-cultura',
  idioma: 'Español',
  descripcion: '',
  requisitos: '',
};

// ─── Mapeo al cuerpo de la API ────────────────────────────────────────────────
export function formToApiBody(v: OfferFormValues) {
  const workModeMap: Record<string, 'remote' | 'hybrid' | 'onsite'> = {
    Remoto: 'remote', Híbrido: 'hybrid', Presencial: 'onsite',
  };
  const contractMap: Record<string, 'full-time' | 'part-time' | 'internship' | 'freelance'> = {
    Prácticas: 'internship',
    'Tiempo completo': 'full-time',
    Temporal: 'part-time',
    Freelance: 'freelance',
  };
  return {
    title: v.titulo,
    description: v.descripcion,
    requirements: v.requisitos || undefined,
    location: v.pais || undefined,
    workMode: workModeMap[v.modalidad] ?? 'onsite',
    contractType: contractMap[v.categoria] ?? (v.jornada === 'Media jornada' ? 'part-time' : 'full-time'),
  };
}

// ─── Opciones de los combos ───────────────────────────────────────────────────
const PAISES = ['España', 'Portugal', 'México', 'Argentina', 'Colombia', 'Otro'];
const MODALIDADES = ['Presencial', 'Remoto', 'Híbrido'];
const CONTRATOS = ['Indefinido', 'Temporal', 'Por obra', 'Prácticas', 'Freelance'];
const JORNADAS = ['Jornada completa', 'Media jornada', 'Reducida', 'Flexible'];
const CATEGORIAS = ['Empleo', 'Prácticas'];
const SECTORES = ['A-cultura', 'Ganadería', 'Agrícola', 'Forestal', 'Veterinaria', 'Otro'];
const IDIOMAS = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Otro'];

// ─── Componente ───────────────────────────────────────────────────────────────
interface OfferFormUIProps {
  title: string;
  initialValues?: Partial<OfferFormValues>;
  onSubmit: (values: OfferFormValues) => Promise<void>;
}

export function OfferFormUI({ title, initialValues, onSubmit }: OfferFormUIProps) {
  const router = useRouter();
  const t = useTranslations('intranet');

  const MODALIDAD_LABELS: Record<string, string> = {
    'Presencial': t('company.offerFormUI.modeOnsite'),
    'Remoto': t('company.offerFormUI.modeRemote'),
    'H\u00edbrido': t('company.offerFormUI.modeHybrid'),
  };
  const CONTRATO_LABELS: Record<string, string> = {
    'Indefinido': t('company.offerFormUI.contractPermanent'),
    'Temporal': t('company.offerFormUI.contractTemporary'),
    'Por obra': t('company.offerFormUI.contractPerWork'),
    'Pr\u00e1cticas': t('company.offerFormUI.contractInternship'),
    'Freelance': t('company.offerFormUI.contractFreelance'),
  };
  const JORNADA_LABELS: Record<string, string> = {
    'Jornada completa': t('company.offerFormUI.scheduleFullTime'),
    'Media jornada': t('company.offerFormUI.schedulePartTime'),
    'Reducida': t('company.offerFormUI.scheduleReduced'),
    'Flexible': t('company.offerFormUI.scheduleFlexible'),
  };
  const CATEGORIA_LABELS: Record<string, string> = {
    'Empleo': t('company.offerFormUI.categoryEmployment'),
    'Pr\u00e1cticas': t('company.offerFormUI.categoryInternship'),
  };
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
    <div className="min-h-screen bg-gray-50 p-6">
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
              {MODALIDADES.map(m => <option key={m} value={m}>{MODALIDAD_LABELS[m] ?? m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.contractTypeLabel')}
            </label>
            <select value={values.tipoContrato} onChange={e => set('tipoContrato', e.target.value)} className={selectClass}>
              {CONTRATOS.map(c => <option key={c} value={c}>{CONTRATO_LABELS[c] ?? c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {t('company.offerFormUI.scheduleLabel')}
            </label>
            <select value={values.jornada} onChange={e => set('jornada', e.target.value)} className={selectClass}>
              {JORNADAS.map(j => <option key={j} value={j}>{JORNADA_LABELS[j] ?? j}</option>)}
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
              {CATEGORIAS.map(c => <option key={c} value={c}>{CATEGORIA_LABELS[c] ?? c}</option>)}
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

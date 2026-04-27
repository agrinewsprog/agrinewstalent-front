'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { UniversityProgram, CreateProgramPayload } from '../../types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  program: UniversityProgram | null;
  programId: string;
  locale: string;
  pageTitle: string;
  pageSubtitle: string;
  backLabel: string;
}

/* ------------------------------------------------------------------ */
/*  Normalize helper (same logic as everywhere)                        */
/* ------------------------------------------------------------------ */
function normalizeProgram(item: unknown, fallbackId: string): UniversityProgram {
  const r = item as Record<string, unknown>;
  return {
    id: String(r.id ?? fallbackId),
    title: String(r.title ?? r.name ?? ''),
    description: typeof r.description === 'string' ? r.description : null,
    rules: typeof r.rules === 'string' ? r.rules : null,
    requiresCourseId:
      typeof r.requiresCourseId === 'number' ? r.requiresCourseId :
      typeof r.require_course_id === 'number' ? r.require_course_id : null,
    status: typeof r.status === 'string' ? r.status.toUpperCase() : 'ACTIVE',
    createdAt:
      typeof r.createdAt === 'string' ? r.createdAt :
      typeof r.created_at === 'string' ? r.created_at : undefined,
    updatedAt:
      typeof r.updatedAt === 'string' ? r.updatedAt :
      typeof r.updated_at === 'string' ? r.updated_at : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Inline form                                                        */
/* ------------------------------------------------------------------ */
interface FormProps {
  initial: Partial<CreateProgramPayload>;
  onSubmit: (payload: CreateProgramPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string;
}

function ProgramForm({ initial, onSubmit, onCancel, saving, error }: FormProps) {
  const t = useTranslations('intranet');
  const [title, setTitle]                   = useState(initial.title ?? '');
  const [description, setDescription]       = useState(initial.description ?? '');
  const [rules, setRules]                   = useState(initial.rules ?? '');
  const [requiresCourseId, setRequiresCourseId] = useState(String(initial.requiresCourseId ?? ''));
  const [status, setStatus]                 = useState(initial.status ?? 'ACTIVE');

  /* Reset when initial changes (client-side fetch completed) */
  useEffect(() => {
    setTitle(initial.title ?? '');
    setDescription(initial.description ?? '');
    setRules(initial.rules ?? '');
    setRequiresCourseId(String(initial.requiresCourseId ?? ''));
    setStatus(initial.status ?? 'ACTIVE');
  }, [initial.title, initial.description, initial.rules, initial.requiresCourseId, initial.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      rules: rules.trim() || undefined,
      requiresCourseId: requiresCourseId ? Number(requiresCourseId) : null,
      status,
    });
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
      <div>
        <label className={labelCls}>{t('university.programs.formTitleLabel')} <span className="text-red-500">*</span></label>
        <input required value={title} onChange={e => setTitle(e.target.value)} placeholder={t('university.programs.formTitlePlaceholder')} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>{t('university.programs.formDescriptionLabel')}</label>
        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('university.programs.formDescriptionPlaceholder')} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>{t('university.programs.formRulesLabel')}</label>
        <textarea rows={4} value={rules} onChange={e => setRules(e.target.value)} placeholder={t('university.programs.formRulesPlaceholder')} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>
          {t('university.programs.formRequiresCourseLabel')}
          <span className="ml-1 text-xs text-gray-400">({t('university.programs.formOptional')})</span>
        </label>
        <input type="number" min={1} value={requiresCourseId} onChange={e => setRequiresCourseId(e.target.value)} placeholder={t('university.programs.formRequiresCoursePlaceholder')} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>{t('university.programs.formStatusLabel')}</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
          <option value="ACTIVE">{t('university.programs.formStatusActive')}</option>
          <option value="CLOSED">{t('university.programs.formStatusClosed')}</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {t('university.programs.formCancel')}
        </button>
        <button type="submit" disabled={saving || !title.trim()} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? t('university.programs.formSaving') : t('university.programs.formSave')}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit page client                                                   */
/* ------------------------------------------------------------------ */
export default function EditProgramClient({ program: serverProgram, programId, locale, pageTitle, pageSubtitle, backLabel }: Props) {
  const t = useTranslations('intranet');
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const [program, setProgram]     = useState<UniversityProgram | null>(serverProgram);
  const [loading, setLoading]     = useState(!serverProgram);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Client-side fallback fetch when server returns null              */
  /* ---------------------------------------------------------------- */
  const fetchFromClient = useCallback(async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${API}/api/universities/me/programs/${programId}`;

    const res = await fetch(url, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();

    const raw = data?.program ?? data?.data ?? data;
    if (!raw || typeof raw !== 'object') throw new Error(t('university.programs.editNotFound'));
    return normalizeProgram(raw, programId);
  }, [programId, t]);

  useEffect(() => {
    if (serverProgram && serverProgram.title) {
      setProgram(serverProgram);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetchFromClient()
      .then((p) => {
        if (!cancelled) {
          setProgram(p);
          setLoadError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [serverProgram, fetchFromClient]);

  /* ---------------------------------------------------------------- */
  /*  Retry handler                                                    */
  /* ---------------------------------------------------------------- */
  const handleRetry = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetchFromClient()
      .then((p) => {
        setProgram(p);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [fetchFromClient]);

  /* ---------------------------------------------------------------- */
  /*  PATCH handler                                                    */
  /* ---------------------------------------------------------------- */
  const handleSubmit = async (payload: CreateProgramPayload) => {
    if (!program) return;
    setSaving(true);
    setError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `${API}/api/universities/me/programs/${program.id}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? t('university.programs.updateError'));
      }
      router.push(`/${locale}/intranet/university/programs/${program.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('university.programs.updateError'));
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Header (always shown)                                            */
  /* ---------------------------------------------------------------- */
  const header = (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {backLabel}
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <AcademicCapIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500">{pageSubtitle}</p>
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 sm:px-0">
      {header}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-gray-500">{t('university.programs.editLoading')}</p>
        </div>
      )}

      {/* Load error */}
      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <ExclamationCircleIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t('university.programs.loadError')}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mb-5">{loadError}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {t('university.programs.retry')}
          </button>
        </div>
      )}

      {/* Not found (client fetch returned nothing) */}
      {!loading && !loadError && !program && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
            <ExclamationCircleIcon className="w-7 h-7 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t('university.programs.editNotFound')}
          </h3>
        </div>
      )}

      {/* Form */}
      {!loading && !loadError && program && (
        <ProgramForm
          initial={{
            title: program.title,
            description: program.description ?? undefined,
            rules: program.rules ?? undefined,
            requiresCourseId: program.requiresCourseId ? Number(program.requiresCourseId) : null,
            status: program.status,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}

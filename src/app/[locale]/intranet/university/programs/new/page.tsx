'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { CreateProgramPayload } from '../types';
import { dbgRequest, dbgResponse, dbgPersistenceMismatch } from '@/lib/debug';

/* ------------------------------------------------------------------ */
/*  Error helpers                                                      */
/* ------------------------------------------------------------------ */
class ApiError extends Error {
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

type ApiErr = { message: string; details?: unknown };

function formatDetails(details: unknown): string[] {
  if (!details) return [];
  if (typeof details === 'string') return [details];
  if (Array.isArray(details)) return details.map(String);
  if (typeof details === 'object')
    return Object.entries(details as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`);
  return [String(details)];
}

function ApiErrorBox({ err }: { err: ApiErr }) {
  const t = useTranslations('intranet');
  const lines = formatDetails(err.details);
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
      <div className="flex items-start gap-2">
        <ExclamationCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="font-medium">{err.message}</p>
          {lines.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-red-700 mb-1">
                {t('university.common.errorDetails')}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-red-700/90">
                {lines.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared program form                                                */
/* ------------------------------------------------------------------ */
interface FormProps {
  initial?: Partial<CreateProgramPayload>;
  onSubmit: (payload: CreateProgramPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: ApiErr | null;
}

function ProgramForm({ initial, onSubmit, onCancel, saving, error }: FormProps) {
  const t = useTranslations('intranet');
  const [title, setTitle]                   = useState(initial?.title ?? '');
  const [description, setDescription]       = useState(initial?.description ?? '');
  const [rules, setRules]                   = useState(initial?.rules ?? '');
  const [requiresCourseId, setRequiresCourseId] = useState(String(initial?.requiresCourseId ?? ''));
  const [status, setStatus]                 = useState(initial?.status ?? 'ACTIVE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateProgramPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      rules: rules.trim() || undefined,
      requiresCourseId: requiresCourseId ? Number(requiresCourseId) : undefined,
      status,
    };
    await onSubmit(payload);
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
      {/* Title */}
      <div>
        <label className={labelCls}>{t('university.programs.formTitleLabel')} <span className="text-red-500">*</span></label>
        <input
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('university.programs.formTitlePlaceholder')}
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>{t('university.programs.formDescriptionLabel')}</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t('university.programs.formDescriptionPlaceholder')}
          className={inputCls}
        />
      </div>

      {/* Rules */}
      <div>
        <label className={labelCls}>{t('university.programs.formRulesLabel')}</label>
        <textarea
          rows={4}
          value={rules}
          onChange={e => setRules(e.target.value)}
          placeholder={t('university.programs.formRulesPlaceholder')}
          className={inputCls}
        />
      </div>

      {/* RequiresCourseId */}
      <div>
        <label className={labelCls}>
          {t('university.programs.formRequiresCourseLabel')}
          <span className="ml-1 text-xs text-gray-400">({t('university.programs.formOptional')})</span>
        </label>
        <input
          type="number"
          min={1}
          value={requiresCourseId}
          onChange={e => setRequiresCourseId(e.target.value)}
          placeholder={t('university.programs.formRequiresCoursePlaceholder')}
          className={inputCls}
        />
      </div>

      {/* Status */}
      <div>
        <label className={labelCls}>{t('university.programs.formStatusLabel')}</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
          <option value="ACTIVE">{t('university.programs.formStatusActive')}</option>
          <option value="CLOSED">{t('university.programs.formStatusClosed')}</option>
        </select>
      </div>

      {/* Error */}
      {error && <ApiErrorBox err={error} />}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('university.programs.formCancel')}
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? t('university.programs.formSaving') : t('university.programs.formSave')}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  New program page                                                   */
/* ------------------------------------------------------------------ */
export default function NewProgramPage() {
  const t = useTranslations('intranet');
  const router = useRouter();
  const locale = useLocale();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<ApiErr | null>(null);

  const handleSubmit = async (payload: CreateProgramPayload) => {
    setSaving(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';

      // 1) POST — create
      dbgRequest('programs/new', 'POST', `${API}/api/universities/me/programs`, payload);
      const res = await fetch(`${API}/api/universities/me/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const resBody = await res.clone().json().catch(() => ({}));
      dbgResponse('programs/new POST', res.status, resBody);

      if (!res.ok) {
        throw new ApiError(
          resBody?.message ?? t('university.programs.createError'),
          resBody?.details ?? resBody?.errors
        );
      }
      const created = resBody?.program ?? resBody?.data ?? resBody;
      const createdId = created?.id ?? null;

      // 2) GET — verify program is persisted before redirecting
      if (createdId) {
        const verifyRes = await fetch(`${API}/api/universities/me/programs/${createdId}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const verifyBody = await verifyRes.clone().json().catch(() => ({}));
        dbgResponse('programs/new GET-verify', verifyRes.status, verifyBody);
        if (!verifyRes.ok) {
          dbgPersistenceMismatch('programs/new', {
            createdId, postResponse: created, verifyStatus: verifyRes.status,
          });
          throw new ApiError(t('university.programs.persistenceWarning'));
        }
      } else {
        // No id returned from POST — cannot verify
        dbgPersistenceMismatch('programs/new', { postResponse: created, note: 'no id returned' });
        throw new ApiError(t('university.programs.persistenceWarning'));
      }

      // Redirect to list — server component will re-fetch fresh data
      router.push(`/${locale}/intranet/university/programs/${createdId}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError({ message: err.message, details: err.details });
      } else {
        setError({ message: err instanceof Error ? err.message : t('university.programs.createError') });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t('university.programs.backToPrograms')}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('university.programs.newTitle')}</h1>
            <p className="text-sm text-gray-500">{t('university.programs.newSubtitle')}</p>
          </div>
        </div>
      </div>

      <ProgramForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        saving={saving}
        error={error}
      />
    </div>
  );
}

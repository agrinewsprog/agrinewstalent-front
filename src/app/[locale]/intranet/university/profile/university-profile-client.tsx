'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { UniversityProfile } from './types';
import { dbgRequest, dbgResponse, dbgPersistenceMismatch } from '@/lib/debug';
import { getDisplayInitial } from '@/lib/frontend/contracts';
import { resolveMediaUrl } from '@/lib/frontend/business';
import UniversityLogoUploader from './university-logo-uploader';
import { PageHeader, PageShell, SectionCard } from '@/components/ui/intranet-page';

const IS_DEV = process.env.NODE_ENV === 'development';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/* ------------------------------------------------------------------ */
/*  Convenio options (API enums)                                       */
/* ------------------------------------------------------------------ */
const CONVENIO_ENUM = ['NATIONAL', 'INTERNATIONAL'] as const;
type ConvenioEnum = typeof CONVENIO_ENUM[number];

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
/*  Client-side profile fetcher                                        */
/* ------------------------------------------------------------------ */
async function fetchProfileFromAPI(): Promise<UniversityProfile | null> {
  const API = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${API}/api/universities/me/profile`;
  const res = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  // Backend may return { profile: {...} }, { data: {...} }, or object directly
  const raw = data?.profile ?? data?.data ?? data;
  return {
    id:            raw?.id,
    name:          raw?.name ?? raw?.universityName ?? '',
    email:         raw?.email ?? raw?.user?.email ?? '',
    logoUrl:       raw?.logoUrl ?? null,
    location:      raw?.location ?? null,
    description:   raw?.description ?? null,
    careers:       Array.isArray(raw?.careers)
      ? raw.careers
      : typeof raw?.careers === 'string'
        ? raw.careers.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    convenioTypes: Array.isArray(raw?.convenioTypes)
      ? raw.convenioTypes
      : typeof raw?.convenioTypes === 'string'
        ? raw.convenioTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    verified: raw?.verified ?? false,
  };
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  initialProfile: UniversityProfile | null;
  pageTitle: string;
}

/* ------------------------------------------------------------------ */
/*  Inline field wrapper                                               */
/* ------------------------------------------------------------------ */
function FieldBlock({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {help && <p className="mt-1 text-xs text-gray-400">{help}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Client component                                                   */
/* ------------------------------------------------------------------ */
export default function UniversityProfileClient({ initialProfile, pageTitle }: Props) {
  const t = useTranslations('intranet');
  const [logoVersion, setLogoVersion] = useState(0);

  const empty: UniversityProfile = {
    name: '', email: '', logoUrl: '', location: '', description: '',
    careers: [], convenioTypes: [], verified: false,
  };

  const [profile, setProfile] = useState<UniversityProfile>(initialProfile ?? empty);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<UniversityProfile>(initialProfile ?? empty);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<ApiErr | null>(null);

  // Loading / error for initial GET
  const [loading, setLoading]     = useState(!initialProfile);
  const [loadError, setLoadError] = useState<string | null>(null);

  // careers chip input
  const [careerInput, setCareerInput] = useState('');
  const careerRef = useRef<HTMLInputElement>(null);

  /* -- client-side GET fallback when server returned null ---------- */
  useEffect(() => {
    if (initialProfile) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetchProfileFromAPI()
      .then((p) => {
        if (!cancelled) {
          if (p) {
            setProfile(p);
            setDraft(p);
            setLoadError(null);
          } else {
            // null means 404 or empty — not necessarily an error
            setProfile(empty);
            setDraft(empty);
          }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProfile]);

  /* -- helpers ---------------------------------------------------- */
  const startEditing = () => {
    setDraft({ ...profile });
    setCareerInput('');
    setError(null);
    setSuccess(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
  };

  const handleField = (field: keyof UniversityProfile, value: string) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  /* -- careers ---------------------------------------------------- */
  const addCareer = () => {
    const val = careerInput.trim();
    if (!val) return;
    const existing = draft.careers ?? [];
    if (existing.includes(val)) { setCareerInput(''); return; }
    setDraft((d) => ({ ...d, careers: [...(d.careers ?? []), val] }));
    setCareerInput('');
    careerRef.current?.focus();
  };

  const removeCareer = (idx: number) => {
    setDraft((d) => ({ ...d, careers: (d.careers ?? []).filter((_, i) => i !== idx) }));
  };

  /* -- convenio toggle -------------------------------------------- */
  const toggleConvenio = (opt: string) => {
    const current = draft.convenioTypes ?? [];
    const next = current.includes(opt)
      ? current.filter((c) => c !== opt)
      : [...current, opt];
    setDraft((d) => ({ ...d, convenioTypes: next }));
  };

  /* -- convenio label -------------------------------------------- */
  const convenioLabel = useCallback((val: string): string => {
    if (val === 'NATIONAL') return t('university.profile.convenioType.NATIONAL');
    if (val === 'INTERNATIONAL') return t('university.profile.convenioType.INTERNATIONAL');
    return val;
  }, [t]);

  /* -- logo uploaded handler -------------------------------------- */
  const handleLogoUploaded = useCallback(async (newUrl: string) => {
    if (IS_DEV) console.log('[UnivProfile] logo uploaded, raw URL:', newUrl);
    // Optimistic update
    setDraft((d) => ({ ...d, logoUrl: newUrl }));
    setProfile((p) => ({ ...p, logoUrl: newUrl }));
    setLogoVersion(Date.now());
    // Refetch real profile to get server-canonical URL
    try {
      const fresh = await fetchProfileFromAPI();
      if (fresh) {
        if (IS_DEV) console.log('[UnivProfile] refetched logoUrl:', fresh.logoUrl);
        setProfile(fresh);
        setDraft((d) => ({ ...d, logoUrl: fresh.logoUrl ?? newUrl }));
        setLogoVersion(Date.now());
      }
    } catch {
      // Keep optimistic value
    }
  }, []);

  /* -- normalize helpers for comparison --------------------------- */
  const norm = (v: unknown): string =>
    typeof v === 'string' ? v.trim() : '';
  const normArr = (v: unknown): string[] =>
    Array.isArray(v) ? [...v].map(String).sort() : [];

  /* -- save ------------------------------------------------------- */
  const handleSave = async () => {
    const trimmedName = draft.name.trim();
    if (!trimmedName) {
      setError({ message: t('university.profile.nameRequired') });
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';

      // Build payload — always send all editable fields so the API
      // receives explicit values (including empty string / empty array).
      // Send both `name` and `universityName` for backend-field compatibility.
      const careers: string[] = (draft.careers ?? []).map(c => c.trim()).filter(Boolean);
      const convenioTypes: ConvenioEnum[] = (draft.convenioTypes ?? []).filter(
        (v): v is ConvenioEnum => CONVENIO_ENUM.includes(v as ConvenioEnum)
      );

      const payload: Record<string, unknown> = {
        name:            trimmedName,
        universityName:  trimmedName,
        logoUrl:         (draft.logoUrl ?? '').trim() || null,
        location:        (draft.location ?? '').trim() || null,
        description:     (draft.description ?? '').trim() || null,
        careers,
        convenioTypes,
      };

      // 1) PATCH
      dbgRequest('profile/save', 'PATCH', `${API}/api/universities/me/profile`, payload);
      const patchRes = await fetch(`${API}/api/universities/me/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const patchBody = await patchRes.clone().json().catch(() => ({}));
      dbgResponse('profile/save PATCH', patchRes.status, patchBody);
      if (!patchRes.ok) {
        const errBody = patchBody;
        throw new ApiError(
          errBody?.message ?? errBody?.error ?? t('university.profile.saveError'),
          errBody?.details ?? errBody?.errors
        );
      }

      // 2) GET — verify real persisted state
      const fresh = await fetchProfileFromAPI();
      if (!fresh) {
        dbgPersistenceMismatch('profile/save', { payload, patchStatus: patchRes.status });
        throw new ApiError(t('university.profile.syncError'));
      }

      // 3) Mismatch check — compare normalised values of key fields
      const mismatches: string[] = [];
      if (norm(fresh.name) !== norm(payload.name) &&
          norm(fresh.name) !== norm(payload.universityName)) {
        mismatches.push('name');
      }
      if (norm(fresh.logoUrl) !== norm(payload.logoUrl)) {
        // null vs '' — both mean "no logo", skip
        if (norm(fresh.logoUrl) || norm(payload.logoUrl)) {
          mismatches.push('logoUrl');
        }
      }
      if (norm(fresh.location) !== norm(payload.location)) {
        if (norm(fresh.location) || norm(payload.location)) {
          mismatches.push('location');
        }
      }
      if (norm(fresh.description) !== norm(payload.description)) {
        if (norm(fresh.description) || norm(payload.description)) {
          mismatches.push('description');
        }
      }
      if (normArr(fresh.careers).join(',') !== normArr(payload.careers as string[]).join(',')) {
        mismatches.push('careers');
      }
      if (normArr(fresh.convenioTypes).join(',') !== normArr(payload.convenioTypes as string[]).join(',')) {
        mismatches.push('convenioTypes');
      }

      if (mismatches.length > 0) {
        dbgPersistenceMismatch('profile/save', {
          mismatches,
          sent: payload,
          received: fresh,
        });
        // Populate UI with real server data but warn instead of showing success
        setProfile(fresh);
        setDraft(fresh);
        setError({ message: t('university.profile.persistenceWarning') });
        setEditing(false);
        return;
      }

      setProfile(fresh);
      setDraft(fresh);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError({ message: err.message, details: err.details });
      } else {
        setError({ message: err instanceof Error ? err.message : t('university.profile.saveError') });
      }
    } finally {
      setSaving(false);
    }
  };

  /* -- logo initial ----------------------------------------------- */
  const logoLetter = getDisplayInitial(profile.name, 'U');
  const resolvedLogoBase = resolveMediaUrl(profile.logoUrl, API_BASE);
  const resolvedLogo = resolvedLogoBase
    ? `${resolvedLogoBase}${resolvedLogoBase.includes('?') ? '&' : '?'}v=${logoVersion || 0}`
    : null;

  if (IS_DEV) console.log('[UnivProfile] render — logoUrl:', profile.logoUrl, '| resolved:', resolvedLogo);

  /* -- retry handler ---------------------------------------------- */
  const handleRetry = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetchProfileFromAPI()
      .then((p) => {
        if (p) {
          setProfile(p);
          setDraft(p);
        }
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---- render --------------------------------------------------- */
  if (loading) {
    return (
      <PageShell className="max-w-3xl">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ArrowPathIcon className="w-8 h-8 text-green-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">{t('university.profile.loadingProfile')}</p>
      </div>
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell className="max-w-3xl">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <ExclamationCircleIcon className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {t('university.profile.loadError')}
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mb-5">{loadError}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          {t('university.profile.retry')}
        </button>
      </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="max-w-4xl space-y-6 pb-10">
      <PageHeader
        title={pageTitle}
        subtitle={t('university.profile.subtitle')}
        actions={!editing ? (
          <button
            onClick={startEditing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" />
            {t('university.profile.edit')}
          </button>
        ) : undefined}
      />

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckIcon className="h-4 w-4 flex-shrink-0" />
          {t('university.profile.saveSuccess')}
        </div>
      )}

      {/* Error banner */}
      {error && <ApiErrorBox err={error} />}

      {/* Saving overlay indicator */}
      {saving && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
          <ArrowPathIcon className="h-4 w-4 flex-shrink-0 animate-spin" />
          {t('university.profile.saving')}
        </div>
      )}

      {/* Profile card header */}
      <SectionCard className="overflow-hidden border-0 bg-gradient-to-br from-green-600 to-green-700 p-6 text-white shadow-sm">
        <div className="flex items-center gap-5">
          {/* Logo */}
          <div className="flex-shrink-0">
            {resolvedLogo ? (
              <img
                key={resolvedLogo}
                src={resolvedLogo}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = 'flex';
                }}
              />
              ) : null}
            {!resolvedLogo ? (
              <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl font-bold text-white">
                {logoLetter}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 items-center justify-center text-3xl font-bold text-white" style={{ display: 'none' }}>
                {logoLetter}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name || '—'}</h2>
            <div className="flex flex-wrap gap-3 mt-1 text-green-100 text-sm">
              {profile.email && (
                <span className="flex items-center gap-1.5">
                  <EnvelopeIcon className="h-4 w-4" /> {profile.email}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" /> {profile.location}
                </span>
              )}
            </div>
            {profile.verified && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                <ShieldCheckIcon className="h-3.5 w-3.5" /> {t('university.profile.verified')}
              </span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ─── VIEW MODE ─────────────────────────────────────────────────── */}
      {!editing && (
        <div className="space-y-5">
          {/* Logo section */}
          <SectionCard className="p-5">
            <UniversityLogoUploader
              currentLogoUrl={resolvedLogo ?? profile.logoUrl ?? null}
              universityName={profile.name}
              onUploaded={handleLogoUploaded}
              editing={false}
            />
          </SectionCard>

          {/* Description */}
          <SectionCard className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4 text-green-600" />
              {t('university.profile.descriptionLabel')}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {profile.description || <span className="text-gray-400 italic">{t('university.profile.noDescription')}</span>}
            </p>
          </SectionCard>

          {/* Careers */}
          {(profile.careers ?? []).length > 0 && (
            <SectionCard className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <AcademicCapIcon className="h-4 w-4 text-green-600" />
                {t('university.profile.careersLabel')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(profile.careers ?? []).map((c, i) => (
                  <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Convenio types */}
          {(profile.convenioTypes ?? []).length > 0 && (
            <SectionCard className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BuildingLibraryIcon className="h-4 w-4 text-green-600" />
                {t('university.profile.convenioLabel')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(profile.convenioTypes ?? []).map((c, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                    {convenioLabel(c)}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Read-only info */}
          <SectionCard className="grid grid-cols-1 gap-4 bg-gray-50 p-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('university.profile.emailLabel')}</p>
              <p className="font-medium text-gray-800">{profile.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('university.profile.verifiedLabel')}</p>
              <p className={`font-medium ${profile.verified ? 'text-green-700' : 'text-gray-400'}`}>
                {profile.verified ? t('university.profile.verifiedYes') : t('university.profile.verifiedNo')}
              </p>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─── EDIT MODE ─────────────────────────────────────────────────── */}
      {editing && (
        <div className="space-y-5">
          <SectionCard className="space-y-5 p-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
              <BuildingLibraryIcon className="h-4 w-4 text-green-600" />
              {t('university.profile.sectionGeneral')}
            </h3>

            {/* Name */}
            <FieldBlock label={t('university.profile.nameLabel')}>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => handleField('name', e.target.value)}
                placeholder={t('university.profile.namePlaceholder')}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              />
            </FieldBlock>

            {/* Logo uploader */}
            <UniversityLogoUploader
              currentLogoUrl={resolvedLogo ?? draft.logoUrl ?? null}
              universityName={draft.name}
              onUploaded={handleLogoUploaded}
              editing={true}
            />

            {/* Logo URL (read-only after upload, or manual entry) */}
            {draft.logoUrl && (
              <FieldBlock label={t('university.profile.logo.currentUrl')}>
                <p className="text-xs text-gray-500 font-mono break-all bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  {draft.logoUrl}
                </p>
              </FieldBlock>
            )}

            {/* Location */}
            <FieldBlock label={t('university.profile.locationLabel')}>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={draft.location ?? ''}
                  onChange={(e) => handleField('location', e.target.value)}
                  placeholder={t('university.profile.locationPlaceholder')}
                  className="w-full pl-9 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </FieldBlock>

            {/* Description */}
            <FieldBlock label={t('university.profile.descriptionLabel')} help={t('university.profile.descriptionHelp')}>
              <textarea
                rows={4}
                value={draft.description ?? ''}
                onChange={(e) => handleField('description', e.target.value)}
                placeholder={t('university.profile.descriptionPlaceholder')}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"
              />
            </FieldBlock>
          </SectionCard>

          {/* Careers */}
          <SectionCard className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
              <AcademicCapIcon className="h-4 w-4 text-green-600" />
              {t('university.profile.careersLabel')}
            </h3>
            <p className="text-xs text-gray-400">{t('university.profile.careersHelp')}</p>

            {/* Chips */}
            {(draft.careers ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(draft.careers ?? []).map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium">
                    {c}
                    <button type="button" onClick={() => removeCareer(i)} className="hover:text-red-600 transition-colors">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                ref={careerRef}
                type="text"
                value={careerInput}
                onChange={(e) => setCareerInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCareer(); } }}
                placeholder={t('university.profile.careersPlaceholder')}
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              />
              <button
                type="button"
                onClick={addCareer}
                className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                {t('university.profile.add')}
              </button>
            </div>
          </SectionCard>

          {/* Convenio types */}
          <SectionCard className="space-y-4 p-5">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
              <BuildingLibraryIcon className="h-4 w-4 text-green-600" />
              {t('university.profile.convenioLabel')}
            </h3>
            <p className="text-xs text-gray-400">{t('university.profile.convenioHelp')}</p>

            <div className="flex flex-wrap gap-2">
              {CONVENIO_ENUM.map((opt) => {
                const active = (draft.convenioTypes ?? []).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleConvenio(opt)}
                    className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {convenioLabel(opt)}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Read-only fields */}
          <SectionCard className="grid grid-cols-1 gap-4 bg-gray-50 p-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400 mb-1">{t('university.profile.emailLabel')}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                <span>{profile.email || '—'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t('university.profile.emailReadOnly')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">{t('university.profile.verifiedLabel')}</p>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className={`h-4 w-4 ${profile.verified ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={profile.verified ? 'text-green-700 font-medium' : 'text-gray-400'}>
                  {profile.verified ? t('university.profile.verifiedYes') : t('university.profile.verifiedNo')}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                : <CheckIcon className="h-4 w-4" />
              }
              {saving ? t('university.profile.saving') : t('university.profile.save')}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4" />
              {t('university.profile.cancel')}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}


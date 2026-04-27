'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { User } from '@/types';
import { getDisplayInitial, normalizeCompanyProfile, resolveCompanyLogoUrl, toAbsoluteAssetUrl } from '@/lib/frontend/contracts';
import { PageHeader, PageShell, SectionCard } from '@/components/ui/intranet-page';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CompanyProfileData {
  companyName: string;
  logoUrl: string | null;
  industry: string;
  companySize: string;
  foundedYear: string;
  website: string;
  linkedinUrl: string;
  descriptionLong: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  workModes: ('REMOTE' | 'HYBRID' | 'ON_SITE')[];
  vacancyTypes: ('FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE')[];
  workingLanguages: string;
  participatesInInternships: boolean;
}

const EMPTY_PROFILE: CompanyProfileData = {
  companyName: '',
  logoUrl: null,
  industry: '',
  companySize: '',
  foundedYear: '',
  website: '',
  linkedinUrl: '',
  descriptionLong: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  workModes: [],
  vacancyTypes: [],
  workingLanguages: '',
  participatesInInternships: false,
};

const WORK_MODES = [
  { value: 'ON_SITE', labelKey: 'on-site' },
  { value: 'REMOTE', labelKey: 'remote' },
  { value: 'HYBRID', labelKey: 'hybrid' },
] as const;
const VACANCY_TYPES = [
  { value: 'FULL_TIME', labelKey: 'full-time' },
  { value: 'PART_TIME', labelKey: 'part-time' },
  { value: 'INTERNSHIP', labelKey: 'internship' },
  { value: 'FREELANCE', labelKey: 'freelance' },
] as const;
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] as const;

function normalizeWorkModes(raw: string[] | undefined): CompanyProfileData['workModes'] {
  const mapped = (raw ?? [])
    .map((value) => {
      switch (value) {
        case 'remote':
        case 'REMOTE':
          return 'REMOTE';
        case 'hybrid':
        case 'HYBRID':
          return 'HYBRID';
        case 'on-site':
        case 'ON_SITE':
        case 'ONSITE':
          return 'ON_SITE';
        default:
          return null;
      }
    })
    .filter((value): value is CompanyProfileData['workModes'][number] => value !== null);
  return Array.from(new Set(mapped));
}

function normalizeVacancyTypes(raw: string[] | undefined): CompanyProfileData['vacancyTypes'] {
  const mapped = (raw ?? [])
    .map((value) => {
      switch (value) {
        case 'full-time':
        case 'FULL_TIME':
          return 'FULL_TIME';
        case 'part-time':
        case 'PART_TIME':
          return 'PART_TIME';
        case 'internship':
        case 'INTERNSHIP':
          return 'INTERNSHIP';
        case 'freelance':
        case 'FREELANCE':
          return 'FREELANCE';
        default:
          return null;
      }
    })
    .filter((value): value is CompanyProfileData['vacancyTypes'][number] => value !== null);
  return Array.from(new Set(mapped));
}

interface CompanyProfileClientProps {
  user: User | null;
}

function toFormData(raw: unknown, user: User | null): CompanyProfileData {
  const normalized = normalizeCompanyProfile(raw, user?.id ?? '');
  const resolvedLogoUrl = resolveCompanyLogoUrl(raw, normalized, user);

  return {
    companyName: normalized?.companyName || user?.name || '',
    logoUrl: resolvedLogoUrl ?? normalized?.logoUrl ?? null,
    industry: normalized?.industry ?? '',
    companySize: normalized?.companySize ?? '',
    foundedYear: normalized?.foundedYear ?? '',
    website: normalized?.website ?? '',
    linkedinUrl: normalized?.linkedinUrl ?? '',
    descriptionLong: normalized?.description ?? '',
    contactPerson: normalized?.contactPerson ?? '',
    contactEmail: normalized?.contactEmail ?? '',
    contactPhone: normalized?.contactPhone ?? '',
    workModes: normalizeWorkModes(normalized?.workModes),
    vacancyTypes: normalizeVacancyTypes(normalized?.vacancyTypes),
    workingLanguages: (normalized?.workingLanguages ?? []).join(', '),
    participatesInInternships: normalized?.participatesInInternships ?? false,
  };
}

export function CompanyProfileClient({ user }: CompanyProfileClientProps) {
  const t = useTranslations('intranet');
  const locale = useLocale();

  const [form, setForm] = useState<CompanyProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [lastKnownLogoUrl, setLastKnownLogoUrl] = useState<string | null>(null);
  const [logoVersion, setLogoVersion] = useState<number>(0);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/companies/me/profile`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const next = toFormData(json?.data ?? json?.profile ?? json, user);
      setForm((prev) => {
        const mergedLogoUrl = next.logoUrl ?? prev.logoUrl ?? null;
        return {
          ...next,
          logoUrl: mergedLogoUrl,
        };
      });
      if (next.logoUrl) setLastKnownLogoUrl(next.logoUrl);
    } catch (err) {
      setForm((prev) => ({ ...prev, companyName: user?.name ?? prev.companyName }));
      setFeedback({ type: 'error', msg: t('company.profile.saveError') });
      if (process.env.NODE_ENV === 'development') console.error('[company/profile] load error', err);
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const setField = <K extends keyof CompanyProfileData>(key: K, value: CompanyProfileData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWorkMode = (value: CompanyProfileData['workModes'][number]) =>
    setForm((prev) => ({
      ...prev,
      workModes: prev.workModes.includes(value)
        ? prev.workModes.filter((item) => item !== value)
        : [...prev.workModes, value],
    }));

  const toggleVacancyType = (value: CompanyProfileData['vacancyTypes'][number]) =>
    setForm((prev) => ({
      ...prev,
      vacancyTypes: prev.vacancyTypes.includes(value)
        ? prev.vacancyTypes.filter((item) => item !== value)
        : [...prev.vacancyTypes, value],
    }));

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        companyName: form.companyName.trim() || null,
        industry: form.industry.trim() || null,
        companySize: form.companySize.trim() || null,
        foundedYear: form.foundedYear.trim() ? Number(form.foundedYear) : null,
        website: form.website.trim() || null,
        linkedinUrl: form.linkedinUrl.trim() || null,
        descriptionLong: form.descriptionLong.trim() || null,
        contactPerson: form.contactPerson.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
        workModes: form.workModes,
        vacancyTypes: form.vacancyTypes,
        workingLanguages: form.workingLanguages
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        participatesInInternships: Boolean(form.participatesInInternships),
      };

      const res = await fetch(`${API}/api/companies/me/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await loadProfile();
      setFeedback({ type: 'success', msg: t('company.profile.saveSuccess') });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[company/profile] save error', err);
      setFeedback({ type: 'error', msg: t('company.profile.saveError') });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch(`${API}/api/companies/me/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? body?.error ?? `HTTP ${res.status}`);

      const rawUrl = body?.data?.logoUrl ?? body?.logoUrl ?? body?.logo_url ?? body?.url ?? null;
      if (rawUrl) {
        setForm((prev) => ({ ...prev, logoUrl: rawUrl }));
        setLastKnownLogoUrl(rawUrl);
        setLogoVersion(Date.now());
      }

      await loadProfile();
      setFeedback({ type: 'success', msg: t('company.profile.saveSuccess') });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[company/profile] logo upload error', err);
      setFeedback({ type: 'error', msg: t('company.profile.saveError') });
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
  };

  const companyName = form.companyName || user?.name || 'Empresa';
  const companyEmail = form.contactEmail || user?.email || '';
  const logoUrl = toAbsoluteAssetUrl(form.logoUrl ?? lastKnownLogoUrl, API);
  const logoUrlWithVersion = logoUrl ? `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}v=${logoVersion}` : null;

  const inputCls =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-50 disabled:text-gray-400';
  const labelCls = 'mb-1 block text-sm font-medium text-gray-700';
  const sectionCls = 'space-y-4 p-6';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <PageShell className="space-y-6 pb-8">
      <PageHeader
        title={companyName}
        subtitle={t('company.profile.sections.companyDetails')}
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? t('company.profile.saving') : t('company.profile.save')}
          </button>
        }
      />

      <SectionCard className="overflow-hidden">
      <div className="relative">
        <div className="h-44 w-full rounded-xl bg-gradient-to-br from-green-600 to-emerald-700" />
        <div className="absolute -bottom-10 left-6">
          <label className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
            {logoUrlWithVersion ? (
              <img src={logoUrlWithVersion} alt={companyName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-green-700">{getDisplayInitial(companyName)}</span>
            )}
            <span className="absolute inset-0 hidden items-center justify-center bg-black/45 text-xs font-medium text-white group-hover:flex">
              {uploadingLogo ? t('company.profile.saving') : t('company.profile.save')}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={uploadingLogo} />
          </label>
        </div>
      </div>

      <div className="px-6 pt-10">
        <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500">
          {form.foundedYear && <span>{form.foundedYear}</span>}
          <span>{companyEmail || '—'}</span>
          {form.website && (
            <a href={form.website} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-green-700">
              {t('company.profile.fields.website')}
            </a>
          )}
        </div>
      </div>
      </SectionCard>

      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <SectionCard>
      <section className={sectionCls}>
        <h2 className="text-lg font-bold text-gray-900">{t('company.profile.sections.companyDetails')}</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('company.profile.fields.industry')}</label>
            <input className={inputCls} value={form.industry} onChange={(e) => setField('industry', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t('company.profile.fields.companySize')}</label>
            <select className={inputCls} value={form.companySize} onChange={(e) => setField('companySize', e.target.value)}>
              <option value="">{t('company.profile.fields.selectOption')}</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('company.profile.fields.foundedYear')}</label>
            <input
              type="number"
              className={inputCls}
              min="1800"
              max={new Date().getFullYear()}
              value={form.foundedYear}
              onChange={(e) => setField('foundedYear', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t('company.profile.fields.website')}</label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://..."
              value={form.website}
              onChange={(e) => setField('website', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>{t('company.profile.fields.linkedinUrl')}</label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://linkedin.com/company/..."
              value={form.linkedinUrl}
              onChange={(e) => setField('linkedinUrl', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('company.profile.fields.descriptionLong')}</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={5}
            value={form.descriptionLong}
            onChange={(e) => setField('descriptionLong', e.target.value)}
          />
        </div>
      </section>
      </SectionCard>

      <SectionCard>
      <section className={sectionCls}>
        <h2 className="text-lg font-bold text-gray-900">{t('company.profile.sections.contact')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('company.profile.fields.contactPerson')}</label>
            <input className={inputCls} value={form.contactPerson} onChange={(e) => setField('contactPerson', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t('company.profile.fields.contactEmail')}</label>
            <input type="email" className={inputCls} value={form.contactEmail} onChange={(e) => setField('contactEmail', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t('company.profile.fields.contactPhone')}</label>
            <input className={inputCls} value={form.contactPhone} onChange={(e) => setField('contactPhone', e.target.value)} />
          </div>
        </div>
      </section>
      </SectionCard>

      <SectionCard>
      <section className={sectionCls}>
        <h2 className="text-lg font-bold text-gray-900">{t('company.profile.sections.recruitment')}</h2>

        <div>
          <label className={labelCls}>{t('company.profile.fields.workModes')}</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {WORK_MODES.map((mode) => {
              const active = form.workModes.includes(mode.value);
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => toggleWorkMode(mode.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-green-300 bg-green-100 text-green-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t(`company.profile.options.workModes.${mode.labelKey}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('company.profile.fields.vacancyTypes')}</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {VACANCY_TYPES.map((type) => {
              const active = form.vacancyTypes.includes(type.value);
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleVacancyType(type.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-green-300 bg-green-100 text-green-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t(`company.profile.options.vacancyTypes.${type.labelKey}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('company.profile.fields.workingLanguages')}</label>
          <input
            className={inputCls}
            placeholder={t('company.profile.fields.workingLanguagesPlaceholder')}
            value={form.workingLanguages}
            onChange={(e) => setField('workingLanguages', e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.participatesInInternships}
            onClick={() => setField('participatesInInternships', !form.participatesInInternships)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              form.participatesInInternships ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.participatesInInternships ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <label className="text-sm font-medium text-gray-700">
            {t('company.profile.fields.participatesInInternships')}
          </label>
        </div>
      </section>
      </SectionCard>

      <SectionCard className="p-5">
        <h2 className="mb-5 text-lg font-bold text-gray-900">{t('company.profile.vacanciesTitle')}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: `/${locale}/intranet/company/offers/new`, label: t('company.profile.publishVacancies') },
            { href: `/${locale}/intranet/company/offers`, label: t('company.profile.viewVacancies') },
            { href: `/${locale}/intranet/company/candidates`, label: t('company.profile.viewCandidates') },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            >
                {action.label}
            </Link>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}

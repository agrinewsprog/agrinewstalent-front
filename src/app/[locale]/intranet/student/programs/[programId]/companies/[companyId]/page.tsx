'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { getDisplayInitial, normalizeCompanyProfile, toAbsoluteAssetUrl } from '@/lib/frontend/contracts';
import { buildStudentProgramHref } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function workModeLabel(raw: string, t: ReturnType<typeof useTranslations>): string {
  const map: Record<string, string> = {
    'on-site': 'ON_SITE', 'ON_SITE': 'ON_SITE', 'onsite': 'ON_SITE',
    'remote': 'REMOTE', 'REMOTE': 'REMOTE',
    'hybrid': 'HYBRID', 'HYBRID': 'HYBRID',
  };
  const key = `student.companyProfile.workModeValues.${map[raw] ?? raw.toUpperCase()}` as Parameters<typeof t>[0];
  try { return t(key); } catch { return raw; }
}

function vacancyTypeLabel(raw: string, t: ReturnType<typeof useTranslations>): string {
  const map: Record<string, string> = {
    'full-time': 'FULL_TIME', 'FULL_TIME': 'FULL_TIME',
    'part-time': 'PART_TIME', 'PART_TIME': 'PART_TIME',
    'internship': 'INTERNSHIP', 'INTERNSHIP': 'INTERNSHIP',
    'temporary': 'TEMPORARY', 'TEMPORARY': 'TEMPORARY',
    'freelance': 'FREELANCE', 'FREELANCE': 'FREELANCE',
  };
  const key = `student.companyProfile.vacancyTypeValues.${map[raw] ?? raw.toUpperCase()}` as Parameters<typeof t>[0];
  try { return t(key); } catch { return raw; }
}

export default function StudentCompanyProfilePage() {
  const t = useTranslations('intranet');
  const locale = useLocale();
  const params = useParams<{ programId: string; companyId: string }>();
  const { programId, companyId } = params;

  const [company, setCompany] = useState<ReturnType<typeof normalizeCompanyProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = buildStudentProgramHref(locale, programId);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${API}/api/students/me/programs/${programId}/companies/${companyId}`;

      const res = await fetch(endpoint, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      setCompany(normalizeCompanyProfile(json, companyId));
    } catch (err) {
      console.error('[companyProfile] fetch error', err);
      setError(t('common.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [programId, companyId, t]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  /* Shared styles */
  const chipCls = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700';
  const sectionCls = 'bg-white rounded-xl border border-gray-200 shadow-sm p-5';
  const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

  /* Loading */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">{t('common.feedback.loading')}</p>
      </div>
    );
  }

  /* Error / Not found */
  if (error || !company) {
    return (
      <div className="space-y-4">
        <Link href={base} className="text-sm text-blue-600 hover:underline">
          {t('student.companyProfile.backToProgram')}
        </Link>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600">{error ?? t('student.companyProfile.notFound')}</p>
          <button
            onClick={fetchCompany}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('student.companyProfile.retry')}
          </button>
        </div>
      </div>
    );
  }

  /* ── Resolved fields ── */
  const cName = company.companyName ?? '—';
  const logo = toAbsoluteAssetUrl(company.logoUrl, API);
  const description = company.description;
  const industry = company.industry;
  const companySize = company.companySize;
  const foundedYear = company.foundedYear;
  const contactPerson = company.contactPerson;
  const contactEmail = company.contactEmail;
  const contactPhone = company.contactPhone;
  const workModes = company.workModes ?? [];
  const vacancyTypes = company.vacancyTypes ?? [];
  const workingLanguages = company.workingLanguages ?? [];
  const participatesInInternships = company.participatesInInternships;
  const webUrl = company.website;
  const linkedinHref = company.linkedinUrl;

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Back */}
      <Link href={base} className="inline-flex items-center text-sm text-blue-600 hover:underline">
        {t('student.companyProfile.backToProgram')}
      </Link>

      {/* ── Header card ── */}
      <div className={sectionCls}>
        <div className="flex items-start gap-4">
          {logo ? (
            <img
              src={logo.startsWith('http') ? logo : `${API}${logo}`}
              alt={cName}
              className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0">
              {getDisplayInitial(cName)}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-xl font-bold text-gray-900 truncate">{cName}</h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              {company.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4 shrink-0" /> {company.location}
                </span>
              )}
              {industry && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                  {industry}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-1">
              {participatesInInternships === true && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  <AcademicCapIcon className="w-3.5 h-3.5" />
                  {t('student.companyProfile.participatesInInternships')}
                </span>
              )}
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-4 mt-2">
              {webUrl && (
                <a href={webUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <GlobeAltIcon className="w-3.5 h-3.5" />
                  {t('student.companyProfile.website')}
                </a>
              )}
              {linkedinHref && (
                <a href={linkedinHref} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  {t('student.companyProfile.linkedin')}
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <EnvelopeIcon className="w-3.5 h-3.5" />
                  {company.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className={sectionCls}>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {t('student.companyProfile.description')}
        </h2>
        {description ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {t('student.companyProfile.noDescription')}
          </p>
        )}
      </div>

      {/* ── Details grid ── */}
      {(industry || companySize || foundedYear || contactPerson || contactEmail || contactPhone || workModes.length > 0 || vacancyTypes.length > 0 || workingLanguages.length > 0) && (
        <div className={sectionCls + ' space-y-5'}>
          {/* Row 1: industry / size / year */}
          {(industry || companySize || foundedYear) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {industry && (
                <div>
                  <p className={labelCls}>{t('student.companyProfile.industry')}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{industry}</p>
                </div>
              )}
              {companySize && (
                <div>
                  <p className={labelCls}>{t('student.companyProfile.companySize')}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{companySize}</p>
                </div>
              )}
              {foundedYear && (
                <div>
                  <p className={labelCls}>{t('student.companyProfile.founded')}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{foundedYear}</p>
                </div>
              )}
            </div>
          )}

          {/* Row 2: contact */}
          {(contactPerson || contactEmail || contactPhone) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {contactPerson && (
                <div>
                  <p className={labelCls}>{t('student.companyProfile.contactPerson')}</p>
                  <p className="text-sm text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    {contactPerson}
                  </p>
                </div>
              )}
              {contactEmail && (
                <div>
                  <p className={labelCls}>{t('student.companyProfile.contactEmail')}</p>
                  <a href={`mailto:${contactEmail}`} className="text-sm text-blue-600 hover:underline mt-0.5 flex items-center gap-1.5">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{contactEmail}</span>
                  </a>
                </div>
              )}
              {contactPhone && (
                <div>
                  <p className={labelCls}>{t('student.companyProfile.contactPhone')}</p>
                  <p className="text-sm text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    {contactPhone}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Row 3: work modes / vacancy types / languages */}
          {(workModes.length > 0 || vacancyTypes.length > 0 || workingLanguages.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {workModes.length > 0 && (
                <div>
                  <p className={labelCls + ' mb-1.5'}>{t('student.companyProfile.workModes')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {workModes.map((m) => (
                      <span key={m} className={chipCls}>{workModeLabel(m, t)}</span>
                    ))}
                  </div>
                </div>
              )}
              {vacancyTypes.length > 0 && (
                <div>
                  <p className={labelCls + ' mb-1.5'}>{t('student.companyProfile.vacancyTypes')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vacancyTypes.map((v) => (
                      <span key={v} className={chipCls}>{vacancyTypeLabel(v, t)}</span>
                    ))}
                  </div>
                </div>
              )}
              {workingLanguages.length > 0 && (
                <div>
                  <p className={labelCls + ' mb-1.5'}>{t('student.companyProfile.workingLanguages')}</p>
                  <p className="text-sm text-gray-900">{workingLanguages.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

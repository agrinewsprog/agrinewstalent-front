'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Application } from '@/types';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';
import {
  getDisplayInitial,
  normalizeApplicationStatus,
  resolveApplicationId,
  resolveApplicationKey,
  resolveApplicationSource,
  resolveCompanyLocation,
  resolveCompanyLogoUrl,
  resolveCompanyName,
  resolveJobOfferId,
  resolveProgramId,
  resolveProgramOfferId,
  toAbsoluteAssetUrl,
} from '@/lib/frontend/contracts';
import {
  buildCompanyApplicationHref,
  buildLocaleHref,
  buildStudentOfferHref,
  buildStudentProgramHref,
  buildStudentProgramOfferHref,
} from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface NormalizedApplication {
  id: string;
  applicationId: string;
  source: 'job' | 'program' | 'application';
  offerId: string;
  offerTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyCity: string | null;
  status: string;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string | null;
  description: string | null;
  programContext: { programId: string; programOfferId: string; programTitle: string } | null;
  _raw?: unknown;
}

function stableKey(item: any, index: number): string {
  return (
    resolveApplicationKey(item)
    ?? (() => {
      const applicationId = resolveApplicationId(item);
      if (applicationId) {
        const source = resolveApplicationSource(item) ?? 'application';
        return `${source}:${applicationId}`;
      }
      const offerId = resolveJobOfferId(item, item.offer) ?? '';
      const created = item.createdAt ?? '';
      return `fb-${offerId}-${created}-${index}`;
    })()
  );
}

function toNormalized(item: any, index: number): NormalizedApplication {
  if (item.offerTitle !== undefined && item.programContext !== undefined) {
    const key = item.id || stableKey(item._raw ?? item, index);
    return {
      ...item,
      id: key,
      applicationId: item.applicationId ?? resolveApplicationId(item._raw ?? item) ?? key,
      source: item.source ?? resolveApplicationSource(item._raw ?? item) ?? 'application',
    } as NormalizedApplication;
  }

  const offer = item.offer ?? {};
  const company = offer.company ?? {};
  const id = stableKey(item, index);
  const companyName = resolveCompanyName(item, offer, company);
  const programId =
    resolveProgramId(item, item.program, offer.program) ?? null;
  const programOfferId =
    resolveProgramOfferId(item, offer, item.programOffer, offer.programOffer) ?? null;
  const programTitle =
    item.programTitle
    ?? item.program?.title
    ?? item.program?.name
    ?? offer.program?.title
    ?? offer.program?.name
    ?? null;

  return {
    id,
    applicationId: resolveApplicationId(item) ?? id,
    source: resolveApplicationSource(item) ?? 'application',
    offerId: String(resolveJobOfferId(item, offer) ?? ''),
    offerTitle: offer.title ?? item.offerTitle ?? '',
    companyName,
    companyLogoUrl: resolveCompanyLogoUrl(item, offer, company),
    companyCity: resolveCompanyLocation(item, offer, company),
    status: item.status ?? '',
    coverLetter: item.coverLetter ?? null,
    createdAt: item.createdAt ?? '',
    updatedAt: item.updatedAt ?? null,
    description: offer.description ?? null,
    programContext:
      programId && programOfferId
        ? {
            programId: String(programId),
            programOfferId: String(programOfferId),
            programTitle: programTitle ?? '',
          }
        : null,
    _raw: item,
  };
}

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale);
}

function relativeDate(value: string | null | undefined, t: ReturnType<typeof useTranslations>): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const diff = Math.ceil((Date.now() - date.getTime()) / 86400000);
  if (diff <= 0) return t('student.relativeDate.today');
  if (diff === 1) return t('student.relativeDate.yesterday');
  if (diff < 7) return t('student.relativeDate.daysAgo', { days: diff });
  if (diff < 30) return t('student.relativeDate.weeksAgo', { weeks: Math.floor(diff / 7) });
  return t('student.relativeDate.monthsAgo', { months: Math.floor(diff / 30) });
}

function normalizeStatus(raw: string): string {
  return normalizeApplicationStatus(raw);
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  INTERVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
  HIRED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_DOT: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  INTERVIEW: 'bg-purple-500',
  HIRED: 'bg-green-500',
  REJECTED: 'bg-red-500',
};

function CompanyLogo({ logoUrl, name }: { logoUrl?: string | null; name?: string }) {
  const initial = getDisplayInitial(name);
  const src = toAbsoluteAssetUrl(logoUrl, API_BASE);
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Empresa'}
        className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
      {initial}
    </div>
  );
}

function ApplicationDetailPanel({
  application,
  locale,
  onClose,
}: {
  application: NormalizedApplication;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations('intranet');
  const labelForStatus = (value: string) => {
    const normalized = normalizeStatus(value);
    try {
      const label = t(`student.applications.statusLabels.${normalized}` as never);
      if (typeof label === 'string' && !label.includes('student.applications.statusLabels.')) return label;
    } catch {}
    return normalized;
  };

  const normalized = normalizeStatus(application.status);
  const statusLabel = labelForStatus(application.status);
  const statusColor = statusColors[normalized] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const dotColor = STATUS_DOT[normalized] ?? 'bg-gray-400';
  const context = application.programContext;
  const offerHref = context
    ? buildStudentProgramOfferHref(locale, context.programId, context.programOfferId)
    : application.offerId
      ? buildStudentOfferHref(locale, application.offerId)
      : buildLocaleHref(locale, '/intranet/student/offers');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
      <div className="relative bg-gradient-to-br from-green-600 to-green-800 px-6 pt-6 pb-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white text-lg leading-none"
        >
          ×
        </button>
        <div className="flex items-center gap-3 mb-4">
          <CompanyLogo logoUrl={application.companyLogoUrl} name={application.companyName} />
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{application.offerTitle || t('student.applications.noTitle')}</h2>
            <p className="text-green-200 text-sm">{application.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {statusLabel}
          </span>
          {context && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              {t('student.applications.programBadge')}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {application.createdAt && !isNaN(new Date(application.createdAt).getTime()) && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">{t('student.applications.detail.sentLabel').replace(':', '')}</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(application.createdAt, locale)}</p>
            </div>
          )}
          {application.companyCity && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">{t('common.location')}</p>
              <p className="text-sm font-semibold text-gray-800">{application.companyCity}</p>
            </div>
          )}
        </div>

        {context?.programTitle && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('student.applications.programLabel')}</h4>
            <Link
              href={buildStudentProgramHref(locale, context.programId)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {context.programTitle}
            </Link>
          </div>
        )}

        {application.coverLetter && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('student.applications.detail.coverLetterTitle')}
            </h4>
            <p className="text-sm text-gray-700 line-clamp-4">{application.coverLetter}</p>
          </div>
        )}

        {application.description && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('student.applications.detail.aboutOfferTitle')}
            </h4>
            <p className="text-sm text-gray-700 line-clamp-4">{application.description}</p>
          </div>
        )}

        <Link
          href={offerHref}
          className="block w-full text-center py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {t('student.applications.detail.viewFull')}
        </Link>
      </div>
    </div>
  );
}

interface ApplicationsListProps {
  applications: Array<Application | NormalizedApplication | Record<string, unknown>>;
  showOffer?: boolean;
  showStudent?: boolean;
  locale?: string;
  onStatusChange?: (applicationId: string, status: Application['status']) => void;
}

export function ApplicationsList({
  applications = [],
  showOffer = true,
  showStudent = false,
  locale: localeProp,
  onStatusChange,
}: ApplicationsListProps) {
  const t = useTranslations('intranet');
  const detectedLocale = useLocale();
  const locale = localeProp || detectedLocale;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const statusLabel = (value: string) => {
    const normalized = normalizeStatus(value);
    try {
      const label = t(`student.applications.statusLabels.${normalized}` as never);
      if (typeof label === 'string' && !label.includes('student.applications.statusLabels.')) return label;
    } catch {}
    return normalized;
  };

  const items = useMemo<NormalizedApplication[]>(
    () => (applications ?? []).map((application, index) => toNormalized(application, index)),
    [applications],
  );

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-gray-500">{t('student.applications.noApplications')}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-5 ${showOffer ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
      <div className={`space-y-3 ${showOffer ? 'lg:col-span-2' : ''}`}>
        {items.map((application) => {
          const isSelected = selected?.id === application.id;
          const normalized = normalizeStatus(application.status);
          const cardStatusLabel = statusLabel(application.status);
          const statusColor = statusColors[normalized] ?? 'bg-gray-100 text-gray-700 border-gray-200';
          const dotColor = STATUS_DOT[normalized] ?? 'bg-gray-400';
          const context = application.programContext;

          return (
            <div
              key={application.id}
              onClick={() => showOffer ? setSelectedId(isSelected ? null : application.id) : undefined}
              className={`bg-white rounded-2xl border transition-all shadow-sm p-4 ${
                showOffer ? 'cursor-pointer hover:shadow-md' : ''
              } ${isSelected ? 'border-green-500 shadow-md' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                {showOffer && <CompanyLogo logoUrl={application.companyLogoUrl} name={application.companyName} />}

                <div className="flex-1 min-w-0">
                  {showOffer && (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                          {application.offerTitle || t('student.applications.noTitle')}
                        </h3>
                        <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          {cardStatusLabel}
                        </span>
                      </div>
                      {application.companyName && <p className="text-sm text-gray-500 mt-0.5">{application.companyName}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {context && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                            {t('student.applications.programBadge')}
                          </span>
                        )}
                        {context?.programTitle && (
                          <span className="text-xs text-indigo-500 truncate max-w-[180px]">{context.programTitle}</span>
                        )}
                        {application.companyCity && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {application.companyCity}
                          </span>
                        )}
                        {application.createdAt && !isNaN(new Date(application.createdAt).getTime()) && (
                          <span className="text-xs text-gray-400">{relativeDate(application.createdAt, t)}</span>
                        )}
                      </div>
                    </>
                  )}

                  {showStudent && (application._raw as any)?.student && (
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={buildCompanyApplicationHref(locale, application.applicationId)}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {(application._raw as any).student.name}
                      </Link>
                      <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {cardStatusLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {onStatusChange && (
                <div className="mt-2 flex justify-end">
                  <ApplicationStatusChanger
                    applicationId={application.applicationId}
                    currentStatus={application.status}
                    onStatusChanged={(id, newStatus) => {
                      onStatusChange(id, newStatus as Application['status']);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showOffer && (
        <div className="lg:col-span-1">
          {selected ? (
            <ApplicationDetailPanel application={selected} locale={locale} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center sticky top-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">{t('student.applications.selectApp')}</h3>
              <p className="text-sm text-gray-400">{t('student.applications.selectAppSub')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

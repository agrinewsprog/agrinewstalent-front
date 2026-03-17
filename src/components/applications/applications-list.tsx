'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Application } from '@/src/types';

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES');
}

function relativeDate(value: string | null | undefined, t: ReturnType<typeof useTranslations>): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const diff = Math.ceil((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return t('student.relativeDate.today');
  if (diff === 1) return t('student.relativeDate.yesterday');
  if (diff < 7) return t('student.relativeDate.daysAgo', { days: diff });
  if (diff < 30) return t('student.relativeDate.weeksAgo', { weeks: Math.floor(diff / 7) });
  return t('student.relativeDate.monthsAgo', { months: Math.floor(diff / 30) });
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewing: 'bg-blue-100 text-blue-700',
  interview: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  VIEWED: 'bg-blue-100 text-blue-700',
  INTERVIEW_REQUESTED: 'bg-purple-100 text-purple-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

function CompanyLogo({ logoUrl, name }: { logoUrl?: string | null; name?: string }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name ?? 'Empresa'}
        className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
      {(name ?? '?')[0].toUpperCase()}
    </div>
  );
}

//  Panel de detalle 
function ApplicationDetailPanel({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  const t = useTranslations('intranet');
  const sl = (k: string) => { try { return t(`student.applications.statusLabels.${k}` as any); } catch { return k; } };
  const offer = application.offer;
  const statusLabel = sl(application.status);
  const statusColor = statusColors[application.status] ?? 'bg-gray-100 text-gray-700';
  const companyName = (offer?.company as any)?.companyName ?? (offer?.company as any)?.name;
  const logoUrl = (offer?.company as any)?.logoUrl;
  const city = (offer?.company as any)?.city;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
      {/* Cabecera verde */}
      <div className="relative bg-gradient-to-br from-green-600 to-green-800 px-6 pt-6 pb-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white text-lg leading-none"
        >
          
        </button>
        <div className="flex items-center gap-3 mb-4">
          <CompanyLogo logoUrl={logoUrl} name={companyName} />
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{offer?.title ?? 'Oferta'}</h2>
            <p className="text-green-200 text-sm">{companyName ?? ''}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {application.createdAt && !isNaN(new Date(application.createdAt).getTime()) && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">{t('student.applications.detail.sentLabel').replace(':', '')}</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(application.createdAt)}</p>
            </div>
          )}
          {city && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">{t('common.location')}</p>
              <p className="text-sm font-semibold text-gray-800">{city}</p>
            </div>
          )}
        </div>

        {application.coverLetter && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('student.applications.detail.coverLetterTitle')}
            </h4>
            <p className="text-sm text-gray-700 line-clamp-4">{application.coverLetter}</p>
          </div>
        )}

        {(offer as any)?.description && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('student.applications.detail.aboutOfferTitle')}
            </h4>
            <p className="text-sm text-gray-700 line-clamp-4">{(offer as any).description}</p>
          </div>
        )}

        <Link
          href={`/intranet/student/offers/${(offer as any)?.id ?? application.offerId}`}
          className="block w-full text-center py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {t('student.applications.detail.viewFull')}
        </Link>
      </div>
    </div>
  );
}

//  Lista 
interface ApplicationsListProps {
  applications: Application[];
  showOffer?: boolean;
  showStudent?: boolean;
  onStatusChange?: (applicationId: string, status: Application['status']) => void;
}

export function ApplicationsList({
  applications = [],
  showOffer = true,
  showStudent = false,
  onStatusChange,
}: ApplicationsListProps) {
  const t = useTranslations('intranet');
  const sl = (k: string) => { try { return t(`student.applications.statusLabels.${k}` as any); } catch { return k; } };
  const [selected, setSelected] = useState<Application | null>(null);

  if ((applications ?? []).length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-gray-500">{t('student.applications.noApplications')}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-5 ${showOffer ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {/* Lista de tarjetas */}
      <div className={`space-y-3 ${showOffer ? 'lg:col-span-2' : ''}`}>
        {(applications ?? []).map((application) => {
          const offer = application.offer;
          const isSelected = selected?.id === application.id;
          const statusLabel = sl(application.status);
          const statusColor = statusColors[application.status] ?? 'bg-gray-100 text-gray-700';
          const companyName = (offer?.company as any)?.companyName ?? (offer?.company as any)?.name;
          const logoUrl = (offer?.company as any)?.logoUrl;
          const city = (offer?.company as any)?.city;

          return (
            <div
              key={application.id}
              onClick={() => showOffer ? setSelected(isSelected ? null : application) : undefined}
              className={`bg-white rounded-2xl border transition-all shadow-sm p-4 ${
                showOffer ? 'cursor-pointer hover:shadow-md' : ''
              } ${isSelected ? 'border-green-500 shadow-md' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                {showOffer && <CompanyLogo logoUrl={logoUrl} name={companyName} />}

                <div className="flex-1 min-w-0">
                  {showOffer && offer && (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                          {offer.title}
                        </h3>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      {companyName && <p className="text-sm text-gray-500 mt-0.5">{companyName}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {city && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {city}
                          </span>
                        )}
                        {application.createdAt && !isNaN(new Date(application.createdAt).getTime()) && (
                          <span className="text-xs text-gray-400">{relativeDate(application.createdAt, t)}</span>
                        )}
                      </div>
                    </>
                  )}

                  {showStudent && application.student && (
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/intranet/company/applications/${application.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {application.student.name}
                      </Link>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {onStatusChange && (
                <div className="mt-2 flex justify-end">
                  <select
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                    value={application.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      onStatusChange(application.id, e.target.value as Application['status']);
                    }}
                  >
                  <option value="pending">{t('student.applications.statusLabels.pending')}</option>
                    <option value="reviewing">{t('student.applications.statusLabels.reviewing')}</option>
                    <option value="interview">{t('student.applications.statusLabels.interview')}</option>
                    <option value="accepted">{t('student.applications.statusLabels.accepted')}</option>
                    <option value="rejected">{t('student.applications.statusLabels.rejected')}</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel de detalle */}
      {showOffer && (
        <div className="lg:col-span-1">
          {selected ? (
            <ApplicationDetailPanel application={selected} onClose={() => setSelected(null)} />
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center sticky top-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CheckBadgeIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  PhoneIcon,
  UserIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import type {
  ProgramCompanyDetail,
  CompanyOfferEntry,
} from '../../../types';
import { buildUniversityProgramOfferHref } from '@/lib/utils';
import { getDisplayInitial, toAbsoluteAssetUrl } from '@/lib/frontend/contracts';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  company: ProgramCompanyDetail;
  offers: CompanyOfferEntry[];
  programId: string;
  locale: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function offerStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'APPROVED': return 'bg-green-100 text-green-800';
    case 'PENDING':  return 'bg-yellow-100 text-yellow-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    default:         return 'bg-gray-100 text-gray-600';
  }
}

function translateContractType(raw: string, t: ReturnType<typeof useTranslations>): string {
  const key = `common.contractType.${raw.toUpperCase()}` as Parameters<typeof t>[0];
  try { return t(key); } catch { return raw; }
}

function translateWorkMode(raw: string, t: ReturnType<typeof useTranslations>): string {
  const key = `common.workMode.${raw.toUpperCase()}` as Parameters<typeof t>[0];
  try { return t(key); } catch { return raw; }
}

/** Translate a workMode chip label for the profile section */
function workModeLabel(raw: string, t: ReturnType<typeof useTranslations>): string {
  const map: Record<string, string> = {
    'on-site': 'ON_SITE', 'ON_SITE': 'ON_SITE', 'onsite': 'ON_SITE',
    'remote': 'REMOTE', 'REMOTE': 'REMOTE',
    'hybrid': 'HYBRID', 'HYBRID': 'HYBRID',
  };
  const key = `university.companyProfile.workModeValues.${map[raw] ?? raw.toUpperCase()}` as Parameters<typeof t>[0];
  try { return t(key); } catch { return raw; }
}

/** Translate a vacancyType chip label */
function vacancyTypeLabel(raw: string, t: ReturnType<typeof useTranslations>): string {
  const map: Record<string, string> = {
    'full-time': 'FULL_TIME', 'FULL_TIME': 'FULL_TIME',
    'part-time': 'PART_TIME', 'PART_TIME': 'PART_TIME',
    'internship': 'INTERNSHIP', 'INTERNSHIP': 'INTERNSHIP',
    'temporary': 'TEMPORARY', 'TEMPORARY': 'TEMPORARY',
    'freelance': 'FREELANCE', 'FREELANCE': 'FREELANCE',
  };
  const key = `university.companyProfile.vacancyTypeValues.${map[raw] ?? raw.toUpperCase()}` as Parameters<typeof t>[0];
  try { return t(key); } catch { return raw; }
}

function uniqueValues(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function CompanyDetailClient({
  company,
  offers,
  programId,
  locale,
}: Props) {
  const t = useTranslations('intranet');
  const [offerFilter, setOfferFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const name = company.companyName ?? company.name ?? String(company.id);
  const description = company.descriptionLong ?? company.description;
  const companyLogoUrl = toAbsoluteAssetUrl(company.logoUrl, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
  const workModes = uniqueValues(company.workModes);
  const vacancyTypes = uniqueValues(company.vacancyTypes);
  const workingLanguages = uniqueValues(company.workingLanguages);

  const filteredOffers = offers.filter(
    (o) => offerFilter === 'all' || o.status.toUpperCase() === offerFilter.toUpperCase(),
  );

  /* Shared styles */
  const chipCls = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700';
  const sectionCls = 'bg-white border border-gray-200 rounded-xl p-5 shadow-sm';
  const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-0">
      {/* Back */}
        <Link
          href={`/${locale}/intranet/university/programs/${programId}`}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
        <ArrowLeftIcon className="w-4 h-4" />
        {t('university.companyProfile.backToProgram')}
      </Link>

      {/* ── Header card ── */}
      <div className={sectionCls}>
        <div className="flex items-start gap-4">
          {company.logoUrl ? (
            <img
              src={companyLogoUrl ?? company.logoUrl}
              alt={name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-semibold text-gray-500">{getDisplayInitial(name)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>

            {/* Location */}
            {company.location ? (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 shrink-0" />
                {company.location}
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 shrink-0" />
                {t('university.companyProfile.noLocation')}
              </p>
            )}

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {company.verified === true && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                  {t('university.companyProfile.verified')}
                </span>
              )}
              {typeof company.approvedOffersCount === 'number' && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  {company.approvedOffersCount} {t('university.companyProfile.approvedOffers')}
                </span>
              )}
              {company.participatesInInternships === true && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  <AcademicCapIcon className="w-3.5 h-3.5" />
                  {t('university.companyProfile.participatesInInternships')}
                </span>
              )}
            </div>

            {/* Quick links row */}
            <div className="mt-3 flex flex-wrap gap-4">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <GlobeAltIcon className="w-3.5 h-3.5" />
                  {t('university.companyProfile.website')}
                </a>
              )}
              {company.linkedinUrl && (
                <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  {t('university.companyProfile.linkedin')}
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
          {t('university.companyProfile.description')}
        </h2>
        {description ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {t('university.companyProfile.noDescription')}
          </p>
        )}
      </div>

      {/* ── Company details grid ── */}
      {(company.industry || company.companySize || company.foundedYear || company.contactPerson || company.contactEmail || company.contactPhone || workModes.length > 0 || vacancyTypes.length > 0 || workingLanguages.length > 0) && (
        <div className={sectionCls + ' space-y-5'}>
          {/* Row 1: industry / size / year */}
          {(company.industry || company.companySize || company.foundedYear) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {company.industry && (
                <div>
                  <p className={labelCls}>{t('university.companyProfile.industry')}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{company.industry}</p>
                </div>
              )}
              {company.companySize && (
                <div>
                  <p className={labelCls}>{t('university.companyProfile.companySize')}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{company.companySize}</p>
                </div>
              )}
              {company.foundedYear && (
                <div>
                  <p className={labelCls}>{t('university.companyProfile.foundedYear')}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{company.foundedYear}</p>
                </div>
              )}
            </div>
          )}

          {/* Row 2: contact info */}
          {(company.contactPerson || company.contactEmail || company.contactPhone) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {company.contactPerson && (
                <div>
                  <p className={labelCls}>{t('university.companyProfile.contactPerson')}</p>
                  <p className="text-sm text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    {company.contactPerson}
                  </p>
                </div>
              )}
              {company.contactEmail && (
                <div>
                  <p className={labelCls}>{t('university.companyProfile.contactEmail')}</p>
                  <a href={`mailto:${company.contactEmail}`} className="text-sm text-blue-600 hover:underline mt-0.5 flex items-center gap-1.5">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{company.contactEmail}</span>
                  </a>
                </div>
              )}
              {company.contactPhone && (
                <div>
                  <p className={labelCls}>{t('university.companyProfile.contactPhone')}</p>
                  <p className="text-sm text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    {company.contactPhone}
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
                  <p className={labelCls + ' mb-1.5'}>{t('university.companyProfile.workModes')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {workModes.map((m) => (
                      <span key={m} className={chipCls}>{workModeLabel(m, t)}</span>
                    ))}
                  </div>
                </div>
              )}
              {vacancyTypes.length > 0 && (
                <div>
                  <p className={labelCls + ' mb-1.5'}>{t('university.companyProfile.vacancyTypes')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vacancyTypes.map((v) => (
                      <span key={v} className={chipCls}>{vacancyTypeLabel(v, t)}</span>
                    ))}
                  </div>
                </div>
              )}
              {workingLanguages.length > 0 && (
                <div>
                  <p className={labelCls + ' mb-1.5'}>{t('university.companyProfile.workingLanguages')}</p>
                  <p className="text-sm text-gray-900">{workingLanguages.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {t('university.companyProfile.offers.title')}
        </h2>

        {offers.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            {t('university.companyProfile.offers.noOffers')}
          </p>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setOfferFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    offerFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t(`university.companyProfile.offers.${f}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>

            {filteredOffers.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                {t('university.companyProfile.offers.noOffers')}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredOffers.map((offer, idx) => {
                  const safeKey = offer.programOfferId
                    ?? offer.id
                    ?? `${offer.programId ?? 'np'}-${offer.title}-${offer.createdAt ?? idx}`;
                  return (
                    <OfferRow
                      key={String(safeKey)}
                      offer={offer}
                      programId={programId}
                      locale={locale}
                      t={t}
                    />
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Offer row                                           */
/* ------------------------------------------------------------------ */
function OfferRow({
  offer,
  programId,
  locale,
  t,
}: {
  offer: CompanyOfferEntry;
  programId: string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const s = offer.status.toUpperCase();
  const statusLabelKey: Record<string, string> = {
    PENDING: 'university.companyProfile.offers.pending',
    APPROVED: 'university.companyProfile.offers.approved',
    REJECTED: 'university.companyProfile.offers.rejected',
  };
  const statusKey = (statusLabelKey[s] ?? 'university.companyProfile.offers.pending') as Parameters<typeof t>[0];
  const linkProgramId = offer.programId ? String(offer.programId) : programId;
  const offerId = offer.programOfferId ?? offer.id;

  return (
    <li className="py-3 space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{offer.title}</p>
          {offer.programTitle && (
            <p className="text-xs text-gray-500 mt-0.5">
              {t('university.companyProfile.offers.program')}: {offer.programTitle}
            </p>
          )}
        </div>
        <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${offerStatusStyle(s)}`}>
          {t(statusKey)}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {offer.location && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="w-3.5 h-3.5" />
            {offer.location}
          </span>
        )}
        {offer.contractType && (
          <span>
            {t('university.companyProfile.offers.contractType')}: {translateContractType(offer.contractType, t)}
          </span>
        )}
        {offer.workMode && (
          <span>
            {t('university.companyProfile.offers.workMode')}: {translateWorkMode(offer.workMode, t)}
          </span>
        )}
        {offer.createdAt && (
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            {t('university.companyProfile.offers.submittedOn')} {new Date(offer.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div>
        <Link
          href={buildUniversityProgramOfferHref(locale, linkProgramId, offerId)}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          {t('university.companyProfile.offers.viewOffer')}
          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
        </Link>
      </div>
    </li>
  );
}

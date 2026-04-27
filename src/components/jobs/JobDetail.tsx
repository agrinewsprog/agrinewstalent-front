'use client';

import { useState } from 'react';
import { XMarkIcon, MapPinIcon, BuildingOfficeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { JobOffer } from './JobCard';
import ApplyModal from './ApplyModal';
import { buildLocaleHref, buildStudentOfferHref, buildStudentProgramOfferHref } from '@/lib/utils';

type EnhancedJobOffer = JobOffer & {
  jobOfferId?: number | string | null;
  programOfferId?: number | string | null;
  programId?: number | string | null;
  detailHref?: string | null;
  profileHref?: string | null;
};

interface JobDetailProps {
  offer: EnhancedJobOffer | null;
  onClose: () => void;
}

function resolveOfferDetailHref(locale: string, offer: EnhancedJobOffer | null): string | null {
  if (!offer) return null;
  if (offer.detailHref) return offer.detailHref;

  if (offer.programId != null && offer.programOfferId != null) {
    return buildStudentProgramOfferHref(locale, offer.programId, offer.programOfferId);
  }

  const jobOfferId = offer.jobOfferId ?? offer.id;
  return jobOfferId != null ? buildStudentOfferHref(locale, jobOfferId) : null;
}

export default function JobDetail({ offer, onClose }: JobDetailProps) {
  const t = useTranslations('public.jobs');
  const locale = useLocale();
  const router = useRouter();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleEditProfile = () => {
    setIsApplyModalOpen(false);
    router.push(offer?.profileHref ?? buildLocaleHref(locale, '/intranet/student/profile'));
  };

  const handleApply = () => {
    setIsApplyModalOpen(false);
    const href = resolveOfferDetailHref(locale, offer);
    if (href) {
      router.push(href);
      return;
    }
    window.alert(t('applySuccess'));
  };

  if (!offer) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <BuildingOfficeIcon className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {t('selectOffer')}
        </h3>
        <p className="text-gray-500 text-sm">
          {t('selectOfferSub')}
        </p>
      </div>
    );
  }

  const getTypeLabel = (type: 'empleo' | 'practicas') => {
    return type === 'empleo' ? t('typeEmpleo') : t('typePracticas');
  };

  const getTypeBadgeColor = (type: 'empleo' | 'practicas') => {
    return type === 'empleo'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffTime = Math.abs(now.getTime() - published.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { count: diffDays });
    if (diffDays < 30) return t('weeksAgo', { count: Math.floor(diffDays / 7) });
    return t('monthsAgo', { count: Math.floor(diffDays / 30) });
  };

  const companyName = offer.company || 'Empresa';

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-4">
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
              offer.type,
            )}`}
          >
            {getTypeLabel(offer.type)}
          </span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={t('closeDetail')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-2">{offer.title}</h2>

        <div className="flex items-center mb-3">
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          <span className="font-semibold text-lg">{companyName}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {offer.location && (
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{offer.location}</span>
            </div>
          )}
          {offer.publishedAt && (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(offer.publishedAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
          {offer.workMode && (
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('workMode')}</p>
              <p className="font-semibold text-gray-900">{offer.workMode}</p>
            </div>
          )}
          {offer.salary && (
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('salaryLabel')}</p>
              <p className="font-semibold text-green-700">{offer.salary}</p>
            </div>
          )}
        </div>

        {offer.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('descriptionLabel')}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {offer.description}
            </p>
          </div>
        )}

        {offer.responsibilities && offer.responsibilities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('responsibilitiesLabel')}
            </h3>
            <ul className="space-y-2">
              {offer.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">&bull;</span>
                  <span className="text-gray-700">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {offer.requirements && offer.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('requirementsLabel')}
            </h3>
            <ul className="space-y-2">
              {offer.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">&bull;</span>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {offer.tags && offer.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('skillsLabel')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {offer.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-md border border-green-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
        >
          {t('applyBtn')}
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          {t('applyModal.note', { company: companyName })}
        </p>
      </div>

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        offer={offer}
        onEditProfile={handleEditProfile}
        onApply={handleApply}
      />
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import { api } from '@/lib/api/client';
import { Application } from '@/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApplicationTimeline } from '@/components/applications/application-timeline';
import { ApplicationActions } from './application-actions';
import { buildCompanyOfferHref, buildLocaleHref } from '@/lib/utils';
import { getLocale } from 'next-intl/server';
import { resolveJobOfferId, resolveProgramId, resolveProgramOfferId } from '@/lib/frontend/contracts';

async function getApplication(id: string): Promise<Application | null> {
  try {
    const response = await api.get<{ data: Application }>(`/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}

function normalizeStatus(raw: string): string {
  const upper = raw?.toUpperCase?.() ?? '';
  if (upper === 'SUBMITTED' || upper === 'VIEWED') return 'PENDING';
  if (upper === 'INTERVIEW_REQUESTED') return 'INTERVIEW';
  return upper;
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  reviewing: 'warning',
  interview: 'default',
  accepted: 'success',
  rejected: 'danger',
  PENDING: 'warning',
  INTERVIEW: 'default',
  HIRED: 'success',
  REJECTED: 'danger',
};

export default async function CompanyApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, t, locale] = await Promise.all([
    getApplication(id),
    getTranslations('intranet'),
    getLocale(),
  ]);

  if (!application) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    pending: t('company.applicationDetail.statusLabels.pending'),
    reviewing: t('company.applicationDetail.statusLabels.reviewing'),
    interview: t('company.applicationDetail.statusLabels.interview'),
    accepted: t('company.applicationDetail.statusLabels.accepted'),
    rejected: t('company.applicationDetail.statusLabels.rejected'),
    PENDING: t('company.applicationDetail.statusLabels.PENDING'),
    INTERVIEW: t('company.applicationDetail.statusLabels.INTERVIEW'),
    HIRED: t('company.applicationDetail.statusLabels.HIRED'),
    REJECTED: t('company.applicationDetail.statusLabels.REJECTED'),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={buildLocaleHref(locale, '/intranet/company/applications')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {t('company.applicationDetail.backToApplications')}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {application.student?.name || 'Candidato'}
              </h1>
              <p className="text-gray-600 mt-2">
                {application.student?.email || ''}
              </p>
              {application.student?.university && (
                <p className="text-sm text-gray-500 mt-1">
                  {application.student.university.universityName}
                </p>
              )}
            </div>
            <Badge variant={statusVariants[normalizeStatus(application.status)]}>
              {statusLabels[normalizeStatus(application.status)]}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">{t('company.applicationDetail.offerTitle')}</h2>
              {application.offer && (() => {
                const offer = application.offer as unknown as Record<string, unknown>;
                const offerId = resolveJobOfferId(application, offer);
                if (!offerId) return null;
                const href = buildCompanyOfferHref(
                  locale,
                  offerId,
                  resolveProgramId(application, offer),
                  resolveProgramOfferId(application, offer),
                );
                return (
                  <Link
                    href={href}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {String(offer.title ?? '')}
                  </Link>
                );
              })()}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">{t('company.applicationDetail.appInfoTitle')}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  {t('company.applicationDetail.sent')} {new Date(application.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p>
                  {t('company.applicationDetail.lastUpdate')} {new Date(application.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {application.coverLetter && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('company.applicationDetail.coverLetterTitle')}</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            <ApplicationActions applicationId={application.id} currentStatus={application.status} />
          </div>
        </CardBody>
      </Card>

      {application.timeline && application.timeline.length > 0 && (
        <ApplicationTimeline timeline={application.timeline} />
      )}
    </div>
  );
}

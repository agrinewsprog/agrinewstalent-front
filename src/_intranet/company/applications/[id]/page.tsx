import { getTranslations } from 'next-intl/server';
import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApplicationTimeline } from '@/src/components/applications/application-timeline';
import { ApplicationActions } from './application-actions';

async function getApplication(id: string): Promise<Application | null> {
  try {
    const response = await api.get<{ data: Application }>(`/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}

const statusVariants: Record<Application['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  reviewing: 'info',
  interview: 'default',
  accepted: 'success',
  rejected: 'danger',
};

export default async function CompanyApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, t] = await Promise.all([
    getApplication(id),
    getTranslations('intranet'),
  ]);

  if (!application) {
    notFound();
  }

  const statusLabels: Record<Application['status'], string> = {
    pending: t('company.applicationDetail.statusLabels.pending'),
    reviewing: t('company.applicationDetail.statusLabels.reviewing'),
    interview: t('company.applicationDetail.statusLabels.interview'),
    accepted: t('company.applicationDetail.statusLabels.accepted'),
    rejected: t('company.applicationDetail.statusLabels.rejected'),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/intranet/company/applications"
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
            <Badge variant={statusVariants[application.status]}>
              {statusLabels[application.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">{t('company.applicationDetail.offerTitle')}</h2>
              {application.offer && (
                <Link
                  href={`/intranet/company/offers/${application.offer.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {application.offer.title}
                </Link>
              )}
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

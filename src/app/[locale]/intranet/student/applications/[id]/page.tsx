import { getTranslations, getLocale } from 'next-intl/server';
import { api } from '@/lib/api/client';
import { Application } from '@/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApplicationTimeline } from '@/components/applications/application-timeline';

async function getApplication(id: string): Promise<Application | null> {
  try {
    const response = await api.get<any>(`/applications/${id}`);
    return (response.application ?? response.data ?? response) as Application;
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

function formatDate(value: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-ES', opts ?? { year: 'numeric', month: 'long', day: 'numeric' });
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

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('intranet');
  const locale = await getLocale();
  const sl = (k: string) => { const nk = normalizeStatus(k); try { return t(`student.applications.statusLabels.${nk}` as any); } catch { return nk; } };
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  /* Detect program context */
  const appAny = application as any;
  const po = appAny.programOffer ?? appAny.offer?.programOffers?.[0];
  const programId = appAny.programId ?? po?.programId ?? po?.program?.id ?? null;
  const programOfferId = appAny.programOfferId ?? po?.id ?? null;
  const isProgram = !!(programId && programOfferId);
  const programTitle = appAny.programTitle ?? appAny.program?.title ?? po?.program?.title ?? '';

  const offerHref = isProgram
    ? `/${locale}/intranet/student/programs/${programId}/offers/${programOfferId}`
    : `/${locale}/intranet/student/offers/${application.offer?.id ?? application.offerId}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/${locale}/intranet/student/applications`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {t('student.applications.backToApplications')}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {application.offer?.title || t('student.applications.noTitle')}
              </h1>
              <p className="text-gray-600 mt-2">
                {application.offer?.company?.companyName || t('student.applications.confidentialCompany')}
              </p>
              {isProgram && programTitle && (
                <p className="mt-1 flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                    {t('student.applications.programBadge')}
                  </span>
                  <Link
                    href={`/${locale}/intranet/student/programs/${programId}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {programTitle}
                  </Link>
                </p>
              )}
            </div>
            <Badge variant={statusVariants[normalizeStatus(application.status)]}>
              {sl(application.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">{t('student.applications.detail.infoTitle')}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{t('student.applications.detail.sentLabel')} {formatDate(application.createdAt)}</p>
                <p>{t('student.applications.detail.updatedLabel')} {formatDate(application.updatedAt)}</p>
              </div>
            </div>

            {application.coverLetter && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('student.applications.detail.coverLetterTitle')}</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {application.offer && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('student.applications.detail.aboutOfferTitle')}</h2>
                <p className="text-gray-700">
                  {application.offer.description}
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  <p>📍 {application.offer.location}</p>
                  {application.offer.salary && <p>💰 {application.offer.salary}</p>}
                </div>
                <div className="mt-4">
                  <Link
                    href={offerHref}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 border border-green-600 hover:border-green-700 rounded-lg px-4 py-2 transition-colors"
                  >
                  {t('student.applications.detail.viewFull')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {application.timeline && application.timeline.length > 0 && (
        <ApplicationTimeline timeline={application.timeline} />
      )}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api/client';
import type { UniversityProgram, ProgramCompany, ProgramApplication, ProgramOffer } from '../types';
import {
  normalizeApplicationStatus,
  resolveCompanyId,
  resolveJobOfferId,
  resolveProgramOfferId,
  resolveStudentId,
  unwrapCollection,
} from '@/lib/frontend/contracts';
import {
  buildUniversityProgramCompanyHref,
  buildUniversityProgramOfferHref,
  buildUniversityStudentHref,
} from '@/lib/utils';
import { EmptyStateCard, MetricCard, PageHeader, PageShell, SectionCard } from '@/components/ui/intranet-page';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface Props {
  program: UniversityProgram;
  initialCompanies: ProgramCompany[];
  initialApplications: ProgramApplication[];
  initialOffers: ProgramOffer[];
  locale: string;
  backLabel: string;
  editLabel: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtDate(iso: string | undefined, locale: string) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'pt' ? 'pt-PT' : 'es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  } catch { return iso; }
}

function statusColors(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE': case 'APPROVED': return 'bg-green-100 text-green-800 ring-1 ring-green-200';
    case 'PENDING':                 return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
    case 'CLOSED': case 'REJECTED': return 'bg-red-100 text-red-800 ring-1 ring-red-200';
    default:                        return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
  }
}

function applicationStatusLabel(
  rawStatus: string | undefined,
  t: ReturnType<typeof useTranslations>,
): string {
  const status = normalizeApplicationStatus(rawStatus);
  const key = `student.applications.statusLabels.${status}` as Parameters<typeof t>[0];
  try {
    return t(key);
  } catch {
    return status;
  }
}

function offerStatusLabel(status: string, t: ReturnType<typeof useTranslations>): string {
  const normalized = status.toUpperCase();
  const map: Record<string, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ACTIVE: 'Approved',
    CLOSED: 'Rejected',
  };
  const suffix = map[normalized] ?? 'Pending';
  const key = `university.programDetail.offers.status${suffix}` as Parameters<typeof t>[0];
  try {
    return t(key);
  } catch {
    return normalized;
  }
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: number; sub?: string;
}) {
  return (
    <MetricCard
      icon={<Icon className="w-5 h-5" />}
      label={label}
      value={value}
      accentClassName="bg-blue-50 text-blue-600"
      className={sub ? 'items-start' : undefined}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Companies tab                                                      */
/* ------------------------------------------------------------------ */

function CompaniesTab({
  companies,
  programId,
}: {
  companies: ProgramCompany[];
  programId: string | number;
}) {
  const t = useTranslations('intranet');
  const locale = useLocale();

  if (companies.length === 0) {
    return (
      <EmptyStateCard
        icon={<BuildingOfficeIcon className="w-6 h-6" />}
        title={t('university.programDetail.companies.noApprovedCompanies')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {companies.map(c => {
        const name = c.companyName ?? c.name ?? String(c.id);
        return (
          <div key={c.companyId ?? c.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {c.logoUrl ? (
                <img src={c.logoUrl} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 text-sm block truncate">{name}</span>
                  {c.verified && (
                    <ShieldCheckIcon className="w-4 h-4 text-blue-500 shrink-0" title={t('university.programDetail.companies.verified')} />
                  )}
                </div>
                {c.location && (
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPinIcon className="w-3 h-3 shrink-0" />{c.location}
                  </span>
                )}
                {typeof c.approvedOffersCount === 'number' && (
                  <span className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                    <BriefcaseIcon className="w-3 h-3 shrink-0" />
                    {c.approvedOffersCount} {t('university.programDetail.companies.approvedOffers')}
                  </span>
                )}
              </div>
            </div>

            <Link
              href={buildUniversityProgramCompanyHref(locale, programId, resolveCompanyId(c) ?? c.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shrink-0"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              {t('university.programDetail.companies.viewCompany')}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Applications tab                                                   */
/* ------------------------------------------------------------------ */
function ApplicationsTab({ applications, locale, programId }: { applications: ProgramApplication[]; locale: string; programId: string | number }) {
  const t = useTranslations('intranet');

  if (applications.length === 0) {
    return (
      <EmptyStateCard
        icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
        title={t('university.programDetail.emptyApplications')}
      />
    );
  }
  return (
    <div className="space-y-2">
      {applications.map(app => {
        const studentName = app.studentName || app.student?.fullName || app.student?.name || t('university.programDetail.applications.noName');
        const date = app.appliedAt ?? app.createdAt;
        return (
          <div key={app.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900 text-sm">{studentName}</p>
                {app.student?.email && <p className="text-xs text-gray-400">{app.student.email}</p>}
                {app.offerTitle && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <BriefcaseIcon className="w-3 h-3" />{app.offerTitle}
                  </p>
                )}
                {app.companyName && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <BuildingOfficeIcon className="w-3 h-3" />{app.companyName}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {app.status && (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors(app.status)}`}>
                    {applicationStatusLabel(app.status, t)}
                  </span>
                )}
                {date && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <CalendarDaysIcon className="w-3 h-3" />{fmtDate(date, locale)}
                  </span>
                )}
                {app.studentId && (
                  <Link
                    href={buildUniversityStudentHref(locale, resolveStudentId(app) ?? app.studentId)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors mt-1"
                  >
                    <EyeIcon className="w-3 h-3" />
                    {t('university.programDetail.applications.viewStudent')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Offers tab                                                         */
/* ------------------------------------------------------------------ */
type OfferFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const offerStatusColors: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  REJECTED: 'bg-red-100 text-red-800 ring-1 ring-red-200',
};

function OffersTab({
  offers,
  programId,
  onRefresh,
}: {
  offers: ProgramOffer[];
  programId: string | number;
  onRefresh: (updated: ProgramOffer[]) => void;
}) {
  const t = useTranslations('intranet');
  const locale = useLocale();
  const [filter, setFilter] = useState<OfferFilter>('ALL');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const filtered = filter === 'ALL' ? offers : offers.filter(o => o.status === filter);

  const filters: { key: OfferFilter; label: string; count: number }[] = [
    { key: 'ALL',      label: t('student.dashboard.viewAll'), count: offers.length },
    { key: 'PENDING',  label: t('university.programDetail.offers.tabPending'),  count: offers.filter(o => o.status === 'PENDING').length },
    { key: 'APPROVED', label: t('university.programDetail.offers.tabApproved'), count: offers.filter(o => o.status === 'APPROVED').length },
    { key: 'REJECTED', label: t('university.programDetail.offers.tabRejected'), count: offers.filter(o => o.status === 'REJECTED').length },
  ];

  const emptyKeys: Record<Exclude<OfferFilter, 'ALL'>, string> = {
    PENDING:  'university.programDetail.offers.emptyPending',
    APPROVED: 'university.programDetail.offers.emptyApproved',
    REJECTED: 'university.programDetail.offers.emptyRejected',
  };

  const handleAction = useCallback(async (offer: ProgramOffer, newStatus: 'APPROVED' | 'REJECTED') => {
    const poId = offer.programOfferId;

    if (!poId) {
      console.error('[OffersTab] Missing programOfferId for offer', offer);
      setFeedback({ type: 'error', msg: t('university.programDetail.offers.missingOfferId') });
      return;
    }

    setLoadingAction(`${offer.programOfferId}-${newStatus}`);
    setFeedback(null);
    try {
      await api.patch(`/api/programs/${programId}/offers/${poId}/status`, { status: newStatus });
      // Re-fetch real data from backend
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${API}/api/universities/me/programs/${programId}/offers`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const raw = unwrapCollection<unknown>(data, ['offers', 'data']);
          const refreshed: ProgramOffer[] = raw.map((item: unknown) => {
            const r = item as Record<string, unknown>;
            const company = (r.company ?? {}) as Record<string, unknown>;
            const innerOffer = (r.offer ?? {}) as Record<string, unknown>;
            const pOId = String(resolveProgramOfferId(r) ?? r.id ?? r._id ?? '');
            const oId = String(resolveJobOfferId(r, innerOffer) ?? r.id ?? r._id ?? '');
            return {
              id: oId,
              programOfferId: pOId,
              title: String(innerOffer.title ?? r.title ?? r.name ?? ''),
              description: typeof (innerOffer.description ?? r.description) === 'string' ? String(innerOffer.description ?? r.description) : undefined,
              companyName: typeof r.companyName === 'string'
                ? r.companyName
                : typeof company.name === 'string' ? company.name
                : typeof (innerOffer.company as Record<string,unknown>)?.name === 'string' ? String((innerOffer.company as Record<string,unknown>).name) : undefined,
              companyId: typeof r.companyId === 'string' ? r.companyId : undefined,
              location: typeof r.location === 'string' ? r.location
                : typeof (innerOffer.location) === 'string' ? String(innerOffer.location) : undefined,
              contractType: typeof r.contractType === 'string'
                ? r.contractType
                : typeof r.contract_type === 'string' ? r.contract_type
                : typeof (innerOffer.contractType) === 'string' ? String(innerOffer.contractType) : undefined,
              workMode: typeof r.workMode === 'string'
                ? r.workMode
                : typeof r.work_mode === 'string' ? r.work_mode
                : typeof (innerOffer.workMode) === 'string' ? String(innerOffer.workMode) : undefined,
              status: typeof r.status === 'string' ? r.status.toUpperCase() : 'PENDING',
              createdAt: typeof r.createdAt === 'string' ? r.createdAt : typeof r.created_at === 'string' ? r.created_at : undefined,
              updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : typeof r.updated_at === 'string' ? r.updated_at : undefined,
            };
          });
          onRefresh(refreshed);
        }
      } catch {
        // If re-fetch fails, do optimistic update
        onRefresh(offers.map(o => o.programOfferId === offer.programOfferId ? { ...o, status: newStatus } : o));
      }
      setFeedback({
        type: 'success',
        msg: t(newStatus === 'APPROVED'
          ? 'university.programDetail.offers.approveSuccess'
          : 'university.programDetail.offers.rejectSuccess'),
      });
    } catch {
      setFeedback({
        type: 'error',
        msg: t('university.programDetail.offers.actionError'),
      });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  }, [programId, offers, onRefresh, t]);

  return (
    <div className="space-y-4">
      {/* Feedback banner */}
      {feedback && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Sub-filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs ${
              filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <EmptyStateCard
          icon={<BriefcaseIcon className="w-6 h-6" />}
          title={filter === 'ALL'
            ? t('student.programDetail.noOffers')
            : t(emptyKeys[filter] as Parameters<typeof t>[0])}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(offer => {
            const statusLabel = offerStatusLabel(offer.status, t);
            const ctKey = `university.programDetail.offers.contractTypes.${offer.contractType}` as Parameters<typeof t>[0];
            const wmKey = `university.programDetail.offers.workModes.${offer.workMode}` as Parameters<typeof t>[0];
            const detailHref = buildUniversityProgramOfferHref(locale, programId, offer.programOfferId || offer.id);
            return (
              <div key={offer.programOfferId || offer.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={detailHref} className="font-semibold text-gray-900 text-sm truncate hover:text-blue-600 hover:underline transition-colors">
                        {offer.title}
                      </Link>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${offerStatusColors[offer.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                      {offer.companyName && (
                        <p className="flex items-center gap-1.5">
                          <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs font-medium text-gray-500">{t('university.programDetail.offers.company')}:</span>
                          <span className="truncate">{offer.companyName}</span>
                        </p>
                      )}
                      {offer.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPinIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs font-medium text-gray-500">{t('university.programDetail.offers.location')}:</span>
                          <span className="truncate">{offer.location}</span>
                        </p>
                      )}
                      {offer.contractType && (
                        <p className="flex items-center gap-1.5">
                          <ClipboardDocumentListIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs font-medium text-gray-500">{t('university.programDetail.offers.contractType')}:</span>
                          <span>{t(ctKey)}</span>
                        </p>
                      )}
                      {offer.workMode && (
                        <p className="flex items-center gap-1.5">
                          <BriefcaseIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs font-medium text-gray-500">{t('university.programDetail.offers.workMode')}:</span>
                          <span>{t(wmKey)}</span>
                        </p>
                      )}
                    </div>

                    {offer.createdAt && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <CalendarDaysIcon className="w-3 h-3" />
                        {t('university.programDetail.offers.submittedOn', {
                          date: fmtDate(offer.createdAt, locale),
                        })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={detailHref}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      {t('university.programDetail.offers.viewOffer')}
                    </Link>
                    {(offer.status === 'PENDING' || offer.status === 'REJECTED') && (
                      <button
                        disabled={loadingAction !== null}
                        onClick={() => handleAction(offer, 'APPROVED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        {loadingAction === `${offer.programOfferId}-APPROVED`
                          ? '...'
                          : t('university.programDetail.offers.approve')}
                      </button>
                    )}
                    {(offer.status === 'PENDING' || offer.status === 'APPROVED') && (
                      <button
                        disabled={loadingAction !== null}
                        onClick={() => handleAction(offer, 'REJECTED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircleIcon className="w-3.5 h-3.5" />
                        {loadingAction === `${offer.programOfferId}-REJECTED`
                          ? '...'
                          : t('university.programDetail.offers.reject')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
type TabKey = 'info' | 'companies' | 'offers' | 'applications';

export default function ProgramDetailClient({ program, initialCompanies, initialApplications, initialOffers, locale, backLabel, editLabel }: Props) {
  const t = useTranslations('intranet');
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [companies] = useState<ProgramCompany[]>(initialCompanies);
  const [offers, setOffers] = useState<ProgramOffer[]>(initialOffers);

  const statusKey = `university.programs.statusLabels.${program.status}` as Parameters<typeof t>[0];
  const statusLabel = t(statusKey);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'info',         label: t('university.programDetail.tabInfo') },
    { key: 'companies',    label: t('university.programDetail.tabCompanies'),    count: companies.length },
    { key: 'offers',       label: t('university.programDetail.tabOffers'),       count: offers.length },
    { key: 'applications', label: t('university.programDetail.tabApplications'), count: initialApplications.length },
  ];

  return (
    <PageShell className="max-w-6xl space-y-6">
      <PageHeader
        title={program.title}
        subtitle={program.createdAt ? `${t('university.programDetail.createdAt')}: ${fmtDate(program.createdAt, locale)}` : undefined}
        actions={
          <>
            <Link
              href={`/${locale}/intranet/university/programs`}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {backLabel}
            </Link>
            <Link
              href={`/${locale}/intranet/university/programs/${program.id}/edit`}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <PencilSquareIcon className="w-4 h-4" />
              {editLabel}
            </Link>
          </>
        }
      />

      <SectionCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <AcademicCapIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors(program.status)}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={BuildingOfficeIcon} label={t('university.programDetail.companiesCount')} value={program.companiesCount ?? 0} />
        <StatCard icon={BriefcaseIcon}      label={t('university.programDetail.offersCount')} value={program.offersCount ?? 0} />
        <StatCard icon={UserGroupIcon}      label={t('university.programDetail.applicationsCount')} value={program.applicationsCount ?? 0} />
      </div>

      {/* Tabs */}
      <SectionCard className="overflow-hidden p-2">
        <nav className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </SectionCard>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          <SectionCard className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <DocumentTextIcon className="w-4 h-4 text-gray-400" />
              {t('university.programDetail.descriptionLabel')}
            </h2>
            {program.description ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{program.description}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">{t('university.programDetail.noDescription')}</p>
            )}
          </SectionCard>

          <SectionCard className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
              {t('university.programDetail.rulesLabel')}
            </h2>
            {program.rules ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{program.rules}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">{t('university.programDetail.noRules')}</p>
            )}
          </SectionCard>

          {program.requiresCourseId ? (
            <SectionCard className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpenIcon className="w-4 h-4 text-gray-400" />
                {t('university.programDetail.requiresCourseLabel')}
              </h2>
              <p className="text-sm text-gray-700">
                {t('university.programDetail.requiresCourseId')}: #{program.requiresCourseId}
              </p>
            </SectionCard>
          ) : null}
        </div>
      )}

      {activeTab === 'companies' && (
        <CompaniesTab
          companies={companies}
          programId={program.id}
        />
      )}
      {activeTab === 'offers' && (
        <OffersTab
          offers={offers}
          programId={program.id}
          onRefresh={setOffers}
        />
      )}
      {activeTab === 'applications' && <ApplicationsTab applications={initialApplications} locale={locale} programId={program.id} />}
    </PageShell>
  );
}

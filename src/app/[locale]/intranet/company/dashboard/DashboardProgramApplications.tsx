'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';
import { getDisplayInitial } from '@/lib/frontend/contracts';
import { resolveMediaUrl } from '@/lib/frontend/business';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const isDev = process.env.NODE_ENV === 'development';

interface ProgramApplicationItem {
  id: string;
  applicationId: string;
  status: string;
  applicationSource?: 'job' | 'program' | null;
  createdAt: string;
  candidateName: string;
  avatarUrl: string | null;
  offerTitle: string;
  programTitle: string;
  candidateHref: string | null;
  offerHref: string | null;
  programHref: string | null;
}

interface Props {
  applications: ProgramApplicationItem[];
  emptyMessage: string;
  programsLabel: string;
  programsHref: string;
}

function AvatarFallback({ name, avatarUrl }: { name?: string; avatarUrl?: string | null }) {
  const src = resolveMediaUrl(avatarUrl, API);
  if (src) {
    return <img src={src} alt={name ?? ''} className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs shrink-0">
      {getDisplayInitial(name, '?')}
    </div>
  );
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

export function DashboardProgramApplications({ applications, emptyMessage, programsLabel, programsHref }: Props) {
  const t = useTranslations('intranet');
  const router = useRouter();

  /* Local state: synced from server props, updated optimistically + on refetch */
  const [items, setItems] = useState(applications);

  /* Re-sync when server component re-renders (after router.refresh) */
  useEffect(() => { setItems(applications); }, [applications]);

  /**
   * After a status PATCH succeeds:
   * 1) Optimistic local update (instant visual)
   * 2) Explicit GET /api/companies/me/dashboard (real metrics)
   * 3) Dispatch event → ProgramMetricValue updates stat cards immediately
   * 4) router.refresh() → full server-side re-render for complete consistency
   */
  const handleStatusChanged = useCallback(async (applicationId: string, newStatus: string) => {
    /* 1 — Optimistic local update */
    setItems((prev) =>
      prev.map((a) =>
        a.applicationId === applicationId ? { ...a, status: newStatus } : a,
      ),
    );

    /* 2 — Explicit refetch of dashboard for real metrics */
    try {
      const res = await fetch(`${API}/api/companies/me/dashboard`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();

        const dash = json.data ?? json.dashboard ?? json;

        const newPending: number =
          dash.pendingProgramApplications ?? json.pendingProgramApplications ?? 0;
        const newTotal: number =
          dash.totalProgramApplications ?? json.totalProgramApplications ?? 0;
        const newHasPrograms: boolean =
          dash.hasPublishedProgramOffers ?? json.hasPublishedProgramOffers ?? false;



        /* 3 — Dispatch event so stat-card ProgramMetricValue components update immediately */
        window.dispatchEvent(
          new CustomEvent('dashboard:program-metrics-updated', {
            detail: {
              pendingProgramApplications: newPending,
              totalProgramApplications: newTotal,
              hasPublishedProgramOffers: newHasPrograms,
            },
          }),
        );
      }
    } catch (err) {
      if (isDev) console.error('[DashProgApps] dashboard refetch error:', err);
    }

    /* 4 — Full server-side refresh for complete consistency (list + other metrics) */
    router.refresh();
  }, [router]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
        <Link href={programsHref} className="mt-2 inline-block text-xs text-indigo-600 font-medium hover:text-indigo-700">
          {programsLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {items.map((app, i) => {
        return (
        <div
          key={app.applicationId ?? app.id ?? i}
          className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-gray-50' : ''}`}
        >
          {app.candidateHref ? (
            <Link href={app.candidateHref} className="shrink-0 hover:opacity-80 transition-opacity">
              <AvatarFallback name={app.candidateName} avatarUrl={app.avatarUrl} />
            </Link>
          ) : (
            <AvatarFallback name={app.candidateName} avatarUrl={app.avatarUrl} />
          )}
          <div className="flex-1 min-w-0">
            {app.candidateHref ? (
              <Link href={app.candidateHref} className="text-sm font-semibold text-gray-900 truncate block hover:text-green-700 transition-colors">
                {app.candidateName || '—'}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-gray-900 truncate">{app.candidateName || '—'}</p>
            )}
            {app.offerHref ? (
              <Link href={app.offerHref} className="text-xs text-gray-400 truncate block hover:text-blue-600 transition-colors">
                {app.offerTitle}
              </Link>
            ) : (
              <p className="text-xs text-gray-400 truncate">{app.offerTitle}</p>
            )}
            {app.programTitle && (
              app.programHref ? (
                <Link href={app.programHref} className="text-xs text-indigo-500 truncate block hover:text-indigo-700 transition-colors">
                  {app.programTitle}
                </Link>
              ) : (
                <p className="text-xs text-indigo-500 truncate">{app.programTitle}</p>
              )
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <ApplicationStatusChanger
              applicationId={app.applicationId}
              currentStatus={app.status}
              applicationSource={app.applicationSource ?? 'program'}
              onStatusChanged={handleStatusChanged}
            />
            <span className="text-xs text-gray-300">{relativeDate(app.createdAt, t)}</span>
          </div>
        </div>
        );
      })}
    </div>
  );
}


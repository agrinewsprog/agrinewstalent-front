'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';
import { getDisplayInitial } from '@/lib/frontend/contracts';
import { resolveMediaUrl } from '@/lib/frontend/business';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApplicationItem {
  id: string;
  status: string;
  applicationSource?: 'job' | 'program' | null;
  createdAt: string;
  studentName: string;
  avatarUrl: string | null;
  offerTitle: string;
  candidateHref: string;
  offerHref: string | null;
}

interface Props {
  applications: ApplicationItem[];
  emptyMessage: string;
  publishLabel: string;
  publishHref: string;
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

export function DashboardRecentApplications({ applications, emptyMessage, publishLabel, publishHref }: Props) {
  const t = useTranslations('intranet');
  const router = useRouter();

  const [items, setItems] = useState(applications);

  const handleStatusChanged = (applicationId: string, newStatus: string) => {
    setItems((prev) =>
      prev.map((a) => a.id === applicationId ? { ...a, status: newStatus } : a),
    );
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
        <Link href={publishHref} className="mt-2 inline-block text-xs text-green-600 font-medium hover:text-green-700">
          {publishLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {items.map((app, i) => (
        <div
          key={app.id}
          className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-gray-50' : ''}`}
        >
          <Link href={app.candidateHref} className="shrink-0 hover:opacity-80 transition-opacity">
            <AvatarFallback name={app.studentName} avatarUrl={app.avatarUrl} />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={app.candidateHref} className="text-sm font-semibold text-gray-900 truncate block hover:text-green-700 transition-colors">
              {app.studentName}
            </Link>
            {app.offerHref ? (
              <Link href={app.offerHref} className="text-xs text-gray-400 truncate block hover:text-blue-600 transition-colors">
                {app.offerTitle}
              </Link>
            ) : (
              <p className="text-xs text-gray-400 truncate">{app.offerTitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <ApplicationStatusChanger
              applicationId={app.id}
              currentStatus={app.status}
              applicationSource={app.applicationSource ?? 'job'}
              onStatusChanged={handleStatusChanged}
            />
            <span className="text-xs text-gray-300">{relativeDate(app.createdAt, t)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { ApplicationsList } from '@/src/components/applications/applications-list';

// ── Notificación inline ───────────────────────────────────────────────────────
type NotifType = 'success' | 'error';
interface Notif { id: number; msg: string; type: NotifType }

function useNotif() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  let counter = 0;
  const show = useCallback((msg: string, type: NotifType) => {
    const id = ++counter;
    setNotifs(p => [...p, { id, msg, type }]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 4000);
  }, []);
  return { notifs, success: (m: string) => show(m, 'success'), error: (m: string) => show(m, 'error') };
}

interface ApplicationsListCompanyProps {
  applications: Application[];
}

export function ApplicationsListCompany({ applications: initialApplications = [] }: ApplicationsListCompanyProps) {
  const router = useRouter();
  const t = useTranslations('intranet');
  const { notifs, success, error: showError } = useNotif();
  const [applications, setApplications] = useState(initialApplications ?? []);

  const handleStatusChange = async (applicationId: string, status: Application['status']) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status } : app));
      success(t('company.applications.statusUpdated'));
      router.refresh();
    } catch (err) {
      showError(t('company.applications.statusError'));
      console.error(err);
    }
  };

  return (
    <>
      {notifs.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {notifs.map(n => (
            <div key={n.id} className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg text-white ${n.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {n.type === 'success' ? '✓ ' : '✗ '}{n.msg}
            </div>
          ))}
        </div>
      )}
      <ApplicationsList
        applications={applications}
        showStudent={true}
        showOffer={true}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

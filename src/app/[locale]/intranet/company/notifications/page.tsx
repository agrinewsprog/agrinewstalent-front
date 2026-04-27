'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { NotificationsList } from '@/components/notifications/notifications-list';
import { useRouter } from 'next/navigation';
import { NormalizedNotification, unwrapNotifications } from '@/lib/frontend/business';

const IS_DEV = process.env.NODE_ENV === 'development';

export default function CompanyNotificationsPage() {
  const t = useTranslations('intranet');
  const locale = useLocale();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NormalizedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=50');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotifications(unwrapNotifications(data, locale, 'company'));
    } catch (err) {
      if (IS_DEV) console.error('[CompanyNotifications] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      if (IS_DEV) console.error('[CompanyNotifications] markAsRead error:', err);
    }
  };

  const handleNotificationClick = (notification: NormalizedNotification) => {
    if (notification.href) {
      const href = notification.href;
      router.push(href);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('company.notifications.title')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('company.notifications.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <NotificationsList
            notifications={notifications}
            role="company"
            onMarkAsRead={handleMarkAsRead}
            onNotificationClick={handleNotificationClick}
          />
        )}
      </div>
    </div>
  );
}
